# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Non-Obvious Build/Test Commands

- Test commands must run from workspace subdirectories: `cd domain && yarn vitest run <path>` or `cd frontend && yarn vitest run <path>`
- Architecture validation: `yarn architecture-tests` runs dependency-cruiser with domain isolation rules

## Non-Obvious Code Patterns

- Domain imports use alias `"pt-domain"` not relative paths
- Components using `bemHelper` + `.css` files are deprecated → migrate to `.module.less`
- Component logic goes in `<Component>.logic.ts` files, not inline in components
- MUI styling changes must be made in `theme.ts`, never inline styles
- LESS files must use predefined variables from `frontend/src/definitions.less`

## Non-Obvious Testing Patterns

- `customRender()` returns `user` object AND helper functions like `fillNumberInput()`, `selectAsset()`
- Test theme uses `disableRipple: true` to prevent act() warnings with MUI components
- Tests must use `customRender()` or `customRenderHook()` from `testUtils/componentHelpers.tsx`

## Critical Architecture Rules

- Domain layer strictly forbidden from importing frontend code (enforced by dependency-cruiser)
- Monorepo structure: domain exports via `"pt-domain"` package name, frontend consumes it
- Vite dev server proxies `/api/*` to `http://localhost:6060`
