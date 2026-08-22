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
});
