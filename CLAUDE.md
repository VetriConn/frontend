# Vetriconn frontend: instructions for coding agents

Every module of the product, frontend included, is documented in the backend repository under `docs/<module>/`. With the two repositories checked out side by side that is `../backend/docs/`. `../backend/docs/README.txt` defines the nine files, the writing rules, and which module owns which code.

## Before changing code

1. Find the module that owns the screen or helper (`../backend/docs/README.txt`, section 1).
2. Read its `06-rules-and-traps.txt` and `04-frontend.txt`.
3. Run `npx tsc --noEmit` and `pnpm test:ci` once you are done.

## In the same piece of work

Update the module folder in the backend repository, as a commit there:

- `04-frontend.txt`: routes, components, hooks, caching or UX rules the change makes untrue.
- `CHANGELOG.txt`: a line under `## Unreleased`, naming the frontend pull request.
- `03-decisions.txt`, `06-rules-and-traps.txt`, `07-known-gaps.txt`: as the backend `CLAUDE.md` describes.

Cross-cutting UI guides stay in this repository: `RESPONSIVE_PATTERNS.md`, `RESPONSIVE_CODE_REVIEW_CHECKLIST.md`, `RESPONSIVE_TROUBLESHOOTING.md`, `components/ui/Button.README.md`. Update them when a shared pattern changes.

## Writing rules

Plain `.txt` as `../backend/docs/README.txt` section 3 describes. Name code by file and symbol, never by line number. No em dashes or en dashes, in docs or in user-facing copy (`__tests__/copy/noDashes.test.ts` enforces the copy side).
