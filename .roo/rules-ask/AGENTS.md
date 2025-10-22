# Project Documentation Rules (Non-Obvious Only)

- Domain logic is strictly isolated in `domain/` folder - cannot import from frontend
- Monorepo structure: `domain` exports via `"pt-domain"` package, `frontend` consumes it
- Component logic patterns: complex data handling goes in `<Component>.logic.ts` files
- Testing utilities: `customRender()` in `testUtils/componentHelpers.tsx` provides specialized helpers
- Legacy pattern: `bemHelper` + `.css` files should be migrated to `.module.less`
- LESS variables: predefined values available in `frontend/src/theme/definitions.less`
- Architecture validation: dependency-cruiser enforces domain isolation rules
