# LLM Onboarding Guide - Portfolio Tracker

Welcome to the Portfolio Tracker project! This guide will help you quickly understand the project structure, patterns, and conventions so you can start implementing new features effectively.

## Table of Contents

1. [Project Overview & Goals](#project-overview--goals)
2. [Architecture & Structure](#architecture--structure)
3. [Domain Layer Guide](#domain-layer-guide)
4. [Frontend Layer Guide](#frontend-layer-guide)
5. [Testing Guidelines](#testing-guidelines)
6. [Development Workflows](#development-workflows)
7. [Key Patterns & Conventions](#key-patterns--conventions)
8. [Common Tasks & Examples](#common-tasks--examples)
9. [Troubleshooting & Best Practices](#troubleshooting--best-practices)

## Project Overview & Goals

The Portfolio Tracker is a **React-based web application** that helps users archive, visualize, and analyze their stock investments. Key characteristics:

- **Manual data entry only** - no bank integration or order placement
- **First In First Out (FIFO) principle** - ensures correct profit calculations
- **Multi-portfolio support** - users can manage multiple portfolios
- **Local storage** - all data stored in browser with export/import functionality
- **Real-time price integration** - supports Yahoo Finance and AlphaVantage APIs

### Core Features

- **Asset Management** - register assets with ticker symbols for price fetching
- **Portfolio Views** - detailed analysis with performance metrics and charts
- **Order/Dividend Entry** - validated transaction input forms
- **Position Tracking** - open/closed positions with batch-level detail
- **Performance Analysis** - balance history and time-weighted return charts
- **Dashboard** - consolidated view across all portfolios

## Architecture & Structure

The project follows a **strict domain/frontend separation**:

```
portfolioTracker/
├── domain/          # Pure business logic (TypeScript)
│   ├── src/
│   │   ├── activity/     # Activity entities and derivers
│   │   ├── asset/        # Asset entities and operations
│   │   ├── batch/        # Batch entities and derivers (FIFO logic)
│   │   ├── dividendPayouts/ # Dividend entities and derivers
│   │   ├── order/        # Order entities and derivers
│   │   ├── portfolio/    # Portfolio entities, operations, validation
│   │   ├── portfolioHistory/ # History derivers and entities
│   │   ├── price/        # Price entities
│   │   └── utils/        # Domain utilities
│   └── package.json
├── frontend/        # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── testUtils/    # Testing utilities
│   │   ├── queryClient/  # TanStack Query configuration
│   │   ├── theme.ts      # Material UI theme
│   │   └── definitions.less # Global LESS variables
│   └── package.json
└── .roo/            # Project documentation and rules
```

### Key Architectural Principles

1. **Domain Independence** - Domain layer has no React dependencies
2. **Functional Programming** - No classes, minimal mutations
3. **Entity-Based Design** - Clear data structures with operations
4. **Separation of Concerns** - UI logic vs business logic clearly separated

## Domain Layer Guide

The domain layer contains all business logic and financial calculations. Key patterns:

### Entity Structure

```typescript
// Example: Portfolio entity
export interface Portfolio {
  name: string;
  orders: Record<string, Order[]>;
  dividendPayouts: Record<string, DividendPayout[]>;
}
```

### File Organization

- **`.entities.ts`** - Type definitions and interfaces
- **`.operations.ts`** - Business operations and transformations
- **`.derivers.ts`** - Calculations and derived data
- **`.validation.ts`** - Data validation logic
- **`.test.ts`** - Unit tests

### Key Domain Modules

#### Portfolio Module ([`domain/src/portfolio/`](domain/src/portfolio/))

- Core portfolio entities and operations
- FIFO batch calculations
- Portfolio validation logic
- Performance metrics derivation

#### Activity Module ([`domain/src/activity/`](domain/src/activity/))

- Transaction activity derivers
- Activity timeline calculations

#### Batch Module ([`domain/src/batch/`](domain/src/batch/))

- FIFO batch logic implementation
- Buy/sell batch calculations
- Critical for profit calculations

### Usage Example

```typescript
import { Portfolio, calculatePortfolioValue } from "pt-domain";

// Domain functions are pure and testable
const portfolioValue = calculatePortfolioValue(portfolio, prices);
```

## Frontend Layer Guide

The frontend is built with React and follows specific patterns for maintainability.

### Component Structure

```
ComponentName/
├── ComponentName.tsx           # Main component
├── ComponentName.module.less   # Styling (preferred)
├── ComponentName.logic.ts      # Complex logic (if needed)
├── ComponentName.test.tsx      # Component tests
└── ComponentName.css          # Legacy styling (to be migrated)
```

### Key Directories

#### Components ([`frontend/src/components/`](frontend/src/components/))

- **`Assets/`** - Asset management components
- **`Portfolios/`** - Portfolio-specific components
- **`charts/`** - Chart components with Recharts
- **`general/`** - Reusable UI components
- **`header/`** - Navigation and header components

#### Hooks ([`frontend/src/hooks/`](frontend/src/hooks/))

- **`portfolios/`** - Portfolio data management hooks
- **`assets/`** - Asset management hooks
- **`prices/`** - Price fetching and caching hooks

### Component Patterns

#### 1. Logic Separation

```typescript
// Component.logic.ts - Complex logic goes here
export const useComponentLogic = (props: Props) => {
  // Complex calculations, data transformations
  return { derivedData, handlers };
};

// Component.tsx - UI focused
export const Component = (props: Props) => {
  const { derivedData, handlers } = useComponentLogic(props);
  return <div>{/* UI implementation */}</div>;
};
```

#### 2. Styling with Less Modules

```less
// Component.module.less
@import (reference) "src/definitions.less";

.container {
  display: flex;
  gap: @default-spacing;
  border-radius: @default-border-radius;
}

.button {
  background-color: @theme-highlight;
  color: white;
}
```

```typescript
// Component.tsx
import styles from './Component.module.less';

export const Component = () => (
  <div className={styles.container}>
    <button className={styles.button}>Click me</button>
  </div>
);
```

### Material UI Integration

#### Theme Customization ([`frontend/src/theme.ts`](frontend/src/theme.ts))

```typescript
// Extend MUI theme for project-specific styling
const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          borderRadius: "4px",
          // ... more customizations
        },
      },
    },
  },
});
```

#### Using MUI Components

```typescript
import { Button, Dialog, TextField } from '@mui/material';

// Prefer MUI components over custom implementations
const MyComponent = () => (
  <Dialog open={isOpen}>
    <TextField label="Amount" type="number" />
    <Button variant="contained" color="primary">
      Submit
    </Button>
  </Dialog>
);
```

## Testing Guidelines

### Testing Stack

- **Vitest** - Test runner (never use Jest)
- **React Testing Library** - Component testing
- **Testing Library User Event** - User interaction simulation

### Test File Patterns

- **`*.test.ts`** - Unit tests for domain logic
- **`*.test.tsx`** - React component tests

### Component Testing Example

```typescript
// Component.test.tsx
import { customRender } from '../../testUtils/componentHelpers';
import { Component } from './Component';

describe('Component', () => {
  it('should handle user interaction', async () => {
    const { user } = customRender({
      component: <Component />
    });

    // Use proper query priorities
    const button = screen.getByRole('button', { name: 'Submit' });
    await user.click(button);

    // Assert expected behavior
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});
```

### Testing Utilities ([`frontend/src/testUtils/`](frontend/src/testUtils/))

- **`componentHelpers.tsx`** - Custom render functions with providers
- **`localStorage.ts`** - Local storage mocking utilities
- **`networkMock.ts`** - Network request mocking

### Key Testing Patterns

#### 1. Custom Render Function

```typescript
import { customRender } from '../../testUtils/componentHelpers';

// Provides all necessary providers (Theme, Query, UserData)
const { user, renderResult } = customRender({
  component: <MyComponent />
});
```

#### 2. Query Testing

```typescript
// Always stick to React Testing Library query priorities
// 1. Accessible queries (getByRole, getByLabelText)
// 2. Semantic queries (getByText, getByDisplayValue)
// 3. Test IDs only as last resort

const button = screen.getByRole("button", { name: "Add Transaction" });
const input = screen.getByLabelText("Amount");
```

### Running Tests

```bash
# From project root
cd domain && yarn vitest run <path/to/file>
cd frontend && yarn vitest run <path/to/file>
```

## Development Workflows

### 1. Adding a New Feature

**Step 1: Domain Logic**

```bash
# 1. Create domain entities and operations
domain/src/newFeature/
├── newFeature.entities.ts
├── newFeature.operations.ts
├── newFeature.derivers.ts
└── newFeature.test.ts

# 2. Export from domain index
# Add to domain/src/index.ts
export * from "./newFeature";
```

**Step 2: Frontend Implementation**

```bash
# 1. Create component structure
frontend/src/components/NewFeature/
├── NewFeature.tsx
├── NewFeature.module.less
├── NewFeature.logic.ts
└── NewFeature.test.tsx

# 2. Create custom hooks if needed
frontend/src/hooks/newFeature/
├── newFeatureHooks.ts
└── newFeatureHooks.test.ts
```

**Step 3: Integration**

```bash
# 1. Update routing/navigation
# 2. Add to main app structure
# 3. Update tests
```

### 2. Starting Development Server

```bash
# Frontend development
cd frontend
yarn start  # Runs on http://localhost:5173

# Domain testing
cd domain
yarn test
```

### 3. Building for Production

```bash
cd frontend
yarn build
```

## Key Patterns & Conventions

### 1. Code Style

- **No classes** - Use functional programming patterns
- **Minimal comments** - Write self-explanatory code
- **No mutations** - Avoid mutating data objects unless critical for performance
- **TypeScript strict mode** - Leverage type safety

### 2. File Naming

- **Components**: `PascalCase.tsx`
- **Hooks**: `camelCase.ts`
- **Utilities**: `camelCase.ts`
- **Styles**: `ComponentName.module.less`
- **Tests**: `*.test.ts` or `*.test.tsx`

### 3. Import Patterns

```typescript
// Domain imports
import { Portfolio, calculateValue } from "pt-domain";

// Relative imports for local files
import { useMyHook } from "./MyComponent.logic";
import styles from "./MyComponent.module.less";

// Third-party imports
import { Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
```

### 4. CSS Variables and Spacing

```less
// Use predefined values from definitions.less
@import (reference) "src/definitions.less";

.container {
  padding: @default-spacing; // 1rem
  margin: @double-spacing; // 2rem
  border-radius: @default-border-radius;
  color: @theme-highlight;
}
```

### 5. State Management

- **TanStack Query** - Server state and caching
- **Local React state** - Component-specific state
- **Context** - Global app state (user data, theme)

## Common Tasks & Examples

### 1. Adding a New Chart Component

```typescript
// Chart.logic.ts
export const useChartLogic = (portfolioId: string) => {
  const { data: portfolio } = useGetPortfolio(portfolioId);
  const { data: prices } = usePortfolioPriceData(portfolioId);

  // Use domain functions for calculations
  const chartData = useMemo(() => {
    if (!portfolio || !prices) return [];
    return generateChartData(portfolio, prices);
  }, [portfolio, prices]);

  return { chartData };
};

// Chart.tsx
import { LineChart, Line, XAxis, YAxis } from 'recharts';

export const Chart = ({ portfolioId }: { portfolioId: string }) => {
  const { chartData } = useChartLogic(portfolioId);

  return (
    <LineChart data={chartData}>
      <XAxis dataKey="date" />
      <YAxis />
      <Line type="monotone" dataKey="value" stroke="#8884d8" />
    </LineChart>
  );
};
```

### 2. Creating a Form Component

```typescript
// Form.tsx
import { TextField, Button } from '@mui/material';
import { useState } from 'react';
import styles from './Form.module.less';

export const TransactionForm = ({ onSubmit }: Props) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Use domain validation
    const validation = validateTransaction({ amount, date });
    if (validation.isValid) {
      onSubmit({ amount: parseFloat(amount), date });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <TextField
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <TextField
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <Button type="submit" variant="contained">
        Add Transaction
      </Button>
    </form>
  );
};
```

### 3. Adding Domain Calculations

```typescript
// domain/src/calculations/performance.ts
export const calculateTimeWeightedReturn = (
  portfolio: Portfolio,
  prices: PriceData[]
): number => {
  // Pure function with no side effects
  const periods = dividePeriods(portfolio.orders);
  return (
    periods.reduce((twr, period) => {
      const periodReturn = calculatePeriodReturn(period, prices);
      return twr * (1 + periodReturn);
    }, 1) - 1
  );
};

// domain/src/calculations/performance.test.ts
describe("calculateTimeWeightedReturn", () => {
  it("should calculate correct TWR for simple case", () => {
    const result = calculateTimeWeightedReturn(mockPortfolio, mockPrices);
    expect(result).toBeCloseTo(0.15, 2); // 15% return
  });
});
```

## Troubleshooting & Best Practices

### Common Issues

#### 1. Component Not Updating

**Problem**: Component doesn't re-render when data changes
**Solution**: Check TanStack Query hooks, ensure proper dependency arrays

```typescript
// ❌ Bad - missing dependency
const { data } = useQuery({
  queryKey: ["portfolio"],
  queryFn: () => getPortfolio(portfolioId),
});

// ✅ Good - include portfolioId in query key
const { data } = useQuery({
  queryKey: ["portfolio", portfolioId],
  queryFn: () => getPortfolio(portfolioId),
});
```

#### 2. Test Failures

**Problem**: Tests fail due to async operations
**Solution**: Use proper async patterns and custom waitFor

```typescript
// ❌ Bad - not waiting for async operations
expect(screen.getByText("Loading...")).toBeInTheDocument();

// ✅ Good - wait for async completion
await waitFor(() => {
  expect(screen.getByText("Data loaded")).toBeInTheDocument();
});
```

#### 3. Styling Issues

**Problem**: Styles not applying correctly
**Solution**: Check import paths and variable references

```less
// ❌ Bad - direct variable usage
.container {
  padding: 1rem;
  color: rgb(65, 138, 216);
}

// ✅ Good - use definitions.less variables
@import (reference) "src/definitions.less";
.container {
  padding: @default-spacing;
  color: @theme;
}
```

### Performance Best Practices

1. **Memoize expensive calculations**

```typescript
const chartData = useMemo(
  () => generateChartData(portfolio, prices),
  [portfolio, prices]
);
```

2. **Use React.memo for expensive components**

```typescript
export const ExpensiveChart = React.memo(({ data }) => {
  // Expensive rendering logic
});
```

3. **Optimize TanStack Query**

```typescript
const { data } = useQuery({
  queryKey: ["portfolio", portfolioId],
  queryFn: () => getPortfolio(portfolioId),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

### Debugging Tips

1. **Use React DevTools** - Inspect component state and props
2. **Check TanStack Query DevTools** - Monitor query state
3. **Use browser debugger** - Set breakpoints in domain logic
4. **Log domain calculations** - Debug business logic separately

### Code Quality Checklist

- [ ] **Domain logic is pure** - No React dependencies
- [ ] **Components are focused** - Single responsibility
- [ ] **Tests cover critical paths** - Business logic and user interactions
- [ ] **Styling uses variables** - From definitions.less
- [ ] **Accessibility considered** - Proper ARIA labels and roles
- [ ] **Performance optimized** - Memoization where needed
- [ ] **Type safety maintained** - Strict TypeScript usage

## Quick Reference

### Essential Commands

```bash
# Start development
cd frontend && yarn start

# Run tests
cd domain && yarn test
cd frontend && yarn test

# Build production
cd frontend && yarn build

# Type checking
yarn tsc
```

### Key Files to Know

- [`domain/src/index.ts`](domain/src/index.ts) - Domain exports
- [`frontend/src/theme.ts`](frontend/src/theme.ts) - MUI theme
- [`frontend/src/definitions.less`](frontend/src/definitions.less) - CSS variables
- [`frontend/src/testUtils/componentHelpers.tsx`](frontend/src/testUtils/componentHelpers.tsx) - Test utilities

### Technology Stack

- **TypeScript** - Type safety and development experience
- **React 19** - UI framework
- **Material UI** - Component library
- **TanStack Query** - Data fetching and caching
- **Vitest** - Testing framework
- **Recharts** - Charting library
- **Less** - CSS preprocessing
- **Moment.js** - Date handling
- **Radash** - Utility functions

Now you're ready to start contributing to the Portfolio Tracker project! Remember to always consider the domain/frontend separation and follow the established patterns for maintainable, testable code.
