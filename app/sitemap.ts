import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/lib/seo";
import { API_CONFIG } from "@/lib/api-config";

// Regenerate at most hourly - the board changes on a 6-hour scrape cadence.
export const revalidate = 3600;

interface SitemapJob {
  _id: string;
  id?: string;
  createdAt?: string;
}

/**
 * sitemap.xml: static pages plus every live job (the SEO-critical pages).
 * The job list is fetched from the public API, bounded, and failure-safe -
 * a backend hiccup yields the static sitemap rather than an error.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/jobs`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/signin`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  const jobPages: MetadataRoute.Sitemap = [];
  try {
    // Bounded sweep: up to 10 pages of 100 covers a launch-scale board.
    for (let page = 1; page <= 10; page++) {
      const res = await fetch(
        `${API_CONFIG.BASE_URL}/api/v1/jobs?page=${page}&limit=100`,
        { next: { revalidate: 3600 } },
      );
      if (!res.ok) break;
      const body = (await res.json()) as {
        data?: SitemapJob[];
        pagination?: { totalPages?: number };
      };
      const jobs = body.data ?? [];
      for (const job of jobs) {
        jobPages.push({
          url: `${baseUrl}/jobs/${job.id || job._id}`,
          lastModified: job.createdAt ? new Date(job.createdAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
      if (!body.pagination?.totalPages || page >= body.pagination.totalPages) break;
    }
  } catch {
    // Static-only sitemap beats a 500 from the crawler's point of view.
  }

  return [...staticPages, ...jobPages];
}
