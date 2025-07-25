# Project Coding Rules (Non-Obvious Only)

- Always use Material UI components when applicable
- Custom styling: Use `.module.less` files, never inline styles
- `bemHelper` + `.css` pattern is deprecated → replace with `.module.less`
- MUI component styling changes go in `theme.ts` only
- Component logic must be extracted to `<Component>.logic.ts` files for complex data handling
- Domain calculations must be kept in `domain/` folder, not in React hooks
- Domain imports use `"pt-domain"` alias, not relative paths
- LESS files must reference predefined variables from `frontend/src/theme/definitions.less`
