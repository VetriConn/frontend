"use client";

import { useEffect, useState } from "react";
import { ImageUploadDialog } from "@/components/ui/ImageUploadDialog";
import {
  MAX_COMPANY_BANNER_BYTES,
  MAX_COMPANY_LOGO_BYTES,
} from "@/lib/upload-limits";
import { COMPANY_INDUSTRY_OPTIONS } from "@/lib/company-fields";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
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
  state_province: company.state_province || "",
  country: company.country || "",
  phone_number: company.phone_number || "",
  email: company.email || "",
  website: company.website || "",
  size: company.size || "",
  about_company: company.about_company || "",
  tagline: company.tagline || "",
  rc_number: company.rc_number || "",
  registration_authority: company.registration_authority || "",
});


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
  const [assetDialog, setAssetDialog] = useState<"logo" | "banner" | null>(
    null,
  );


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
      form.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      next.email = "Enter a valid email address";
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

  /**
   * Both assets now go through the same dialog the user avatar uses, which is
   * the point of the change: these two buttons sat beside each other offering
   * a bare file picker while a person's own photo got a full editor.
   *
   * The dialog owns the busy state, the inline error and closing itself, so
   * these are the network call and the toast. They must throw on failure,
   * because that is how the dialog knows to stay open and say why.
   *
   * The size ceilings come from lib/upload-limits, which mirrors the server.
   * The flat 5MB this replaces was wrong in both directions: it refused
   * banners the server would have taken, and accepted logos it would not.
   */
  const handleAssetSubmit = async (asset: "logo" | "banner", file: File) => {
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
            <button
              type="button"
              onClick={() => setAssetDialog("logo")}
              className="inline-flex items-center gap-2 min-h-[44px] py-2 px-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg transition-colors"
            >
              <HiOutlinePhoto className="w-4 h-4" aria-hidden="true" />
              Change logo
            </button>

            <button
              type="button"
              onClick={() => setAssetDialog("banner")}
              className="inline-flex items-center gap-2 min-h-[44px] py-2 px-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-lg transition-colors"
            >
              <HiOutlinePhoto className="w-4 h-4" aria-hidden="true" />
              Change banner
            </button>
          </div>
        )}

        {/* Siblings of the form, never nested inside another dialog. Both are
            the same component the profile photo uses; only the output shape,
            the ceiling and the words differ. */}
        <ImageUploadDialog
          isOpen={assetDialog === "logo"}
          onClose={() => setAssetDialog(null)}
          title="Company logo"
          headline={`Add a logo for ${company.name}`}
          description="Square works best. This shows on your company profile and on every job you post."
          output={{ width: 1200, height: 1200 }}
          mask="rect"
          maxBytes={MAX_COMPANY_LOGO_BYTES}
          currentImageUrl={company.logo_url || undefined}
          placeholder={
            <HiOutlineBuildingOffice2
              className="w-16 h-16 text-gray-400"
              aria-hidden="true"
            />
          }
          onSubmit={(file) => handleAssetSubmit("logo", file)}
        />

        <ImageUploadDialog
          isOpen={assetDialog === "banner"}
          onClose={() => setAssetDialog(null)}
          title="Company banner"
          headline={`Add a banner for ${company.name}`}
          description="A wide image across the top of your profile. Keep the important part in the middle, because the sides are cropped on a phone."
          output={{ width: 1600, height: 300 }}
          mask="rect"
          maxBytes={MAX_COMPANY_BANNER_BYTES}
          currentImageUrl={company.banner_url || undefined}
          placeholder={
            <HiOutlinePhoto className="w-10 h-10 text-gray-400" aria-hidden="true" />
          }
          onSubmit={(file) => handleAssetSubmit("banner", file)}
        />

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
            {/* Same vocabulary as the application form — this was a free-
                text field that could overwrite the stored slug with prose. */}
            <CustomDropdown
              label="Industry"
              name="company_industry"
              placeholder="Select industry"
              value={form.industry}
              onChange={(value) => setField("industry", value)}
              options={COMPANY_INDUSTRY_OPTIONS}
            />
            <FormField
              label="Company size"
              name="size"
              value={form.size}
              onChange={(value) => setField("size", value)}
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
              name="email"
              type="email"
              value={form.email}
              onChange={(value) => setField("email", value)}
              error={errors.email}
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
              className="block w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base outline-none transition-colors focus:ring-2 focus:ring-primary focus:border-transparent bg-white disabled:bg-gray-100"
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
