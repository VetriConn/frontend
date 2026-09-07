import type { Metadata } from "next";
import { cache } from "react";
import type { JobsResponse } from "@/types/api";
import { getJobById } from "@/lib/api";
import { generateJobMetadata, generateJobPostingSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Job } from "@/types/job";
import JobDetailClient from "./JobDetailClient";
import { mapJobsResponse } from "@/lib/job-mapper";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

// One fetch per render pass: metadata and the page body share this result
// via React.cache, and the raw response rides along so the client can seed
// SWR without a duplicate fetch.
const getJobBundle = cache(
  async (
    id: string,
  ): Promise<{ job: Job; raw: JobsResponse } | null> => {
    try {
      const raw = await getJobById(id);
      return { job: mapJobsResponse(raw), raw };
    } catch {
      return null;
    }
  },
);

async function getJob(id: string): Promise<Job | null> {
  return (await getJobBundle(id))?.job ?? null;
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
  const bundle = await getJobBundle(id);

  // If server fetch succeeded, render with SEO schema + pre-fetched data
  // If it failed, still render the client component — it will fetch client-side
  if (bundle) {
    const jobPostingSchema = generateJobPostingSchema(bundle.job);
    return (
      <>
        <JsonLd data={jobPostingSchema} />
        <JobDetailClient
          jobId={id}
          initialJob={bundle.job}
          initialJobRaw={bundle.raw}
        />
      </>
    );
  }

  return <JobDetailClient jobId={id} initialJob={null} />;
}
