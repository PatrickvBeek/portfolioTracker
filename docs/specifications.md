# User Story: Persistent Portfolio Data File

## Title

Automatic Portfolio Data Persistence to User-Selected File

## User Story

**As a** Portfolio Tracker user,  
**I want** the application to automatically save my portfolio data to a file I select once,  
**So that** I don't need to manually export and import my data constantly, and my changes are automatically persisted without additional user actions.

## Background

Currently, users must manually export their portfolio data to a JSON file for backup and manually import it to restore data. This creates friction in the user workflow and increases the risk of data loss if users forget to export their changes. The proposed feature eliminates this friction by allowing the application to directly write to a user-selected file.

## Acceptance Criteria

### Core Functionality

1. **Initial File Selection**

   - When the app needs to save data and has no linked file, it prompts the user to select a file location
   - The file selection dialog allows creating new files or overwriting existing ones
   - The selected file handle is stored persistently in the browser

2. **Automatic Loading**

   - On app startup, if a file handle exists, the app automatically loads data from the linked file
   - The loaded data overwrites any existing localStorage data
   - Loading happens before the main UI is rendered

3. **Automatic Saving**

   - The app automatically saves to the linked file whenever localStorage data changes (new orders, assets, portfolios, etc.)
   - The app responds to Ctrl+S (Windows/Linux) and Cmd+S (macOS) keyboard shortcuts to trigger manual save

4. **Manual Save Indication**
   - When user presses Ctrl+S/Cmd+S, show visual feedback that save was successful
   - Display save status in the UI (e.g., "Last saved: 2 minutes ago")

### Legacy Functionality

5. **Import/Export Buttons**
   - Keep existing Import and Export buttons in the header as fallback options
   - Import button can load data from any JSON file, potentially different from the linked file
   - Export button creates a downloadable file as before
   - When importing via the button, ask user if they want to link this file for future automatic saves

### Error Handling

6. **File Access Errors**

   - If writing to linked file fails (permission denied, disk full, file deleted), show error dialog
   - Error dialog prompts user to select a new file location
   - Until new file is selected, continue saving only to localStorage
   - Log error details for debugging purposes

7. **File Read Errors**

   - If linked file cannot be read on startup, show error dialog with options:
     - Select a different file
     - Disable autoSave and use manual import/export workflow
   - Clear the stored file handle if file is permanently inaccessible

8. **Data Consistency**
   - If file data differs from localStorage on startup, use file data as authoritative source
   - Maintain data backup in localStorage as fallback

### Browser Compatibility

9. **Feature Detection**

   - Detect if File System Access API is available (Chrome-based browsers)
   - On supported browsers, show option to enable persistent file feature
   - On unsupported browsers (Firefox, Safari), show compatibility warning and use legacy import/export workflow
   - Provide clear messaging about browser limitations

10. **Progressive Enhancement**
    - App remains fully functional on all browsers using legacy workflow
    - Persistent file feature is an enhancement, not a requirement
    - User can disable persistent file feature and return to manual workflow

### User Experience

11. **File Management UI**

    - Show currently linked file name in the UI header
    - Provide option to unlink current file and select a different one
    - Show file linking status (linked/not linked) clearly to user
    - Provide tooltip explanations for file-related actions

12. **Data Migration**
    - Support importing existing portfolio data files created with legacy export
    - Maintain backward compatibility with all export versions (current and future)
    - Handle data migration seamlessly during file linking process

## Edge Cases and Considerations

### Security and Privacy

- File handles are stored only in browser storage and never transmitted
- User must explicitly grant file access permissions through browser APIs
- No automatic file access without user consent
- Respect browser security restrictions and user privacy

### Performance

- Use asynchronous file operations to prevent UI blocking
- Provide loading indicators for file operations

### Multi-Device Scenarios

- File linking is per-browser/device - users need to link files on each device
- Provide guidance for users on sharing files across devices (cloud storage, USB drives)
- Support importing files created on different devices
- Maintain consistent data format across all export sources

### Data Integrity

- Validate file structure before loading to prevent data corruption
- Create backup copies during critical operations
- Implement atomic write operations where possible
- Provide data recovery options in case of corruption

### User Onboarding

- Provide clear explanation of the feature benefits
- Show tutorial or guide for first-time file linking
- Explain the relationship between persistent files and legacy import/export
- Provide FAQ or help documentation

## Technical Implementation Notes

### File System Access API Requirements

- Use `window.showSaveFilePicker()` for file selection
- Store file handles using IndexedDB for persistence
- Implement proper error handling for API limitations
- Test across different Chrome-based browsers

### Data Flow Changes

- Modify existing localStorage hooks to trigger file saves
- Implement file loading logic in app initialization
- Add file handle management to UserDataContext
- Update existing import/export components for integration

### Backward Compatibility

- Maintain existing data structures and formats
- Keep current migration system functional
- Ensure legacy workflows remain unaffected
- Support mixed usage scenarios (some users with files, others without)

## Risks and Mitigation

### Risk: Browser API Limitations

- **Mitigation**: Comprehensive feature detection and fallback to legacy workflow

### Risk: File Permission Issues

- **Mitigation**: Clear error messages and alternative file selection options

### Risk: Data Loss During File Operations

- **Mitigation**: Always maintain localStorage backup and implement atomic operations

### Risk: User Confusion with New Workflow

- **Mitigation**: Progressive disclosure, clear UI indicators, and comprehensive help documentation
