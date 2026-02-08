# Project Debug Rules (Non-Obvious Only)

- Test commands must run from workspace subdirectories: `cd domain && npx vitest run <path>` or `cd frontend && npx vitest run <path>`
- Architecture validation failures: run `npm run architecture-tests` to check domain isolation rules
- MUI component test failures: ensure using `customRender()` which sets `disableRipple: true`
- Domain import errors: use `"pt-domain"` alias, not relative paths between workspaces
- Test helper functions available: `fillNumberInput()`, `selectAsset()` from `customRender()`
