/**
 * The shared surfaces, pinned.
 *
 * Every one of these tokens exists because the same value had drifted across
 * many files, and each was settled by an explicit decision. A comment records
 * why, but a comment does not fail, and all three of these were reintroduced
 * by hand at least once after being centralised: the red focus ring came back
 * in nine fields, the pre-fieldStyles input string survived a refactor in six
 * copies, and a cleanup pass nearly folded the admin surface away as drift.
 *
 * These assertions are deliberately about properties rather than exact
 * strings. Pinning the whole class list would fail on a harmless reorder and
 * teach people to update the test without reading it.
 */
import {
  FIELD_BASE,
  FIELD_LABEL,
  fieldBorder,
} from "@/components/ui/fieldStyles";
import {
  PANEL_SURFACE,
  ADMIN_PANEL_SURFACE,
} from "@/components/ui/panelStyles";

describe("field tokens", () => {
  it("does not use the brand red for focus", () => {
    // primary is the same red as border-red-500, which is how an error is
    // marked, so a red focus ring made every field you touched look rejected.
    expect(FIELD_BASE).not.toContain("ring-primary");
    expect(FIELD_BASE).not.toContain("border-primary");
  });

  it("has a focus treatment at all, so removing red did not remove focus", () => {
    expect(FIELD_BASE).toMatch(/focus:/);
  });

  it("keeps red for errors, which is the distinction that matters", () => {
    expect(fieldBorder(true)).toContain("red");
    expect(fieldBorder(false)).not.toContain("red");
  });

  it("labels are the legible weight chosen over the muted one", () => {
    // Settled on the 24-use majority, which is also the more readable of the
    // two for an audience that skews 45+.
    expect(FIELD_LABEL).toContain("font-semibold");
    expect(FIELD_LABEL).not.toContain("text-text-muted");
  });
});

describe("panel surfaces", () => {
  it("uses one radius at every width", () => {
    // The owner chose the majority over the documented responsive pattern.
    // RESPONSIVE_CODE_REVIEW_CHECKLIST now says to reject any new one.
    expect(PANEL_SURFACE).toContain("rounded-xl");
    expect(PANEL_SURFACE).not.toMatch(/md:rounded/);
  });

  it("carries no padding, because p-6 and p-12 are different intents", () => {
    expect(PANEL_SURFACE).not.toMatch(/\bp-\d/);
    expect(ADMIN_PANEL_SURFACE).not.toMatch(/\bp-\d/);
  });

  it("keeps the admin surface distinct on purpose", () => {
    // The admin area is meant to read as a separate application. This is the
    // decision, not drift, and a cleanup pass nearly folded it away once.
    expect(ADMIN_PANEL_SURFACE).not.toEqual(PANEL_SURFACE);
    expect(ADMIN_PANEL_SURFACE).toContain("rounded-2xl");
  });
});
