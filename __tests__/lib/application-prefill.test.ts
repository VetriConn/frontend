/**
 * The application form fills from the profile when the profile arrives.
 *
 * Its initial state read `userProfile?.phone_number`, which is undefined on
 * the first render because the profile is still in flight — so the field
 * initialised empty and stayed empty however long the answer took. Name and
 * email had the same hole; phone was the one that showed, being most often
 * blank and the field the form marks required.
 */

import {
  prefillFromProfile,
  experienceOpener,
  type PrefillableFields,
  type PrefillProfile,
} from "@/lib/application-prefill";

const empty: PrefillableFields = {
  fullName: "",
  email: "",
  phone: "",
  relevantExperience: "",
};

const profile: PrefillProfile = {
  full_name: "Wisdom Adele",
  email: "a@example.com",
  phone_number: "+14165551234",
  years_of_experience: "3-5 years",
  job_title: "Customer Service Representative",
};

describe("prefillFromProfile", () => {
  it("fills the contact fields once the profile lands", () => {
    const out = prefillFromProfile(empty, profile);
    expect(out.phone).toBe("+14165551234");
    expect(out.fullName).toBe("Wisdom Adele");
    expect(out.email).toBe("a@example.com");
  });

  it("never overwrites what the applicant typed", () => {
    const typed = { ...empty, phone: "+15195550000", fullName: "Different Name" };
    const out = prefillFromProfile(typed, profile);
    expect(out.phone).toBe("+15195550000");
    expect(out.fullName).toBe("Different Name");
  });

  it("never overwrites a restored draft", () => {
    // The draft loader races this, so it has to be safe in either order.
    const draft = {
      ...empty,
      relevantExperience: "Twenty years on the floor at Canadian Tire.",
    };
    expect(prefillFromProfile(draft, profile).relevantExperience).toBe(
      "Twenty years on the floor at Canadian Tire.",
    );
  });

  it("is a no-op when run again", () => {
    const once = prefillFromProfile(empty, profile);
    expect(prefillFromProfile(once, profile)).toEqual(once);
  });

  it("does nothing before the profile arrives", () => {
    expect(prefillFromProfile(empty, null)).toEqual(empty);
    expect(prefillFromProfile(empty, undefined)).toEqual(empty);
  });

  it("ignores a field the profile does not have", () => {
    const out = prefillFromProfile(empty, { ...profile, phone_number: undefined });
    expect(out.phone).toBe("");
    expect(out.fullName).toBe("Wisdom Adele");
  });
});

describe("experienceOpener", () => {
  it("opens with a true sentence the applicant can continue", () => {
    expect(experienceOpener(profile)).toBe(
      "I have 3–5 years of experience as a Customer Service Representative. ",
    );
  });

  it("ends the sentence rather than trailing off", () => {
    // If it is submitted unedited it still has to read as something a person
    // wrote — and the trailing space leaves the cursor ready for specifics.
    expect(experienceOpener(profile).endsWith(". ")).toBe(true);
  });

  it("sets the range in an en dash, as the profile screen does", () => {
    expect(experienceOpener(profile)).toContain("3–5");
    expect(experienceOpener(profile)).not.toContain("3-5");
  });

  it("handles the open-ended range without mangling it", () => {
    expect(experienceOpener({ ...profile, years_of_experience: "20+ years" })).toContain(
      "20+ years",
    );
  });

  it("writes nothing when either half is missing", () => {
    // "I have  of experience as a ." is worse than an empty box.
    expect(experienceOpener({ ...profile, job_title: undefined })).toBe("");
    expect(experienceOpener({ ...profile, years_of_experience: undefined })).toBe("");
    expect(experienceOpener({ ...profile, job_title: "   " })).toBe("");
  });
});
