// Copies country-flag-icons' 3x2 SVGs (a transitive dependency of
// react-phone-number-input) into public/flags, so flags load as static
// assets instead of ~250 inline React components in the JS bundle.
// Runs via the predev/prebuild hooks; public/flags is gitignored.
import { cpSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const src = fileURLToPath(
  new URL("../node_modules/country-flag-icons/3x2", import.meta.url),
);
const dest = fileURLToPath(new URL("../public/flags", import.meta.url));

mkdirSync(dest, { recursive: true });
cpSync(src, dest, { recursive: true });
