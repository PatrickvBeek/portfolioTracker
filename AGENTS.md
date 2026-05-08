# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Build/Lint/Test Commands

- **Single test**: `cd domain && pnpm vitest run <path>` or `cd frontend && pnpm vitest run <path>`
- **Watch mode**: `cd domain && pnpm vitest watch` or `cd frontend && pnpm vitest watch`
- **Full test suite**: `pnpm test` (runs both domain and frontend tests)
- **Type checking**: `pnpm tsc` (root), `cd domain && pnpm tsc`, `cd frontend && pnpm tsc`
- **Linting**: `pnpm lint` (runs oxlint on all files)
- **Lint fix**: `pnpm lint:fix` (auto-fixes linting issues)
- **Architecture validation**: `pnpm architecture-tests` (runs dependency-cruiser to enforce domain isolation)
- **Format check**: `pnpm fmt:check`
- **Format fix**: `pnpm fmt`
- **Build frontend**: `pnpm build` or `pnpm --filter frontend build`
- **Start dev server**: `pnpm start` or `pnpm --filter frontend start`

## Code Style Guidelines

### Imports

- Domain imports in frontend: Use alias `"pt-domain"` not relative paths (e.g., `import { Order } from "pt-domain"`)
- Local imports: Prefer relative paths for same-package imports
- Group imports: external libs → pt-domain → local modules
- `pt-domain` is a workspace dependency linked via `"pt-domain": "workspace:*"` in frontend package.json

### Types

- Use TypeScript strict mode (enforced)
- Define types in `.entities.ts` files for domain models
- Expect explicit type annotations, avoid `any` (oxlint enforces this)
- Use union types for variants (e.g., `BatchType`)
- Test types use pattern: `type NameProps = Props<{ required: string; optional?: number }>`

### Naming Conventions

- **Components**: PascalCase (`Dashboard`, `OrderInputForm`)
- **Hooks**: camelCase with `use` prefix (`useOrderValidation`, `useGetAssets`)
- **Utilities**: camelCase (`toPrice`, `fillNumberInput`)
- **Constants**: UPPER_SNAKE_CASE (`TEST_PORTFOLIO`, `TEST_ASSET_TESLA`)
- **CSS selectors**: kebab-case (`.container`, `.portfolio-selection`)

### Formatting

- oxfmt config: `trailingComma: es5`, `printWidth: 80` (see `.oxfmtrc.json`)
- Oxlint enforces TypeScript best practices with extensive rule set
- No inline comments unless specifically requested
- Consistent indentation (2 spaces)

### File Organization

- **Domain entities**: `<module>.entities.ts`
- **Domain operations**: `<module>.operations.ts`, `<module>.derivers.ts`
- **Component logic**: `<Component>.logic.ts` (NOT inline in component)
- **Styles (RadixUI+Tailwind)**: `<Component>.styles.ts` (see Styling Rules below)
- **Styles (MUI legacy)**: `.module.less` files (migrate from `bemHelper` + `.css`)
- **Tests**: `<module>.test.ts`, `<Component>.test.tsx`

### Error Handling

- Domain functions return undefined/null for invalid states unless error type required
- React components show "Error..." text for loading/query failures
- Use optional chaining and nullish coalescing for safe access
- API failures should display user-friendly error messages
- LocalStorage errors should be handled gracefully (e.g., userDataContext)

## Critical Architecture Rules

- **Domain isolation**: Domain layer strictly forbidden from importing frontend code (enforced by dependency-cruiser)
- **Monorepo structure**: pnpm workspaces with `pt-domain` as domain, `frontend` as React app
- **Workspace configuration**: `.pnpm-workspace.yaml` defines packages: `domain` and `frontend`

## React Patterns

- Use hooks from `<Component>.logic.ts` files, never inline logic
- State management: React state for local, `usePortfolioSelector` for global
- Query state: TanStack Query API calls via hooks
- Component composition: Build small reusable components
- Props: Define explicit interfaces, use `Props<T>` helper for flexibility

## Styling Rules

### RadixUI + Tailwind (preferred for new components)

- **Design tokens**: Defined in `frontend/src/index.css` via Tailwind v4 `@theme` directive
- **Utility function**: `cn()` from `frontend/src/utility/cn.ts` (combines `clsx` + `tailwind-merge`)
- **Component variants**: Use `class-variance-authority` (CVA) for components with multiple variants (buttons, inputs, cards)
- **Style files**: `<Component>.styles.ts` — contains CVA variant definitions AND plain style constants
- **Shared UI styles**: Cross-component variants live in `frontend/src/components/ui/*.styles.ts`
- **Import order in .styles.ts**: CVA variants (exported as named functions) first, then plain constants (exported as `styles` object)

**What goes where:**

| Style type                                        | Location                                   | Example                                    |
| ------------------------------------------------- | ------------------------------------------ | ------------------------------------------ |
| Cross-component variants (buttons, inputs, cards) | `components/ui/*.styles.ts`                | `buttonVariants()`, `inputVariants()`      |
| Component-internal repeated patterns              | `<Component>.styles.ts` as `styles` object | `styles.tableRow`, `styles.sectionHeading` |
| Component-specific variants                       | `<Component>.styles.ts` as CVA             | `deleteButtonVariants()`                   |
| Layout utilities (flex, gap, padding, margin)     | Inline in TSX                              | `"flex items-center gap-3"`, `"mt-4"`      |
| One-off single-class styles                       | Inline in TSX                              | `"w-6 h-6"`, `"ml-auto"`                   |

**Rules:**

- Extract visual/design-token classes (colors, borders, transitions, focus rings) into `.styles.ts`
- Layout/structure classes (flex, grid, gap, padding, margin) can stay inline, if short
- Never use `@apply` in CSS for component styles (Tailwind team discourages it)
- Never use CSS Modules (`.module.css`) for Tailwind-styled components
- Always use `cn()` for composing classes: `cn(buttonVariants({ intent: "primary" }), className)`

### MUI + LESS (legacy, being migrated)

- **MUI components**: Customize via `frontend/src/theme/theme.ts`, never inline styles
- **Custom styles**: Use `.module.less` files with CSS modules
- **LESS variables**: Must use predefined variables from `frontend/src/theme/definitions.less`
- **Deprecated pattern**: `bemHelper` + `.css` files → migrate to `.module.less` or RadixUI+Tailwind
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

- **Package manager**: pnpm (monorepo with workspaces)
- **Date handling**: `moment` (consistent across domain and frontend)
- **Utils**: `radash` for functional utilities (`omit`, `shake`, `sort`)
- **UUID**: `uuid` package for unique identifiers
- **Icons**: FontAwesome (`@fortawesome/fontawesome-free`), `lucide-react` (preferred for RadixUI components)
- **Charts**: Recharts, D3 arrays/scaling
- **Dev tools**: oxlint (linting), oxfmt (formatting), syncpack (dependency version sync)

## TypeScript Config

- ES modules: `"type": "module"` in package.json
- Paths: No custom path mappings - use `"pt-domain"` alias
- Strict mode enabled
- Workspace dependencies use `"workspace:*"` protocol

## Important Notes

- **syncpack**: Uses `.syncpackrc.yml` configuration with workspace packages ignored via `versionGroups`
- **pnpm-lock.yaml**: Single lockfile at root for all workspaces
- **node_modules**: pnpm uses symlinks and shared content-addressable storage for efficiency
