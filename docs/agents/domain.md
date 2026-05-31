# Domain docs layout

This repo uses a **single-context** layout.

## File locations

| File         | Location  | Purpose                                      |
| ------------ | --------- | -------------------------------------------- |
| `CONTEXT.md` | Repo root | Domain language, core concepts, glossary     |
| `docs/adr/`  | Repo root | Architectural Decision Records (ADR-NNNN.md) |

## Consumer rules

Skills that read domain docs **must**:

1. Read `CONTEXT.md` at the repo root to understand the domain language before proposing changes.
2. Check `docs/adr/` for prior architectural decisions before introducing new patterns or overturning old ones.
3. When a decision is made that affects architecture, create or update an ADR in `docs/adr/`.

## When to create CONTEXT.md

If `CONTEXT.md` does not yet exist, the `improve-codebase-architecture` skill will propose creating one. It should contain:

- A short description of what the project does
- Key domain terms and their definitions
- The relationship between the `domain` and `frontend` workspaces
- Any conventions that are not obvious from the code alone
