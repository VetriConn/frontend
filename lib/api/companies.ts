/**
 * Company Pages API.
 *
 * A Company is a vetted entity separate from any one person's account: an
 * owner applies, an admin approves, and the owner invites teammates as admins
 * or recruiters. Jobs posted under a company belong to the company, not to the
 * individual who posted them.
 */

import {
  API_BASE_URL,
  apiFetch,
  type ApiEnvelope,
  type PaginatedApiEnvelope,
} from "./client";
import type { PostedJobSummary } from "@/types/api";

export type CompanyRole = "owner" | "admin" | "recruiter";
export type CompanyMemberStatus = "invited" | "active";
export type CompanyStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

export interface CompanyMember {
  user_id?: string;
  invited_email?: string;
  role: CompanyRole;
  status: CompanyMemberStatus;
  invited_at?: string;
  joined_at?: string;
}

export interface Company {
  _id: string;
  name: string;
  industry?: string;
  city?: string;
  country?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  size?: string;
  about_company?: string;
  logo_url?: string;
  banner_url?: string;

  owner_id: string;
  members: CompanyMember[];

  status: CompanyStatus;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;

  createdAt?: string;
  updatedAt?: string;
}

/** Fields accepted when applying for, or editing, a company. */
export interface CompanyProfileInput {
  name?: string;
  industry?: string;
  city?: string;
  country?: string;
  phone_number?: string;
  email?: string;
  website?: string;
  size?: string;
  about_company?: string;
}

export interface ApplyForCompanyInput extends CompanyProfileInput {
  name: string;
}

const COMPANIES_URL = `${API_BASE_URL}/api/v1/companies`;

const jsonRequest = (method: string, body?: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});

// ── Membership and application ──────────────────────────────────────────────

/** Apply for a Company Page. Creates it as `pending` with you as owner. */
export async function applyForCompany(
  input: ApplyForCompanyInput,
): Promise<Company> {
  const response = await apiFetch<ApiEnvelope<Company>>(
    `${COMPANIES_URL}/apply`,
    jsonRequest("POST", input),
  );
  return response.data;
}

/** Companies where you are an active member, with your role on each. */
export async function getMyCompanies(): Promise<Company[]> {
  const response = await apiFetch<ApiEnvelope<Company[]>>(
    `${COMPANIES_URL}/me`,
    { method: "GET" },
  );
  return response.data || [];
}

export async function getCompanyById(companyId: string): Promise<Company> {
  const response = await apiFetch<ApiEnvelope<Company>>(
    `${COMPANIES_URL}/${companyId}`,
    { method: "GET" },
  );
  return response.data;
}

export async function updateCompany(
  companyId: string,
  input: CompanyProfileInput,
): Promise<Company> {
  const response = await apiFetch<ApiEnvelope<Company>>(
    `${COMPANIES_URL}/${companyId}`,
    jsonRequest("PATCH", input),
  );
  return response.data;
}

// ── Branding ────────────────────────────────────────────────────────────────

/**
 * Upload a company logo or banner. Multipart under the field name `asset`;
 * Content-Type is left to the browser so the boundary is set correctly.
 *
 * The server validates the file in memory — magic bytes and a malware scan —
 * before anything reaches Cloudinary, so a rejected upload is never hosted.
 */
async function uploadCompanyAsset(
  companyId: string,
  asset: "logo" | "banner",
  file: File,
): Promise<string> {
  const formData = new FormData();
  formData.append("asset", file);

  const response = await apiFetch<
    ApiEnvelope<{ asset_url: string; asset_type: "logo" | "banner" }>
  >(`${COMPANIES_URL}/${companyId}/assets/${asset}`, {
    method: "POST",
    body: formData,
  });

  const url = response.data?.asset_url;
  if (!url) throw new Error(`Upload succeeded but no ${asset} URL was returned`);
  return url;
}

export const uploadCompanyLogo = (companyId: string, file: File) =>
  uploadCompanyAsset(companyId, "logo", file);

export const uploadCompanyBanner = (companyId: string, file: File) =>
  uploadCompanyAsset(companyId, "banner", file);

// ── Team ────────────────────────────────────────────────────────────────────

/** Invite a teammate by email. Sends a token that expires in seven days. */
export async function inviteMember(
  companyId: string,
  email: string,
  role: Exclude<CompanyRole, "owner">,
): Promise<{ email: string; role: CompanyRole }> {
  const response = await apiFetch<
    ApiEnvelope<{ email: string; role: CompanyRole }>
  >(`${COMPANIES_URL}/${companyId}/invite`, jsonRequest("POST", { email, role }));
  return response.data;
}

/** Redeem an invite token. Requires a signed-in user. */
export async function acceptInvite(token: string): Promise<Company> {
  const response = await apiFetch<ApiEnvelope<Company>>(
    `${COMPANIES_URL}/invites/accept`,
    jsonRequest("POST", { token }),
  );
  return response.data;
}

/** Remove a teammate. Owner only; the owner cannot be removed. */
export async function removeMember(
  companyId: string,
  userId: string,
): Promise<Company> {
  const response = await apiFetch<ApiEnvelope<Company>>(
    `${COMPANIES_URL}/${companyId}/members/${userId}`,
    { method: "DELETE" },
  );
  return response.data;
}

/**
 * Hand the company to another active member. Owner only, and the outgoing
 * owner stays on as an admin rather than being dropped.
 */
export async function transferOwnership(
  companyId: string,
  userId: string,
): Promise<Company> {
  const response = await apiFetch<ApiEnvelope<Company>>(
    `${COMPANIES_URL}/${companyId}/owner`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    },
  );
  return response.data;
}

// ── Jobs ────────────────────────────────────────────────────────────────────

export async function getCompanyJobs(
  companyId: string,
): Promise<PostedJobSummary[]> {
  const response = await apiFetch<PaginatedApiEnvelope<PostedJobSummary[]>>(
    `${COMPANIES_URL}/${companyId}/jobs`,
    { method: "GET" },
  );
  return response.data || [];
}

// ── Admin review ────────────────────────────────────────────────────────────

export async function adminListCompanies(options?: {
  status?: CompanyStatus;
  page?: number;
  limit?: number;
}): Promise<{
  companies: Company[];
  pagination?: PaginatedApiEnvelope<Company[]>["pagination"];
}> {
  const params = new URLSearchParams();
  if (options?.status) params.set("status", options.status);
  if (options?.page) params.set("page", String(options.page));
  if (options?.limit) params.set("limit", String(options.limit));

  const query = params.toString();
  const response = await apiFetch<PaginatedApiEnvelope<Company[]>>(
    `${COMPANIES_URL}/admin/all${query ? `?${query}` : ""}`,
    { method: "GET" },
  );

  return { companies: response.data || [], pagination: response.pagination };
}

export async function adminApproveCompany(
  companyId: string,
): Promise<Company> {
  const response = await apiFetch<ApiEnvelope<Company>>(
    `${COMPANIES_URL}/admin/${companyId}/approve`,
    { method: "PATCH" },
  );
  return response.data;
}

/** Reject a company. A reason is required and is shown to the applicant. */
export async function adminRejectCompany(
  companyId: string,
  reason: string,
): Promise<Company> {
  const response = await apiFetch<ApiEnvelope<Company>>(
    `${COMPANIES_URL}/admin/${companyId}/reject`,
    jsonRequest("PATCH", { reason }),
  );
  return response.data;
}

/**
 * Suspend an approved company. Posting rights follow approval, so this stops
 * the whole hiring team publishing under it without suspending anyone's
 * account. Its existing listings stay up — taking those down is a separate
 * decision from taking the company's standing away.
 */
export async function adminSuspendCompany(
  companyId: string,
  reason?: string,
): Promise<Company> {
  const response = await apiFetch<ApiEnvelope<Company>>(
    `${COMPANIES_URL}/admin/${companyId}/suspend`,
    jsonRequest("PATCH", { reason }),
  );
  return response.data;
}

/** Restore a suspended company to approved. */
export async function adminReinstateCompany(
  companyId: string,
): Promise<Company> {
  const response = await apiFetch<ApiEnvelope<Company>>(
    `${COMPANIES_URL}/admin/${companyId}/reinstate`,
    { method: "PATCH" },
  );
  return response.data;
}

// ── Derived helpers ─────────────────────────────────────────────────────────

/** The viewer's role on a company, or null when they are not an active member. */
export function getMyRole(
  company: Company,
  userId: string | undefined,
): CompanyRole | null {
  if (!userId) return null;
  const member = company.members?.find(
    (m) => m.user_id === userId && m.status === "active",
  );
  return member?.role ?? null;
}

/** Only owners and admins may post jobs, and only for an approved company. */
export function canPostJobsFor(
  company: Company,
  userId: string | undefined,
): boolean {
  if (company.status !== "approved") return false;
  const role = getMyRole(company, userId);
  return role === "owner" || role === "admin";
}
