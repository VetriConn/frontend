import { Tag } from "./tag";
import type {
  Industry,
  JobType,
  WorkArrangement,
  ExperienceLevel,
  PhysicalDemands,
  WorkSchedule,
  PaymentType,
  ProvinceCode,
  MinQualification,
  SecurityClearance,
  Language,
  Benefit,
  Currency,
  ScreeningQuestion,
  JobFaq,
} from "@/lib/job-fields";

export interface Job {
  id: string;
  role: string;
  company_name: string;
  company_logo: string;
  location: string; // Dedicated location field for filtering
  /**
   * What the role pays — one object, assembled server-side. The verbatim
   * `text` is the only form that can express "$18.50 hourly"; `basis` is what
   * makes `min`/`max` interpretable.
   */
  compensation?: {
    min?: number;
    max?: number;
    currency: string;
    basis?: PaymentType;
    text?: string;
  };
  tags: Tag[];
  /** Full posting body — detail pages only; list payloads omit it. */
  description?: string;
  /** Card preview text, derived server-side from the body. */
  summary: string;
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

  /** Whether the poster published as themselves or as a vetted Company Page. */
  posted_as?: "individual" | "company";
  company_id?: string;
  /** Structured columns; absent means the listing didn't state it. */
  job_category?: Industry;
  job_type?: JobType;
  work_arrangement?: WorkArrangement;
  experience_level?: ExperienceLevel;
  skills?: string;
  physical_demands?: PhysicalDemands;
  work_schedule?: WorkSchedule;
  city?: string;
  state_province?: ProvinceCode;
  country?: string;
  min_qualification?: MinQualification;
  security_clearance?: SecurityClearance;
  requires_drivers_license?: boolean;
  visa_sponsorship?: boolean;
  languages?: Language[];
  certifications?: string[];
  benefits?: Benefit[];
  openings?: number;
  application_deadline?: string;
  start_date?: string;
  veteran_friendly?: boolean;
  accommodations_offered?: boolean;
  physically_accessible?: boolean;
  open_to_returners?: boolean;
  // Phase-2 job-builder fields.
  screening_questions?: ScreeningQuestion[];
  faqs?: JobFaq[];
  hiring_stages?: string[];
  /** The account that published it. Used to stop you applying to your own. */
  poster_id?: string;
}

// Re-export Tag for backward compatibility
export type { Tag };
