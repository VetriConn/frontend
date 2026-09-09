// Copies country-flag-icons' 3x2 SVGs into public/flags, so flags load as
// static assets instead of ~250 inline React components in the JS bundle.
// Runs via the predev/prebuild hooks; public/flags is gitignored.
//
// The package is resolved through Node, not a literal ../node_modules path:
// under pnpm's isolated linker only declared dependencies appear at the
// root, which is also why country-flag-icons is a direct devDependency
// rather than a phantom reach into react-phone-number-input's tree.
import { cpSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const src = join(
  dirname(require.resolve("country-flag-icons/package.json")),
  "3x2",
);
const dest = fileURLToPath(new URL("../public/flags", import.meta.url));

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
