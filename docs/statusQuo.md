# Portfolio Tracker - Import/Export Functionality Technical Documentation

## Overview

The Portfolio Tracker application implements client-side import and export functionality for user data backup and restoration. The system handles three data categories: portfolios, assets, and API keys. All functionality is implemented using React functional components with TypeScript, integrated through a centralized context provider pattern.

## Core Architecture

### Data Storage

The application uses browser [`localStorage`](frontend/src/userDataContext.tsx:47) as the primary storage mechanism for user data:

- **Portfolios**: Stored in `localStorage` key "portfolios"
- **Assets**: Stored in `localStorage` key "assets"
- **API Keys**: Stored in `localStorage` key "apiKeys"

### User Data Context

The [`UserDataContext`](frontend/src/userDataContext.tsx:5) provides centralized state management for all user data:

- Manages three main data types: `AssetLibrary`, `PortfolioLibrary`, and `ApiKeys`
- Automatically loads data from `localStorage` on initialization
- Provides setter functions that update both React state and `localStorage`

## Data Structures

### Core Types

#### UserData Structure

```typescript
type UserData = {
  portfolios: PortfolioLibrary;
  assets: AssetLibrary;
  apiKeys: ApiKeys;
  meta: {
    exportVersion: typeof EXPORT_VERSION;
  };
};
```

#### Portfolio Structure

```typescript
interface Portfolio {
  name: string;
  orders: Record<string, Order[]>;
  dividendPayouts: Record<string, DividendPayout[]>;
}
```

#### Asset Structure

```typescript
interface Asset {
  isin: string;
  displayName: string;
  symbol?: string;
}
```

#### Order Structure

```typescript
interface Order {
  uuid: string;
  asset: string;
  pieces: number;
  sharePrice: number;
  timestamp: string;
  orderFee: number;
  taxes: number;
}
```

#### DividendPayout Structure

```typescript
type DividendPayout = {
  uuid: string;
  asset: string;
  pieces: number;
  dividendPerShare: number;
  timestamp: string;
  taxes: number;
};
```

### Version Management

- Current export version: [`EXPORT_VERSION = 2`](frontend/src/components/header/userData/userData.ts:3)
- Supports data migration from version 1 to version 2
- Version 2 added [`apiKeys`](frontend/src/components/header/userData/userData.ts:42) field with Yahoo Finance API key support

## Export Functionality

### Implementation

Located in [`DataExport.tsx`](frontend/src/components/header/userData/dataExport/DataExport.tsx):

#### Process Flow

1. **Data Collection**: Retrieves current user data using React hooks:

   - [`useGetPortfolios()`](frontend/src/components/header/userData/dataExport/DataExport.tsx:9) for portfolio library
   - [`useGetAssets()`](frontend/src/components/header/userData/dataExport/DataExport.tsx:10) for asset library
   - [`useGetApiKeys()`](frontend/src/components/header/userData/dataExport/DataExport.tsx:11) for API keys

2. **Data Serialization**: Creates a [`UserData`](frontend/src/components/header/userData/dataExport/DataExport.tsx:17) object with current export version

3. **File Generation**:

   - Converts data to formatted JSON string using [`JSON.stringify(data, null, 2)`](frontend/src/components/header/userData/dataExport/DataExport.tsx:23)
   - Creates downloadable blob with MIME type `application/json`
   - Generates download URL using [`URL.createObjectURL(blob)`](frontend/src/components/header/userData/dataExport/DataExport.tsx:25)

4. **User Interface**: Renders as downloadable link with filename [`portfolioTracker_dataExport.json`](frontend/src/components/header/userData/dataExport/DataExport.tsx:29)

#### Features

- **Automatic Download**: Click triggers immediate file download
- **Formatted Output**: JSON is pretty-printed with 2-space indentation
- **Tooltip Support**: Displays "Export all data into a file" on hover
- **Null Safety**: Returns null if any required data is missing

## Import Functionality

### Implementation

Located in [`DataImport.tsx`](frontend/src/components/header/userData/dataImport/DataImport.tsx):

#### Process Flow

1. **File Selection**: HTML file input accepting only [`.json`](frontend/src/components/header/userData/dataImport/DataImport.tsx:75) files

2. **File Reading**: Uses [`FileReader`](frontend/src/components/header/userData/dataImport/DataImport.tsx:22) API to read file as UTF-8 text

3. **Data Parsing**:

   - Calls [`parseUserData(readingResult)`](frontend/src/components/header/userData/dataImport/DataImport.tsx:31) to validate and parse JSON
   - Handles data migration if needed (version 1 → version 2)
   - Validates required fields: `assets`, `meta`, `portfolios`

4. **Data Update**: Updates application state using setter hooks:
   - [`setPortfolios(parsedUserData.portfolios)`](frontend/src/components/header/userData/dataImport/DataImport.tsx:32)
   - [`setAssets(parsedUserData.assets)`](frontend/src/components/header/userData/dataImport/DataImport.tsx:33)
   - [`setApiKeys(parsedUserData.apiKeys)`](frontend/src/components/header/userData/dataImport/DataImport.tsx:34)

#### Error Handling

- **File Reading Errors**: Shows error dialog if file cannot be read
- **Parse Errors**: Shows error dialog if JSON is invalid or missing required fields
- **User Feedback**: [`InfoDialog`](frontend/src/components/header/userData/dataImport/DataImport.tsx:78) component displays error messages

#### User Interface

- **Hidden Input**: File input is visually hidden using CSS modules
- **Custom Label**: Clickable icon label for better UX
- **Keyboard Support**: Enter/Space key support for accessibility
- **Tooltip**: Displays "Import all your data from a file" on hover

## Data Migration System

### Migration Logic

Located in [`userData.ts`](frontend/src/components/header/userData/userData.ts):

#### Version Detection

- Each exported data file contains [`meta.exportVersion`](frontend/src/components/header/userData/userData.ts:14) field
- Current version is 2, previous version was 1

#### Migration Process

1. **Version 1 → Version 2**:

   - Adds [`apiKeys: { yahoo: "" }`](frontend/src/components/header/userData/userData.ts:42) field
   - Updates [`meta.exportVersion`](frontend/src/components/header/userData/userData.ts:44) to 2

2. **Migration Function**: [`doMigration()`](frontend/src/components/header/userData/userData.ts:31) applies all necessary transformations

#### Backward Compatibility

- Supports importing older version 1 files
- Automatically migrates data structure during import
- Maintains data integrity throughout migration process

## State Management Integration

### React Hooks

The import/export functionality integrates with custom React hooks:

#### Portfolio Management

- [`useSetPortfolios()`](frontend/src/hooks/portfolios/portfolioHooks.ts:34): Updates both React state and localStorage
- [`useGetPortfolios()`](frontend/src/hooks/portfolios/portfolioHooks.ts:29): Retrieves current portfolio library

#### Asset Management

- [`useSetAssets()`](frontend/src/hooks/assets/assetHooks.ts:15): Updates both React state and localStorage
- [`useGetAssets()`](frontend/src/hooks/assets/assetHooks.ts:10): Retrieves current asset library

#### API Key Management

- [`useSetApiKeys()`](frontend/src/hooks/apiKeys/apiKeyHooks.ts:10): Updates both React state and localStorage
- [`useGetApiKeys()`](frontend/src/hooks/apiKeys/apiKeyHooks.ts:5): Retrieves current API keys

### Data Persistence

All state updates automatically persist to [`localStorage`](frontend/src/hooks/portfolios/portfolioHooks.ts:38):

- Ensures data survives browser sessions
- Provides immediate backup of user changes
- Maintains consistency between React state and stored data

## User Interface Integration

### Header Integration

Both components are integrated into the main application header via [`Header.tsx`](frontend/src/components/header/Header.tsx:17):

- Positioned alongside API key management
- Uses Material-UI [`Stack`](frontend/src/components/header/Header.tsx:17) for layout
- Maintains consistent styling with other header elements

### Styling

- **DataImport**: Uses [`DataImport.module.less`](frontend/src/components/header/userData/dataImport/DataImport.module.less) for component-specific styles
- **Icons**: Font Awesome icons for visual consistency
- **Material-UI**: Leverages MUI components for tooltips and layout

## Testing Infrastructure

### Test Utilities

The codebase includes comprehensive testing support:

- [`localStorage.ts`](frontend/src/testUtils/localStorage.ts): [`setUserData()`](frontend/src/testUtils/localStorage.ts:3) helper for test data setup
- Component integration tests verify import/export workflows
- Mock data structures available in [`testConstants.ts`](domain/src/testConstants.ts)

### Test Coverage

Import/export functionality is tested through:

- Unit tests for data parsing and migration
- Integration tests for component behavior
- End-to-end workflows in larger application tests

## Technical Dependencies

### External Libraries

- **@mui/material**: Material-UI components for [`Tooltip`](frontend/src/components/header/userData/dataExport/DataExport.tsx:1) and [`Stack`](frontend/src/components/header/Header.tsx:1) layout
- **React**: Hooks including [`useState`](frontend/src/components/header/userData/dataImport/DataImport.tsx:2), [`useContext`](frontend/src/hooks/portfolios/portfolioHooks.ts:18), [`useId`](frontend/src/components/header/userData/dataImport/DataImport.tsx:2)
- **pt-domain**: Domain layer package providing data structures and operations

### File Structure

```
frontend/src/components/header/userData/
├── userData.ts                    # Core types and parsing logic
├── dataExport/
│   └── DataExport.tsx            # Export component
└── dataImport/
    ├── DataImport.tsx            # Import component
    └── DataImport.module.less    # Component styling
```

### Hook Dependencies

Import/export components utilize custom hooks from multiple modules:

- [`portfolioHooks.ts`](frontend/src/hooks/portfolios/portfolioHooks.ts): Portfolio state management
- [`assetHooks.ts`](frontend/src/hooks/assets/assetHooks.ts): Asset state management
- [`apiKeyHooks.ts`](frontend/src/hooks/apiKeys/apiKeyHooks.ts): API key management

## Implementation Details

### Data Parsing Function

The [`parseUserData`](frontend/src/components/header/userData/userData.ts:18) function signature:

```typescript
const parseUserData = (jsonString: string): UserData
```

- Throws `Error` with message format: `"cannot parse user data ${jsonString}"`
- Validates existence of three required properties: `assets`, `meta`, `portfolios`
- Calls [`doMigration(parsedObject)`](frontend/src/components/header/userData/userData.ts:24) for version compatibility

### Migration Implementation

The migration system uses a reducer pattern:

```typescript
const doMigration = (data: UserDataOfAnyVersion): UserData =>
  [getV2].reduce((result, reducer, i) => {
    return result.meta.exportVersion <= i + 1 ? reducer(data) : data;
  }, data);
```

- Migration functions array currently contains single element: [`getV2`](frontend/src/components/header/userData/userData.ts:33)
- Version comparison uses `<=` operator with index-based versioning
- TypeScript errors suppressed with `@ts-expect-error` comments

### File I/O Implementation

**Export Process:**

- Creates [`Blob`](frontend/src/components/header/userData/dataExport/DataExport.tsx:24) with MIME type `"application/json"`
- Generates URL using [`URL.createObjectURL(blob)`](frontend/src/components/header/userData/dataExport/DataExport.tsx:25)
- Downloads via HTML anchor element with [`download`](frontend/src/components/header/userData/dataExport/DataExport.tsx:29) attribute

**Import Process:**

- File input accepts [`accept=".json"`](frontend/src/components/header/userData/dataImport/DataImport.tsx:75) attribute
- Uses [`FileReader.readAsText(file, "UTF-8")`](frontend/src/components/header/userData/dataImport/DataImport.tsx:23)
- Handles three error scenarios: file reading, JSON parsing, type validation

### State Synchronization Pattern

All hooks follow identical localStorage synchronization pattern:

```typescript
const setter = (data: DataType) => {
  setStateFunction(data);
  localStorage.setItem(key, JSON.stringify(data));
};
```

This pattern is implemented in:

- [`useSetPortfolios()`](frontend/src/hooks/portfolios/portfolioHooks.ts:36)
- [`useSetAssets()`](frontend/src/hooks/assets/assetHooks.ts:18)
- [`useSetApiKeys()`](frontend/src/hooks/apiKeys/apiKeyHooks.ts:13)

## Data Constraints and Formats

### Storage Keys

- Portfolios: `"portfolios"` key in localStorage
- Assets: `"assets"` key in localStorage
- API Keys: `"apiKeys"` key in localStorage

### JSON Export Format

Exported files use [`JSON.stringify(data, null, 2)`](frontend/src/components/header/userData/dataExport/DataExport.tsx:23) producing:

- 2-space indentation
- All object properties included
- No circular reference handling
- Standard JSON encoding

### File Naming Convention

Export files use fixed naming: [`"portfolioTracker_dataExport.json"`](frontend/src/components/header/userData/dataExport/DataExport.tsx:29)

### API Key Structure

Current implementation supports single API provider:

```typescript
type ApiKeys = {
  yahoo: string;
};
```

## Component Architecture

### DataExport Component

- **Return Type**: `ReactElement | null`
- **Conditional Rendering**: Returns `null` if any required data is missing
- **Data Dependencies**: Requires all three data sources (portfolios, assets, apiKeys)
- **Side Effects**: None - pure rendering component

### DataImport Component

- **State Management**: Uses [`useState`](frontend/src/components/header/userData/dataImport/DataImport.tsx:16) for error dialog visibility
- **Event Handlers**: File change, keyboard navigation, error scenarios
- **Accessibility**: Implements ARIA patterns with [`tabIndex={0}`](frontend/src/components/header/userData/dataImport/DataImport.tsx:63) and [`onKeyDown`](frontend/src/components/header/userData/dataImport/DataImport.tsx:64)
- **Error UI**: Uses [`InfoDialog`](frontend/src/components/header/userData/dataImport/DataImport.tsx:78) component for error display

## Testing Infrastructure

### Mock Data Structures

Test constants defined in [`domain/src/testConstants.ts`](domain/src/testConstants.ts):

- `TEST_ASSET_TESLA`, `TEST_ASSET_GOOGLE`: Sample asset objects
- `TEST_ASSET_LIB`: Complete asset library structure
- `TEST_ORDER_*`: Sample order objects with UUIDs
- `TEST_PORTFOLIO`: Complete portfolio structure

### Test Utilities

- [`setUserData()`](frontend/src/testUtils/localStorage.ts:3) function for localStorage setup in tests
- [`customRender()`](frontend/src/testUtils/componentHelpers.tsx:47) wrapper providing UserDataProvider context
- Component tests verify import workflow with mock FileReader events

### Test Patterns

Tests utilize consistent patterns:

- [`localStorage.setItem("portfolios", JSON.stringify(...))`](frontend/src/components/Portfolios/OrderInputForm/OrderInputForm.test.tsx:19) for data setup
- [`customRender({ component: <Component /> })`](frontend/src/components/Portfolios/ActivityList/ActivityList.test.tsx:66) for component rendering
- [`setUserData({ portfolios: ..., assets: ... })`](frontend/src/components/Portfolios/ActivityList/ActivityList.test.tsx:61) for test data initialization

---

_This document describes the technical implementation of import/export functionality as implemented in the current codebase._
