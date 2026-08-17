import { Tag } from "./tag";

export interface Job {
  id: string;
  role: string;
  company_name: string;
  company_logo: string;
  location: string; // Dedicated location field for filtering
  salary?: {
    symbol: string;
    number: number;
    currency: string;
  };
  salary_range?: {
    start_salary: {
      symbol: string;
      number?: number;
      currency: string;
    };
    end_salary: {
      symbol: string;
      number?: number;
      currency: string;
    };
  };
  tags: Tag[];
  full_description: string;
  responsibilities: string[];
  qualifications: string[];
  applicationLink?: string; // Optional application link

  /**
   * Aggregated listings scraped from an external board. These have no employer
   * on our side, so applying happens at `external_url` — never through our own
   * application flow, which would save an application nobody receives.
   */
  source?: "user" | "scraped";
  /** Board the listing came from, e.g. "Job Bank". Shown on the badge. */
  source_name?: string;
  external_url?: string;
  /**
   * Salary exactly as the source wrote it, e.g. "$18.50 hourly". Preferred over
   * the parsed numeric salary, which cannot represent hourly pay.
   */
  salary_text?: string;

  /** Whether the poster published as themselves or as a vetted Company Page. */
  posted_as?: "individual" | "company";
  company_id?: string;
}

// Re-export Tag for backward compatibility
export type { Tag };
