import type { Metadata } from "next";
import AdminCommunityPostDetail from "@/components/pages/admin/AdminCommunityPostDetail";

export const metadata: Metadata = {
  title: "Community Post",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCommunityPostDetailPage({
  params,
}: PageProps) {
  const { id } = await params;
  return <AdminCommunityPostDetail postId={id} />;
}
