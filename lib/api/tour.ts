import { apiFetch, API_BASE_URL } from "./client";

/**
 * Record that the dashboard tour has been seen.
 *
 * No body: the server stamps the time. The client is reporting that the tour
 * finished or was skipped, not choosing when that happened.
 *
 * Called for both outcomes, and NOT called when the tour was started from
 * Account Settings, which is a replay rather than a first viewing.
 */
export async function markTourCompleted(): Promise<void> {
  await apiFetch<{ success: boolean }>(
    `${API_BASE_URL}/api/v1/auth/tour-completed`,
    { method: "POST" },
  );
}
