# Codex Agent Instructions

## Scope
These instructions apply to the entire repository.

## Testing
- **Backend (Python)**: run `pytest backend/app/tests`.
- **Frontend (TypeScript)**: run `npx vitest run`.
- If tests fail because dependencies are missing, mention this in the PR description.

## Style Guidelines
- **Python**: format with `black` (line length 88).
- **TypeScript/React**: use Prettier defaults and lint with `npm run lint`.
- Prefer single quotes and omit semicolons in TSX/TS files.

## Commit Messages
- Use concise messages starting with a category, e.g. `feat:`, `fix:`, `docs:`.

## Pull Request Notes
Summarize key changes with file references and include test outcomes. If commands fail due to environment limits, add the standard disclaimer.
