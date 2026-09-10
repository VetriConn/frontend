"use client";
import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import Link from "next/link";
import {
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineBriefcase,
  HiOutlineArrowUpTray,
  HiOutlineDocumentText,
  HiOutlineXMark,
  HiOutlineExclamationCircle,
  HiOutlineCalendarDays,
  HiOutlineBookmark,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { HiOutlinePaperAirplane } from "react-icons/hi2";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format, parse } from "date-fns";
import { Job } from "@/types/job";
import { submitJobApplication } from "@/lib/api";
import {
  getApplicationDraft,
  removeApplicationDraft,
  saveApplicationDraft,
} from "@/lib/applicationDrafts";
import { useToaster } from "@/components/ui/Toaster";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { PhoneField } from "@/components/ui/PhoneField.lazy";
import { ScreeningQuestionField } from "./ScreeningQuestionField";
import {
  ApplicationReview,
  type ReviewGroup,
} from "./ApplicationReview";
import { RequiredMark } from "@/components/ui/RequiredMark";

// Canonical profile shape subset used for pre-filling application form
import type { UserProfile } from "@/types/api";
import { fieldLabel, JOB_TYPE_LABELS } from "@/lib/job-fields";
import { formatDate } from "@/lib/date-utils";
import { addSkill } from "@/lib/application-skills";
import {
  prefillFromProfile,
  storedResumes,
  type PrefillProfile,
} from "@/lib/application-prefill";
/** Contact details, plus the two facts the experience opener is built from. */
type CanonicalUserProfile = PrefillProfile;

interface JobApplicationFormProps {
  job: Job;
  userProfile?: CanonicalUserProfile | null;
}

// Fallback pool for listings that state no skills of their own. When the
// posting lists skills, THOSE are the chips - picking from a generic list
// unrelated to the job told the employer nothing.
const FALLBACK_SKILLS = [
  "Customer Service",
  "Phone Communication",
  "Problem Solving",
  "Data Entry",
  "Microsoft Office",
  "Team Collaboration",
  "Leadership",
  "Project Management",
  "Time Management",
  "Technical Writing",
  "Public Speaking",
  "Analytical Thinking",
];

/** The job's own stated skills, split from its free-text field. */
function jobSkillPool(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[\n,;]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

const SCHEDULE_OPTIONS = [
  { value: "", label: "Select your preference..." },
  { value: "full-time", label: "Full-Time" },
  { value: "part-time", label: "Part-Time" },
  { value: "flexible", label: "Flexible Hours" },
  { value: "shift-work", label: "Shift Work" },
  { value: "weekdays", label: "Weekdays Only" },
  { value: "weekends", label: "Weekends Available" },
];

const LOCATION_OPTIONS = [
  { value: "", label: "Select your preference..." },
  { value: "on-site", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "no-preference", label: "No Preference" },
];

/** Suggested length, shown as a counter. Not a limit. */
const COVER_LETTER_SUGGESTED = 500;
/** The actual cap, matching the column's maxlength on the server. */
const COVER_LETTER_MAX = 5000;

/** A stored option value as the reader saw it, not as we store it. */
function labelFor(
  options: { value: string; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value && o.value !== "")?.label ?? "";
}

const ACCEPTED_FILE_TYPES = [".pdf", ".doc", ".docx"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  relevantExperience: string;
  /** Why this role. Separate from experience, which is what they have done. */
  coverLetter: string;
  portfolioUrl: string;
  personalWebsite: string;
  selectedSkills: string[];
  earliestStartDate: string;
  preferredSchedule: string;
  workLocationPreference: string;
  resume: File | null;
  resumeDocumentId: string;
  additionalInfo: string;
  // Phase-2 screening answers, keyed by the job's question id.
  screeningAnswers: Record<string, string[]>;
}

export default function JobApplicationForm({
  job,
  userProfile,
}: JobApplicationFormProps) {
  const { showToast } = useToaster();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: userProfile?.full_name || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone_number || "",
    relevantExperience: "",
    coverLetter: "",
    portfolioUrl: "",
    personalWebsite: "",
    selectedSkills: [],
    earliestStartDate: "",
    preferredSchedule: "",
    workLocationPreference: "",
    resume: null,
    /** A document already on the profile, chosen instead of uploading. */
    resumeDocumentId: "",
    additionalInfo: "",
    screeningAnswers: {},
  });

  // Restore draft from backend on mount
  useEffect(() => {
    let cancelled = false;
    async function loadDraft() {
      try {
        const draft = await getApplicationDraft(job.id);
        if (draft && !cancelled) {
          setFormData((prev) => ({
            ...prev,
            relevantExperience: draft.relevantExperience || prev.relevantExperience,
            // Only picks still in the rendered pool: the employer may have
            // edited the listing's skills since the draft was saved, and an
            // invisible, un-deselectable pick must not ride into the
            // submission.
            // Everything saved is kept. This used to drop anything outside
            // the rendered pool, which was right when the pool was the only
            // source — and would now silently delete the skills the
            // applicant typed themselves, between saving and coming back.
            selectedSkills: draft.selectedSkills || prev.selectedSkills,
            earliestStartDate: draft.earliestStartDate || prev.earliestStartDate,
            preferredSchedule: draft.preferredSchedule || prev.preferredSchedule,
            workLocationPreference:
              draft.workLocationPreference || prev.workLocationPreference,
            additionalInfo: draft.additionalInfo || prev.additionalInfo,
            screeningAnswers: draft.screeningAnswers ?? prev.screeningAnswers,
          }));
        }
      } catch (err) {
        console.error("Failed to load draft:", err);
      }
    }
    loadDraft();
    return () => { cancelled = true; };
  }, [job.id]);

  /**
   * Fill from the profile when it ARRIVES, not only when the form mounts.
   * The rule itself lives in lib/application-prefill so it can be tested.
   */
  useEffect(() => {
    if (!userProfile) return;
    setFormData((prev) => ({ ...prev, ...prefillFromProfile(prev, userProfile) }));
  }, [userProfile]);

  // Track which fields were pre-filled
  const preFilled = useMemo(
    () => ({
      fullName: !!userProfile?.full_name,
      email: !!userProfile?.email,
      phone: !!userProfile?.phone_number,
    }),
    [userProfile],
  );

  // ── Screening questions ───────────────────────────────────
  const screeningQuestions = useMemo(
    () => job.screening_questions ?? [],
    [job.screening_questions],
  );

  const setScreeningAnswer = (questionId: string, values: string[]) => {
    setFormData((prev) => ({
      ...prev,
      screeningAnswers: { ...prev.screeningAnswers, [questionId]: values },
    }));
  };

  const requiredScreeningMissing = useMemo(
    () =>
      screeningQuestions.some(
        (q) =>
          q.required &&
          !(formData.screeningAnswers[q.id] ?? []).some((v) => v.trim()),
      ),
    [screeningQuestions, formData.screeningAnswers],
  );

  /**
   * One entry per section rendered, which was not true before.
   *
   * This returned four booleans while the form rendered six cards, and the
   * bar read "{n} of 4 sections completed" — so it could sit at "4 of 4"
   * with the screening questions unanswered and the last section untouched.
   * A progress bar that reaches the end before the form does is worse than
   * no progress bar.
   */
  const sectionComplete = useMemo(() => {
    const s1 =
      formData.fullName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== "";
    const s2 =
      formData.relevantExperience.trim() !== "" &&
      formData.selectedSkills.length > 0;
    const s3 =
      formData.earliestStartDate !== "" &&
      formData.preferredSchedule !== "" &&
      formData.workLocationPreference !== "";
    const s4 = formData.resume !== null || formData.resumeDocumentId !== "";
    // Screening only counts when the job asks something; an absent section
    // must not hold the bar back.
    const s5 = screeningQuestions.length === 0 || !requiredScreeningMissing;
    // The last section is genuinely optional — complete by default, so it
    // never reads as unfinished work.
    const s6 = true;
    return [s1, s2, s3, s4, s5, s6];
  }, [formData, screeningQuestions.length, requiredScreeningMissing]);

  /** Résumés already on the profile, offered instead of a fresh upload. */
  const profileResumes = useMemo(() => storedResumes(userProfile), [userProfile]);

  /** What the form offers to tick: the employer's list, else the fallback. */
  const offeredSkills = useMemo(() => {
    const pool = jobSkillPool(job.skills);
    return pool.length > 0 ? pool : FALLBACK_SKILLS;
  }, [job.skills]);

  const completedCount = sectionComplete.filter(Boolean).length;

  /**
   * The last look. Not a wizard step — the form stays one page filled in any
   * order, and this is a summary of it reached once at the end.
   */
  const [reviewing, setReviewing] = useState(false);

  const reviewGroups: ReviewGroup[] = useMemo(
    () => [
      {
        title: "Personal information",
        editTargetId: "section-contact",
        fields: [
          { label: "Full name", value: formData.fullName },
          { label: "Email address", value: formData.email },
          { label: "Phone number", value: formData.phone },
          { label: "Personal website", value: formData.personalWebsite },
          { label: "Portfolio URL", value: formData.portfolioUrl },
        ],
      },
      {
        title: "Experience and skills",
        editTargetId: "section-experience",
        fields: [
          { label: "Relevant experience", value: formData.relevantExperience },
          { label: "Cover letter", value: formData.coverLetter },
          { label: "Skills", value: formData.selectedSkills },
        ],
      },
      {
        title: "Availability",
        editTargetId: "section-availability",
        fields: [
          { label: "Earliest start", value: formData.earliestStartDate },
          {
            label: "Preferred schedule",
            value: labelFor(SCHEDULE_OPTIONS, formData.preferredSchedule),
          },
          {
            label: "Work location",
            value: labelFor(LOCATION_OPTIONS, formData.workLocationPreference),
          },
        ],
      },
      {
        title: "Résumé",
        editTargetId: "section-resume",
        fields: [
          {
            label: "Attached",
            value:
              formData.resume?.name ??
              profileResumes.find(
                (d) => String(d._id) === formData.resumeDocumentId,
              )?.name ??
              "",
          },
        ],
      },
      ...(screeningQuestions.length > 0
        ? [
            {
              title: "Screening questions",
              editTargetId: "section-screening",
              fields: screeningQuestions.map((q) => ({
                label: q.question,
                value: formData.screeningAnswers[q.id] ?? [],
              })),
            },
          ]
        : []),
      {
        title: "Additional information",
        editTargetId: "section-extra",
        fields: [{ label: "Anything else", value: formData.additionalInfo }],
      },
    ],
    [formData, profileResumes, screeningQuestions],
  );

  /** Back to the form, at the section they asked to change. */
  const handleEditSection = useCallback((targetId: string) => {
    setReviewing(false);
    // After the form is back in the tree.
    requestAnimationFrame(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);


  // The stored column, labelled; null renders nothing. The old tag scan here
  // defaulted to "Part-time" while the detail page's copy defaulted to
  // "Full-Time" — two invented answers for the same silent job.
  const derivedJobType = fieldLabel(JOB_TYPE_LABELS, job.job_type);


  // ── Handlers ──────────────────────────────────────────────

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [newSkill, setNewSkill] = useState("");

  /** The rule lives in lib/application-skills so it can be tested. */
  const addCustomSkill = () => {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: addSkill(prev.selectedSkills, offeredSkills, newSkill),
    }));
    setNewSkill("");
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter((s) => s !== skill)
        : [...prev.selectedSkills, skill],
    }));
  };


  // File handling
  const handleFile = useCallback((file: File) => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_FILE_TYPES.includes(ext)) {
      alert("Please upload a PDF or Word document (.pdf, .doc, .docx)");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("File size must be under 5MB");
      return;
    }
    // One résumé goes with an application, so picking a file drops any
    // stored document that was chosen, and choosing one drops the file.
    setFormData((prev) => ({ ...prev, resume: file, resumeDocumentId: "" }));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, resume: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = async () => {
    if (requiredScreeningMissing) {
      showToast({
        type: "error",
        title: "Answer the required questions",
        description:
          "Some screening questions are required before you can apply.",
      });
      return;
    }
    // The backend requires all three; catching it here spares the user a
    // round trip that used to fail without a word.
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim()
    ) {
      showToast({
        type: "error",
        title: "Add your contact details",
        description: "Your name, email, and phone number are needed so the employer can reach you.",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const apiFormData = new FormData();
      apiFormData.append("fullName", formData.fullName);
      apiFormData.append("email", formData.email);
      apiFormData.append("phone", formData.phone);
      apiFormData.append("relevantExperience", formData.relevantExperience);
      apiFormData.append(
        "selectedSkills",
        JSON.stringify(formData.selectedSkills),
      );
      apiFormData.append("earliestStartDate", formData.earliestStartDate);
      apiFormData.append("preferredSchedule", formData.preferredSchedule);
      apiFormData.append(
        "workLocationPreference",
        formData.workLocationPreference,
      );
      apiFormData.append("additionalInfo", formData.additionalInfo);
      apiFormData.append("coverLetter", formData.coverLetter);
      apiFormData.append("portfolioUrl", formData.portfolioUrl);
      apiFormData.append("personalWebsite", formData.personalWebsite);
      // Only answered questions are sent, shaped as the API expects.
      const screeningPayload = screeningQuestions
        .map((q) => ({
          question_id: q.id,
          answer: (formData.screeningAnswers[q.id] ?? []).filter((v) =>
            v.trim(),
          ),
        }))
        .filter((a) => a.answer.length);
      if (screeningPayload.length) {
        apiFormData.append(
          "screeningAnswers",
          JSON.stringify(screeningPayload),
        );
      }
      if (formData.resume) {
        apiFormData.append("resume", formData.resume);
      } else if (formData.resumeDocumentId) {
        // An id, never a URL. The server resolves it against this account's
        // own documents — see services/resumeSource.
        apiFormData.append("resumeDocumentId", formData.resumeDocumentId);
      }
      await submitJobApplication(job.id, apiFormData);
      // Clear draft on successful submission
      await removeApplicationDraft(job.id);
      setIsSubmitting(false);
      setSubmitted(true);
    } catch (err) {
      // The spinner stopping with no explanation read as "I applied" when
      // nothing was saved. The server's message names the actual problem
      // (already applied, listing no longer available, missing field).
      setIsSubmitting(false);
      showToast({
        type: "error",
        title: "Your application wasn't submitted",
        description:
          err instanceof Error && err.message
            ? err.message
            : "Something went wrong. Please try again.",
      });
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveApplicationDraft(job.id, {
        jobId: job.id,
        jobTitle: job.role,
        companyName: job.company_name,
        location: job.location,
        relevantExperience: formData.relevantExperience,
        selectedSkills: formData.selectedSkills,
        earliestStartDate: formData.earliestStartDate,
        preferredSchedule: formData.preferredSchedule,
        workLocationPreference: formData.workLocationPreference,
        additionalInfo: formData.additionalInfo,
        // The answers are the part of a long application most worth saving -
        // "Draft saved" used to silently drop them.
        screeningAnswers: formData.screeningAnswers,
        savedAt: new Date().toISOString(),
      });
      showToast({
        type: "success",
        title: "Draft saved",
        description: "You can continue this application later.",
      });
    } catch (err) {
      console.error("Failed to save draft:", err);
      showToast({
        type: "error",
        title: "Save failed",
        description: "Couldn't save draft. Please try again.",
      });
    }
  };

  // ── Success screen ────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 mobile:p-4">
        <div className="w-full max-w-lg">
          {/* Success Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-10 mobile:p-6 text-center mb-4">
            <div className="w-14 h-14 mobile:w-12 mobile:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <HiOutlineCheckCircle className="w-8 h-8 md:w-12 md:h-12 text-emerald-500" />
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-2">
              Application Submitted Successfully
            </h2>
            <p className="text-sm mobile:text-xs text-gray-500 mb-1">
              Your application for
            </p>
            <p className="text-sm md:text-base mobile:text-sm font-bold text-gray-900 mb-0.5">
              {job.role}
            </p>
            <p className="text-sm mobile:text-xs text-gray-500 mb-5">
              at {job.company_name}
            </p>
            <p className="text-sm mobile:text-xs text-gray-500 leading-relaxed mb-7 max-w-sm mx-auto">
              We&apos;ve sent it to the employer. They will review it and
              contact you if you&apos;re a good match. This usually takes 3–5
              business days.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
              <Link
                href="/dashboard/find-jobs"
                className="inline-flex items-center gap-2 px-5 py-2.5 mobile:px-4 mobile:py-2 bg-primary hover:bg-primary-hover text-white font-semibold text-sm mobile:text-xs rounded-lg transition-colors no-underline"
              >
                Browse More Jobs
              </Link>
              <Link
                href="/dashboard/applied-jobs"
                className="inline-flex items-center gap-2 px-5 py-2.5 mobile:px-4 mobile:py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm mobile:text-xs rounded-lg hover:bg-gray-50 transition-colors no-underline"
              >
                <HiOutlineBriefcase className="w-4 h-4 md:w-5 md:h-5" />
                View Applied Jobs
              </Link>
            </div>
          </div>

          {/* Tip Card */}
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 mobile:px-4 mobile:py-3 text-center">
            <p className="text-sm mobile:text-xs text-gray-500">
              <strong className="text-gray-700">Tip:</strong> Check your email
              inbox for a confirmation. Don&apos;t forget to check your spam
              folder too.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Two columns from lg up. The form was max-w-2xl centred, so most of
          a wide screen was empty margin — and merely stretching the form
          would have pushed the textareas past a comfortable line length.
          The width goes to what is worth keeping in view while filling this
          in: the role itself, and how far along you are. */}
      <div className="max-w-6xl mx-auto px-6 py-8 tablet:px-4 tablet:py-6">
        {/* Page header */}
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1.5">
          Submit Your Application
        </h1>
        <p className="text-sm md:text-base text-gray-500 mb-8 leading-relaxed">
          Take your time filling out each section. We&apos;ve pre-filled some
          information from your profile to save you time.
        </p>

        {/* flex with a fixed-width aside, rather than an arbitrary grid
            template. The template version did not turn up in the emitted
            stylesheet when I looked, and I could not establish why — so
            rather than ship a layout resting on a class I could not prove
            was real, this uses plain utilities whose output I did check in
            the production bundle. The precedent is `rounded-10`, which was
            not a Tailwind class at all and left every input square-cornered
            for as long as nobody looked. */}
        <div className="lg:flex lg:items-start gap-6 lg:gap-8">
          <div className="min-w-0 flex-1">


        {reviewing ? (
          <ApplicationReview groups={reviewGroups} onEdit={handleEditSection} />
        ) : (
          <>
          {/* ─── Section 1: Personal Information ─── */}
          <SectionCard
            anchorId="section-contact"
            number={1}
            title="Personal Information"
            subtitle="Please verify your contact details are correct."
            complete={sectionComplete[0]}
          >
            <div className="space-y-5">
              {/* Paired two-up on desktop: these are short single-line fields
                  and stacking them made a form of six sections longer than it
                  needed to be. Only short fields pair — a textarea or the
                  résumé in half-width reads worse, not better. */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  id="app-full-name"
                  label="Full Name"
                  required
                  help="As it appears on your ID, so an employer can match it to your references."
                  preFilled={preFilled.fullName}
                  valid={formData.fullName.trim().length > 1}
                >
                  <input
                    id="app-full-name"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className="form-input"
                    placeholder="Your full name"
                  />
                </FormField>

                <FormField
                  id="app-email"
                  label="Email Address"
                  required
                  help="Where the employer replies. Check it carefully."
                  preFilled={preFilled.email}
                  valid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())}
                >
                  <input
                    id="app-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="form-input"
                    placeholder="your@email.com"
                  />
                </FormField>
              </div>

              {/* PhoneField, the same component the signup and profile use.
                  This built its own label around the bare control and passed
                  `className="form-input"`, which replaced the shared box
                  styling — so the one field on the page with two inputs
                  inside one border also had different padding and a
                  different focus colour from everything around it. */}
              <PhoneField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={(value) => updateField("phone", value)}
                required
                helperText="We only use this to contact you about this application."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  id="app-website"
                  label="Personal Website"
                  help="Your home page, blog or company site."
                  valid={formData.personalWebsite.trim().length > 3}
                >
                  <input
                    id="app-website"
                    type="url"
                    inputMode="url"
                    value={formData.personalWebsite}
                    onChange={(e) => updateField("personalWebsite", e.target.value)}
                    className="form-input"
                    placeholder="example.com"
                  />
                </FormField>

                <FormField
                  id="app-portfolio"
                  label="Portfolio URL"
                  help="Only shared with this employer."
                  valid={formData.portfolioUrl.trim().length > 3}
                >
                  <input
                    id="app-portfolio"
                    type="url"
                    inputMode="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => updateField("portfolioUrl", e.target.value)}
                    className="form-input"
                    placeholder="dribbble.com/yourname"
                  />
                </FormField>
              </div>
            </div>
          </SectionCard>

          {/* ─── Section 2: Work Experience & Skills ─── */}
          <SectionCard
            anchorId="section-experience"
            number={2}
            title="Work Experience & Skills"
            subtitle="Tell us about your relevant experience and skills."
            complete={sectionComplete[1]}
          >
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="app-experience"
                  className="block text-sm font-semibold text-gray-900 mb-1.5 md:mb-2"
                >
                  Describe Your Relevant Experience
                  <RequiredMark />
                </label>
                <textarea
                  id="app-experience"
                  value={formData.relevantExperience}
                  onChange={(e) =>
                    updateField("relevantExperience", e.target.value)
                  }
                  rows={5}
                  className="form-input resize-none"
                  placeholder="Share your experience related to this role..."
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  What you have done, and where. The letter below is for why
                  this role.
                </p>
              </div>

              {/* The letter, under the name everyone uses for it.
                  The experience box above answers "what have you done"; this
                  answers "why this role", and people write them differently.
                  Naming it matters — applicants did not know they were writing
                  a cover letter and employers did not know they were reading
                  one. */}
              <div>
                <div className="flex items-baseline justify-between gap-3 mb-1.5 md:mb-2">
                  <label
                    htmlFor="app-cover-letter"
                    className="block text-sm font-semibold text-gray-900"
                  >
                    Cover Letter
                  </label>
                  {/* A counter, because "how much should I write?" is the
                      question that stalls people at an empty box. It reports
                      length rather than enforcing it — running past the
                      suggestion is not an error. */}
                  <span
                    className={`text-xs tabular-nums ${
                      formData.coverLetter.length > COVER_LETTER_SUGGESTED
                        ? "text-amber-600"
                        : "text-gray-400"
                    }`}
                  >
                    {formData.coverLetter.length}/{COVER_LETTER_SUGGESTED}
                  </span>
                </div>
                <textarea
                  id="app-cover-letter"
                  value={formData.coverLetter}
                  onChange={(e) => updateField("coverLetter", e.target.value)}
                  rows={6}
                  maxLength={COVER_LETTER_MAX}
                  className="form-input resize-none"
                  placeholder="Why this role, and why you…"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Optional, and the part most employers read first. A short
                  paragraph is plenty.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5 md:mb-2">
                  Select your skills
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  {jobSkillPool(job.skills).length > 0
                    ? "These are the skills the employer listed - pick the ones you have."
                    : "Choose any skills that apply to you."}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {/* The employer's list (or the fallback), plus anything the
                      applicant typed. A pool cannot know every trade — a
                      forklift ticket or thirty years on a switchboard is
                      exactly the experience this board exists to surface,
                      and it was unofferable. Their own skills come first:
                      they are the ones that were worth the typing. */}
                  {[
                    ...formData.selectedSkills.filter(
                      (skill) => !offeredSkills.includes(skill),
                    ),
                    ...offeredSkills,
                  ].map((skill) => {
                    const selected = formData.selectedSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                          selected
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {selected && (
                          <span className="mr-1.5 text-red-400">✓</span>
                        )}
                        {skill}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <label htmlFor="app-add-skill" className="sr-only">
                    Add a skill that is not listed
                  </label>
                  <input
                    id="app-add-skill"
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        // Enter adds the skill; it must not submit the form.
                        e.preventDefault();
                        addCustomSkill();
                      }
                    }}
                    placeholder="Add a skill that isn't listed"
                    className="form-input flex-1 min-w-52 max-w-xs"
                  />
                  <button
                    type="button"
                    onClick={addCustomSkill}
                    disabled={!newSkill.trim()}
                    className="min-h-[44px] px-4 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 transition-colors hover:border-primary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-gray-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* ─── Section 3: Availability & Preferences ─── */}
          <SectionCard
            anchorId="section-availability"
            number={3}
            title="Availability & Preferences"
            subtitle="Let us know when you can start and your schedule preferences."
            complete={sectionComplete[2]}
          >
            <div className="space-y-5">
              <DatePickerField
                label="Earliest Start Date"
                value={formData.earliestStartDate}
                onChange={(val) => updateField("earliestStartDate", val)}
                hint="When would you be available to begin work?"
              />

              <CustomDropdown
                name="preferredSchedule"
                label="Preferred Schedule"
                value={formData.preferredSchedule}
                onChange={(v) => updateField("preferredSchedule", v)}
                options={SCHEDULE_OPTIONS}
                placeholder="Select a schedule"
                hideHeader
              />

              <CustomDropdown
                name="workLocationPreference"
                label="Work Location Preference"
                value={formData.workLocationPreference}
                onChange={(v) => updateField("workLocationPreference", v)}
                options={LOCATION_OPTIONS}
                placeholder="Select a preference"
                hideHeader
              />
            </div>
          </SectionCard>

          {/* ─── Section 4: Upload Your Resume ─── */}
          <SectionCard
            anchorId="section-resume"
            number={4}
            title="Upload Your Resume"
            subtitle="Share your resume so we can learn more about your background."
            complete={sectionComplete[3]}
          >
            {/* Something already on the profile, before asking for a file.
                Most applicants have uploaded a résumé once and should not have
                to find the PDF again — least of all on a phone, and least of
                all on the fourth section of a form they are most likely to
                abandon here. Uploading stays exactly where it was. */}
            {profileResumes.length > 0 && !formData.resume && (
              <fieldset className="mb-4 min-w-0">
                <legend className="block text-sm font-semibold text-gray-900 mb-2">
                  Use a résumé from your profile
                </legend>
                <div className="space-y-2">
                  {profileResumes.map((doc) => {
                    const id = String(doc._id);
                    const chosen = formData.resumeDocumentId === id;
                    return (
                      <label
                        key={id}
                        className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                          chosen
                            ? "border-primary bg-red-50/40"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="profile-resume"
                          value={id}
                          checked={chosen}
                          onChange={() =>
                            setFormData((prev) => ({
                              ...prev,
                              resumeDocumentId: id,
                              resume: null,
                            }))
                          }
                          className="h-4 w-4 accent-[var(--color-primary)] shrink-0"
                        />
                        <HiOutlineDocumentText className="w-5 h-5 text-gray-400 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-gray-900 truncate">
                            {doc.name}
                          </span>
                          {doc.upload_date && (
                            <span className="block text-xs text-gray-500">
                              Added {formatDate(doc.upload_date)}
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {formData.resumeDocumentId && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, resumeDocumentId: "" }))
                    }
                    className="mt-2 text-sm text-gray-600 underline underline-offset-2 hover:text-primary"
                  >
                    Upload a different one instead
                  </button>
                )}
              </fieldset>
            )}

            {/* Outside every branch below. It used to live inside the
                dropzone, which now unmounts once a file is attached — so
                "Choose a different file" would have had nothing to click. */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />

            {formData.resume ? (
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <HiOutlineDocumentText className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm md:text-base font-medium text-gray-900 truncate">
                    {formData.resume.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(formData.resume.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                  aria-label="Remove file"
                >
                  <HiOutlineXMark className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            ) : null}

            {/* "Choose a different file" stays available with one attached.
                Swapping the dropzone out entirely meant replacing a résumé
                required finding the remove button first — two steps for what
                should be one. */}
            {formData.resume && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 inline-flex items-center gap-2 min-h-[44px] text-sm font-medium text-gray-600 underline underline-offset-2 hover:text-primary"
              >
                <HiOutlineArrowUpTray className="w-4 h-4" />
                Choose a different file
              </button>
            )}

            {!formData.resume && !formData.resumeDocumentId && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  isDragging
                    ? "border-primary bg-red-50/50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                  <HiOutlineArrowUpTray className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                </div>
                <p className="text-sm md:text-base font-medium text-gray-700 mb-1">
                  Drag and drop your resume here
                </p>
                <p className="text-xs text-gray-400 mb-3">
                  or click to browse your files
                </p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs md:text-sm font-medium rounded">
                    PDF
                  </span>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs md:text-sm font-medium rounded">
                    DOCX
                  </span>
                  <span className="text-xs md:text-sm text-gray-400">
                    Max 5MB
                  </span>
                </div>
              </div>
            )}
          </SectionCard>

          {/* ─── Screening questions (only when the job has them) ─── */}
          {screeningQuestions.length > 0 && (
            <SectionCard
              anchorId="section-screening"
            number={5}
              title="Screening Questions"
              subtitle="A few quick questions from the employer."
              complete={!requiredScreeningMissing}
              optional={!screeningQuestions.some((q) => q.required)}
            >
              <div className="space-y-6">
                {screeningQuestions.map((q) => (
                  <ScreeningQuestionField
                    key={q.id}
                    question={q}
                    value={formData.screeningAnswers[q.id] ?? []}
                    onChange={(values) => setScreeningAnswer(q.id, values)}
                  />
                ))}
              </div>
            </SectionCard>
          )}

          {/* ─── Section 6: Additional Information ─── */}
          <SectionCard
            anchorId="section-extra"
            number={6}
            title="Additional Information"
            subtitle="Optional: Share anything else you'd like us to know."
            complete={false}
            optional
          >
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5 md:mb-2">
                Is there anything else you&apos;d like to share with us?
              </label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => updateField("additionalInfo", e.target.value)}
                rows={4}
                className="form-input resize-none"
                placeholder="Type your response here..."
              />
              <p className="text-xs text-gray-400 flex items-start gap-2 mt-2">
                <InfoCircle className="shrink-0 mt-0.5" />
                <span>
                  This could include availability constraints, accommodation
                  needs, or additional qualifications.
                </span>
              </p>
            </div>
          </SectionCard>
          </>
        )}

        {/* Review notice */}
        {/* Only while editing. On the review screen it would be telling
            somebody to do the thing they are already doing. */}
        {!reviewing && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
          <HiOutlineExclamationCircle className="w-5 h-5 md:w-6 md:h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm md:text-base font-bold text-gray-900">
              Please Review Your Information
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Before submitting, take a moment to review your responses. Once
              submitted, you may not be able to make changes.
            </p>
          </div>
        </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Review, then send. Submitting straight from the bottom of six
              sections meant the top was several screens away and checking
              was on you. */}
          {!reviewing ? (
            <button
              type="button"
              onClick={() => {
                setReviewing(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={isSubmitting || requiredScreeningMissing}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed tablet:w-full"
            >
              <HiOutlineCheckCircle className="w-5 h-5 md:w-6 md:h-6" />
              Review &amp; Submit
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || requiredScreeningMissing}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed tablet:w-full"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <HiOutlinePaperAirplane className="w-5 h-5 md:w-6 md:h-6 -rotate-45" />
                  Submit Application
                </>
              )}
            </button>
          )}

          {reviewing && (
            <button
              type="button"
              onClick={() => setReviewing(false)}
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-60 tablet:w-full"
            >
              Back to editing
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-60 tablet:w-full"
          >
            <HiOutlineBookmark className="w-5 h-5 md:w-6 md:h-6" />
            Save and Finish Later
          </button>
        </div>
          </div>

          <aside className="mt-6 lg:mt-0 lg:w-80 lg:shrink-0 lg:sticky lg:top-24 space-y-6">
            {/* Job summary card */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <div className="flex items-start gap-3 md:gap-4 mb-3">
                <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <HiOutlineBriefcase className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold text-gray-900">
                    {job.role}
                  </h3>
                  <p className="text-sm md:text-base text-gray-500">
                    {job.company_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-1.5 text-xs text-gray-400">
                    {job.location && (
                      <span className="inline-flex items-center gap-2">
                        <HiOutlineMapPin className="w-4 h-4 md:w-5 md:h-5" />
                        {job.location}
                      </span>
                    )}
                    {derivedJobType && (
                      <span className="inline-flex items-center gap-2">
                        <HiOutlineClock className="w-4 h-4 md:w-5 md:h-5" />
                        {derivedJobType}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-2">
                <HiOutlineCheckCircle className="w-4 h-4 md:w-5 md:h-5" />
                You&apos;re applying for this role.
              </p>
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-sm font-semibold text-gray-900">
                  Application Progress
                </span>
                <span className="text-xs text-gray-400">
                  {completedCount} of {sectionComplete.length} sections completed
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{
                    width: `${(completedCount / sectionComplete.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function SectionCard({
  anchorId,
  number,
  title,
  subtitle,
  complete,
  children,
}: {
  anchorId?: string;
  number: number;
  title: string;
  subtitle: string;
  complete: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      id={anchorId}
      // scroll-mt so an Edit jump does not tuck the heading under the
      // sticky header it lands beneath.
      className="bg-white rounded-xl border border-gray-200 p-6 mb-6 scroll-mt-24"
    >
      <div className="flex items-start gap-3 mb-5">
        {/* A soft tinted square, matching the job card, rather than a solid
            brand-red disc. At 3xl the section heading was larger than the
            page's own h1, and a filled red circle competed with the primary
            button — two things shouting on a form whose job is to be calm. */}
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
            complete
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-primary"
          }`}
          aria-hidden="true"
        >
          {complete ? "✓" : number}
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

/**
 * A labelled field.
 *
 * `htmlFor` is the point. This rendered a `<label>` with no association that
 * did not wrap its input either, so every field on the application form was
 * an unnamed control — a screen reader announced "edit text, blank" for the
 * applicant's name, email and phone. The id is required now rather than
 * optional, so a new field cannot repeat it.
 *
 * `help` and `valid` come from the reference designs: a line of plain
 * English under each field, and a tick when it is filled in properly. We only
 * ever told people what they had got wrong. Confirmation matters more the
 * less confident the person, and that is most of this audience.
 */
function FormField({
  id,
  label,
  required,
  help,
  preFilled,
  valid,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  preFilled?: boolean;
  valid?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-1.5 md:mb-2">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-gray-900"
        >
          {label}
          {required && <RequiredMark />}
        </label>
        {preFilled && (
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 shrink-0">
            <HiOutlineCheckCircle className="w-4 h-4" />
            From your profile
          </span>
        )}
      </div>
      <div className="relative">
        {children}
        {valid && (
          <HiOutlineCheckCircle
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500"
            aria-hidden="true"
          />
        )}
      </div>
      {help && <p className="mt-1.5 text-xs text-gray-500">{help}</p>}
    </div>
  );
}

function DatePickerField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  hint: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = value ? parse(value, "yyyy-MM-dd", new Date()) : undefined;

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-semibold text-gray-900 mb-1.5 md:mb-2">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="form-input w-full text-left flex items-center justify-between cursor-pointer"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value
            ? format(parse(value, "yyyy-MM-dd", new Date()), "MMM d, yyyy")
            : "Select a date..."}
        </span>
        <HiOutlineCalendarDays className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 animate-fadeIn">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(day) => {
              if (day) {
                onChange(format(day, "yyyy-MM-dd"));
              }
              setOpen(false);
            }}
            disabled={{ before: new Date() }}
            defaultMonth={selected || new Date()}
          />
        </div>
      )}
      <p className="text-xs text-gray-400 flex items-center gap-2 mt-2">
        <InfoCircle />
        {hint}
      </p>
    </div>
  );
}

function InfoCircle({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`w-3.5 h-3.5 text-gray-400 ${className}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}
