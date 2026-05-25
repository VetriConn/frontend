"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineHashtag,
  HiOutlineTrash,
} from "react-icons/hi2";
import {
  useAdminCommunity,
  removeAdminCommunityPost,
  type AdminCommunityPost,
} from "@/hooks/useAdminCommunity";
import { AdminPageHeader } from "./AdminTablePanel";
import ConfirmDialog from "./ConfirmDialog";
import { useToaster } from "@/components/ui/Toaster";

interface Props {
  postId: string;
}

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const AdminCommunityPostDetail = ({ postId }: Props) => {
  const { posts, isLoading, mutate } = useAdminCommunity();
  const { showToast } = useToaster();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const post = useMemo<AdminCommunityPost | null>(
    () => posts.find((p) => p.id === postId) ?? null,
    [posts, postId],
  );

  const handleRemove = async (reason?: string) => {
    if (!post || !reason) return;
    setBusy(true);
    try {
      await removeAdminCommunityPost(post.id, reason);
      showToast({ type: "success", title: "Post removed" });
      await mutate(posts.filter((p) => p.id !== post.id), false);
    } catch {
      showToast({ type: "error", title: "Could not remove post" });
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-5 w-32 bg-gray-100 rounded animate-shimmer" />
        <div className="h-8 w-2/3 bg-gray-100 rounded animate-shimmer" />
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 space-y-3">
          <div className="h-4 w-1/3 bg-gray-100 rounded animate-shimmer" />
          <div className="h-3 w-2/3 bg-gray-100 rounded animate-shimmer" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-10 text-center">
          <h1 className="text-base font-semibold text-gray-900">
            Post not found
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            The community post may have been removed.
          </p>
          <Link
            href="/admin/community"
            className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary hover:text-primary-hover"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/admin/community"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-primary"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
        Back to community
      </Link>

      <AdminPageHeader
        title={post.title}
        description="Community post"
        actions={
          <button
            onClick={() => setConfirmOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-rose-200 bg-white text-rose-600 hover:bg-rose-50"
          >
            <HiOutlineTrash className="w-4 h-4" />
            Remove Post
          </button>
        }
      />

      <section className="bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-5 md:p-6">
        <h2 className="text-base font-semibold text-gray-900">Details</h2>
        <p className="text-xs text-gray-500 mt-0.5 mb-5">
          Once a fuller community model lands, the post body, comments, and
          flag history will appear here.
        </p>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <Field icon={HiOutlineUser} label="Author" value={post.author} />
          <Field
            icon={HiOutlineCalendar}
            label="Posted"
            value={formatDate(post.postedAt)}
          />
          <Field icon={HiOutlineHashtag} label="ID" value={post.id} />
        </dl>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Remove this post?"
        subject={post.title}
        description="The post will be hidden from the community immediately. The author will be notified."
        reasonLabel="Reason for removal"
        reasonPlaceholder="What guideline did this post violate?"
        confirmLabel="Confirm Removal"
        busy={busy}
        onClose={() => (busy ? null : setConfirmOpen(false))}
        onConfirm={handleRemove}
      />
    </div>
  );
};

const Field = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-gray-900 truncate">{value}</p>
    </div>
  </div>
);

export default AdminCommunityPostDetail;
