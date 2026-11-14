/**
 * The terms outline is derived, not written down, so these tests guard the
 * derivation rather than the content.
 *
 * The failure this exists for is silent. The document repeats subheadings
 * across its four audiences on purpose, so "Screening Tools" and several of
 * the indemnity and class action headings occur more than once. If two of
 * them ended up with the same id nothing would throw, nothing would look
 * wrong, and every link to that id would simply land on whichever came
 * first, sending employers into the job seeker terms. A page that quietly
 * shows somebody the wrong half of a contract is worse than one that breaks.
 */
import {
  TERMS_H3_IDS,
  TERMS_OUTLINE,
  TERMS_SECTIONS,
} from "@/lib/terms-content";

describe("terms outline", () => {
  it("gives every heading a unique id", () => {
    const ids = TERMS_OUTLINE.map((h) => h.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);

    expect(duplicates).toEqual([]);
  });

  it("uses ids that survive a URL fragment", () => {
    // Anything outside this set either needs escaping in an href or is
    // altered by the browser on the way into location.hash.
    for (const heading of TERMS_OUTLINE) {
      expect(heading.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("covers every section and every subheading, and nothing else", () => {
    const h3Count = TERMS_SECTIONS.reduce(
      (total, section) =>
        total + section.blocks.filter((b) => b.kind === "h3").length,
      0,
    );

    expect(TERMS_OUTLINE.filter((h) => h.level === 2)).toHaveLength(
      TERMS_SECTIONS.length,
    );
    expect(TERMS_OUTLINE.filter((h) => h.level === 3)).toHaveLength(h3Count);
    expect(Object.keys(TERMS_H3_IDS)).toHaveLength(h3Count);
  });

  it("lists headings in reading order", () => {
    // The rail picks the active heading by walking the outline and stopping
    // at the first one still below the fold, which is only correct if the
    // outline is in the same order as the page.
    const expected: string[] = [];
    for (const section of TERMS_SECTIONS) {
      expected.push(section.title);
      for (const block of section.blocks) {
        if (block.kind === "h3") expected.push(block.text);
      }
    }

    expect(TERMS_OUTLINE.map((h) => h.text)).toEqual(expected);
  });

  it("keys each subheading id by the block the page renders it from", () => {
    // The page looks the id up as `${section.id}:${blockIndex}` while
    // mapping over blocks. A key that does not match that shape yields
    // undefined, which renders an h3 with no id and a link to nowhere.
    for (const section of TERMS_SECTIONS) {
      section.blocks.forEach((block, index) => {
        const key = `${section.id}:${index}`;
        if (block.kind === "h3") {
          expect(TERMS_H3_IDS[key]).toBeDefined();
          expect(TERMS_H3_IDS[key].startsWith(`${section.id}-`)).toBe(true);
        } else {
          expect(TERMS_H3_IDS[key]).toBeUndefined();
        }
      });
    }
  });

  it("anchors every section id the outline advertises", () => {
    const sectionIds = new Set(TERMS_SECTIONS.map((s) => s.id));

    for (const heading of TERMS_OUTLINE.filter((h) => h.level === 2)) {
      expect(sectionIds.has(heading.id)).toBe(true);
    }
  });
});
