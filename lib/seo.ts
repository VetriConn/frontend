import type { Metadata } from "next";
import type { Job } from "@/types/job";
import type {
  Organization,
  WebSite,
  JobPosting,
  SearchAction,
} from "@/components/seo/JsonLd";

/**
 * Site-wide SEO configuration
 */
export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  twitterHandle: string;
  locale: string;
  keywords: string[];
}

/**
 * Page-specific metadata input
 */
export interface PageSeoInput {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
  keywords?: string[];
}

/**
 * Site configuration constant
 */
export const SITE_CONFIG: SiteConfig = {
  name: "Vetriconn",
  description:
    "Find meaningful jobs for retirees and veterans in Canada. Part-time, full-time, and volunteer opportunities for seniors and experienced professionals.",
  url: "https://vetriconn.ca",
  ogImage: "https://vetriconn.ca/og-image.png",
  twitterHandle: "@vetriconn",
  locale: "en_CA",
  keywords: [
    // Retiree-focused
    "jobs for retirees",
    "retiree jobs Canada",
    "retired but want to work",
    "part-time jobs for seniors",
    "senior employment opportunities",
    "jobs for seniors",
    "senior jobs Canada",
    "retiree employment",
    "work after retirement",
    "retirement jobs",
    "jobs for retired people",
    "encore careers",
    "post-retirement jobs",
    "senior citizen jobs",
    "jobs for 55+",
    "jobs for 60+",
    "jobs for 65+",
    "older adult employment",

    // Veteran-focused
    "veteran jobs Canada",
    "jobs for veterans",
    "military veteran employment",
    "veteran career opportunities",
    "Canadian veteran jobs",
    "ex-military jobs Canada",
    "veteran hiring",
    "jobs for ex-military",
    "military to civilian jobs",
    "veteran employment programs",
    "CAF veteran jobs",
    "Canadian Armed Forces jobs",
    "veteran job board",
    "hire a veteran Canada",

    // General older worker terms
    "jobs for older workers",
    "mature worker jobs",
    "experienced professional jobs",
    "second career opportunities",
    "midlife career change",
    "experienced workers wanted",
    "age-friendly employers",
    "jobs for experienced professionals",
    "mature talent",
    "seasoned professionals jobs",

    // Canadian-specific
    "Canadian job board",
    "Canada job site for seniors",
    "employment for retirees Canada",
    "jobs in Canada",
    "Canadian employment",
    "work in Canada seniors",
    "Ontario senior jobs",
    "BC senior jobs",
    "Alberta senior jobs",
    "Toronto jobs for retirees",
    "Vancouver jobs for seniors",

    // Work type keywords
    "flexible work for retirees",
    "part-time work Canada",
    "remote jobs for veterans",
    "remote jobs for seniors",
    "work from home seniors",
    "flexible hours jobs",
    "contract work seniors",
    "temporary jobs retirees",
    "seasonal jobs seniors",
    "gig work for retirees",

    // Purpose & fulfillment
    "purposeful work retirement",
    "meaningful employment seniors",
    "volunteer opportunities seniors",
    "give back jobs",
    "community jobs seniors",
    "nonprofit jobs retirees",

    // Industry-specific
    "consulting jobs retirees",
    "mentoring jobs seniors",
    "teaching jobs retirees",
    "customer service jobs seniors",
    "retail jobs for seniors",
    "healthcare jobs for retirees",
    "administrative jobs seniors",

    // Skill-based
    "experienced accountant jobs",
    "senior engineer jobs",
    "experienced manager jobs",
    "skilled trades jobs seniors",
    "professional jobs 50+",
  ],
};

/**
 * Metadata templates for key pages
 */
export const METADATA_TEMPLATES = {
  homepage: {
    title: "Vetriconn | Jobs for Retirees & Veterans in Canada",
    description:
      "Find meaningful jobs for retirees and veterans in Canada. Part-time, full-time, and volunteer opportunities for seniors.",
  },
  jobs: {
    title: "Browse Jobs for Retirees & Veterans | Vetriconn Canada",
    description:
      "Search flexible job opportunities for retirees, veterans, and seniors across Canada. Part-time roles and remote work available.",
  },
  signup: {
    title: "Join Vetriconn | Register for Senior & Veteran Jobs in Canada",
    description:
      "Create your free account to access jobs for retirees and veterans in Canada. Connect with employers seeking experienced professionals.",
  },
  signin: {
    title: "Sign In | Vetriconn - Jobs for Retirees & Veterans",
    description:
      "Sign in to your Vetriconn account to browse and apply for jobs designed for retirees and veterans in Canada.",
  },
  about: {
    title: "About Us | Vetriconn - Reconnecting Experience with Opportunity",
    description:
      "Learn about Vetriconn's mission to strengthen the Canadian workforce by reconnecting retirees and veterans with meaningful employment and volunteer opportunities.",
  },
  faq: {
    title: "FAQ | Vetriconn - Frequently Asked Questions",
    description:
      "Find answers to common questions about Vetriconn, our platform for connecting Canadian retirees and veterans with jobs, volunteer roles, and community opportunities.",
  },
} as const;

/**
 * Generates Next.js Metadata object from page-specific input
 * Includes Open Graph, Twitter Card, and canonical URL generation
 */
export function generateMetadata(input: PageSeoInput): Metadata {
  const { title, description, path, ogImage, noIndex, keywords } = input;

  const canonicalUrl = `${SITE_CONFIG.url}${path}`;
  const imageUrl = ogImage || SITE_CONFIG.ogImage;
  const allKeywords = keywords
    ? [...SITE_CONFIG.keywords, ...keywords]
    : SITE_CONFIG.keywords;

  return {
    title,
    description,
    keywords: allKeywords,
    authors: [{ name: SITE_CONFIG.name }],
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: SITE_CONFIG.locale,
      url: canonicalUrl,
      title,
      description,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: SITE_CONFIG.twitterHandle,
      creator: SITE_CONFIG.twitterHandle,
      images: [imageUrl],
    },
  };
}

/**
 * Generates metadata for a specific job listing page
 */
export function generateJobMetadata(job: Job): Metadata {
  const title = `${job.role} at ${job.company_name} | Vetriconn`;

  // Create a description from job data, truncated to fit meta description limits
  const rawDescription = job.full_description || "";
  const truncatedDescription =
    rawDescription.length > 140
      ? `${rawDescription.substring(0, 137)}...`
      : rawDescription;

  const description =
    truncatedDescription ||
    `Apply for ${job.role} at ${job.company_name}. Find jobs for retirees and veterans in Canada on Vetriconn.`;

  return generateMetadata({
    title,
    description,
    path: `/jobs/${job.id}`,
    keywords: [job.role, job.company_name, job.location, "job opportunity"],
  });
}

/**
 * Generates Organization schema markup for structured data
 * Requirements: 2.1
 */
export function generateOrganizationSchema(): Organization {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.svg`,
    description: SITE_CONFIG.description,
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English", "French"],
    },
  };
}

/**
 * Generates WebSite schema markup with search action for sitelinks search box
 * Requirements: 2.2
 */
export function generateWebSiteSchema(): WebSite {
  const searchAction: SearchAction = {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_CONFIG.url}/jobs?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  };

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    potentialAction: searchAction,
  };
}

/**
 * Generates JobPosting schema markup for individual job listings
 * Requirements: 2.3
 */
export function generateJobPostingSchema(job: Job): JobPosting {
  const schema: JobPosting = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.role,
    description: job.full_description,
    datePosted: new Date().toISOString().split("T")[0],
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name,
      logo: job.company_logo || undefined,
    },
    identifier: {
      "@type": "PropertyValue",
      name: SITE_CONFIG.name,
      value: job.id,
    },
  };

  // Add job location if available
  if (job.location) {
    schema.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: "CA",
      },
    };
  }

  // Add salary information if available
  if (job.salary?.number) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salary.currency || "CAD",
      value: job.salary.number,
      unitText: "YEAR",
    };
  } else if (
    job.salary_range?.start_salary?.number ||
    job.salary_range?.end_salary?.number
  ) {
    schema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salary_range.start_salary?.currency || "CAD",
      minValue: job.salary_range.start_salary?.number,
      maxValue: job.salary_range.end_salary?.number,
      unitText: "YEAR",
    };
  }

  // Derive employment type from tags if available
  const employmentTypeTags = job.tags
    ?.filter((tag) =>
      ["full-time", "part-time", "contract", "temporary", "volunteer"].includes(
        tag.name.toLowerCase(),
      ),
    )
    .map((tag) => tag.name.toUpperCase().replace("-", "_"));

  if (employmentTypeTags && employmentTypeTags.length > 0) {
    schema.employmentType =
      employmentTypeTags.length === 1
        ? employmentTypeTags[0]
        : employmentTypeTags;
  }

  return schema;
}
