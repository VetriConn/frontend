/**
 * Skill suggestions from the shared, growable collection. Falls back silently
 * to an empty list so the pill input still works (on its curated client list)
 * when the endpoint is unavailable.
 */
import { API_BASE_URL, apiFetch, ApiEnvelope } from "./client";

export async function getSkillSuggestions(query: string): Promise<string[]> {
  const q = query.trim();
  if (!q) return [];
  try {
    const res = await apiFetch<ApiEnvelope<{ skills: string[] }>>(
      `${API_BASE_URL}/api/v1/skills?q=${encodeURIComponent(q)}`,
      { method: "GET" },
    );
    return res.data?.skills ?? [];
  } catch {
    return [];
  }
}
