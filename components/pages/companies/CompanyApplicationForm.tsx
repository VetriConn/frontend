"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { applyForCompany, type ApplyForCompanyInput } from "@/lib/api";
import { useMyCompanies } from "@/hooks/useCompanies";
import { useToaster } from "@/components/ui/Toaster";
import { FormField } from "@/components/ui/FormField";
import { CustomDropdown } from "@/components/ui/CustomDropdown";

/**
 * Apply for a Company Page.
 *
 * Only `name` is required; everything else can be filled in later from the
 * company's profile editor. The application lands as `pending` and an admin
 * reviews it, so this deliberately sets that expectation before submitting.
 */

const INDUSTRY_OPTIONS = [
  { value: "technology", label: "Technology & Consulting" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance & Banking" },
  { value: "education", label: "Education" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail & E-Commerce" },
  { value: "construction", label: "Construction" },
  { value: "hospitality", label: "Hospitality & Tourism" },
  { value: "media", label: "Media & Entertainment" },
  { value: "transportation", label: "Transportation & Logistics" },
  { value: "energy", label: "Energy & Utilities" },
  { value: "agriculture", label: "Agriculture" },
  { value: "legal", label: "Legal Services" },
  { value: "nonprofit", label: "Nonprofit & NGO" },
  { value: "government", label: "Government" },
  { value: "other", label: "Other" },
];

const COMPANY_SIZE_OPTIONS = [
  { value: "1-10", label: "1–10 employees" },
  { value: "11-50", label: "11–50 employees" },
  { value: "50-200", label: "50–200 employees" },
  { value: "201-500", label: "201–500 employees" },
  { value: "501-1000", label: "501–1,000 employees" },
  { value: "1001-5000", label: "1,001–5,000 employees" },
  { value: "5001+", label: "5,001+ employees" },
];

type FormState = Required<Omit<ApplyForCompanyInput, "name">> & { name: string };

const EMPTY: FormState = {
  name: "",
  industry: "",
  city: "",
  country: "",
  phone_number: "",
  email: "",
  website: "",
  size: "",
  about_company: "",
};

export const CompanyApplicationForm = () => {
  const router = useRouter();
  const { showToast } = useToaster();
  const { mutate } = useMyCompanies();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!form.name.trim()) next.name = "Company name is required";

    // Mirror the server's rules so a round-trip isn't needed to learn these.
    if (
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      next.email = "Enter a valid email address";
    }
    if (form.website && !/^https?:\/\/.+\..+/.test(form.website)) {
      next.website = "Enter a full URL, including https://";
    }
    if (form.about_company.length > 2000) {
      next.about_company = "Keep this under 2,000 characters";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Send only what was filled in — the server treats blanks as absent.
      const optional = Object.fromEntries(
        Object.entries(form).filter(
          ([key, value]) => key !== "name" && value.trim() !== "",
        ),
      );
      const payload: ApplyForCompanyInput = {
        ...optional,
        name: form.name.trim(),
      };

      await applyForCompany(payload);
      await mutate();

      showToast({
        type: "success",
        title: "Application submitted",
        description: "We'll review your company and let you know by email.",
      });
      router.push("/dashboard/companies");
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "We couldn't submit your application. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
      <Link
        href="/dashboard/companies"
        className="text-sm text-gray-500 hover:text-gray-700 no-underline mb-6 inline-block"
      >
        ← Back to companies
      </Link>

      <div className="flex items-start gap-3 mb-2">
        <HiOutlineBuildingOffice2 className="w-7 h-7 text-primary shrink-0 mt-0.5" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Apply for a Company Page
        </h1>
      </div>
      <p className="text-sm text-gray-500 mb-8">
        A Company Page lets you hire as an organisation rather than as an
        individual — invite teammates to review applicants, and keep job
        postings with the company if someone leaves. An admin reviews every
        application before the page goes live.
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 p-6 md:p-8"
        noValidate
      >
        <FormField
          label="Company name"
          name="name"
          value={form.name}
          onChange={(value) => setField("name", value)}
          error={errors.name}
          placeholder="Acme Logistics Ltd."
          required
        />

        <CustomDropdown
          label="Industry"
          name="industry"
          placeholder="Select an industry"
          value={form.industry}
          onChange={(value) => setField("industry", value)}
          options={INDUSTRY_OPTIONS}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <FormField
            label="City"
            name="city"
            value={form.city}
            onChange={(value) => setField("city", value)}
            placeholder="Ottawa"
            optional
          />
          <FormField
            label="Country"
            name="country"
            value={form.country}
            onChange={(value) => setField("country", value)}
            placeholder="Canada"
            optional
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
          <FormField
            label="Company email"
            name="email"
            type="email"
            value={form.email}
            onChange={(value) => setField("email", value)}
            error={errors.email}
            placeholder="careers@acme.com"
            optional
          />
          <FormField
            label="Phone number"
            name="phone_number"
            type="tel"
            value={form.phone_number}
            onChange={(value) => setField("phone_number", value)}
            placeholder="+1 613 555 0178"
            optional
          />
        </div>

        <FormField
          label="Website"
          name="website"
          value={form.website}
          onChange={(value) => setField("website", value)}
          error={errors.website}
          placeholder="https://acme.com"
          optional
        />

        <CustomDropdown
          label="Company size"
          name="size"
          placeholder="Select a size"
          value={form.size}
          onChange={(value) => setField("size", value)}
          options={COMPANY_SIZE_OPTIONS}
        />

        <div className="flex flex-col gap-1 mb-4">
          <label
            htmlFor="about_company"
            className="block text-sm text-text-muted mb-1.5 md:mb-2 font-medium"
          >
            About the company
            <span className="text-gray-400 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            id="about_company"
            name="about_company"
            rows={5}
            value={form.about_company}
            onChange={(event) => setField("about_company", event.target.value)}
            placeholder="What does your company do, and who do you usually hire?"
            className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
            aria-describedby="about_company-count"
          />
          <p id="about_company-count" className="text-xs text-gray-500 mt-1">
            {form.about_company.length.toLocaleString()} / 2,000 characters
          </p>
          {errors.about_company && (
            <p className="text-xs text-red-500 mt-1" role="alert">
              {errors.about_company}
            </p>
          )}
        </div>

        {submitError && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
          >
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors"
        >
          {isSubmitting ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </div>
  );
};

export default CompanyApplicationForm;
