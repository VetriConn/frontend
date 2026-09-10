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
  storedResumes,
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

/**
 * Résumés already on the profile, offered instead of a fresh upload.
 *
 * The application sends the document's ID and the server resolves it against
 * that account's own documents (services/resumeSource) — never a URL, which
 * would be an invitation to name somebody else's file.
 */
describe("storedResumes", () => {
  const doc = (over: Record<string, unknown> = {}) => ({
    _id: "d1",
    name: "My CV.pdf",
    url: "https://res.cloudinary.com/x/cv.pdf",
    upload_date: "2026-01-01T00:00:00.000Z",
    ...over,
  });

  it("offers what the profile holds", () => {
    expect(storedResumes({ documents: [doc()] })).toHaveLength(1);
  });

  it("puts the most recent first, since that is the one they mean", () => {
    const older = doc({ _id: "old", upload_date: "2025-01-01T00:00:00.000Z" });
    const newer = doc({ _id: "new", upload_date: "2026-06-01T00:00:00.000Z" });
    expect(storedResumes({ documents: [older, newer] }).map((d) => d._id)).toEqual([
      "new",
      "old",
    ]);
  });

  it("skips anything that cannot actually be attached", () => {
    // No id means nothing to send; no url means nothing behind it. Either
    // would render a choice that silently fails on submit.
    const usable = storedResumes({
      documents: [doc(), doc({ _id: undefined }), doc({ url: "" })],
    });
    expect(usable).toHaveLength(1);
  });

  it("offers nothing when there is no profile yet", () => {
    expect(storedResumes(null)).toEqual([]);
    expect(storedResumes({})).toEqual([]);
  });
});
