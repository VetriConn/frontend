/**
 * A skill the applicant typed themselves.
 *
 * The form offered a fixed pool — the employer's list, or a generic
 * fallback. A pool cannot know every trade, and a forklift ticket or thirty
 * years on a switchboard is exactly the experience this board exists to
 * surface. It was unofferable.
 *
 * The rule lives in lib/application-skills and is imported here, rather
 * than reproduced — a copy passes happily while the real one drifts.
 */

import { addSkill } from "@/lib/application-skills";

const POOL = ["Customer Service", "Data Entry"];

describe("adding a skill of your own", () => {
  it("keeps it", () => {
    expect(addSkill([], POOL, "Forklift Licence")).toEqual(["Forklift Licence"]);
  });

  it("keeps the applicant's own capitalisation", () => {
    // An employer reads this. How they wrote it is not ours to correct.
    expect(addSkill([], POOL, "RCMP security clearance")).toEqual([
      "RCMP security clearance",
    ]);
  });

  it("ignores blank input", () => {
    expect(addSkill(["A"], POOL, "   ")).toEqual(["A"]);
    expect(addSkill(["A"], POOL, "")).toEqual(["A"]);
  });

  it("trims what was typed", () => {
    expect(addSkill([], POOL, "  Welding  ")).toEqual(["Welding"]);
  });

  it("does not add the same skill twice, whatever the case", () => {
    expect(addSkill(["Welding"], POOL, "welding")).toEqual(["Welding"]);
    expect(addSkill(["Welding"], POOL, "WELDING")).toEqual(["Welding"]);
  });

  it("ticks the employer's chip rather than making a near-duplicate", () => {
    // Typing one that is already on offer should select THAT one, so the
    // employer does not see "data entry" sitting beside their "Data Entry".
    expect(addSkill([], POOL, "data entry")).toEqual(["Data Entry"]);
  });
});
