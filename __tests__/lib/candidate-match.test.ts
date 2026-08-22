/**
 * Tests for the candidate matching maths behind the candidate detail view and
 * the applicant list — skills match and per-answer screening state.
 */
import {
  splitSkills,
  uniqueCI,
  skillMatch,
  screeningAnswerState,
} from "@/lib/candidate-match";

describe("splitSkills", () => {
  it("splits on commas, newlines and semicolons and trims", () => {
    expect(splitSkills("React, Node\nTypeScript; Go")).toEqual([
      "React",
      "Node",
      "TypeScript",
      "Go",
    ]);
  });

  it("drops empties and handles undefined", () => {
    expect(splitSkills(" , ,\n")).toEqual([]);
    expect(splitSkills(undefined)).toEqual([]);
  });
});

describe("uniqueCI", () => {
  it("de-duplicates case-insensitively, keeping the first spelling", () => {
    expect(uniqueCI(["React", "react", "Node", "NODE"])).toEqual([
      "React",
      "Node",
    ]);
  });
});

describe("skillMatch", () => {
  it("splits required into matched and unmatched, case-insensitively", () => {
    const r = skillMatch(
      ["React", "Node", "Go"],
      ["react", "node", "Python"],
    );
    expect(r.matched).toEqual(["React", "Node"]);
    expect(r.unmatched).toEqual(["Go"]);
    expect(r.percent).toBe(67);
  });

  it("de-duplicates the required list before scoring", () => {
    const r = skillMatch(["React", "react", "Node"], ["React"]);
    expect(r.required).toEqual(["React", "Node"]);
    expect(r.percent).toBe(50);
  });

  it("returns percent null when there is nothing to match against", () => {
    const r = skillMatch([], ["React"]);
    expect(r.percent).toBeNull();
    expect(r.matched).toEqual([]);
  });

  it("is 100 when every required skill is present", () => {
    expect(skillMatch(["A", "B"], ["a", "b", "c"]).percent).toBe(100);
  });
});

describe("screeningAnswerState", () => {
  it("is info when the question has no preferred answer", () => {
    expect(screeningAnswerState([], ["anything"], "short_text")).toBe("info");
  });

  it("is full or none for single-answer types, case-insensitively", () => {
    expect(screeningAnswerState(["Yes"], ["yes"], "yes_no")).toBe("full");
    expect(screeningAnswerState(["yes"], ["no"], "yes_no")).toBe("none");
    expect(
      screeningAnswerState(["Blue"], ["blue"], "single_choice"),
    ).toBe("full");
  });

  it("gives partial credit for multi-choice overlap", () => {
    expect(
      screeningAnswerState(["a", "b"], ["a"], "multi_choice"),
    ).toBe("partial");
    expect(
      screeningAnswerState(["a", "b"], ["a", "b"], "multi_choice"),
    ).toBe("full");
    expect(
      screeningAnswerState(["a", "b"], ["c"], "multi_choice"),
    ).toBe("none");
  });
});
