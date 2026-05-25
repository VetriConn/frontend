import useSWR from "swr";

export interface AdminCommunityPost {
  id: string;
  title: string;
  author: string;
  postedAt: string; // ISO
}

const MOCK: AdminCommunityPost[] = [
  {
    id: "p-1",
    title: "Tips for Returning to Work After Retirement",
    author: "Margaret Chen",
    postedAt: "2026-02-23",
  },
  {
    id: "p-2",
    title: "Best Jobs for Veterans in Ontario",
    author: "James Patterson",
    postedAt: "2026-02-22",
  },
  {
    id: "p-3",
    title: "How I Landed My First Part-Time Role at 62",
    author: "Robert Williams",
    postedAt: "2026-02-20",
  },
  {
    id: "p-4",
    title: "Employer Red Flags to Watch Out For",
    author: "Linda Thompson",
    postedAt: "2026-02-19",
  },
];

const fetchPosts = async (): Promise<AdminCommunityPost[]> => {
  // TODO: GET /api/v1/admin/community/posts
  await new Promise((r) => setTimeout(r, 200));
  return MOCK;
};

export function useAdminCommunity() {
  const { data, error, isLoading, mutate } = useSWR<AdminCommunityPost[]>(
    "/admin/community/posts",
    fetchPosts,
  );
  return {
    posts: data ?? [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export async function removeAdminCommunityPost(
  id: string,
  reason: string,
): Promise<void> {
  // TODO: DELETE /api/v1/admin/community/posts/:id  body: { reason }
  await new Promise((r) => setTimeout(r, 300));
  console.log("[mock] removed post", id, "reason:", reason);
}
