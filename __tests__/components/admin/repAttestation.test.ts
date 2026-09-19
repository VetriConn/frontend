/**
 * `authorized_rep_verified` is a record, never a badge.
 *
 * The submission form makes the attestation tick box required and then sends
 * `authorized_rep_verified: true` unconditionally, so the flag is true for
 * every company that has ever applied. It carries no information. Rendered as
 * a green check badge it actively misled, because it reads as a check the
 * platform performed on the business rather than a box the applicant ticked
 * about themselves.
 *
 * A source tripwire rather than a render test, because the failure mode is
 * somebody reintroducing the badge somewhere new, which a test of the two
 * components that used to have it would not catch.
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(__dirname, "..", "..", "..");
const DIRS = ["components", "app"];
/** Where the attestation is legitimately shown, as an admin-only record. */
const RECORD = path.join("components", "pages", "admin", "CompanyDetail.tsx");

/**
 * Comments are the codebase talking to itself, and the note explaining why
 * the badge is gone names the field. Stripping them keeps that note legal.
 */
const code = (file: string): string =>
  fs
    .readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });

const files = DIRS.flatMap((d) => walk(path.join(ROOT, d)));

describe("authorized_rep_verified", () => {
  it("is read in exactly one place, the admin record", () => {
    const readers = files
      .filter((f) => code(f).includes("authorized_rep_verified"))
      .map((f) => path.relative(ROOT, f))
      // The application form writes the flag; it does not display it.
      .filter((f) => !f.endsWith("CompanyApplicationForm.tsx"));

    expect(readers).toEqual([RECORD]);
  });

  it("is not labelled as verification anywhere a member can see", () => {
    const offenders = files
      .filter((f) => /Rep verified|rep verified/.test(code(f)))
      .map((f) => path.relative(ROOT, f));

    expect(offenders).toEqual([]);
  });

  it("is worded as the applicant's own declaration on the admin record", () => {
    const src = fs.readFileSync(path.join(ROOT, RECORD), "utf8");
    expect(src).toContain("Attested by the applicant at submission");
    expect(src).not.toContain("CheckBadge");
  });
});
