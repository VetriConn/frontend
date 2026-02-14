"use client";

import { useMemo } from "react";
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
import { DUMMY_JOBS } from "@/lib/dummy-jobs";
import { Job } from "@/types/job";
import { Skeleton } from "@/components/ui/Skeleton";

// ── Helpers ──────────────────────────────────────────────────────────

function formatSalary(job: Job): string {
  if (job.salary) {
    return `${job.salary.symbol}${job.salary.number.toLocaleString()} ${job.salary.currency}`;
  }
  if (job.salary_range) {
    const { start_salary: s, end_salary: e } = job.salary_range;
    if (s.number && e.number) {
      return `${s.symbol}${s.number.toLocaleString()} – ${e.symbol}${e.number.toLocaleString()} ${e.currency}`;
    }
  }
  return "";
}

function getJobType(job: Job): string {
  const types = ["Full-time", "Part-time", "Contract", "Flexible"];
  const found = job.tags.find((t) =>
    types.some((type) => type.toLowerCase() === t.name.toLowerCase()),
  );
  return found?.name || "Full-time";
}

// ── Skeleton ─────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3"
      aria-hidden="true"
    >
      <Skeleton width="55%" height="22px" borderRadius="4px" />
      <div className="flex flex-wrap gap-3">
        <Skeleton width="100px" height="16px" borderRadius="4px" />
        <Skeleton width="80px" height="16px" borderRadius="4px" />
        <Skeleton width="90px" height="16px" borderRadius="4px" />
      </div>
      <Skeleton width="100%" height="16px" borderRadius="4px" />
      <Skeleton width="70%" height="16px" borderRadius="4px" />
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
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-gray-500 mb-3">
        <span className="flex items-center gap-1.5">
          <HiOutlineBuildingOffice2
            className="w-4 h-4 text-gray-400"
            aria-hidden="true"
          />
          {job.company_name}
        </span>
        <span className="flex items-center gap-1.5">
          <HiOutlineMapPin
            className="w-4 h-4 text-gray-400"
            aria-hidden="true"
          />
          {job.location || "Canada"}
        </span>
        <span className="flex items-center gap-1.5">
          <HiOutlineBriefcase
            className="w-4 h-4 text-gray-400"
            aria-hidden="true"
          />
          {type}
        </span>
        {salary && (
          <span className="flex items-center gap-1.5">
            <HiOutlineCurrencyDollar
              className="w-4 h-4 text-gray-400"
              aria-hidden="true"
            />
            {salary}
          </span>
        )}
      </div>

      {/* Description excerpt */}
      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
        {job.full_description}
      </p>

      {/* Tags */}
      {job.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {job.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.name}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-primary"
            >
              {tag.name}
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

  const dummyJobsList = useMemo(() => Object.values(DUMMY_JOBS), []);
  const jobs = apiJobs.length > 0 ? apiJobs : dummyJobsList;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Public site header */}
      <div className="sticky top-0 z-50 bg-white">
        <Header />
      </div>

      {/* Hero banner */}
      <section className="px-[5%] py-4 pb-16 bg-white relative overflow-hidden mobile:px-[5%] mobile:py-1.5 mobile:pb-8">
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

        <div className="flex items-center justify-between gap-8 relative max-w-[1340px] mx-auto p-8 mobile:flex-col mobile:text-center mobile:gap-6 mobile:mt-4 mobile:p-4 mobile:pt-8">
          {/* Left — Text content */}
          <div className="flex-[0_0_45%] max-w-[500px] relative mobile:flex-none mobile:w-full mobile:mx-auto mobile:max-w-full">
            {/* Dotted box decoration */}
            <DottedBox
              className="absolute top-0 -left-[150px] z-0 w-[100px] h-auto pointer-events-none mobile:w-[70px] mobile:-top-10 mobile:left-0"
              aria-hidden="true"
            />

            <h1 className="font-lato text-[52px] leading-[1.1] font-bold text-text mb-6 mobile:text-[32px] mobile:mb-4">
              Find The{" "}
              <span className="italic font-[var(--font-outfit)] text-[0.85em] underline decoration-primary decoration-2 underline-offset-4">
                Perfect Opportunity
              </span>{" "}
              <span className="text-primary">For You</span>
            </h1>
            <p className="font-open-sans text-subtitle text-text-muted mb-2 max-w-[80%] text-base mobile:text-sm mobile:mb-2 mobile:max-w-full">
              Browse pre-vetted job opportunities for Canadian veterans and
              retirees — flexible roles that match your experience, skills, and
              lifestyle.
            </p>

            {/* CTA + pins row */}
            <div className="flex flex-wrap items-center gap-5 mt-4 mobile:justify-center">
              <Link
                href="/signin"
                className="inline-flex items-center gap-2.5 bg-primary hover:bg-red-700 text-white font-semibold py-3.5 px-8 rounded-full transition-colors shadow-sm"
              >
                Browse Jobs
                <HiOutlineArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              {/* Job pins stack */}
              <div className="flex items-center">
                <div className="flex -space-x-2.5">
                  {["jobs_pin", "jobs_pin2", "jobs_pin3", "jobs_pin4"].map(
                    (pin) => (
                      <div
                        key={pin}
                        className="w-9 h-9 rounded-full border-2 border-white bg-gray-200 overflow-hidden"
                      >
                        <Image
                          src={`/images/${pin}.jpg`}
                          alt=""
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ),
                  )}
                  <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                    <span className="text-[10px] font-semibold text-gray-600">
                      +500
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Image collage */}
          <div className="relative flex-[0_0_auto] w-[650px] max-w-[650px] h-[455px] mobile:flex-none mobile:w-full mobile:max-w-full mobile:h-[300px]">
            {/* Dotted box decoration behind images */}
            <DottedBox
              className="absolute -bottom-[30px] -right-[70px] z-[3] w-[100px] h-auto pointer-events-none"
              aria-hidden="true"
            />

            {/* Maple leaf watermark */}
            <div
              className="absolute bottom-2 right-2 w-[100px] h-[100px] rounded-[10px] bg-[url('/favicon.svg')] bg-no-repeat bg-center bg-contain z-[1] opacity-80 mobile:hidden"
              aria-hidden="true"
            />

            {/* Image 1 — top-left, tilted left */}
            <div className="absolute left-0 top-0 w-[48%] h-[55%] -rotate-3 rounded-2xl overflow-hidden shadow-lg z-[3]">
              <Image
                src="/images/jobs_hero.jpg"
                alt="Professional working at desk"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                priority
              />
            </div>

            {/* Image 2 — top-right, tilted right */}
            <div className="absolute right-0 top-2 w-[48%] h-[55%] rotate-3 rounded-2xl overflow-hidden shadow-lg z-[4]">
              <Image
                src="/images/jobs_hero2.jpg"
                alt="Experienced professional collaborating"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                priority
              />
            </div>

            {/* Image 3 — bottom-center, tilted slightly */}
            <div className="absolute left-[15%] bottom-0 w-[52%] h-[50%] rotate-2 rounded-2xl overflow-hidden shadow-lg z-[5]">
              <Image
                src="/images/jobs_hero3.jpg"
                alt="Veteran in professional setting"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 80vw, 30vw"
                priority
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
            <h2 className="text-2xl font-bold text-gray-900">
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
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-red-700 transition-colors"
          >
            <HiOutlineMagnifyingGlass className="w-4 h-4" aria-hidden="true" />
            Advanced Search
          </Link>
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div
            className="grid gap-4 sm:grid-cols-2"
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
            className="grid gap-4 sm:grid-cols-2"
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
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            Ready to take the next step?
          </h3>
          <p className="text-gray-600 max-w-lg mx-auto mb-6">
            Create your free Vetriconn account to access full job details, save
            listings, and apply with one click.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2.5 bg-primary hover:bg-red-700 text-white font-semibold py-3.5 px-10 rounded-full transition-colors shadow-sm"
            >
              Get Started Free
              <HiOutlineArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <p className="text-sm font-medium text-gray-500">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="text-primary hover:text-red-700 transition-colors font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
