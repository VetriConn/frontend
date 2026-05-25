"use client";

import { useState } from "react";
import { HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import {
  useAdminCommunity,
  removeAdminCommunityPost,
  type AdminCommunityPost,
} from "@/hooks/useAdminCommunity";
import {
  AdminPageHeader,
  AdminTablePanel,
  AdminTable,
  AdminTableHead,
  AdminTableTh,
  AdminTableBody,
  AdminTableRow,
  AdminTableTd,
  AdminRowSkeleton,
  AdminEmptyState,
  RowActions,
  ViewAction,
  DangerAction,
} from "./AdminTablePanel";
import ConfirmDialog from "./ConfirmDialog";
import { useToaster } from "@/components/ui/Toaster";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const CommunityModeration = () => {
  const { posts, isLoading, mutate } = useAdminCommunity();
  const { showToast } = useToaster();
  const [target, setTarget] = useState<AdminCommunityPost | null>(null);
  const [busy, setBusy] = useState(false);

  const handleRemove = async (reason?: string) => {
    if (!target || !reason) return;
    setBusy(true);
    try {
      await removeAdminCommunityPost(target.id, reason);
      showToast({
        type: "success",
        title: "Post removed",
        description: `"${target.title}" was removed.`,
      });
      await mutate(posts.filter((p) => p.id !== target.id), false);
      setTarget(null);
    } catch {
      showToast({ type: "error", title: "Could not remove post" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Community Moderation"
        description="Ensure community discussions remain safe and professional"
      />

      <AdminTablePanel>
        <AdminTable>
          <AdminTableHead>
            <AdminTableTh>Post Title</AdminTableTh>
            <AdminTableTh>Author</AdminTableTh>
            <AdminTableTh>Date Posted</AdminTableTh>
            <AdminTableTh align="right">Actions</AdminTableTh>
          </AdminTableHead>
          <AdminTableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <AdminRowSkeleton key={i} columns={4} />
                ))
              : posts.map((p) => (
                  <AdminTableRow key={p.id}>
                    <AdminTableTd className="font-semibold text-gray-900">
                      {p.title}
                    </AdminTableTd>
                    <AdminTableTd>{p.author}</AdminTableTd>
                    <AdminTableTd>{formatDate(p.postedAt)}</AdminTableTd>
                    <AdminTableTd align="right">
                      <RowActions>
                        <ViewAction href={`/admin/community/${p.id}`} />
                        <DangerAction
                          label="Remove"
                          icon="remove"
                          onClick={() => setTarget(p)}
                        />
                      </RowActions>
                    </AdminTableTd>
                  </AdminTableRow>
                ))}
          </AdminTableBody>
        </AdminTable>
        {!isLoading && posts.length === 0 && (
          <AdminEmptyState
            title="No posts yet"
            description="Community posts will appear here for review and moderation."
            icon={HiOutlineChatBubbleLeftRight}
          />
        )}
      </AdminTablePanel>

      <ConfirmDialog
        open={!!target}
        title="Remove this post?"
        subject={target?.title}
        description="The post will be hidden from the community immediately. The author will be notified."
        reasonLabel="Reason for removal"
        reasonPlaceholder="What guideline did this post violate?"
        confirmLabel="Confirm Removal"
        busy={busy}
        onClose={() => (busy ? null : setTarget(null))}
        onConfirm={handleRemove}
      />
    </div>
  );
};

export default CommunityModeration;
