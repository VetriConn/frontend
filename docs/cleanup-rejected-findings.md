# Cleanup findings that were rejected

Things an automated dead-code scan flags here that are **not** dead. Recorded so
the next cleanup pass does not re-propose them, because eventually someone says
yes and breaks the build.

Last verified: 2026-09-17, against `knip@5`.

| Flagged | Verdict | Why the scanner is wrong |
|---|---|---|
| `@svgr/webpack` (frontend dep) | Keep | Referenced in `next.config.ts` and `jest.config.js`, not imported by any source file. |
| `pino-pretty` (backend dep) | Keep | Named as a string in the pino transport target at `src/utils/logger.ts:27`. Removing it breaks development logging. |
| `pure-rand`, `@types/estree`, `@types/json-schema`, `@types/json5` | Keep unless tested | Direct entries that exist to satisfy resolution under pnpm's strict linking. Removing them can break typecheck even though nothing imports them. Verify with a clean install before acting. |
| 32 exports in namespace-imported modules | Unverifiable | Their module is consumed with `import * as`, so no tool can tell which members are read. Treat as live. |
| Anything under `src/services/dataExport/` (backend) | Do not touch | In-flight work on `feat/data-export` as of this pass. New code has no callers yet and is indistinguishable from dead code. |
| `src/scripts/*.ts` without an npm script | Keep | Maintenance scripts are run ad hoc through `ts-node`. Absence from `package.json` is not evidence of deadness. |

## Method note

The first pass of this audit used grep for whole-file references and produced 75
false positives, because it could not tell which *binding* of a dual-export file
was in use. A file exporting both `export const Foo` and `export default Foo`
looks used either way. Resolving imports properly, binding by binding, is the
only check that works on this codebase.
