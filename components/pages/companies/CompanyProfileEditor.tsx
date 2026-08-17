"use client";

import { useEffect, useRef, useState } from "react";
import {
  HiOutlineBuildingOffice2,
  HiOutlinePhoto,
} from "react-icons/hi2";
import {
  updateCompany,
  uploadCompanyLogo,
  uploadCompanyBanner,
  type Company,
  type CompanyProfileInput,
  type CompanyRole,
} from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";
import { FormField } from "@/components/ui/FormField";

/**
 * Company profile editor. Owners and admins only — read-only for recruiters,
 * matching the server's `requireCompanyRole("owner", "admin")`.
 */

interface CompanyProfileEditorProps {
  company: Company;
  myRole: CompanyRole | null;
  onChanged: () => void;
}

type FormState = Required<CompanyProfileInput>;

const toFormState = (company: Company): FormState => ({
  name: company.name || "",
  industry: company.industry || "",
  city: company.city || "",
  country: company.country || "",
  phone_number: company.phone_number || "",
  company_email: company.company_email || "",
  website: company.website || "",
  company_size: company.company_size || "",
  about_company: company.about_company || "",
});

const MAX_ASSET_BYTES = 5 * 1024 * 1024;

export const CompanyProfileEditor = ({
  company,
  myRole,
  onChanged,
}: CompanyProfileEditorProps) => {
  const { showToast } = useToaster();
  const canEdit = myRole === "owner" || myRole === "admin";

  const [form, setForm] = useState<FormState>(() => toFormState(company));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState<"logo" | "banner" | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Re-seed when the company reloads after a save or an upload.
  useEffect(() => {
    setForm(toFormState(company));
  }, [company]);

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
    if (
      form.company_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.company_email)
    ) {
      next.company_email = "Enter a valid email address";
    }
    if (form.website && !/^https?:\/\/.+\..+/.test(form.website)) {
      next.website = "Enter a full URL, including https://";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      await updateCompany(company._id, form);
      showToast({
        type: "success",
        title: "Company updated",
        description: "Your changes are live.",
      });
      onChanged();
    } catch (err) {
      showToast({
        type: "error",
        title: "Couldn't save changes",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssetChange = async (
    asset: "logo" | "banner",
    file: File | undefined,
  ) => {
    if (!file) return;

    if (file.size > MAX_ASSET_BYTES) {
      showToast({
        type: "error",
        title: "Image is too large",
        description: "Please choose a file under 5MB.",
      });
      return;
    }

    setUploading(asset);
    try {
      if (asset === "logo") {
        await uploadCompanyLogo(company._id, file);
      } else {
        await uploadCompanyBanner(company._id, file);
      }
      showToast({
        type: "success",
        title: asset === "logo" ? "Logo updated" : "Banner updated",
        description: "Your new image is live.",
      });
      onChanged();
    } catch (err) {
      showToast({
        type: "error",
        title: "Upload failed",
        description:
          err instanceof Error ? err.message : "Please try again in a moment.",
      });
    } finally {
      setUploading(null);
      if (asset === "logo" && logoInputRef.current) {
        logoInputRef.current.value = "";
      }
      if (asset === "banner" && bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Company profile
      </h2>
      <p className="text-sm text-gray-500 mb-5">
        {canEdit
          ? "This is what job seekers see on your listings."
          : "Only owners and admins can edit these details."}
      </p>

      {/* Branding */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
          {company.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo_url}
              alt={`${company.name} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <HiOutlineBuildingOffice2 className="w-7 h-7 text-gray-400" />
          )}
        </div>

        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAssetChange("logo", e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploading !== null}
              className="inline-flex items-center gap-2 py-2 px-3.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-700 font-medium text-sm rounded-lg transition-colors"
            >
              <HiOutlinePhoto className="w-4 h-4" />
              {uploading === "logo" ? "Uploading…" : "Change logo"}
            </button>

            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleAssetChange("banner", e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploading !== null}
              className="inline-flex items-center gap-2 py-2 px-3.5 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-700 font-medium text-sm rounded-lg transition-colors"
            >
              <HiOutlinePhoto className="w-4 h-4" />
              {uploading === "banner" ? "Uploading…" : "Change banner"}
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} noValidate>
        <fieldset disabled={!canEdit} className="border-0 p-0 m-0">
          <FormField
            label="Company name"
            name="company_name"
            value={form.name}
            onChange={(value) => setField("name", value)}
            error={errors.name}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <FormField
              label="Industry"
              name="company_industry"
              value={form.industry}
              onChange={(value) => setField("industry", value)}
              optional
            />
            <FormField
              label="Company size"
              name="company_size"
              value={form.company_size}
              onChange={(value) => setField("company_size", value)}
              optional
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <FormField
              label="City"
              name="company_city"
              value={form.city}
              onChange={(value) => setField("city", value)}
              optional
            />
            <FormField
              label="Country"
              name="company_country"
              value={form.country}
              onChange={(value) => setField("country", value)}
              optional
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <FormField
              label="Company email"
              name="company_email"
              type="email"
              value={form.company_email}
              onChange={(value) => setField("company_email", value)}
              error={errors.company_email}
              optional
            />
            <FormField
              label="Phone number"
              name="company_phone"
              type="tel"
              value={form.phone_number}
              onChange={(value) => setField("phone_number", value)}
              optional
            />
          </div>

          <FormField
            label="Website"
            name="company_website"
            value={form.website}
            onChange={(value) => setField("website", value)}
            error={errors.website}
            placeholder="https://acme.com"
            optional
          />

          <div className="flex flex-col gap-1 mb-4">
            <label
              htmlFor="company_about"
              className="block text-sm text-text-muted mb-1.5 md:mb-2 font-medium"
            >
              About the company
              <span className="text-gray-400 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              id="company_about"
              rows={5}
              value={form.about_company}
              onChange={(e) => setField("about_company", e.target.value)}
              className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-10 text-sm md:text-base outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-transparent bg-white disabled:bg-gray-100"
            />
          </div>

          {canEdit && (
            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-5 bg-primary hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-colors"
            >
              {isSaving ? "Saving…" : "Save changes"}
            </button>
          )}
        </fieldset>
      </form>
    </section>
  );
};

export default CompanyProfileEditor;
