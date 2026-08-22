/**
 * Tests for the single JobsResponse → Job transform. This replaced three
 * hand-copied mappings that had already drifted; these pin the behaviour they
 * must share — identity precedence, tag shape, and the structured columns.
 */
import { mapJobsResponse } from "@/lib/job-mapper";
import type { JobsResponse } from "@/types/api";

const base: JobsResponse = {
  _id: "6a833e224ac336dd752f70d1",
  id: "head-baker-abc",
  role: "head baker",
  company_name: "L'ARTISAN",
  salary: { symbol: "$", number: 0, currency: "CAD" },
  createdAt: "2026-08-17T00:00:00Z",
  updatedAt: "2026-08-20T00:00:00Z",
};

describe("mapJobsResponse", () => {
  it("prefers the Mongo _id for the collapsed id", () => {
    expect(mapJobsResponse(base).id).toBe("6a833e224ac336dd752f70d1");
  });

  it("falls back to the slug id when _id is absent", () => {
    expect(mapJobsResponse({ ...base, _id: "" }).id).toBe("head-baker-abc");
  });

  it("maps string tags to Tag objects", () => {
    expect(mapJobsResponse({ ...base, tags: ["food-service"] }).tags).toEqual([
      { name: "food-service" },
    ]);
  });

  it("defaults absent tags to an empty array", () => {
    expect(mapJobsResponse(base).tags).toEqual([]);
  });

  it("passes the structured columns through", () => {
    const job = mapJobsResponse({
      ...base,
      job_type: "full-time",
      experience_level: "senior",
      work_arrangement: "onsite",
      payment_type: "hourly",
    });
    expect(job.job_type).toBe("full-time");
    expect(job.experience_level).toBe("senior");
    expect(job.work_arrangement).toBe("onsite");
    expect(job.payment_type).toBe("hourly");
  });

  it("falls back full_description to description", () => {
    expect(
      mapJobsResponse({ ...base, description: "the only body" }).full_description,
    ).toBe("the only body");
  });

  it("defaults responsibilities and qualifications to arrays", () => {
    const job = mapJobsResponse(base);
    expect(job.responsibilities).toEqual([]);
    expect(job.qualifications).toEqual([]);
  });

  it("passes the Phase-1 job-builder columns through", () => {
    const job = mapJobsResponse({
      ...base,
      currency: "CAD",
      min_qualification: "college",
      security_clearance: "secret",
      requires_drivers_license: true,
      visa_sponsorship: false,
      languages: ["english", "french"],
      certifications: ["First Aid"],
      benefits: ["health", "pension"],
      openings: 3,
      application_deadline: "2026-09-01",
      start_date: "2026-10-01",
      veteran_friendly: true,
      accommodations_offered: true,
      physically_accessible: true,
      open_to_returners: true,
    });
    expect(job.min_qualification).toBe("college");
    expect(job.security_clearance).toBe("secret");
    expect(job.requires_drivers_license).toBe(true);
    expect(job.languages).toEqual(["english", "french"]);
    expect(job.benefits).toEqual(["health", "pension"]);
    expect(job.certifications).toEqual(["First Aid"]);
    expect(job.openings).toBe(3);
    expect(job.application_deadline).toBe("2026-09-01");
    expect(job.veteran_friendly).toBe(true);
    expect(job.open_to_returners).toBe(true);
  });

  it("passes the Phase-2 screening, FAQ and hiring-stage fields through", () => {
    const job = mapJobsResponse({
      ...base,
      screening_questions: [
        {
          id: "q1",
          question: "Do you have a Class 5 licence?",
          type: "yes_no",
          preferred_answers: ["yes"],
          weight: 4,
          required: true,
          knockout: true,
        },
      ],
      faqs: [{ question: "Parking?", answer: "Yes, free." }],
      hiring_stages: ["Application", "Interview", "Offer"],
    });
    expect(job.screening_questions).toHaveLength(1);
    expect(job.screening_questions?.[0].type).toBe("yes_no");
    expect(job.faqs).toEqual([{ question: "Parking?", answer: "Yes, free." }]);
    expect(job.hiring_stages).toEqual(["Application", "Interview", "Offer"]);
  });
});
