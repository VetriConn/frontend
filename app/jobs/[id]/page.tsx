import type { Metadata } from "next";
import { getJobById } from "@/lib/api";
import { JobsResponse } from "@/types/api";
import { generateJobMetadata, generateJobPostingSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Job } from "@/types/job";
import JobDetailClient from "./JobDetailClient";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

// Transform backend job data to frontend format
function transformJob(data: JobsResponse): Job {
  return {
    id: data._id || data.id,
    role: data.role,
    company_name: data.company_name,
    company_logo: data.company_logo || "/images/company-logo.jpg",
    location: data.location || "",
    salary: data.salary,
    salary_range: data.salary_range,
    tags: data.tags
      ? data.tags.map((tag, index) => ({
          name: tag,
          color: [
            "flutter",
            "dart",
            "mobile",
            "ios",
            "android",
            "react",
            "web",
          ][index % 7] as
            | "flutter"
            | "dart"
            | "mobile"
            | "ios"
            | "android"
            | "react"
            | "web",
        }))
      : [],
    full_description: data.full_description || data.description || "",
    responsibilities: data.responsibilities || [],
    qualifications: data.qualifications || [],
    applicationLink: data.applicationLink,
  };
}

// Fetch job data for metadata generation
async function getJob(id: string): Promise<Job | null> {
  try {
    const data = await getJobById(id);
    return transformJob(data);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);

  if (!job) {
    return {
      title: "Job Not Found | Vetriconn",
      description:
        "The job you're looking for doesn't exist or has been removed.",
    };
  }

  return generateJobMetadata(job);
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;
  const job = await getJob(id);

  // If server fetch succeeded, render with SEO schema + pre-fetched data
  // If it failed, still render the client component — it will fetch client-side
  if (job) {
    const jobPostingSchema = generateJobPostingSchema(job);
    return (
      <>
        <JsonLd data={jobPostingSchema} />
        <JobDetailClient jobId={id} initialJob={job} />
      </>
    );
  }

  return <JobDetailClient jobId={id} initialJob={null} />;
}
