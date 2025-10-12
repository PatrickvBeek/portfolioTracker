# Project Debug Rules (Non-Obvious Only)

- Test commands must run from workspace subdirectories: `cd domain && yarn vitest run <path>` or `cd frontend && yarn vitest run <path>`
- Architecture validation failures: run `yarn architecture-tests` to check domain isolation rules
- Vite dev server proxies `/api/*` to `http://localhost:6060` (backend dependency)
- MUI component test failures: ensure using `customRender()` which sets `disableRipple: true`
- Domain import errors: use `"pt-domain"` alias, not relative paths between workspaces
- Test helper functions available: `fillNumberInput()`, `selectAsset()` from `customRender()`
