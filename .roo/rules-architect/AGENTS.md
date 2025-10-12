# Project Architecture Rules (Non-Obvious Only)

- Domain layer strictly forbidden from importing frontend code (enforced by dependency-cruiser)
- Monorepo packages: `domain` exports via `"pt-domain"`, `frontend` imports from alias
- Component separation: logic extraction to `<Component>.logic.ts` for complex data handling
- Style architecture: MUI theming in `theme.ts`, custom styles in `.module.less` only
- Testing architecture: specialized render functions with providers in `testUtils/`
- Build architecture: workspace-specific commands, tests run from subdirectories
- Legacy migration: `bemHelper` + `.css` pattern should be replaced with `.module.less`
