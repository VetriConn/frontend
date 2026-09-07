"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { mutate } from "swr";
import {
  HiOutlineBriefcase,
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineClipboardDocument,
} from "react-icons/hi2";
import { useToaster } from "@/components/ui/Toaster";
import { StepHiring } from "@/components/pages/dashboard/postings/HiringStep";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useMyCompanies } from "@/hooks/useCompanies";
import { canPostJobsFor } from "@/lib/api";
import {
  createPosting,
  getMyPosting,
  updatePosting,
} from "@/lib/api";
import type { PostedJobDetail } from "@/types/api";
import type { CreateJobInput } from "@/lib/api/postings";
import {
  INDUSTRIES,
  JOB_TYPES as JOB_TYPE_VALUES,
  WORK_ARRANGEMENTS as WORK_ARRANGEMENT_VALUES,
  EXPERIENCE_LEVELS as EXPERIENCE_LEVEL_VALUES,
  PHYSICAL_DEMANDS as PHYSICAL_DEMAND_VALUES,
  WORK_SCHEDULES as WORK_SCHEDULE_VALUES,
  PAYMENT_TYPES as PAYMENT_TYPE_VALUES,
  MIN_QUALIFICATIONS as MIN_QUALIFICATION_VALUES,
  SECURITY_CLEARANCES as SECURITY_CLEARANCE_VALUES,
  LANGUAGES as LANGUAGE_VALUES,
  BENEFITS as BENEFIT_VALUES,
  CURRENCIES as CURRENCY_VALUES,
} from "@/lib/job-fields";
import {
  WIZARD_STEPS,
  LITE_STEPS,
  INITIAL_FORM_DATA,
  asVocab,
  cleanScreeningQuestions,
  cleanFaqs,
  cleanStages,
  linesToList,
  type JobFormData,
  type FormErrors,
} from "./jobForm";
import {
  StepJobDetails,
  StepDescription,
  StepRequirements,
  StepSalaryLocation,
  StepEssentials,
  StepReview,
  VerticalStepper,
} from "./steps";
import { SelectField } from "./formKit";

/**
 * The job builder's orchestrator: mode selection (full vs lite), step state,
 * validation, draft/publish submission, and the wizard shell. The data layer
 * lives in ./jobForm, the field kit in ./formKit, and each step in ./steps —
 * this file used to carry all of it at once (2,100+ lines, #47).
 */

/** ISO datetime (or plain date) → the YYYY-MM-DD an <input type="date"> shows. */
function toDateInputValue(value: string | undefined): string {
  if (!value) return "";
  return value.slice(0, 10);
}

const CreateJobPosting = ({
  variant = "full",
}: {
  /** "lite" is the 2-step quick-post path; "full" is the complete builder. */
  variant?: "full" | "lite";
} = {}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToaster();
  const { userProfile } = useUserProfile();
  const [currentStep, setCurrentStep] = useState(1);
  const [builderMode, setBuilderMode] = useState<"full" | "lite">(variant);
  const [formData, setFormData] = useState<JobFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDraftLoading, setIsDraftLoading] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string>("");

  const steps = builderMode === "lite" ? LITE_STEPS : WIZARD_STEPS;
  const totalSteps = steps.length;
  const draftId = searchParams.get("draftId");

  // Switch between quick-post and the full builder. Form data is a superset, so
  // nothing is lost either way; we just reset to the first step.
  const switchMode = useCallback((next: "full" | "lite") => {
    setBuilderMode(next);
    setCurrentStep(1);
    setErrors({});
  }, []);

  // Pin the header just below the sticky dashboard navbar, and the stepper just
  // below the header — measured at runtime so the offsets stay correct whatever
  // the navbar/header heights are (responsive text, wrapping, or accessibility
  // text-scaling), instead of relying on a brittle magic number.
  const headerRef = useRef<HTMLDivElement>(null);
  const [stickyTops, setStickyTops] = useState({ header: 64, rail: 140 });
  useEffect(() => {
    const nav = document.querySelector("nav.sticky") as HTMLElement | null;
    const measure = () => {
      const navH = nav?.offsetHeight ?? 64;
      const headerH = headerRef.current?.offsetHeight ?? 76;
      setStickyTops({ header: navH, rail: navH + headerH });
    };
    measure();
    // ResizeObserver catches font-load, wrapping and text-scaling changes that
    // a plain resize listener would miss.
    const ro = new ResizeObserver(measure);
    if (nav) ro.observe(nav);
    if (headerRef.current) ro.observe(headerRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [builderMode, currentStep]);

  // Straight column reads. This used to reverse-engineer the form state by
  // scanning tags/qualifications/responsibilities against the dropdown option
  // lists — guesswork that misfiled values whenever two lists shared a slug.
  const mapJobToFormData = useCallback(
    (job: PostedJobDetail): JobFormData => ({
      job_title: job.role || "",
      job_category: job.job_category ?? "",
      job_type: job.job_type ?? "",
      work_arrangement: job.work_arrangement ?? "",
      description: job.description || "",
      responsibilities: (job.responsibilities ?? []).join("\n"),
      requirements: (job.qualifications ?? []).join("\n"),
      experience_level: job.experience_level ?? "",
      skills: job.skills ?? "",
      physical_demands: job.physical_demands ?? "",
      // Zero means "not specified" in storage, so it comes back as empty
      // rather than as a claim the job pays nothing.
      salary_min: job.salary_range?.start_salary?.number
        ? String(job.salary_range.start_salary.number)
        : job.salary?.number
          ? String(job.salary.number)
          : "",
      salary_max: job.salary_range?.end_salary?.number
        ? String(job.salary_range.end_salary.number)
        : "",
      payment_type: job.payment_type ?? "",
      currency: job.currency ?? "CAD",
      city: job.city ?? "",
      state_province: job.state_province ?? "",
      country: job.country ?? "Canada",
      work_schedule: job.work_schedule ?? "",
      min_qualification: job.min_qualification ?? "",
      security_clearance: job.security_clearance ?? "",
      requires_drivers_license: job.requires_drivers_license ?? false,
      visa_sponsorship: job.visa_sponsorship ?? false,
      veteran_friendly: job.veteran_friendly ?? false,
      accommodations_offered: job.accommodations_offered ?? false,
      physically_accessible: job.physically_accessible ?? false,
      open_to_returners: job.open_to_returners ?? false,
      languages: job.languages ?? [],
      benefits: job.benefits ?? [],
      certifications: (job.certifications ?? []).join(", "),
      openings: job.openings ? String(job.openings) : "",
      // The API ships these as ISO datetimes now that they are real dates;
      // <input type="date"> only accepts the calendar part.
      application_deadline: toDateInputValue(job.application_deadline),
      start_date: toDateInputValue(job.start_date),
      screening_questions: job.screening_questions ?? [],
      faqs: job.faqs ?? [],
      hiring_stages: job.hiring_stages ?? [],
    }),
    [],
  );

  React.useEffect(() => {
    if (!draftId) return;

    let active = true;
    setIsDraftLoading(true);

    void getMyPosting(draftId)
      .then((job) => {
        if (!active) return;
        setEditingJobId(job._id);
        setFormData(mapJobToFormData(job));
      })
      .catch((err) => {
        if (!active) return;
        // Invalid draft ID - remove it from URL and proceed with new job creation
        console.warn("Invalid draft ID, proceeding with new job creation:", err);
        const url = new URL(window.location.href);
        url.searchParams.delete("draftId");
        window.history.replaceState({}, "", url.toString());
        // Don't show error toast - just silently proceed with new creation
      })
      .finally(() => {
        if (active) setIsDraftLoading(false);
      });

    return () => {
      active = false;
    };
  }, [draftId, mapJobToFormData]);

  const handleFieldChange = useCallback(
    (field: keyof JobFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors],
  );

  // Generic setter for the non-string fields — booleans and multi-selects.
  const setField = useCallback(
    <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  // Toggle a value in a multi-select array field (languages, benefits).
  const toggleInArray = useCallback(
    (field: "languages" | "benefits", value: string) => {
      setFormData((prev) => {
        const current = prev[field];
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [field]: next };
      });
    },
    [],
  );

  /**
   * A failed validation used to render red text and nothing else — no
   * announcement, no focus move — so keyboard and screen-reader users heard
   * silence when Continue refused to advance. The toast region is aria-live,
   * and focus lands on the first field that needs attention (every field's
   * id matches its error key).
   */
  const announceErrors = useCallback(
    (newErrors: FormErrors) => {
      const failed = Object.keys(newErrors);
      if (failed.length === 0) return;
      showToast({
        type: "error",
        title: "Check the highlighted fields",
        description: Object.values(newErrors)[0],
      });
      const first = document.getElementById(failed[0]);
      if (first) {
        first.scrollIntoView?.({ block: "center", behavior: "smooth" });
        (first as HTMLElement).focus?.({ preventScroll: true });
      }
    },
    [showToast],
  );

  const validateStep = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    const briefEmpty = !formData.description.replace(/<[^>]*>/g, "").trim();
    const salaryValid = () => {
      if (!formData.salary_min && !formData.salary_max) {
        newErrors.salary_min = "Add a salary or range";
      } else if (
        formData.salary_min &&
        formData.salary_max &&
        Number(formData.salary_min) > Number(formData.salary_max)
      ) {
        newErrors.salary_min = "Minimum salary cannot exceed maximum";
      }
    };

    // Lite: everything required lives on the single Essentials step.
    if (builderMode === "lite") {
      if (currentStep === 1) {
        if (!formData.job_title.trim())
          newErrors.job_title = "Job title is required";
        if (!formData.job_category)
          newErrors.job_category = "Category is required";
        if (!formData.city.trim())
          newErrors.city = "Location (city) is required";
        salaryValid();
        if (briefEmpty) newErrors.description = "A job brief is required";
        if (!formData.responsibilities.trim())
          newErrors.responsibilities = "Add at least one responsibility";
      }
      setErrors(newErrors);
      announceErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (currentStep === 1) {
      if (!formData.job_title.trim()) {
        newErrors.job_title = "Job title is required";
      }
      if (!formData.job_category) {
        newErrors.job_category = "Category is required";
      }
    }

    if (currentStep === 2) {
      // The brief is HTML now, so an empty editor can still hold "<br>";
      // require real text, not just tags.
      if (briefEmpty) {
        newErrors.description = "A job brief is required";
      }
      if (!formData.responsibilities.trim()) {
        newErrors.responsibilities = "Add at least one responsibility";
      }
    }

    if (currentStep === 4) {
      if (!formData.city.trim()) {
        newErrors.city = "Location (city) is required";
      }
      salaryValid();
    }

    setErrors(newErrors);
    announceErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [builderMode, currentStep, formData, announceErrors]);

  const handleContinue = useCallback(() => {
    if (!validateStep()) return;

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep, totalSteps, validateStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  // Jump straight to an already-completed step from the stepper. Only backward
  // jumps are allowed, so we never skip a step's validation on the way forward.
  const goToStep = useCallback(
    (step: number) => {
      if (step < currentStep) {
        setCurrentStep(step);
        setErrors({});
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [currentStep],
  );

  // Empty means posting as the individual employer, which is the default and
  // the only option for anyone without an approved Company Page.
  const [postAsCompanyId, setPostAsCompanyId] = useState("");
  const { approvedCompanies } = useMyCompanies();

  // Companies this user may post under: approved, and they're an owner/admin.
  // Recruiters can review applicants but not create postings, matching the
  // server's check — so the control simply won't list those companies.
  const postableCompanies = approvedCompanies.filter((company) =>
    canPostJobsFor(company, userProfile?.id),
  );

  // Typed against the wire contract. The old payload also sent tags,
  // qualifications, responsibilities, salary_range and a draft_payload blob —
  // all silently stripped by the backend validator; the flat fields below are
  // what actually crosses, now as vocabulary-checked columns.
  const buildPayload = useCallback(
    (status: "draft" | "published"): CreateJobInput => ({
      role: formData.job_title,
      description: formData.description,
      responsibilities: linesToList(formData.responsibilities),
      qualifications: linesToList(formData.requirements),
      skills: formData.skills,
      experience_level: asVocab(
        EXPERIENCE_LEVEL_VALUES,
        formData.experience_level,
      ),
      physical_demands: asVocab(
        PHYSICAL_DEMAND_VALUES,
        formData.physical_demands,
      ),
      salary_min: formData.salary_min,
      salary_max: formData.salary_max,
      payment_type: asVocab(PAYMENT_TYPE_VALUES, formData.payment_type),
      city: formData.city,
      state_province: formData.state_province || undefined,
      country: formData.country,
      work_schedule: asVocab(WORK_SCHEDULE_VALUES, formData.work_schedule),
      work_arrangement: asVocab(
        WORK_ARRANGEMENT_VALUES,
        formData.work_arrangement,
      ),
      job_type: asVocab(JOB_TYPE_VALUES, formData.job_type),
      job_category: asVocab(INDUSTRIES, formData.job_category),
      // Phase-1 job-builder fields.
      currency: asVocab(CURRENCY_VALUES, formData.currency),
      min_qualification: asVocab(
        MIN_QUALIFICATION_VALUES,
        formData.min_qualification,
      ),
      security_clearance: asVocab(
        SECURITY_CLEARANCE_VALUES,
        formData.security_clearance,
      ),
      requires_drivers_license: formData.requires_drivers_license,
      visa_sponsorship: formData.visa_sponsorship,
      veteran_friendly: formData.veteran_friendly,
      accommodations_offered: formData.accommodations_offered,
      physically_accessible: formData.physically_accessible,
      open_to_returners: formData.open_to_returners,
      languages: formData.languages.filter((l): l is (typeof LANGUAGE_VALUES)[number] =>
        (LANGUAGE_VALUES as readonly string[]).includes(l),
      ),
      benefits: formData.benefits.filter((b): b is (typeof BENEFIT_VALUES)[number] =>
        (BENEFIT_VALUES as readonly string[]).includes(b),
      ),
      certifications: formData.certifications
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      openings: formData.openings ? Number(formData.openings) : undefined,
      application_deadline: formData.application_deadline || undefined,
      start_date: formData.start_date || undefined,
      // Phase-2 fields, cleaned: drop blank rows and trim, so an empty editor
      // row never reaches the server (which would reject it) or a listing.
      screening_questions: cleanScreeningQuestions(formData.screening_questions),
      faqs: cleanFaqs(formData.faqs),
      hiring_stages: cleanStages(formData.hiring_stages),
      status,
      // Empty means posting as the individual employer.
      company_id: postAsCompanyId || undefined,
    }),
    [formData, postAsCompanyId],
  );

  const handleSaveDraft = useCallback(async () => {
    if (!formData.job_title.trim()) {
      setErrors((prev) => ({
        ...prev,
        job_title: "Job title is required to save a draft",
      }));
      setCurrentStep(1);
      return;
    }

    setIsSaving(true);
    try {
      if (editingJobId) {
        await updatePosting(editingJobId, buildPayload("draft"));
        showToast({
          type: "success",
          title: "Draft updated",
          description: "Your job draft was updated successfully",
        });
      } else {
        const newJob = await createPosting(buildPayload("draft"));
        // Set the editing ID so subsequent saves update instead of creating new drafts
        setEditingJobId(newJob._id);
        // Update URL to include draftId
        const url = new URL(window.location.href);
        url.searchParams.set("draftId", newJob._id);
        window.history.replaceState({}, "", url.toString());
        showToast({
          type: "success",
          title: "Draft saved",
          description: "Your job draft was saved successfully",
        });
      }
      await mutate("employer-jobs-dashboard");
      await mutate("employer-jobs-manage");
      await mutate("employer-jobs-drafts");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save draft";
      showToast({
        type: "error",
        title: "Couldn't save draft",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }, [buildPayload, editingJobId, formData.job_title, showToast]);

  const handlePublish = useCallback(async () => {
    if (!validateStep()) return;

    setIsSaving(true);
    try {
      const saved = editingJobId
        ? await updatePosting(editingJobId, buildPayload("published"))
        : await createPosting(buildPayload("published"));
      await mutate("employer-jobs-dashboard");
      await mutate("employer-jobs-manage");
      await mutate("employer-jobs-drafts");
      // New jobs (and content edits to live ones) sit in the moderation queue
      // before they appear on the board — say so, don't claim "live". An
      // approved job can also be held (company suspended): approved ≠ live.
      // The hold axis is always present ("none" when clear), so test the hold
      // itself rather than the field's truthiness.
      if (
        saved.moderation_status === "approved" &&
        saved.unpublished_reason !== "company_suspended"
      ) {
        showToast({
          type: "success",
          title: "Job updated",
          description: "Your changes are live",
        });
      } else if (saved.moderation_status === "approved") {
        showToast({
          type: "success",
          title: "Job updated",
          description:
            "Your changes are saved. The listing stays off the board while your company is on hold.",
        });
      } else {
        showToast({
          type: "success",
          title: "Job submitted for review",
          description:
            "Our team checks every listing before it goes live. We'll let you know when it's up.",
        });
      }
      router.push("/dashboard/postings");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to publish";
      showToast({
        type: "error",
        title: "Publish failed",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  }, [buildPayload, editingJobId, router, showToast, validateStep]);

  // ─── Render Current Step ─────────────────────────────────────────────────

  const renderStep = () => {
    // Lite quick-post: one Essentials step, then the shared Preview.
    if (builderMode === "lite") {
      return currentStep === 1 ? (
        <StepEssentials
          formData={formData}
          errors={errors}
          onChange={handleFieldChange}
        />
      ) : (
        <StepReview formData={formData} />
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <StepJobDetails
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
          />
        );
      case 2:
        return (
          <StepDescription
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
          />
        );
      case 3:
        return (
          <StepRequirements
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
            onSet={setField}
            onToggle={toggleInArray}
          />
        );
      case 4:
        return (
          <StepSalaryLocation
            formData={formData}
            errors={errors}
            onChange={handleFieldChange}
            onToggle={toggleInArray}
          />
        );
      case 5:
        return (
          <StepHiring
            questions={formData.screening_questions}
            faqs={formData.faqs}
            stages={formData.hiring_stages}
            setQuestions={(q) => setField("screening_questions", q)}
            setFaqs={(f) => setField("faqs", f)}
            setStages={(s) => setField("hiring_stages", s)}
          />
        );
      case 6:
        return <StepReview formData={formData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-6 py-8 max-w-full lg:max-w-6xl xl:max-w-7xl">
        {/* Header */}
        {/* Header — pinned below the sticky dashboard navbar so the title, step
            counter and mode toggle stay visible while only the form scrolls.
            The top offset is measured (stickyTops.header); sticky only on lg+,
            on mobile it scrolls normally (top is ignored while static). */}
        <div
          ref={headerRef}
          style={{ top: stickyTops.header }}
          className="flex items-center justify-between mb-8 lg:mb-0 lg:sticky lg:z-30 lg:-mx-6 lg:px-6 lg:pt-2 lg:pb-8 lg:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 text-primary rounded-full flex items-center justify-center">
              <HiOutlineBriefcase className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
                {editingJobId ? "Edit Your Posting" : "Post a Job"}
              </h1>
              <p className="text-sm text-gray-600">
                Step {currentStep} of {totalSteps}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Quick-post ⇄ full builder. Data is shared, so switching is safe. */}
            {!editingJobId && (
              <div
                role="group"
                aria-label="Posting mode"
                className="hidden sm:inline-flex rounded-lg border border-gray-200 bg-white p-1"
              >
                {(
                  [
                    ["lite", "Quick post"],
                    ["full", "Full builder"],
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => switchMode(mode)}
                    aria-pressed={builderMode === mode}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                      builderMode === mode
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-700 transition-colors"
            >
              <HiOutlineArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Two-column layout: vertical stepper rail + form content */}
        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
          {/* Left rail — vertical stepper. Sticky on the grid item itself with
              self-start (the reliable grid pattern), pinned just below the
              sticky header (measured stickyTops.rail) so the steps stay put
              while only the form scrolls. */}
          <div
            style={{ top: stickyTops.rail }}
            className="mb-8 lg:mb-0 lg:sticky lg:self-start"
          >
            <VerticalStepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={goToStep}
            />
          </div>

          {/* Right column — step content + actions */}
          <div>
        {/* Quick-post nudge: the full builder's richer data drives visibility
            and matching, so encourage it (posting as a company most of all). */}
        {builderMode === "lite" && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-red-50 p-4">
            <HiOutlineBriefcase className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Want more visibility and better matches?</span>{" "}
              Posting as a company with the full builder captures the details
              that power candidate matching.{" "}
              <button
                type="button"
                onClick={() => switchMode("full")}
                className="font-semibold text-primary underline underline-offset-2 hover:text-primary-hover"
              >
                Switch to the full builder
              </button>
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 mb-6">
          {/* Only shown when there's genuinely a choice to make — solo
              employers see the form exactly as before. */}
          {postableCompanies.length > 0 && (
            <div className="mb-6 pb-6 border-b border-gray-100">
              <SelectField
                id="post_as"
                label="Post as"
                value={postAsCompanyId}
                onChange={setPostAsCompanyId}
                placeholder={`${userProfile?.full_name || "Myself"} (individual)`}
                options={[
                  {
                    value: "",
                    label: `${userProfile?.full_name || "Myself"} (individual)`,
                  },
                  ...postableCompanies.map((company) => ({
                    value: company._id,
                    label: company.name,
                  })),
                ]}
                helperText={
                  postAsCompanyId
                    ? "This posting and its applicants belong to the company, and your teammates can manage them."
                    : "This posting belongs to you personally."
                }
              />
            </div>
          )}

          {isDraftLoading ? (
            <div className="text-sm text-gray-600">Loading draft...</div>
          ) : (
            renderStep()
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <HiOutlineClipboardDocument className="w-4 h-4" />
            Save as Draft
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <HiOutlineArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleContinue}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
              >
                Continue
                <HiOutlineArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {isSaving ? "Publishing..." : "Publish Job"}
                {!isSaving && <HiOutlineArrowRight className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateJobPosting;
