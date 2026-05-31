# Concentrate persistence in the UserData module

The `UserDataProvider` (React context) sets React state but does not persist to localStorage. Persistence was scattered across three hook files (`assetHooks`, `portfolioHooks`, `apiKeyHooks`), each calling `localStorage.setItem` independently — meaning bypassing the hooks caused a state/disk desync. The `ApiKeys` type was defined inside a header component file but needed at the root context level (inverted dependency). We consolidate: the provider owns both state and persistence; hooks become thin one-line delegations; types move into the module. Three localStorage keys are kept (avoiding a storage migration). Read-side composition hooks (e.g. `useGetPortfolioActivity`) stay outside — this module is CRUD-focused, not a deriving layer. Import/export browser I/O stays in the component; the module exposes `setAllUserData` / `getUserData` as a clean data seam.

## Status

Accepted

## Considered Options

- **Single localStorage key** (`"userData"`): atomic writes and shape alignment with export format, but requires a storage migration for existing users and write amplification for small updates.
- **Three keys** (chosen): no migration needed, smaller writes, matches the three `useState` calls naturally. The non-atomic import risk is negligible (three synchronous `setItem` calls).

## Consequences

- The three hook files (`assetHooks.ts`, `portfolioHooks.ts`, `apiKeyHooks.ts`) collapse into thin delegations in the UserData module file.
- `userData.ts` (types, `parseUserData`, migration) moves out of `components/header/userData/` into the UserData module.
- `useDataImport` and `useDataExport` split: data logic moves into the module; browser I/O (FileReader, download link) stays in the component.
- Any future write path automatically persists — no way to forget `localStorage.setItem`.
