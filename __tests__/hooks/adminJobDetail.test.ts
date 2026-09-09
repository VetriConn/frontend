/**
 * The review console must show at least what the public job page shows.
 *
 * It showed less. A job posted through the quick wizard rendered in the
 * drawer as a title, a one-line brief and "Requirements: None listed", while
 * the public page for the same job listed three responsibilities, the work
 * arrangement, the category and four inclusion claims. AdminJobRaw simply
 * never declared those fields and toAdminJob never mapped them, so a reviewer
 * was approving a posting they could not fully see.
 */

import { toAdminJob } from "@/hooks/useAdminJobQueue";
import type { AdminJobRaw } from "@/lib/api/jobs";

const raw = (over: Partial<AdminJobRaw> = {}): AdminJobRaw => ({
  _id: "job-1",
  role: "Software Engineer",
  company_name: "Maya Kin",
  location: "Toronto",
  job_type: "full-time",
  description: "this is the job brief",
  responsibilities: ["Test", "test", "test"],
  qualifications: [],
  createdAt: "2026-09-09T18:30:00.000Z",
  ...over,
});

describe("toAdminJob", () => {
  it("carries the responsibilities the public page lists", () => {
    // The exact gap in the report: three tasks on the public page, nothing in
    // the drawer.
    expect(toAdminJob(raw()).responsibilities).toEqual(["Test", "test", "test"]);
  });

  it("surfaces the structured fields the employer filled in", () => {
    const job = toAdminJob(
      raw({
        job_category: "skilled-trades",
        work_arrangement: "onsite",
        experience_level: "senior",
        openings: 3,
      }),
    );
    const labels = job.details.map((d) => d.label);
    expect(labels).toEqual(
      expect.arrayContaining([
        "Category",
        "Work arrangement",
        "Experience level",
        "Openings",
      ]),
    );
    expect(job.details.find((d) => d.label === "Openings")?.value).toBe("3");
  });

  it("shows the inclusion claims, which are the reviewer's actual decision", () => {
    // "Veteran-friendly" and "accessible" are undertakings this board makes on
    // an employer's behalf to the people least able to absorb a false one.
    const job = toAdminJob(
      raw({ veteran_friendly: true, physically_accessible: true }),
    );
    const labels = job.details.map((d) => d.label);
    expect(labels).toContain("Veteran-friendly");
    expect(labels).toContain("Physically accessible");
  });

  it("omits a claim the employer did not make, rather than showing 'No'", () => {
    // A row per unticked box would bury the ones that were ticked.
    const labels = toAdminJob(raw({ veteran_friendly: false })).details.map(
      (d) => d.label,
    );
    expect(labels).not.toContain("Veteran-friendly");
  });

  it("lists the screening questions applicants must answer", () => {
    const job = toAdminJob(
      raw({
        screening_questions: [
          { id: "q1", question: "Do you hold a Class 5 licence?", type: "yes_no", required: true },
        ],
      }),
    );
    expect(job.screening).toHaveLength(1);
    expect(job.screening[0].question).toBe("Do you hold a Class 5 licence?");
    expect(job.screening[0].required).toBe(true);
  });

  it("adds no rows for a posting with nothing extra filled in", () => {
    expect(toAdminJob(raw()).details).toEqual([]);
    expect(toAdminJob(raw()).screening).toEqual([]);
  });
});
