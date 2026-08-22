import type { Metadata } from "next";
import { getJobById } from "@/lib/api";
import { JobsResponse } from "@/types/api";
import { generateJobMetadata, generateJobPostingSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Job } from "@/types/job";
import JobDetailClient from "./JobDetailClient";
import { mapJobsResponse } from "@/lib/job-mapper";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

// Transform backend job data to frontend format
async function getJob(id: string): Promise<Job | null> {
  try {
    const data = await getJobById(id);
    return mapJobsResponse(data);
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
