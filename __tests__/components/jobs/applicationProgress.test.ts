/**
 * The apply form's sections are derived, not hand-listed.
 *
 * This has now broken twice in opposite directions. First the bar counted
 * four sections while six cards rendered, so it read "4 of 4" with two cards
 * untouched. The fix padded the array to six, which required inventing a
 * value for the two sections that have no completion state, and those two
 * invented values became the second bug: an untouched form reported "3 of 6
 * sections completed" above a page showing one tick and numbered 1, 2, 3, 4,
 * 6.
 *
 * Both are the same root cause. "Which sections exist" was written down by
 * hand in more than one place, and only one copy shrank when a section was
 * conditional. A source tripwire rather than a render test, because the
 * failure is the reappearance of a second hand-maintained list, which a test
 * of rendered output would not name.
 */
import fs from "fs";
import path from "path";

const FORM = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "components",
  "pages",
  "jobs",
  "JobApplicationForm.tsx",
);
const src = fs.readFileSync(FORM, "utf8");

/** Comments explain the old bug by name, so they must not count as usage. */
const code = src
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/^\s*\/\/.*$/gm, "");

describe("apply form section list", () => {
  it("has no hardcoded section numerals", () => {
    // `number={5}` on a card that only sometimes renders is what produced
    // the visible 1, 2, 3, 4, 6.
    expect(code).not.toMatch(/number=\{\d+\}/);
  });

  it("no longer keeps a parallel sectionComplete array", () => {
    expect(code).not.toContain("sectionComplete");
  });

  it("derives numerals from position in the one list", () => {
    expect(code).toContain("number: index + 1");
  });

  it("separates being counted from being rendered", () => {
    // The optional section is rendered and numbered but must never sit in
    // the denominator, or the bar can never reach zero.
    expect(code).toMatch(/counts:\s*false/);
    expect(code).toContain("sections.filter((s) => s.counts)");
  });

  it("divides by the counted sections, never by the full list", () => {
    expect(code).toContain("countedSections.length");
    expect(code).not.toMatch(/\/\s*6\)\s*\*\s*100/);
  });

  it("keeps the phone check synchronous", () => {
    // Not a bundle concern: PhoneField.lazy exports a safe validatePhone.
    // It is that the lazy validator reports any non-empty value as fine
    // until its chunk lands, so the bar would read 1 of 4 and then drop to
    // 0 of 4 on its own. The eager module must also stay unimported.
    expect(code).not.toMatch(/from "@\/components\/ui\/PhoneField"/);
    expect(code).not.toContain('validatePhone');
    expect(code).toContain('from "@/components/ui/PhoneField.lazy"');
  });
});
