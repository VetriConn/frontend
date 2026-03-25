const DRAFT_PREFIX = "vetriconn-draft-";

export interface ApplicationDraftRecord {
  jobId: string;
  jobTitle?: string;
  companyName?: string;
  location?: string;
  relevantExperience?: string;
  selectedSkills?: string[];
  earliestStartDate?: string;
  preferredSchedule?: string;
  workLocationPreference?: string;
  additionalInfo?: string;
  savedAt?: string;
}

export function getApplicationDraftKey(jobId: string): string {
  return `${DRAFT_PREFIX}${jobId}`;
}

export function getApplicationDraft(
  jobId: string,
): ApplicationDraftRecord | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(getApplicationDraftKey(jobId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ApplicationDraftRecord;
    return { ...parsed, jobId };
  } catch {
    return null;
  }
}

export function hasApplicationDraft(jobId: string): boolean {
  return !!getApplicationDraft(jobId);
}

export function saveApplicationDraft(
  jobId: string,
  draft: ApplicationDraftRecord,
): void {
  if (typeof window === "undefined") return;
  const payload: ApplicationDraftRecord = { ...draft, jobId };
  window.localStorage.setItem(
    getApplicationDraftKey(jobId),
    JSON.stringify(payload),
  );
}

export function removeApplicationDraft(jobId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getApplicationDraftKey(jobId));
}

export function listApplicationDrafts(): ApplicationDraftRecord[] {
  if (typeof window === "undefined") return [];

  const drafts: ApplicationDraftRecord[] = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith(DRAFT_PREFIX)) continue;

    const jobId = key.slice(DRAFT_PREFIX.length);
    if (!jobId) continue;

    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as ApplicationDraftRecord;
      drafts.push({ ...parsed, jobId });
    } catch {
      // Ignore malformed drafts and keep listing the rest.
    }
  }

  return drafts.sort((a, b) => {
    const left = a.savedAt ? Date.parse(a.savedAt) : 0;
    const right = b.savedAt ? Date.parse(b.savedAt) : 0;
    return right - left;
  });
}
