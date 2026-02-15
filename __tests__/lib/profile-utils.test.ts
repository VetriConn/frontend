/**
 * Unit Tests for Profile Completion Utilities
 * Tests the calculateProfileCompletion function against the 12-field model:
 *   full_name, picture, phone_number, location, bio, job_title,
 *   industry, years_of_experience, work_experience, education, documents, skills
 */

import {
  calculateProfileCompletion,
  PROFILE_COMPLETION_FIELDS,
} from "@/lib/profile-utils";
import { UserProfile } from "@/types/api";

const TOTAL = PROFILE_COMPLETION_FIELDS.length; // 11

describe("calculateProfileCompletion", () => {
  /** Helper: a fully-complete profile (all 11 fields populated). */
  const createMockProfile = (
    overrides: Partial<UserProfile> = {},
  ): UserProfile => ({
    full_name: "John Doe",
    role: "job_seeker",
    email: "john@example.com",
    phone_number: "123-456-7890",
    location: "New York, USA",
    job_title: "Software Engineer",
    industry: "Technology",
    years_of_experience: "5",
    bio: "Experienced developer",
    picture: "https://res.cloudinary.com/demo/image/upload/profile.jpg",
    work_experience: [
      {
        company: "Tech Corp",
        position: "Developer",
        start_date: "2020-01-01",
        end_date: "2023-01-01",
      },
    ],
    education: [
      {
        institution: "University",
        degree: "BS",
        field_of_study: "Computer Science",
      },
    ],
    documents: [
      {
        name: "Resume.pdf",
        url: "https://example.com/resume.pdf",
        type: "resume",
      },
    ],
    skills: ["Project Management", "Leadership", "Data Analysis"],
    ...overrides,
  });

  // ── Boundary cases ──────────────────────────────────────────────────────

  it("should return 100% completion for fully filled profile", () => {
    const result = calculateProfileCompletion(createMockProfile());

    expect(result.percentage).toBe(100);
    expect(result.completed).toBe(TOTAL);
    expect(result.total).toBe(TOTAL);
    expect(result.completedSections).toHaveLength(TOTAL);
    expect(result.incompleteSections).toHaveLength(0);
  });

  it("should return 0% completion for empty profile", () => {
    const result = calculateProfileCompletion(
      createMockProfile({
        full_name: "",
        picture: "",
        phone_number: "",
        location: "",
        city: "",
        country: "",
        bio: "",
        job_title: "",
        industry: "",
        years_of_experience: "",
        work_experience: [],
        education: [],
        documents: [],
        skills: [],
      }),
    );

    expect(result.percentage).toBe(0);
    expect(result.completed).toBe(0);
    expect(result.incompleteSections).toHaveLength(TOTAL);
  });

  // ── Individual field tests ──────────────────────────────────────────────

  it.each([
    ["full_name", { full_name: "" }],
    ["phone_number", { phone_number: "" }],
    ["location", { location: "", city: "", country: "" }],
    ["job_title", { job_title: "" }],
    ["industry", { industry: "" }],
    ["years_of_experience", { years_of_experience: "" }],
    ["bio", { bio: "" }],
    ["work_experience", { work_experience: [] }],
    ["education", { education: [] }],
    ["documents", { documents: [] }],
    ["skills", { skills: [] }],
  ])("should mark %s as incomplete when empty", (field, overrides) => {
    const result = calculateProfileCompletion(createMockProfile(overrides));

    expect(result.incompleteSections).toContain(field);
    expect(result.completedSections).not.toContain(field);
    expect(result.completed).toBe(TOTAL - 1);
    expect(result.percentage).toBe(Math.round(((TOTAL - 1) / TOTAL) * 100));
  });

  // ── Picture-specific validation ─────────────────────────────────────────

  it("should treat a whitespace-only picture as incomplete", () => {
    const result = calculateProfileCompletion(
      createMockProfile({ picture: "   " }),
    );

    expect(result.incompleteSections).toContain("picture");
  });

  it("should treat a real Cloudinary URL as complete", () => {
    const result = calculateProfileCompletion(
      createMockProfile({
        picture: "https://res.cloudinary.com/demo/image/upload/v1/profile.jpg",
      }),
    );

    expect(result.completedSections).toContain("picture");
  });

  it("should treat empty string picture as incomplete", () => {
    const result = calculateProfileCompletion(
      createMockProfile({ picture: "" }),
    );

    expect(result.incompleteSections).toContain("picture");
  });

  it("should treat whitespace-only picture as incomplete", () => {
    const result = calculateProfileCompletion(
      createMockProfile({ picture: "   " }),
    );

    expect(result.incompleteSections).toContain("picture");
  });

  // ── Location derivation ─────────────────────────────────────────────────

  it("should derive location from city + country when location string is empty", () => {
    const result = calculateProfileCompletion(
      createMockProfile({ location: "", city: "Austin", country: "USA" }),
    );

    expect(result.completedSections).toContain("location");
  });

  it("should mark location incomplete when all location fields are empty", () => {
    const result = calculateProfileCompletion(
      createMockProfile({ location: "", city: "", country: "" }),
    );

    expect(result.incompleteSections).toContain("location");
  });

  // ── Whitespace handling ─────────────────────────────────────────────────

  it("should handle whitespace-only strings as incomplete", () => {
    const result = calculateProfileCompletion(
      createMockProfile({
        full_name: "   ",
        bio: "\t\n",
        job_title: " ",
      }),
    );

    expect(result.incompleteSections).toContain("full_name");
    expect(result.incompleteSections).toContain("bio");
    expect(result.incompleteSections).toContain("job_title");
  });

  // ── Multiple missing fields ─────────────────────────────────────────────

  it("should handle multiple missing fields", () => {
    const result = calculateProfileCompletion(
      createMockProfile({
        full_name: "",
        phone_number: "",
        location: "",
        city: "",
        country: "",
      }),
    );

    expect(result.incompleteSections).toHaveLength(3);
    expect(result.completedSections).toHaveLength(TOTAL - 3);
    expect(result.percentage).toBe(Math.round(((TOTAL - 3) / TOTAL) * 100));
  });

  // ── Multiple entries in array fields ────────────────────────────────────

  it("should accept multiple work_experience entries", () => {
    const result = calculateProfileCompletion(
      createMockProfile({
        work_experience: [
          { company: "A", position: "Dev" },
          { company: "B", position: "Lead" },
        ],
      }),
    );

    expect(result.completedSections).toContain("work_experience");
  });

  it("should accept multiple education entries", () => {
    const result = calculateProfileCompletion(
      createMockProfile({
        education: [
          { institution: "Uni A", degree: "BS", field_of_study: "CS" },
          { institution: "Uni B", degree: "MS", field_of_study: "SE" },
        ],
      }),
    );

    expect(result.completedSections).toContain("education");
  });

  // ── items array contract ────────────────────────────────────────────────

  it("should include an items array matching the field list length", () => {
    const result = calculateProfileCompletion(createMockProfile());

    expect(result.items).toHaveLength(TOTAL);
    result.items.forEach((item) => {
      expect(item).toHaveProperty("field");
      expect(item).toHaveProperty("label");
      expect(item).toHaveProperty("scrollTo");
      expect(item).toHaveProperty("isComplete");
    });
  });

  it("should mark the correct item in the items array as incomplete", () => {
    const result = calculateProfileCompletion(createMockProfile({ bio: "" }));

    const bioItem = result.items.find((i) => i.field === "bio");
    expect(bioItem?.isComplete).toBe(false);
  });

  // ── Percentage rounding ─────────────────────────────────────────────────

  it("should round percentage correctly", () => {
    // 3 out of 12 filled → 25
    const result = calculateProfileCompletion(
      createMockProfile({
        full_name: "John",
        phone_number: "123",
        location: "NYC",
        picture: "",
        job_title: "",
        industry: "",
        years_of_experience: "",
        bio: "",
        work_experience: [],
        education: [],
        documents: [],
        skills: [],
      }),
    );

    expect(result.percentage).toBe(Math.round((3 / TOTAL) * 100));
  });
});
