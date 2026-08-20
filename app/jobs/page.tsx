"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  HiOutlineBriefcase,
  HiOutlineMapPin,
  HiOutlineBuildingOffice2,
  HiOutlineCurrencyDollar,
  HiOutlineArrowRight,
  HiOutlineMagnifyingGlass,
} from "react-icons/hi2";
import { Header } from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import DottedBox from "@/public/images/dotted_box.svg";
import { useJobs } from "@/hooks/useJobs";
import { Job } from "@/types/job";
import { formatJobSalary } from "@/lib/job-display";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  splitDescriptionParts,
  jobChipLabels,
  JOB_TAG_CLASS,
} from "@/lib/job-display";
import { fieldLabel, JOB_TYPE_LABELS } from "@/lib/job-fields";

// ── Helpers ──────────────────────────────────────────────────────────

// Salary rules live in lib/job-display so every surface renders the same
// string. This page predated that and printed the raw struct — which on a
// scraped listing is {number: 0}, so every card read "$0 CAD" while the real
// figure sat unused in salary_text ("$18.50 hourly").
function formatSalary(job: Job): string {
  return formatJobSalary(job, "full") ?? "";
}

// The stored column, labelled; null when the listing does not state one, so
// the row is omitted rather than defaulting to a fabricated "Full-time".
function getJobType(job: Job): string | null {
  return fieldLabel(JOB_TYPE_LABELS, job.job_type);
}

// ── Skeleton ─────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 md:p-6 flex flex-col gap-3"
      aria-hidden="true"
    >
      <div className="h-5 md:h-6 w-[55%] bg-gray-200 rounded animate-shimmer" />
      <div className="flex flex-wrap gap-2 md:gap-3">
        <div className="h-3 md:h-4 w-20 md:w-24 bg-gray-200 rounded animate-shimmer" />
        <div className="h-3 md:h-4 w-16 md:w-20 bg-gray-200 rounded animate-shimmer" />
        <div className="h-3 md:h-4 w-18 md:w-22 bg-gray-200 rounded animate-shimmer" />
      </div>
      <div className="h-3 md:h-4 w-full bg-gray-200 rounded animate-shimmer" />
      <div className="h-3 md:h-4 w-[70%] bg-gray-200 rounded animate-shimmer" />
    </div>
  );
}

// ── Job Card ─────────────────────────────────────────────────────────

function JobCard({ job }: { job: Job }) {
  const router = useRouter();
  const salary = formatSalary(job);
  const type = getJobType(job);

  return (
    <article
      className="group bg-white border border-gray-200 rounded-xl p-5 sm:p-6 transition-shadow hover:shadow-md cursor-pointer"
      onClick={() => router.push(`/jobs/${job.id}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/jobs/${job.id}`);
        }
      }}
      aria-label={`${job.role} at ${job.company_name}`}
    >
      {/* Title */}
      <h3 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-primary transition-colors">
        {job.role}
      </h3>

      {/* Meta row */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mb-3">
        <span className="inline-flex items-center gap-2">
          <HiOutlineBuildingOffice2
            className="w-4 h-4 md:w-5 md:h-5 text-gray-400"
            aria-hidden="true"
          />
          {job.company_name}
        </span>
        <span className="inline-flex items-center gap-2">
          <HiOutlineMapPin
            className="w-4 h-4 md:w-5 md:h-5 text-gray-400"
            aria-hidden="true"
          />
          {job.location || "Canada"}
        </span>
        {type && (
          <span className="inline-flex items-center gap-2">
            <HiOutlineBriefcase
              className="w-4 h-4 md:w-5 md:h-5 text-gray-400"
              aria-hidden="true"
            />
            {type}
          </span>
        )}
        {salary && (
          <span className="inline-flex items-center gap-2">
            <HiOutlineCurrencyDollar
              className="w-4 h-4 md:w-5 md:h-5 text-gray-400"
              aria-hidden="true"
            />
            {salary}
          </span>
        )}
      </div>

      {/* Description excerpt */}
      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
        {splitDescriptionParts(job.full_description).join(" · ")}
      </p>

      {/* Chips come from the category/type/arrangement columns, not tags, so
          gate on what actually renders — a job with a type but no category
          has empty tags yet still has chips. */}
      {jobChipLabels(job).length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {jobChipLabels(job)
            .slice(0, 3)
            .map((chip) => (
              <span key={chip} className={JOB_TAG_CLASS}>
                {chip}
              </span>
            ))}
        </div>
      )}
    </article>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

export default function JobsPage() {
  const { jobs: apiJobs, isLoading } = useJobs({ limit: 20 });
  const jobs = apiJobs;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Public site header */}
      <div className="sticky top-0 z-50 bg-white">
        <Header />
      </div>

      {/* Hero banner */}
      <section className="px-[5%] md:px-6 py-4 pb-16 bg-white relative overflow-hidden mobile:px-[5%] mobile:py-1.5 mobile:pb-8">
        {/* Decorative dots */}
        <div
          className="absolute top-10 left-[8%] w-3 h-3 rounded-full bg-amber-400 opacity-70"
          aria-hidden="true"
        />
        <div
          className="absolute top-28 left-[3%] w-2 h-2 rounded-full bg-primary opacity-50"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-20 left-[12%] w-2.5 h-2.5 rounded-full bg-primary opacity-40"
          aria-hidden="true"
        />
        <div
          className="absolute top-16 right-[5%] w-2 h-2 rounded-full bg-amber-400 opacity-50"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-12 right-[8%] w-3 h-3 rounded-full bg-primary opacity-50"
          aria-hidden="true"
        />
        <div
          className="absolute top-[50%] right-[2%] w-2 h-2 rounded-full bg-pink-400 opacity-40"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between gap-8 relative max-w-7xl mx-auto p-8 mobile:flex-col mobile:text-center mobile:gap-6 mobile:mt-4 mobile:p-4 mobile:pt-8">
          {/* Left — Text content */}
          <div className="flex-[0_0_45%] max-w-lg relative mobile:flex-none mobile:w-full mobile:mx-auto mobile:max-w-full">
            {/* Dotted box decoration */}
            <DottedBox
              className="absolute top-0 -left-40 z-0 w-28 h-auto pointer-events-none mobile:w-20 mobile:-top-10 mobile:left-0"
              aria-hidden="true"
            />

            <h1 className="heading-1 mb-6 mobile:mb-4">
              Find The{" "}
              <span className="italic font-[var(--font-outfit)] underline decoration-primary decoration-2 underline-offset-4">
                Perfect Opportunity
              </span>{" "}
              <span className="text-primary">For You</span>
            </h1>
            <p className="body-text text-base mobile:text-sm mb-2 max-w-[80%] mobile:mb-2 mobile:max-w-full">
              Browse pre-vetted job opportunities for Canadian veterans and
              retirees — flexible roles that match your experience, skills, and
              lifestyle.
            </p>

            {/* CTA + pins row */}
            <div className="flex flex-wrap items-center gap-5 mt-4 mobile:justify-center">
              <Link
                href="/signin"
                className="inline-flex items-center gap-2 bg-primary hover:bg-red-700 text-white font-semibold py-3.5 px-8 rounded-full transition-all shadow-sm group"
              >
                Browse Jobs
                <HiOutlineArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-rotate-45" aria-hidden="true" />
              </Link>

              {/* Job pins stack */}
              <div className="hidden md:flex items-center">
                <div className="flex -space-x-2.5">
                  {["jobs_pin", "jobs_pin2", "jobs_pin3", "jobs_pin4"].map(
                    (pin) => (
                      <div
                        key={pin}
                        className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden"
                        style={{ aspectRatio: '1' }}
                      >
                        <Image
                          src={`/images/${pin}.jpg`}
                          alt=""
                          width={40}
                          height={40}
                          className="w-full h-auto object-cover"
                          sizes="(max-width: 850px) 36px, 40px"
                          loading="lazy"
                        />
                      </div>
                    ),
                  )}
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600">
                      +500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Image collage */}
          <div className="relative flex-[0_0_auto] w-2xl max-w-2xl h-[455px] mobile:flex-none mobile:w-full mobile:max-w-full mobile:h-80">
            {/* Dotted box decoration behind images */}
            <DottedBox
              className="absolute -bottom-8 -right-20 z-[3] w-28 h-auto pointer-events-none"
              aria-hidden="true"
            />

            {/* Maple leaf watermark */}
            <div
              className="absolute bottom-2 right-2 w-28 h-28 rounded-lg bg-[url('/favicon.svg')] bg-no-repeat bg-center bg-contain z-[1] opacity-80 mobile:hidden"
              aria-hidden="true"
            />

            {/* Image 1 — top-left, tilted left */}
            <div className="absolute left-0 top-0 w-[48%] h-[55%] -rotate-3 rounded-2xl overflow-hidden shadow-lg z-[3]">
              <Image
                src="/images/jobs_hero.jpg"
                alt="Professional working at desk"
                fill
                className="object-cover w-full h-auto"
                sizes="(max-width: 850px) 50vw, 25vw"
                priority
                style={{ aspectRatio: '4/3' }}
              />
            </div>

            {/* Image 2 — top-right, tilted right */}
            <div className="absolute right-0 top-2 w-[48%] h-[55%] rotate-3 rounded-2xl overflow-hidden shadow-lg z-[4]">
              <Image
                src="/images/jobs_hero2.jpg"
                alt="Experienced professional collaborating"
                fill
                className="object-cover w-full h-auto"
                sizes="(max-width: 850px) 50vw, 25vw"
                priority
                style={{ aspectRatio: '4/3' }}
              />
            </div>

            {/* Image 3 — bottom-center, tilted slightly */}
            <div className="absolute left-[15%] bottom-0 w-[52%] h-[50%] rotate-2 rounded-2xl overflow-hidden shadow-lg z-[5]">
              <Image
                src="/images/jobs_hero3.jpg"
                alt="Veteran in professional setting"
                fill
                className="object-cover w-full h-auto"
                sizes="(max-width: 850px) 80vw, 30vw"
                loading="lazy"
                style={{ aspectRatio: '4/3' }}
              />
            </div>

            {/* Decorative accents near images */}
            <div
              className="absolute -right-3 top-[45%] w-4 h-4 rounded-full bg-amber-400 z-[6]"
              aria-hidden="true"
            />
            <div
              className="absolute left-[45%] bottom-[42%] w-3 h-3 rounded-full bg-primary z-[6]"
              aria-hidden="true"
            />
            <div
              className="absolute -left-4 top-[35%] w-2.5 h-2.5 rounded-full bg-pink-400 opacity-60 z-[6]"
              aria-hidden="true"
            />
            <div
              className="absolute right-[20%] -top-3 w-2 h-2 rounded-full bg-primary opacity-50 z-[6]"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      {/* Job listings */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="heading-2">
              Recently Posted Jobs
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isLoading
                ? "Loading opportunities…"
                : `${jobs.length} ${jobs.length === 1 ? "opportunity" : "opportunities"} available`}
            </p>
          </div>
          <Link
            href="/signin"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-red-700 transition-all group"
          >
            <HiOutlineMagnifyingGlass className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-rotate-45" aria-hidden="true" />
            Advanced Search
          </Link>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            aria-busy="true"
            aria-label="Loading jobs"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Job grid */}
        {!isLoading && jobs.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            role="list"
            aria-label="Job listings"
          >
            {jobs.map((job) => (
              <div key={job.id} role="listitem">
                <JobCard job={job} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state (unlikely with dummy fallback, but safe) */}
        {!isLoading && jobs.length === 0 && (
          <div className="text-center py-16">
            <HiOutlineBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No jobs available right now
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Check back soon — new opportunities are posted regularly.
            </p>
          </div>
        )}

        {/* CTA banner */}
        <div className="mt-12 bg-white border border-gray-200 rounded-xl p-8 sm:p-10 text-center">
          <h3 className="heading-3 mb-3">
            Ready to take the next step?
          </h3>
          <p className="text-gray-600 max-w-lg mx-auto mb-6">
            Create your free Vetriconn account to access full job details, save
            listings, and apply with one click.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-primary hover:bg-red-700 text-white font-semibold py-3.5 px-10 rounded-full transition-all shadow-sm group"
            >
              Get Started Free
              <HiOutlineArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-rotate-45" aria-hidden="true" />
            </Link>
            <p className="text-sm font-medium text-gray-500">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-primary hover:text-red-700 transition-all font-semibold group inline-flex items-center gap-1"
              >
                Sign in
                <HiOutlineArrowRight className="w-3 h-3 md:w-4 md:h-4 transition-transform group-hover:-rotate-45" aria-hidden="true" />
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
