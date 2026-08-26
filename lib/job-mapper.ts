import type { Job } from "@/types/job";
import type { JobsResponse } from "@/types/api";

/**
 * The one JobsResponse → Job transform.
 *
 * This mapping existed as three hand-written copies — useJobs, useJob and the
 * jobs/[id] server page — maintained field-by-field, and they had already
 * drifted: the server copy still attached a `color` the Tag type had dropped.
 * A field added to one copy silently never reached the other two surfaces.
 */
export function mapJobsResponse(job: JobsResponse): Job {
  return {
    // The Mongo id wins so detail links stay stable across retitles; the
    // saved-jobs hook indexes both identities, so saved state follows either.
    id: job._id || job.id,
    role: job.role,
    company_name: job.company_name,
    company_logo: job.company_logo || "",
    location: job.location || "",
    salary: job.salary,
    salary_range: job.salary_range,
    tags: (job.tags ?? []).map((tag) => ({ name: tag })),
    full_description: job.full_description || job.description || "",
    responsibilities: job.responsibilities ?? [],
    qualifications: job.qualifications ?? [],
    applicationLink: job.applicationLink,
    source: job.source,
    source_name: job.source_name,
    external_url: job.external_url,
    salary_text: job.salary_text,
    posted_as: job.posted_as,
    company_id: job.company_id,
    poster_id: job.poster_id,
    job_category: job.job_category,
    job_type: job.job_type,
    work_arrangement: job.work_arrangement,
    experience_level: job.experience_level,
    skills: job.skills,
    physical_demands: job.physical_demands,
    work_schedule: job.work_schedule,
    payment_type: job.payment_type,
    currency: job.currency,
    city: job.city,
    state_province: job.state_province,
    country: job.country,
    // Phase-1 job-builder fields.
    min_qualification: job.min_qualification,
    security_clearance: job.security_clearance,
    requires_drivers_license: job.requires_drivers_license,
    visa_sponsorship: job.visa_sponsorship,
    languages: job.languages,
    certifications: job.certifications,
    benefits: job.benefits,
    openings: job.openings,
    application_deadline: job.application_deadline,
    start_date: job.start_date,
    veteran_friendly: job.veteran_friendly,
    accommodations_offered: job.accommodations_offered,
    physically_accessible: job.physically_accessible,
    open_to_returners: job.open_to_returners,
    // Phase-2 job-builder fields.
    screening_questions: job.screening_questions,
    faqs: job.faqs,
    hiring_stages: job.hiring_stages,
  };
}
