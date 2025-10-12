# Persistent Portfolio Data File Implementation Plan

## Overview

Implement automatic portfolio data persistence using the File System Access API, allowing users to link a file that automatically saves/loads their data while maintaining full backward compatibility with the existing localStorage-based workflow. This feature eliminates the need for manual export/import operations while providing a seamless user experience across supported browsers.

## Current State Analysis

The Portfolio Tracker application currently uses a localStorage-based persistence system with manual import/export functionality:

### Existing Architecture:

- **Data Storage**: Three localStorage keys (`portfolios`, `assets`, `apiKeys`)
- **State Management**: [`UserDataContext`](frontend/src/userDataContext.tsx:5) centralizes all user data
- **Data Synchronization**: All hooks follow the pattern: update React state → update localStorage
- **Import/Export**: Manual process via [`DataExport.tsx`](frontend/src/components/header/userData/dataExport/DataExport.tsx) and [`DataImport.tsx`](frontend/src/components/header/userData/dataImport/DataImport.tsx)
- **Data Migration**: Version-aware system in [`userData.ts`](frontend/src/components/header/userData/userData.ts:31)

### Key Constraints:

- Must maintain existing data structures and formats
- Cannot break current localStorage-based workflows
- Must preserve all existing import/export functionality
- Architecture enforces domain layer isolation from frontend code

## Desired End State

A Portfolio Tracker application that automatically persists data to user-selected files while maintaining all existing functionality.

### Core Capabilities:

1. **Automatic File Persistence**: Data changes trigger automatic saves to linked file
2. **Startup Data Loading**: Linked files automatically load on app initialization
3. **Manual Save Support**: Ctrl+S/Cmd+S keyboard shortcuts with visual feedback
4. **File Management UI**: Clear file linking status and management controls
5. **Progressive Enhancement**: Full functionality on all browsers, enhanced experience on supported ones
6. **Comprehensive Error Handling**: Graceful recovery from file access issues

### Verification Methods:

- Create/link a file → make data changes → verify automatic saves
- Restart app → verify data loads from linked file before UI render
- Test keyboard shortcuts and visual feedback
- Test error scenarios (permissions, missing files, etc.)
- Verify functionality on Chrome, Firefox, Safari, Edge

## Key Discoveries:

- **Data Hook Pattern**: All setter hooks follow [`setData() → localStorage.setItem()`](frontend/src/hooks/portfolios/portfolioHooks.ts:37-38) pattern consistently
- **UserDataContext Structure**: Simple provider pattern with state + setters for three data types
- **Migration System**: Robust version-based migration using [`doMigration()`](frontend/src/components/header/userData/userData.ts:31) reducer pattern
- **Test Infrastructure**: Comprehensive testing with [`customRender()`](frontend/src/testUtils/componentHelpers.tsx:47) and [`setUserData()`](frontend/src/testUtils/localStorage.ts:3)
- **File Format**: Standard JSON with 2-space indentation and version metadata

## What We're NOT Doing

- **Breaking Changes**: No modifications to existing data structures or API patterns
- **Replacing localStorage**: localStorage remains as backup and fallback storage
- **Removing Manual Import/Export**: Existing buttons remain for compatibility and user choice
- **Real-time Sync**: No multi-device synchronization - file linking is per-browser/device
- **Cloud Integration**: No cloud storage APIs - users manage file location themselves
- **File Format Changes**: Maintaining exact compatibility with current export format

## Implementation Approach

**Progressive Enhancement Strategy**: Build the file persistence system as an enhancement layer over the existing architecture. The core pattern involves:

1. **Wrapper Pattern**: Enhance existing hooks without changing their signatures
2. **Feature Detection**: Runtime detection of File System Access API availability
3. **Graceful Degradation**: Full fallback to current localStorage-only workflow
4. **Atomic Integration**: Each phase delivers working functionality independently

## Phase 1: File Handle Management Foundation

### Overview

Create the core infrastructure for managing file handles, browser compatibility detection, and IndexedDB storage.

### Changes Required:

#### 1. File System API Types and Detection

**File**: `frontend/src/fileSystem/fileSystemTypes.ts`
**Changes**: Create type definitions and browser compatibility detection

```typescript
// File System Access API type definitions
export interface FileSystemFileHandle {
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
  name: string;
  kind: "file";
}

export interface FileSystemWritableFileStream extends WritableStream {
  write(data: string | BufferSource): Promise<void>;
  close(): Promise<void>;
}

// Browser compatibility detection
export const isFileSystemAccessSupported = (): boolean => {
  return "showSaveFilePicker" in window && "showOpenFilePicker" in window;
};

// File picker options
export const FILE_PICKER_OPTIONS = {
  types: [
    {
      description: "Portfolio Tracker Data",
      accept: {
        "application/json": [".json"],
      },
    },
  ],
  excludeAcceptAllOption: false,
  multiple: false,
};
```

#### 2. IndexedDB File Handle Storage

**File**: `frontend/src/fileSystem/fileHandleStorage.ts`
**Changes**: Create IndexedDB wrapper for storing file handles

```typescript
const DB_NAME = "PortfolioTrackerFileHandles";
const DB_VERSION = 1;
const STORE_NAME = "fileHandles";
const FILE_HANDLE_KEY = "linkedFileHandle";

export class FileHandleStorage {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }

  async storeFileHandle(handle: FileSystemFileHandle): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.put(handle, FILE_HANDLE_KEY);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getFileHandle(): Promise<FileSystemFileHandle | null> {
    const db = await this.dbPromise;
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(FILE_HANDLE_KEY);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async clearFileHandle(): Promise<void> {
    const db = await this.dbPromise;
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.delete(FILE_HANDLE_KEY);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
```

#### 3. File Operations Service

**File**: `frontend/src/fileSystem/fileOperations.ts`
**Changes**: Core file read/write operations

```typescript
import { UserData } from "../components/header/userData/userData";
import { FileHandleStorage } from "./fileHandleStorage";
import {
  isFileSystemAccessSupported,
  FILE_PICKER_OPTIONS,
} from "./fileSystemTypes";

export class FileOperations {
  private storage = new FileHandleStorage();

  async selectFile(): Promise<FileSystemFileHandle | null> {
    if (!isFileSystemAccessSupported()) {
      throw new Error("File System Access API not supported");
    }

    try {
      const [fileHandle] = await window.showSaveFilePicker(FILE_PICKER_OPTIONS);
      await this.storage.storeFileHandle(fileHandle);
      return fileHandle;
    } catch (error) {
      if (error.name === "AbortError") {
        return null; // User cancelled
      }
      throw error;
    }
  }

  async getCurrentFileHandle(): Promise<FileSystemFileHandle | null> {
    return await this.storage.getFileHandle();
  }

  async writeDataToFile(
    data: UserData,
    fileHandle?: FileSystemFileHandle
  ): Promise<void> {
    const handle = fileHandle || (await this.storage.getFileHandle());
    if (!handle) {
      throw new Error("No file handle available");
    }

    const writable = await handle.createWritable();
    await writable.write(JSON.stringify(data, null, 2));
    await writable.close();
  }

  async readDataFromFile(fileHandle?: FileSystemFileHandle): Promise<UserData> {
    const handle = fileHandle || (await this.storage.getFileHandle());
    if (!handle) {
      throw new Error("No file handle available");
    }

    const file = await handle.getFile();
    const text = await file.text();
    return JSON.parse(text) as UserData;
  }

  async unlinkFile(): Promise<void> {
    await this.storage.clearFileHandle();
  }
}
```

### Success Criteria:

#### Automated Verification:

- [ ] Type checking passes for all new file system types
- [ ] Linting passes for all file system modules
- [ ] Unit tests pass for FileHandleStorage operations
- [ ] Unit tests pass for FileOperations methods
- [ ] Browser compatibility detection works correctly

#### Manual Verification:

- [ ] IndexedDB database creates successfully in Chrome DevTools
- [ ] File handle storage/retrieval works in supported browsers
- [ ] Feature detection correctly identifies browser support
- [ ] No errors or crashes in unsupported browsers
- [ ] No regressions in existing functionality

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 2: Data Flow Integration

### Overview

Modify the existing UserDataContext and hooks to support automatic file saving while maintaining exact API compatibility.

### Changes Required:

#### 1. Enhanced UserDataContext with File Support

**File**: `frontend/src/userDataContext.tsx`
**Changes**: Add file operations support to context

```typescript
import { AssetLibrary, PortfolioLibrary } from "pt-domain";
import { createContext, FC, PropsWithChildren, useState, useEffect } from "react";
import { ApiKeys } from "./components/header/userData/userData";
import { FileOperations } from "./fileSystem/fileOperations";
import { isFileSystemAccessSupported } from "./fileSystem/fileSystemTypes";

interface UserDataContextType {
  assets: AssetLibrary;
  setAssets: (a: AssetLibrary) => void;
  portfolios: PortfolioLibrary;
  setPortfolios: (p: PortfolioLibrary) => void;
  apiKeys: ApiKeys;
  setApiKeys: (a: ApiKeys) => void;
  // New file-related functions
  fileOperations: FileOperations;
  isFileLinkingSupported: boolean;
  linkedFileName: string | null;
  lastSavedTime: Date | null;
}

export const UserDataContext = createContext<UserDataContextType>({
  assets: {},
  setAssets: () => {},
  portfolios: {},
  setPortfolios: () => {},
  apiKeys: { yahoo: "" },
  setApiKeys: () => {},
  fileOperations: new FileOperations(),
  isFileLinkingSupported: false,
  linkedFileName: null,
  lastSavedTime: null,
});

export const UserDataProvider: FC<PropsWithChildren> = ({ children }) => {
  const [assets, setAssets] = useState<AssetLibrary>(readAssetsFromLocalStorage);
  const [portfolios, setPortfolios] = useState<PortfolioLibrary>(readPortfoliosFromLocalStorage);
  const [apiKeys, setApiKeys] = useState<ApiKeys>(readApiKeysFromLocalStorage);

  // New file-related state
  const [fileOperations] = useState(() => new FileOperations());
  const [isFileLinkingSupported] = useState(isFileSystemAccessSupported);
  const [linkedFileName, setLinkedFileName] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Check for linked file on startup
  useEffect(() => {
    const checkLinkedFile = async () => {
      if (isFileLinkingSupported) {
        try {
          const handle = await fileOperations.getCurrentFileHandle();
          setLinkedFileName(handle?.name || null);
        } catch (error) {
          console.warn('Failed to check linked file:', error);
        }
      }
    };
    checkLinkedFile();
  }, [fileOperations, isFileLinkingSupported]);

  return (
    <UserDataContext.Provider
      value={{
        assets,
        setAssets,
        portfolios,
        setPortfolios,
        apiKeys,
        setApiKeys,
        fileOperations,
        isFileLinkingSupported,
        linkedFileName,
        lastSavedTime,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

// Existing localStorage functions remain unchanged
function readAssetsFromLocalStorage(): AssetLibrary {
  const savedAssets = localStorage.getItem("assets");
  return savedAssets ? (JSON.parse(savedAssets) as AssetLibrary) : {};
}

function readPortfoliosFromLocalStorage(): PortfolioLibrary {
  const savedPortfolios = localStorage.getItem("portfolios");
  return savedPortfolios
    ? (JSON.parse(savedPortfolios) as PortfolioLibrary)
    : {};
}

function readApiKeysFromLocalStorage(): ApiKeys {
  const savedApiKeys = localStorage.getItem("apiKeys");
  return savedApiKeys ? (JSON.parse(savedApiKeys) as ApiKeys) : { yahoo: "" };
}
```

#### 2. Auto-Save Hook

**File**: `frontend/src/fileSystem/useAutoSave.ts`
**Changes**: Create hook for automatic file saving

```typescript
import { useContext, useCallback } from "react";
import { UserDataContext } from "../userDataContext";
import {
  UserData,
  EXPORT_VERSION,
} from "../components/header/userData/userData";

export const useAutoSave = () => {
  const {
    assets,
    portfolios,
    apiKeys,
    fileOperations,
    isFileLinkingSupported,
  } = useContext(UserDataContext);

  const saveToFile = useCallback(async (): Promise<boolean> => {
    if (!isFileLinkingSupported) {
      return false;
    }

    try {
      const handle = await fileOperations.getCurrentFileHandle();
      if (!handle) {
        return false;
      }

      const userData: UserData = {
        portfolios,
        assets,
        apiKeys,
        meta: { exportVersion: EXPORT_VERSION },
      };

      await fileOperations.writeDataToFile(userData, handle);
      return true;
    } catch (error) {
      console.error("Auto-save failed:", error);
      return false;
    }
  }, [assets, portfolios, apiKeys, fileOperations, isFileLinkingSupported]);

  return { saveToFile };
};
```

#### 3. Enhanced Portfolio Hooks with Auto-Save

**File**: `frontend/src/hooks/portfolios/portfolioHooks.ts`
**Changes**: Add auto-save to existing hooks (showing pattern for all hooks)

```typescript
// Add new import
import { useAutoSave } from "../../fileSystem/useAutoSave";

// Modify useSetPortfolios to include auto-save
export function useSetPortfolios() {
  const { setPortfolios } = useContext(UserDataContext);
  const { saveToFile } = useAutoSave();

  return (portfolios: PortfolioLibrary) => {
    // Existing localStorage logic remains unchanged
    setPortfolios(portfolios);
    localStorage.setItem("portfolios", JSON.stringify(portfolios));

    // Add automatic file save (non-blocking)
    saveToFile().catch((error) => {
      console.warn("Auto-save failed:", error);
      // Continue normally - localStorage save still succeeded
    });
  };
}

// Similar pattern applies to useUpdatePortfolios and all other setter functions
function useUpdatePortfolios<T extends PortfolioUpdate>(
  updater: PortfolioUpdater<T>
) {
  const { setPortfolios, portfolios } = useContext(UserDataContext);
  const { saveToFile } = useAutoSave();

  return (update: T) => {
    // Existing logic unchanged
    const newLib = updater(portfolios, update);
    setPortfolios(newLib);
    localStorage.setItem("portfolios", JSON.stringify(newLib));

    // Add automatic file save
    saveToFile().catch((error) => {
      console.warn("Auto-save failed:", error);
    });
  };
}
```

### Success Criteria:

#### Automated Verification:

- [ ] Type checking passes with extended UserDataContext
- [ ] All existing tests continue to pass
- [ ] Unit tests pass for useAutoSave hook
- [ ] Integration tests verify auto-save triggers on data changes
- [ ] Hook signatures remain unchanged (no breaking changes)

#### Manual Verification:

- [ ] Data changes trigger automatic file saves in Chrome
- [ ] localStorage continues to work as before
- [ ] No performance degradation during normal usage
- [ ] Auto-save failures don't block normal operations
- [ ] Existing functionality unaffected in unsupported browsers

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 3: Application Startup Enhancement

### Overview

Add file loading logic during app initialization to automatically restore data from linked files before the UI renders.

### Changes Required:

#### 1. App Initialization Hook

**File**: `frontend/src/fileSystem/useAppInitialization.ts`
**Changes**: Create hook for app startup data loading

```typescript
import { useState, useEffect } from "react";
import { parseUserData } from "../components/header/userData/userData";
import { FileOperations } from "./fileOperations";
import { isFileSystemAccessSupported } from "./fileSystemTypes";

export interface InitializationState {
  isLoading: boolean;
  error: string | null;
  hasLinkedFile: boolean;
}

export const useAppInitialization = (
  setPortfolios: (p: any) => void,
  setAssets: (a: any) => void,
  setApiKeys: (k: any) => void
) => {
  const [state, setState] = useState<InitializationState>({
    isLoading: true,
    error: null,
    hasLinkedFile: false,
  });

  useEffect(() => {
    const initializeApp = async () => {
      if (!isFileSystemAccessSupported()) {
        setState({
          isLoading: false,
          error: null,
          hasLinkedFile: false,
        });
        return;
      }

      try {
        const fileOperations = new FileOperations();
        const handle = await fileOperations.getCurrentFileHandle();

        if (handle) {
          // Found linked file - load data
          try {
            const fileData = await fileOperations.readDataFromFile(handle);
            const parsedData = parseUserData(JSON.stringify(fileData));

            // Update both localStorage and React state
            localStorage.setItem(
              "portfolios",
              JSON.stringify(parsedData.portfolios)
            );
            localStorage.setItem("assets", JSON.stringify(parsedData.assets));
            localStorage.setItem("apiKeys", JSON.stringify(parsedData.apiKeys));

            setPortfolios(parsedData.portfolios);
            setAssets(parsedData.assets);
            setApiKeys(parsedData.apiKeys);

            setState({
              isLoading: false,
              error: null,
              hasLinkedFile: true,
            });
          } catch (error) {
            // File exists but couldn't read - show error but don't block app
            setState({
              isLoading: false,
              error: `Failed to load linked file: ${error.message}`,
              hasLinkedFile: false,
            });
          }
        } else {
          // No linked file - use localStorage data
          setState({
            isLoading: false,
            error: null,
            hasLinkedFile: false,
          });
        }
      } catch (error) {
        setState({
          isLoading: false,
          error: `Initialization error: ${error.message}`,
          hasLinkedFile: false,
        });
      }
    };

    initializeApp();
  }, [setPortfolios, setAssets, setApiKeys]);

  return state;
};
```

#### 2. Enhanced UserDataProvider with Initialization

**File**: `frontend/src/userDataContext.tsx`
**Changes**: Integrate initialization logic

```typescript
// Add import
import { useAppInitialization } from './fileSystem/useAppInitialization';

export const UserDataProvider: FC<PropsWithChildren> = ({ children }) => {
  const [assets, setAssets] = useState<AssetLibrary>(() => ({})); // Start empty
  const [portfolios, setPortfolios] = useState<PortfolioLibrary>(() => ({})); // Start empty
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => ({ yahoo: "" })); // Start empty

  // Initialize from localStorage after initialization check
  const [isInitialized, setIsInitialized] = useState(false);

  // File-related state
  const [fileOperations] = useState(() => new FileOperations());
  const [isFileLinkingSupported] = useState(isFileSystemAccessSupported);
  const [linkedFileName, setLinkedFileName] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Initialization hook
  const initState = useAppInitialization(setPortfolios, setAssets, setApiKeys);

  // Load localStorage data if no linked file found and initialization complete
  useEffect(() => {
    if (!initState.isLoading && !initState.hasLinkedFile && !isInitialized) {
      setPortfolios(readPortfoliosFromLocalStorage());
      setAssets(readAssetsFromLocalStorage());
      setApiKeys(readApiKeysFromLocalStorage());
      setIsInitialized(true);
    } else if (!initState.isLoading && initState.hasLinkedFile && !isInitialized) {
      setIsInitialized(true);
    }
  }, [initState.isLoading, initState.hasLinkedFile, isInitialized]);

  // Show loading screen during initialization
  if (initState.isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2em'
      }}>
        Loading portfolio data...
      </div>
    );
  }

  return (
    <UserDataContext.Provider
      value={{
        assets,
        setAssets,
        portfolios,
        setPortfolios,
        apiKeys,
        setApiKeys,
        fileOperations,
        isFileLinkingSupported,
        linkedFileName,
        lastSavedTime,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
```

### Success Criteria:

#### Automated Verification:

- [ ] Type checking passes for initialization logic
- [ ] Unit tests pass for useAppInitialization hook
- [ ] Integration tests verify file loading on app startup
- [ ] Tests verify localStorage fallback when no file linked
- [ ] Error handling tests for corrupted/missing files

#### Manual Verification:

- [ ] App loads linked file data on startup in Chrome
- [ ] Loading screen displays during initialization
- [ ] App falls back to localStorage when no file linked
- [ ] Error handling graceful for file access issues
- [ ] No performance impact on app startup time
- [ ] Functionality identical in unsupported browsers

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 4: User Interface & File Management

### Overview

Create UI components for file linking, status display, manual save feedback, and file management controls integrated into the existing header.

### Changes Required:

#### 1. File Status Component

**File**: `frontend/src/components/header/fileStatus/FileStatus.module.less`
**Changes**: Create styles for file status display

```less
@import "../../../definitions.less";

.fileStatus {
  display: flex;
  align-items: center;
  gap: 8px;
  color: @text-color-secondary;
  font-size: 0.9em;
}

.fileName {
  color: @text-color-primary;
  font-weight: 500;
}

.lastSaved {
  font-size: 0.8em;
  opacity: 0.8;
}

.notLinked {
  color: @text-color-secondary;
  font-style: italic;
}
```

**File**: `frontend/src/components/header/fileStatus/FileStatus.tsx`
**Changes**: Create file status display component

```typescript
import React, { useContext } from 'react';
import { Tooltip } from '@mui/material';
import { UserDataContext } from '../../../userDataContext';
import styles from './FileStatus.module.less';

export const FileStatus: React.FC = () => {
  const {
    isFileLinkingSupported,
    linkedFileName,
    lastSavedTime
  } = useContext(UserDataContext);

  if (!isFileLinkingSupported) {
    return (
      <Tooltip title="File linking not supported in this browser">
        <div className={styles.fileStatus}>
          <i className="fa-solid fa-circle-info" />
          <span className={styles.notLinked}>Browser not supported</span>
        </div>
      </Tooltip>
    );
  }

  if (!linkedFileName) {
    return (
      <div className={styles.fileStatus}>
        <i className="fa-solid fa-file-slash" />
        <span className={styles.notLinked}>No file linked</span>
      </div>
    );
  }

  const formatLastSaved = (date: Date | null) => {
    if (!date) return 'Never saved';

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just saved';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  return (
    <Tooltip title={`Linked to: ${linkedFileName}`}>
      <div className={styles.fileStatus}>
        <i className="fa-solid fa-file-check" />
        <span className={styles.fileName}>{linkedFileName}</span>
        {lastSavedTime && (
          <span className={styles.lastSaved}>
            • {formatLastSaved(lastSavedTime)}
          </span>
        )}
      </div>
    </Tooltip>
  );
};
```

#### 2. File Management Controls

**File**: `frontend/src/components/header/fileManagement/FileManagement.tsx`
**Changes**: Create file management component

```typescript
import React, { useContext, useState, useEffect } from 'react';
import { Tooltip, Button } from '@mui/material';
import { UserDataContext } from '../../../userDataContext';
import { useAutoSave } from '../../../fileSystem/useAutoSave';

export const FileManagement: React.FC = () => {
  const {
    fileOperations,
    isFileLinkingSupported,
    linkedFileName
  } = useContext(UserDataContext);

  const [isSaving, setIsSaving] = useState(false);
  const { saveToFile } = useAutoSave();

  // Manual save function
  const handleManualSave = async () => {
    if (!linkedFileName) return;

    setIsSaving(true);
    try {
      await saveToFile();
      // Show success feedback
    } catch (error) {
      console.error('Manual save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // File linking
  const handleLinkFile = async () => {
    try {
      await fileOperations.selectFile();
      window.location.reload(); // Refresh to update UI state
    } catch (error) {
      console.error('File linking failed:', error);
    }
  };

  // Keyboard shortcut for manual save
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (linkedFileName) {
          handleManualSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [linkedFileName]);

  if (!isFileLinkingSupported) {
    return null;
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      {!linkedFileName ? (
        <Tooltip title="Link a file for automatic saving">
          <Button variant="contained" size="small" onClick={handleLinkFile}>
            <i className="fa-solid fa-link" /> Link File
          </Button>
        </Tooltip>
      ) : (
        <Tooltip title="Save now (Ctrl/Cmd+S)">
          <Button
            variant="contained"
            size="small"
            onClick={handleManualSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Tooltip>
      )}
    </div>
  );
};
```

#### 3. Enhanced Header Integration

**File**: `frontend/src/components/header/Header.tsx`
**Changes**: Integrate file components into header

```typescript
// Add imports
import { FileStatus } from './fileStatus/FileStatus';
import { FileManagement } from './fileManagement/FileManagement';

// Modify header JSX to include file components
return (
  <header className={styles.header}>
    {/* Existing header content */}

    <Stack direction="row" spacing={2} alignItems="center">
      {/* File status and management */}
      <FileStatus />
      <FileManagement />

      {/* Existing import/export components */}
      <DataExport />
      <DataImport />

      {/* Existing API keys */}
      <ApiKeys />
    </Stack>
  </header>
);
```

### Success Criteria:

#### Automated Verification:

- [ ] Type checking passes for all UI components
- [ ] Linting passes for all new styles and components
- [ ] Unit tests pass for FileStatus component
- [ ] Unit tests pass for FileManagement component
- [ ] Integration tests verify keyboard shortcuts work

#### Manual Verification:

- [ ] File status displays correctly in header
- [ ] Link/unlink buttons work as expected
- [ ] Manual save button provides visual feedback
- [ ] Ctrl+S/Cmd+S keyboard shortcuts work
- [ ] UI gracefully handles unsupported browsers
- [ ] Visual design integrates well with existing header

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 5: Error Handling & Recovery

### Overview

Implement comprehensive error handling for file access failures, permission issues, and data consistency problems with graceful recovery mechanisms.

### Changes Required:

#### 1. Error Types and Recovery Strategies

**File**: `frontend/src/fileSystem/fileSystemErrors.ts`
**Changes**: Define error types and recovery strategies

```typescript
export enum FileSystemErrorType {
  PERMISSION_DENIED = "PermissionDenied",
  FILE_NOT_FOUND = "FileNotFound",
  DISK_FULL = "DiskFull",
  INVALID_DATA = "InvalidData",
  NETWORK_ERROR = "NetworkError",
  UNKNOWN = "Unknown",
}

export class FileSystemError extends Error {
  constructor(
    public type: FileSystemErrorType,
    message: string,
    public recoverable: boolean = true,
    public cause?: Error
  ) {
    super(message);
    this.name = "FileSystemError";
  }
}

export const createFileSystemError = (error: any): FileSystemError => {
  if (error instanceof FileSystemError) {
    return error;
  }

  // Map browser errors to our error types
  if (error.name === "NotAllowedError") {
    return new FileSystemError(
      FileSystemErrorType.PERMISSION_DENIED,
      "File access was denied. Please grant permission or select a different file.",
      true,
      error
    );
  }

  if (error.name === "NotFoundError") {
    return new FileSystemError(
      FileSystemErrorType.FILE_NOT_FOUND,
      "The linked file could not be found. It may have been moved or deleted.",
      true,
      error
    );
  }

  if (error.name === "QuotaExceededError") {
    return new FileSystemError(
      FileSystemErrorType.DISK_FULL,
      "Not enough storage space. Please free up space or choose a different location.",
      true,
      error
    );
  }

  return new FileSystemError(
    FileSystemErrorType.UNKNOWN,
    error.message || "An unknown error occurred",
    true,
    error
  );
};
```

#### 2. Enhanced Auto-Save with Error Handling

**File**: `frontend/src/fileSystem/useAutoSave.ts`
**Changes**: Add comprehensive error handling to auto-save

```typescript
import { useContext, useCallback } from "react";
import { UserDataContext } from "../userDataContext";
import {
  UserData,
  EXPORT_VERSION,
} from "../components/header/userData/userData";
import { createFileSystemError } from "./fileSystemErrors";

export const useAutoSave = () => {
  const {
    assets,
    portfolios,
    apiKeys,
    fileOperations,
    isFileLinkingSupported,
  } = useContext(UserDataContext);

  const saveToFile = useCallback(async (): Promise<boolean> => {
    if (!isFileLinkingSupported) {
      return false;
    }

    try {
      const handle = await fileOperations.getCurrentFileHandle();
      if (!handle) {
        return false; // No file linked - this is not an error
      }

      const userData: UserData = {
        portfolios,
        assets,
        apiKeys,
        meta: { exportVersion: EXPORT_VERSION },
      };

      await fileOperations.writeDataToFile(userData, handle);
      return true;
    } catch (error) {
      const fileError = createFileSystemError(error);
      console.warn("Auto-save failed:", fileError);

      // For auto-save, we don't show error dialogs - just log and continue
      // Critical errors will be handled by manual operations
      return false;
    }
  }, [assets, portfolios, apiKeys, fileOperations, isFileLinkingSupported]);

  return { saveToFile };
};
```

### Success Criteria:

#### Automated Verification:

- [ ] Type checking passes for all error handling code
- [ ] Unit tests pass for error classification and recovery
- [ ] Integration tests verify error handling behavior
- [ ] Tests cover all error scenarios (permissions, missing files, etc.)
- [ ] Auto-save gracefully handles all error types

#### Manual Verification:

- [ ] Permission denied errors are handled gracefully
- [ ] Missing file errors don't break functionality
- [ ] Disk full errors fall back to localStorage
- [ ] Invalid data errors provide clear messaging
- [ ] App continues functioning normally after errors
- [ ] No data loss occurs during error scenarios

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to the next phase.

---

## Phase 6: Browser Compatibility & Progressive Enhancement

### Overview

Add comprehensive feature detection and graceful fallbacks to ensure the app works perfectly on all browsers while enhancing the experience on supported ones.

### Changes Required:

#### 1. Browser Compatibility Detection

**File**: `frontend/src/fileSystem/browserCompatibility.ts`
**Changes**: Comprehensive browser and feature detection

```typescript
export interface BrowserCapabilities {
  hasFileSystemAccess: boolean;
  hasIndexedDB: boolean;
  hasLocalStorage: boolean;
  browserName: string;
  browserVersion: string;
  isSupported: boolean;
  limitations: string[];
}

export const detectBrowserCapabilities = (): BrowserCapabilities => {
  const hasFileSystemAccess =
    "showSaveFilePicker" in window && "showOpenFilePicker" in window;
  const hasIndexedDB = "indexedDB" in window;
  const hasLocalStorage =
    "localStorage" in window && typeof Storage !== "undefined";

  // Browser detection
  const userAgent = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "Unknown";

  if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) {
    browserName = "Chrome";
    const match = userAgent.match(/Chrome\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (userAgent.includes("Edg")) {
    browserName = "Edge";
    const match = userAgent.match(/Edg\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (userAgent.includes("Firefox")) {
    browserName = "Firefox";
    const match = userAgent.match(/Firefox\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  } else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) {
    browserName = "Safari";
    const match = userAgent.match(/Version\/(\d+)/);
    browserVersion = match ? match[1] : "Unknown";
  }

  // Determine limitations
  const limitations: string[] = [];
  if (!hasFileSystemAccess) {
    limitations.push("File System Access API not available");
  }
  if (!hasIndexedDB) {
    limitations.push("IndexedDB not available");
  }
  if (!hasLocalStorage) {
    limitations.push("LocalStorage not available");
  }

  // Determine overall support level
  const isSupported = hasLocalStorage; // Minimum requirement

  return {
    hasFileSystemAccess,
    hasIndexedDB,
    hasLocalStorage,
    browserName,
    browserVersion,
    isSupported,
    limitations,
  };
};

export const getBrowserRecommendation = (
  capabilities: BrowserCapabilities
): string => {
  if (!capabilities.hasFileSystemAccess) {
    return `For the best experience with automatic file saving, please use a Chromium-based browser like Chrome (version 86+) or Edge (version 86+). Your current browser (${capabilities.browserName}) will use manual import/export functionality.`;
  }

  return `Your browser (${capabilities.browserName} ${capabilities.browserVersion}) supports all features including automatic file saving.`;
};
```

#### 2. Enhanced Import/Export Integration

**File**: `frontend/src/components/header/userData/dataImport/DataImport.tsx`
**Changes**: Add file linking integration to existing import

```typescript
// Add imports for file operations
import { UserDataContext } from "../../../../userDataContext";

// In the component, add file linking option after successful import
const DataImport: React.FC = () => {
  const { fileOperations, isFileLinkingSupported } =
    useContext(UserDataContext);

  // Modify the successful import flow
  const handleImportSuccess = async (parsedUserData: UserData) => {
    setPortfolios(parsedUserData.portfolios);
    setAssets(parsedUserData.assets);
    setApiKeys(parsedUserData.apiKeys);

    // Ask if user wants to link this file for auto-save
    if (isFileLinkingSupported) {
      const linkFile = confirm(
        "Import successful! Would you like to link this file for automatic saving?"
      );
      if (linkFile) {
        try {
          // This would require modifications to support linking existing files
          // For now, we'll just show a message directing users to use the Link File button
          alert(
            'Please use the "Link File" button in the header to set up automatic saving.'
          );
        } catch (error) {
          console.error("File linking failed:", error);
        }
      }
    }
  };

  // Rest of component remains the same...
};
```

### Success Criteria:

#### Automated Verification:

- [ ] Type checking passes for all compatibility code
- [ ] Unit tests pass for browser detection logic
- [ ] Integration tests verify fallback behavior
- [ ] Tests cover all major browser scenarios
- [ ] Progressive enhancement works as designed

#### Manual Verification:

- [ ] Chrome/Edge: Full file linking functionality works
- [ ] Firefox/Safari: Import/export buttons work normally
- [ ] Feature detection correctly identifies capabilities
- [ ] No errors or crashes in any browser
- [ ] UI appropriately adapts to browser capabilities
- [ ] User receives clear guidance about browser limitations

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation from the human that the manual testing was successful before proceeding to finalization.

---

## Testing Strategy

### Unit Tests

#### File System Core (`frontend/src/fileSystem/`)

- **FileHandleStorage**: IndexedDB operations (store, retrieve, clear)
- **FileOperations**: File read/write operations with mocked File System API
- **useAutoSave**: Auto-save hook with mocked file operations
- **useAppInitialization**: Initialization logic with various scenarios
- **Error handling**: FileSystemError creation and classification

#### Components (`frontend/src/components/header/`)

- **FileStatus**: Status display with different file states
- **FileManagement**: Button interactions and keyboard shortcuts
- **Enhanced Import**: File linking integration after import

#### Browser Compatibility

- **detectBrowserCapabilities**: Browser detection with mocked user agents
- **Feature detection**: API availability detection

### Integration Tests

#### Data Flow Integration

- Verify auto-save triggers when data changes through existing hooks
- Test file loading on app initialization
- Verify localStorage fallback when file operations fail

#### UI Integration

- Test file management UI integrated with existing header
- Verify keyboard shortcuts (Ctrl+S/Cmd+S) work across app
- Test error dialogs and recovery workflows

#### Cross-Browser Testing

- Chrome/Edge: Full functionality including file linking
- Firefox/Safari: Graceful fallback to manual import/export
- Feature detection and progressive enhancement

### Manual Testing Steps

#### Chrome/Edge Testing (Full Feature Support)

1. **Initial Setup**:

   - Open app in Chrome/Edge
   - Verify "Link File" button appears in header
   - Click "Link File" and select/create a JSON file
   - Verify file name appears in header

2. **Auto-Save Testing**:

   - Create a new portfolio → verify file auto-saves
   - Add an order → verify file auto-saves
   - Check file contents match app data

3. **App Restart Testing**:

   - Close and reopen app
   - Verify data loads from linked file
   - Verify file status shows in header

4. **Manual Save Testing**:

   - Press Ctrl+S (Windows) or Cmd+S (Mac)
   - Verify visual feedback shows save success
   - Verify "Save" button provides feedback

5. **Error Scenario Testing**:
   - Move/rename the linked file
   - Make data changes → verify graceful error handling
   - Test file permission issues

#### Firefox/Safari Testing (Fallback Mode)

1. **Compatibility Indication**:

   - Open app in Firefox/Safari
   - Verify no "Link File" button appears
   - Verify existing Import/Export buttons work normally

2. **Standard Workflow**:
   - Use Export button to download data file
   - Clear browser data
   - Use Import button to restore data
   - Verify all functionality works identically

#### Cross-Platform Testing

- Test keyboard shortcuts work on Windows (Ctrl+S) and Mac (Cmd+S)
- Verify file dialogs use native OS appearance
- Test with different file locations (Desktop, Documents, etc.)

### Performance Considerations

#### File Operation Performance

- **Asynchronous Operations**: All file operations are async to prevent UI blocking
- **Auto-Save Debouncing**: Consider debouncing auto-save for rapid data changes
- **Loading Indicators**: Show loading states during file operations
- **Memory Management**: Minimize memory usage during large file operations

#### Startup Performance

- **Conditional Loading**: Only load file system code on supported browsers
- **Lazy Loading**: Defer non-critical file operations until after initial render
- **Error Recovery**: Quick fallback to localStorage if file loading fails

### Migration Notes

#### Data Migration

- **No Data Structure Changes**: Existing UserData format remains identical
- **Version Compatibility**: All existing export files remain compatible
- **Migration Path**: Users can continue with localStorage or opt-in to file linking

#### Development Migration

- **Hook Compatibility**: All existing hooks maintain identical signatures
- **Component Integration**: File features integrate without breaking existing components
- **Test Compatibility**: All existing tests continue to pass without modification

#### Deployment Strategy

- **Feature Flags**: Consider feature flag for gradual rollout
- **Backward Compatibility**: New features don't affect existing workflows
- **User Communication**: Provide clear documentation about new file features

---

## Summary

This implementation plan delivers automatic portfolio data persistence while maintaining complete backward compatibility. The progressive enhancement approach ensures all users benefit from the new functionality according to their browser capabilities, with no users experiencing a degraded experience.

**Key Benefits:**

- ✅ Automatic data persistence for supported browsers
- ✅ Zero breaking changes to existing functionality
- ✅ Comprehensive error handling and recovery
- ✅ Full cross-browser compatibility
- ✅ Enhanced user experience with manual save options
- ✅ Maintainable architecture following existing patterns

**Next Steps:**

1. Begin implementation with Phase 1: File Handle Management Foundation
2. Test each phase thoroughly before proceeding
3. Gather user feedback during development for UI/UX refinements
4. Consider gradual rollout strategy for production deployment
