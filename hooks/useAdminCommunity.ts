import useSWR from "swr";
import {
  adminListContent,
  adminModerateContent,
  type ContentModerationStatus,
} from "@/lib/api/admin";

export interface AdminCommunityPost {
  id: string;
  title: string;
  body: string;
  author: string;
  postedAt: string; // ISO
  moderation_status: ContentModerationStatus;
}

export function useAdminCommunity() {
  const { data, error, isLoading, mutate } = useSWR<AdminCommunityPost[]>(
    "/admin/community/posts",
    async () =>
      (await adminListContent()).posts.map((p) => ({
        id: p.id,
        title: p.title,
        body: p.body,
        author: p.author,
        postedAt: p.postedAt,
        moderation_status: p.moderation_status,
      })),
  );
  return {
    posts: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

/** Take a community post down. Recorded in the audit log with the reason. */
export async function removeAdminCommunityPost(
  id: string,
  reason: string,
): Promise<void> {
  await adminModerateContent(id, "removed", reason);
}

/** Flag a post for review without removing it. */
export async function flagAdminCommunityPost(
  id: string,
  reason: string,
): Promise<void> {
  await adminModerateContent(id, "flagged", reason);
}

/** Restore a removed or flagged post to visible. */
export async function restoreAdminCommunityPost(id: string): Promise<void> {
  await adminModerateContent(id, "visible");
}
