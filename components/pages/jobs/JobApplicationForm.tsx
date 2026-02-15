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
  HiOutlineArrowLeft,
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

// Mapped profile shape from useUserProfile hook
interface MappedUserProfile {
  name: string;
  email: string;
  phone_number: string;
  [key: string]: unknown;
}

interface JobApplicationFormProps {
  job: Job;
  userProfile?: MappedUserProfile | null;
}

// Skills pool — in a real app, these would come from the job posting or backend
const AVAILABLE_SKILLS = [
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

const ACCEPTED_FILE_TYPES = [".pdf", ".doc", ".docx"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  relevantExperience: string;
  selectedSkills: string[];
  earliestStartDate: string;
  preferredSchedule: string;
  workLocationPreference: string;
  resume: File | null;
  additionalInfo: string;
}

export default function JobApplicationForm({
  job,
  userProfile,
}: JobApplicationFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: userProfile?.name || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone_number || "",
    relevantExperience: "",
    selectedSkills: [],
    earliestStartDate: "",
    preferredSchedule: "",
    workLocationPreference: "",
    resume: null,
    additionalInfo: "",
  });

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`vetriconn-draft-${job.id}`);
      if (saved) {
        const draft = JSON.parse(saved);
        setFormData((prev) => ({
          ...prev,
          relevantExperience:
            draft.relevantExperience || prev.relevantExperience,
          selectedSkills: draft.selectedSkills || prev.selectedSkills,
          earliestStartDate: draft.earliestStartDate || prev.earliestStartDate,
          preferredSchedule: draft.preferredSchedule || prev.preferredSchedule,
          workLocationPreference:
            draft.workLocationPreference || prev.workLocationPreference,
          additionalInfo: draft.additionalInfo || prev.additionalInfo,
        }));
      }
    } catch {
      // Ignore corrupted drafts
    }
  }, [job.id]);

  // Track which fields were pre-filled
  const preFilled = useMemo(
    () => ({
      fullName: !!userProfile?.name,
      email: !!userProfile?.email,
      phone: !!userProfile?.phone_number,
    }),
    [userProfile],
  );

  // Section completion checks
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
    const s4 = formData.resume !== null;
    return [s1, s2, s3, s4];
  }, [formData]);

  const completedCount = sectionComplete.filter(Boolean).length;

  // Derive a job-type label from tags
  const jobTypeTags = [
    "Full-Time",
    "Part-Time",
    "Contract",
    "Freelance",
    "Internship",
  ];
  const derivedJobType =
    job.tags.find((t) =>
      jobTypeTags.some((jt) => jt.toLowerCase() === t.name.toLowerCase()),
    )?.name || "Part-time";

  // ── Handlers ──────────────────────────────────────────────

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    setFormData((prev) => ({ ...prev, resume: file }));
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
      if (formData.resume) {
        apiFormData.append("resume", formData.resume);
      }
      await submitJobApplication(job.id, apiFormData);
      // Clear draft on successful submission
      localStorage.removeItem(`vetriconn-draft-${job.id}`);
      setIsSubmitting(false);
      setSubmitted(true);
    } catch {
      setIsSubmitting(false);
      // Could show error toast here
    }
  };

  const handleSaveDraft = () => {
    const draft = {
      ...formData,
      resume: null, // Files can't be stored in localStorage
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(`vetriconn-draft-${job.id}`, JSON.stringify(draft));
    alert("Application draft saved! You can finish it later.");
  };

  // ── Success screen ────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 mobile:p-4">
        <div className="w-full max-w-lg">
          {/* Success Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-10 mobile:p-6 text-center mb-4">
            <div className="w-14 h-14 mobile:w-12 mobile:h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <HiOutlineCheckCircle className="text-3xl mobile:text-2xl text-emerald-500" />
            </div>
            <h2 className="text-2xl mobile:text-lg font-bold text-gray-900 mb-2">
              Application Submitted Successfully
            </h2>
            <p className="text-sm mobile:text-xs text-gray-500 mb-1">
              Your application for
            </p>
            <p className="text-base mobile:text-sm font-bold text-gray-900 mb-0.5">
              {job.role}
            </p>
            <p className="text-sm mobile:text-xs text-gray-500 mb-5">
              at {job.company_name}
            </p>
            <p className="text-sm mobile:text-xs text-gray-500 leading-relaxed mb-7 max-w-[380px] mx-auto">
              We&apos;ve sent it to the employer. They will review it and
              contact you if you&apos;re a good match. This usually takes 3–5
              business days.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/dashboard/jobs"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 mobile:px-4 mobile:py-2 bg-primary hover:bg-primary-hover text-white font-semibold text-sm mobile:text-xs rounded-lg transition-colors no-underline"
              >
                Browse More Jobs
              </Link>
              <Link
                href="/dashboard/applied-jobs"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 mobile:px-4 mobile:py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-sm mobile:text-xs rounded-lg hover:bg-gray-50 transition-colors no-underline"
              >
                <HiOutlineBriefcase className="text-sm mobile:text-xs" />
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
      <div className="max-w-2xl mx-auto px-6 py-8 tablet:px-4 tablet:py-6">
        {/* Page header */}
        <h1 className="text-2xl font-bold text-gray-900 mb-1.5">
          Submit Your Application
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Take your time filling out each section. We&apos;ve pre-filled some
          information from your profile to save you time.
        </p>

        {/* Progress bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-sm font-semibold text-gray-900">
              Application Progress
            </span>
            <span className="text-xs text-gray-400">
              {completedCount} of 4 sections completed
            </span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Job summary card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-start gap-3.5 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <HiOutlineBriefcase className="text-lg text-red-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{job.role}</h3>
              <p className="text-sm text-gray-500">{job.company_name}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <HiOutlineMapPin className="text-sm" />
                    {job.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <HiOutlineClock className="text-sm" />
                  {derivedJobType}
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
            <HiOutlineCheckCircle className="text-sm" />
            You&apos;re applying for this role.
          </p>
        </div>

        {/* ─── Section 1: Personal Information ─── */}
        <SectionCard
          number={1}
          title="Personal Information"
          subtitle="Please verify your contact details are correct."
          complete={sectionComplete[0]}
        >
          <div className="space-y-5">
            <FormField label="Full Name" preFilled={preFilled.fullName}>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => updateField("fullName", e.target.value)}
                className="form-input"
                placeholder="Your full name"
              />
            </FormField>

            <FormField label="Email Address" preFilled={preFilled.email}>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="form-input"
                placeholder="your@email.com"
              />
            </FormField>

            <FormField label="Phone Number" preFilled={preFilled.phone}>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="form-input"
                placeholder="(555) 234-5678"
              />
            </FormField>

            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <InfoCircle />
              We&apos;ll only use this to contact you about your application.
            </p>
          </div>
        </SectionCard>

        {/* ─── Section 2: Work Experience & Skills ─── */}
        <SectionCard
          number={2}
          title="Work Experience & Skills"
          subtitle="Tell us about your relevant experience and skills."
          complete={sectionComplete[1]}
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Describe Your Relevant Experience
              </label>
              <textarea
                value={formData.relevantExperience}
                onChange={(e) =>
                  updateField("relevantExperience", e.target.value)
                }
                rows={5}
                className="form-input resize-none"
                placeholder="Share your experience related to this role..."
              />
              <p className="text-xs text-gray-400 flex items-start gap-1.5 mt-2">
                <InfoCircle className="shrink-0 mt-0.5" />
                <span>
                  For example: &quot;I have 10 years of customer service
                  experience in healthcare settings, helping patients and
                  families navigate their care options.&quot;
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Select Your Skills
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Choose any skills that apply to you. This helps us understand
                your strengths.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {AVAILABLE_SKILLS.map((skill) => {
                  const selected = formData.selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
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
            </div>
          </div>
        </SectionCard>

        {/* ─── Section 3: Availability & Preferences ─── */}
        <SectionCard
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

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Preferred Schedule
              </label>
              <select
                value={formData.preferredSchedule}
                onChange={(e) =>
                  updateField("preferredSchedule", e.target.value)
                }
                className="form-input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M7%207l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-size-[20px] bg-position-[right_12px_center] bg-no-repeat pr-10"
              >
                {SCHEDULE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Work Location Preference
              </label>
              <select
                value={formData.workLocationPreference}
                onChange={(e) =>
                  updateField("workLocationPreference", e.target.value)
                }
                className="form-input appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M7%207l3%203%203-3%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%221.5%22%20fill%3D%22none%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-size-[20px] bg-position-[right_12px_center] bg-no-repeat pr-10"
              >
                {LOCATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>

        {/* ─── Section 4: Upload Your Resume ─── */}
        <SectionCard
          number={4}
          title="Upload Your Resume"
          subtitle="Share your resume so we can learn more about your background."
          complete={sectionComplete[3]}
        >
          {formData.resume ? (
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <HiOutlineDocumentText className="text-lg text-red-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {formData.resume.name}
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(formData.resume.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                aria-label="Remove file"
              >
                <HiOutlineXMark className="text-lg" />
              </button>
            </div>
          ) : (
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
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                <HiOutlineArrowUpTray className="text-xl text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Drag and drop your resume here
              </p>
              <p className="text-xs text-gray-400 mb-3">
                or click to browse your files
              </p>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded">
                  PDF
                </span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] font-medium rounded">
                  DOCX
                </span>
                <span className="text-[11px] text-gray-400">Max 5MB</span>
              </div>
            </div>
          )}
        </SectionCard>

        {/* ─── Section 5: Additional Information ─── */}
        <SectionCard
          number={5}
          title="Additional Information"
          subtitle="Optional: Share anything else you'd like us to know."
          complete={false}
          optional
        >
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Is there anything else you&apos;d like to share with us?
            </label>
            <textarea
              value={formData.additionalInfo}
              onChange={(e) => updateField("additionalInfo", e.target.value)}
              rows={4}
              className="form-input resize-none"
              placeholder="Type your response here..."
            />
            <p className="text-xs text-gray-400 flex items-start gap-1.5 mt-2">
              <InfoCircle className="shrink-0 mt-0.5" />
              <span>
                This could include availability constraints, accommodation
                needs, or additional qualifications.
              </span>
            </p>
          </div>
        </SectionCard>

        {/* Review notice */}
        <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
          <HiOutlineExclamationCircle className="text-lg text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-gray-900">
              Please Review Your Information
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Before submitting, take a moment to review your responses. Once
              submitted, you may not be able to make changes.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 tablet:flex-col">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed tablet:w-full"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <HiOutlinePaperAirplane className="text-base -rotate-45" />
                Submit Application
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-60 tablet:w-full"
          >
            <HiOutlineBookmark className="text-base" />
            Save and Finish Later
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function SectionCard({
  number,
  title,
  subtitle,
  complete,
  optional,
  children,
}: {
  number: number;
  title: string;
  subtitle: string;
  complete: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-start gap-3 mb-5">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
            complete ? "bg-emerald-500 text-white" : "bg-primary text-white"
          }`}
        >
          {complete ? "✓" : number}
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function FormField({
  label,
  preFilled,
  children,
}: {
  label: string;
  preFilled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-900">{label}</label>
        {preFilled && (
          <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
            <HiOutlineCheckCircle className="text-sm" />
            Pre-filled from your profile
          </span>
        )}
      </div>
      {children}
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
      <label className="block text-sm font-semibold text-gray-900 mb-2">
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
        <HiOutlineCalendarDays className="text-gray-400 text-base" />
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
      <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-2">
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
