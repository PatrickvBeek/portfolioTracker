# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build/Lint/Test Commands

- **Single test**: `cd domain && yarn vitest run <path>` or `cd frontend && yarn vitest run <path>`
- **Watch mode**: `cd domain && yarn vitest watch` or `cd frontend && yarn vitest watch`
- **Full test suite**: `yarn test` (runs both domain and frontend tests)
- **Type checking**: `yarn tsc` (root), `cd domain && yarn tsc`, `cd frontend && yarn tsc`
- **Linting**: `yarn lint` (runs eslint on all files)
- **Lint fix**: `yarn lint:fix` (auto-fixes linting issues)
- **Architecture validation**: `yarn architecture-tests` (runs dependency-cruiser to enforce domain isolation)
- **Format check**: `yarn format` (prettier --check)
- **Format fix**: `yarn format:fix` (prettier --write)
- **Build frontend**: `yarn build` or `yarn workspace frontend build`
- **Start dev server**: `yarn start` or `yarn workspace frontend start`

## Code Style Guidelines

### Imports

- Domain imports in frontend: Use alias `"pt-domain"` not relative paths (e.g., `import { Order } from "pt-domain"`)
- Local imports: Prefer relative paths for same-package imports
- Group imports: external libs → pt-domain → local modules

### Types

- Use TypeScript strict mode (enforced)
- Define types in `.entities.ts` files for domain models
- Expect explicit type annotations, avoid `any`
- Use union types for variants (e.g., `BatchType`)
- Test types use pattern: `type NameProps = Props<{ required: string; optional?: number }>`

### Naming Conventions

- **Components**: PascalCase (`Dashboard`, `OrderInputForm`)
- **Hooks**: camelCase with `use` prefix (`useOrderValidation`, `useGetAssets`)
- **Utilities**: camelCase (`toPrice`, `fillNumberInput`)
- **Constants**: UPPER_SNAKE_CASE (`TEST_PORTFOLIO`, `TEST_ASSET_TESLA`)
- **CSS selectors**: kebab-case (`.container`, `.portfolio-selection`)

### Formatting

- Prettier with `trailingComma: "es5"` (see package.json)
- ESLint enforces TypeScript best practices
- No inline comments unless specifically requested
- Consistent indentation (2 spaces)

### File Organization

- **Domain entities**: `<module>.entities.ts`
- **Domain operations**: `<module>.operations.ts`, `<module>.derivers.ts`
- **Component logic**: `<Component>.logic.ts` (NOT inline in component)
- **Styles**: Use `.module.less` files (migrate from `bemHelper` + `.css`)
- **Tests**: `<module>.test.ts`, `<Component>.test.tsx`

### Error Handling

- Domain functions return undefined/null for invalid states unless error type required
- React components show "Error..." text for loading/query failures
- Use optional chaining and nullish coalescing for safe access
- API failures should display user-friendly error messages
- LocalStorage errors should be handled gracefully (e.g., userDataContext)

## Critical Architecture Rules

- **Domain isolation**: Domain layer strictly forbidden from importing frontend code (enforced by dependency-cruiser)
- **Monorepo structure**: Domain exports via `"pt-domain"` package name, frontend consumes it

## React Patterns

- Use hooks from `<Component>.logic.ts` files, never inline logic
- State management: React state for local, `usePortfolioSelector` for global
- Query state: TanStack Query API calls via hooks
- Component composition: Build small reusable components
- Props: Define explicit interfaces, use `Props<T>` helper for flexibility

## Styling Rules

- **MUI components**: Customize via `frontend/src/theme/theme.ts`, never inline styles
- **Custom styles**: Use `.module.less` files with CSS modules
- **LESS variables**: Must use predefined variables from `frontend/src/theme/definitions.less`
- **Deprecated pattern**: `bemHelper` + `.css` files → migrate to `.module.less`
- **Import always at top**: `import styles from "./MyComponent.module.less"`

## Testing Patterns

- **Framework**: Vitest with jsdom (frontend) and node (domain)
- **Render helpers**: Use `customRender()` or `customRenderHook()` from `testUtils/componentHelpers.tsx`
- **Test theme**: Uses `disableRipple: true` to prevent act() warnings with MUI
- **Helper functions**: `customRender()` returns user + helpers (`fillNumberInput`, `selectAsset`)
- **Test data**: Use helper functions from domain `dataHelpers.ts` (`getTestOrder`, `getTestPortfolio`)
- **Test globals**: Automatically available: `describe`, `it`, `expect`, `test`, `beforeAll`, `beforeEach`, `afterAll`, `afterEach`, `vi`
- **Coverage**: Vitest with c8 coverage reporter

## Common Dependencies

- **Date handling**: `moment` (consistent across domain and frontend)
- **Utils**: `radash` for functional utilities (`omit`, `shake`, `sort`)
- **UUID**: `uuid` package for unique identifiers
- **Icons**: FontAwesome (`@fortawesome/fontawesome-free`)
- **Charts**: Recharts, D3 arrays/scaling

## TypeScript Config

- ES modules: `"type": "module"` in package.json
- Paths: No custom path mappings - use `"pt-domain"` alias
- Strict mode enabled
