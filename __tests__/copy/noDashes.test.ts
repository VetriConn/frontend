/**
 * No dashes in anything a member reads.
 *
 * This is a project rule (.cursor/rules/no-em-dashes.mdc) and it kept being
 * broken, which is the argument for a test rather than a convention. A sweep
 * removed dashes from fifteen files, and within the same week new copy
 * arrived carrying them again, because nothing failed when it did.
 *
 * Two reasons it matters beyond house style. A dash between two numbers is
 * read aloud as nothing, so "3-5 business days" reaches a screen reader as
 * "3 5 business days". And lib/application-prefill was found actively
 * converting hyphens into en dashes inside text the applicant then sends to
 * an employer under their own name.
 *
 * Scope is deliberately narrow: string literals and JSX text, not comments.
 * Engineering comments are the codebase talking to itself and are not copy.
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve(__dirname, "../..");
const SKIP = new Set([
  "node_modules",
  ".next",
  ".next-check",
  ".git",
  "__tests__",
  "storybook-static",
  "public",
]);

/** A dash used as punctuation. Hyphens are fine, these are not. */
const DASH = /[–—]/;

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

/**
 * Strip every comment so only live code and JSX text remain.
 *
 * Done before the search rather than after, because a line like
 * `const x = 1; // note - here` would otherwise be reported for a dash that
 * nobody reads.
 */
function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

describe("no dashes in copy", () => {
  const files = walk(ROOT);

  it("scans a meaningful number of files, so a broken walk cannot pass", () => {
    // Guards the test itself. A walker that silently returns nothing would
    // otherwise report a clean sweep forever.
    expect(files.length).toBeGreaterThan(150);
  });

  it("finds no en dash or em dash in any rendered string", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const body = stripComments(fs.readFileSync(file, "utf8"));
      body.split("\n").forEach((line, i) => {
        if (DASH.test(line)) {
          offenders.push(`${path.relative(ROOT, file)}:${i + 1}  ${line.trim()}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});
