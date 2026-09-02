import BrushUnderline from "@/components/ui/BrushUnderline";
import Eyebrow from "@/components/ui/Eyebrow";
import Link from "next/link";
import Image from "next/image";
import {
  HiOutlineBriefcase,
  HiOutlineMapPin,
  HiOutlineBuildingOffice2,
  HiOutlineCurrencyDollar,
  HiOutlineAcademicCap,
  HiOutlineArrowRight,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { Header } from "@/components/ui/Header";
import Footer from "@/components/ui/Footer";
import DottedBox from "@/public/images/dotted_box.svg";
import { getJobs, type JobsPage } from "@/lib/api/jobs";
import { mapJobsResponse } from "@/lib/job-mapper";
import { Job } from "@/types/job";
import { formatJobSalary } from "@/lib/job-display";
import {
  splitDescriptionParts,
  jobChipLabels,
  JOB_TAG_CLASS,
} from "@/lib/job-display";
import { fieldLabel, EXPERIENCE_LEVEL_LABELS } from "@/lib/job-fields";

const PAGE_SIZE = 20;

// ── Helpers ──────────────────────────────────────────────────────────

// Salary rules live in lib/job-display so every surface renders the same
// string. This page predated that and printed the raw struct — which on a
// scraped listing is {number: 0}, so every card read "$0 CAD" while the real
// figure sat unused in salary_text ("$18.50 hourly").
function formatSalary(job: Job): string {
  return formatJobSalary(job, "full") ?? "";
}

// Experience level as a label; null when the listing does not state one.
function getExperience(job: Job): string | null {
  return fieldLabel(EXPERIENCE_LEVEL_LABELS, job.experience_level);
}

// What the card previews — the most concrete thing available about the role.
// Real tasks tell a seeker what the job is; requirements are the next best
// signal; the synthesized overview is the last resort. The old card always
// showed the overview ("Permanent, full-time position…"), which only repeated
// the chips.
function cardPreview(job: Job): string {
  const source =
    job.responsibilities.length > 0
      ? job.responsibilities
      : job.qualifications.length > 0
        ? job.qualifications
        : splitDescriptionParts(job.full_description);
  return source.slice(0, 3).join(" · ");
}

// Link back to this page with the query preserved. Page 1 keeps a clean URL.
function pageHref(page: number, q?: string): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/jobs?${qs}` : "/jobs";
}

// ── Job Card ─────────────────────────────────────────────────────────

// A plain link, rendered on the server: the whole card is crawlable and
// keyboard-operable with zero client JS (the old version was a div with a
// click handler, which also kept every job out of the page HTML).
function JobCard({ job }: { job: Job }) {
  const salary = formatSalary(job);
  const experience = getExperience(job);
  const preview = cardPreview(job);

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 rounded-xl"
      aria-label={`${job.role} at ${job.company_name}`}
    >
      <article className="group bg-white border border-gray-200 rounded-xl p-5 sm:p-6 transition-shadow hover:shadow-md h-full">
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
          {salary && (
            <span className="inline-flex items-center gap-2">
              <HiOutlineCurrencyDollar
                className="w-4 h-4 md:w-5 md:h-5 text-gray-400"
                aria-hidden="true"
              />
              {salary}
            </span>
          )}
          {experience && (
            <span className="inline-flex items-center gap-2">
              <HiOutlineAcademicCap
                className="w-4 h-4 md:w-5 md:h-5 text-gray-400"
                aria-hidden="true"
              />
              {experience}
            </span>
          )}
        </div>

        {/* Preview — what the role actually involves, when the listing states it */}
        {preview && (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {preview}
          </p>
        )}

        {/* Chips come from the category/type/arrangement columns, not tags, so
            gate on what actually renders - a job with a type but no category
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
    </Link>
  );
}

// ── Page ─────────────────────────────────────────────────────────────

// Server-rendered: the job list is in the HTML (this is the SEO- and
// traffic-critical page), search is a plain GET form, and pagination is plain
// links — all of it works before a byte of JavaScript loads.
export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const page = Math.max(1, Number(params.page) || 1);

  let result: JobsPage = { jobs: [] };
  let fetchFailed = false;
  try {
    result = await getJobs({ page, limit: PAGE_SIZE, search: q });
  } catch {
    fetchFailed = true;
  }

  const jobs = result.jobs.map(mapJobsResponse);
  const totalItems = result.pagination?.totalItems ?? jobs.length;
  const totalPages = result.pagination?.totalPages ?? 1;
  const searchingMore = result.searchingMore === true;

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

        {/* Anchored to the section at a positive offset — hanging it off the
            copy column at -left-40 clipped it against overflow-hidden, the
            same bug fixed in the home hero. */}
        <DottedBox
          className="absolute top-6 left-6 lg:left-10 z-0 w-24 lg:w-28 h-auto pointer-events-none hidden md:block"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between gap-8 relative max-w-[1600px] mx-auto p-8 md:px-10 lg:px-14 mobile:flex-col mobile:text-center mobile:gap-6 mobile:mt-4 mobile:p-4 mobile:pt-8">
          {/* Left — Text content */}
          <div className="flex-[0_0_45%] max-w-lg relative mobile:flex-none mobile:w-full mobile:mx-auto mobile:max-w-full">
            <h1 className="heading-1 mb-6 mobile:mb-4">
              Find the <BrushUnderline>right role</BrushUnderline> for the{" "}
              <span className="text-primary">experience you bring</span>
            </h1>
            <p className="body-text text-base mobile:text-sm mb-2 max-w-[80%] mobile:mb-2 mobile:max-w-full">
              Browse pre-vetted job opportunities for Canadian veterans and
              retirees - flexible roles that match your experience, skills, and
              lifestyle.
            </p>

            {/* CTA + pins row */}
            <div className="flex flex-wrap items-center gap-5 mt-4 mobile:justify-center">
              <a
                href="#job-listings"
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3.5 px-8 min-h-[52px] rounded-full transition-colors shadow-sm group no-underline whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
              >
                Browse jobs
                <HiOutlineArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:-rotate-45" aria-hidden="true" />
              </a>

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
                style={{ aspectRatio: "4/3" }}
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
                style={{ aspectRatio: "4/3" }}
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
                style={{ aspectRatio: "4/3" }}
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
      <main
        id="job-listings"
        className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14 scroll-mt-24"
      >
        <div className="mb-8">
          <Eyebrow className="mb-1.5">Open roles</Eyebrow>
          <h2 className="heading-2">
            {q ? (
              <>
                Results for &ldquo;{q}&rdquo;
                <span className="text-primary">.</span>
              </>
            ) : (
              <>
                Recently posted<span className="text-primary">.</span>
              </>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {fetchFailed
              ? "We couldn't load jobs just now."
              : `${totalItems} ${totalItems === 1 ? "opportunity" : "opportunities"} available`}
          </p>
        </div>

        {/* Search — a plain GET form, so it works without JavaScript and the
            resulting URL is shareable and crawlable. */}
        <form
          action="/jobs"
          method="get"
          role="search"
          className="mb-8 flex gap-3 mobile:flex-col"
        >
          <div className="relative flex-1">
            <HiOutlineMagnifyingGlass
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              aria-hidden="true"
            />
            <input
              type="search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by role, company, or keyword"
              aria-label="Search jobs"
              className="w-full min-h-[52px] pl-11 pr-4 text-base bg-white border border-gray-200 rounded-full outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold py-3 px-8 min-h-[52px] rounded-full transition-colors shadow-sm whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            Search
          </button>
        </form>

        {/* The board is thin for this query and the scraper is fetching more
            from the source in the background. */}
        {searchingMore && (
          <p className="text-sm text-gray-500 -mt-4 mb-6">
            We&apos;re checking more sources for this search. Check back in a
            minute for more results.
          </p>
        )}

        {/* Job grid */}
        {jobs.length > 0 && (
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

        {/* Empty state */}
        {jobs.length === 0 && (
          <div className="text-center py-16">
            <HiOutlineBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {fetchFailed
                ? "We couldn't load jobs right now"
                : q
                  ? `No jobs match "${q}"`
                  : "No jobs available right now"}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {fetchFailed
                ? "Something went wrong on our end. Please try again in a moment."
                : q
                  ? "Try a different word, or browse everything that's open."
                  : "Check back soon - new opportunities are posted regularly."}
            </p>
            {q && !fetchFailed && (
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 mt-6 text-primary font-semibold hover:text-red-700 transition-colors"
              >
                Browse all jobs
                <HiOutlineArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}

        {/* Pagination — plain links so back/forward, sharing, and crawlers all
            work. Buttons are 52px targets to match the rest of the site. */}
        {totalPages > 1 && (
          <nav
            aria-label="Job list pages"
            className="mt-10 flex items-center justify-between gap-4"
          >
            {page > 1 ? (
              <Link
                href={`${pageHref(page - 1, q)}#job-listings`}
                className="inline-flex items-center gap-2 min-h-[52px] px-6 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary transition-colors no-underline"
              >
                <HiOutlineChevronLeft className="w-4 h-4" aria-hidden="true" />
                Previous
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            <p className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </p>
            {page < totalPages ? (
              <Link
                href={`${pageHref(page + 1, q)}#job-listings`}
                className="inline-flex items-center gap-2 min-h-[52px] px-6 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary transition-colors no-underline"
              >
                Next
                <HiOutlineChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
          </nav>
        )}

        {/* CTA banner */}
        <div className="mt-12 bg-white border border-gray-200 rounded-xl p-8 sm:p-10 text-center">
          <h3 className="heading-3 mb-3">Ready to take the next step?</h3>
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
