"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  HiOutlineChatBubbleLeftRight,
  HiOutlineEye,
  HiOutlineFlag,
  HiOutlineTrash,
  HiOutlineArrowUturnLeft,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { adminContentCounts } from "@/lib/api/admin";
import {
  useAdminCommunity,
  removeAdminCommunityPost,
  flagAdminCommunityPost,
  restoreAdminCommunityPost,
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
  StatusPill,
  AdminStatCard,
  AdminStatRow,
} from "./AdminTablePanel";
import KebabMenu, { type KebabAction } from "./KebabMenu";
import DetailDrawer from "./DetailDrawer";
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
  const { data: counts, mutate: mutateCounts } = useSWR(
    "admin-content-counts",
    adminContentCounts,
  );
  const [viewing, setViewing] = useState<AdminCommunityPost | null>(null);
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
      mutateCounts();
      setTarget(null);
    } catch {
      showToast({ type: "error", title: "Could not remove post" });
    } finally {
      setBusy(false);
    }
  };

  const moderate = async (
    p: AdminCommunityPost,
    action: "flag" | "restore",
  ) => {
    try {
      if (action === "flag") await flagAdminCommunityPost(p.id, "Flagged for review");
      else await restoreAdminCommunityPost(p.id);
      showToast({
        type: "success",
        title: action === "flag" ? "Post flagged" : "Post restored",
      });
      await mutate();
      mutateCounts();
    } catch {
      showToast({ type: "error", title: "Could not update post" });
    }
  };

  const rowActions = (p: AdminCommunityPost): KebabAction[] => {
    const actions: KebabAction[] = [
      { label: "View post", icon: HiOutlineEye, onClick: () => setViewing(p) },
    ];
    if (p.moderation_status !== "flagged" && p.moderation_status !== "removed") {
      actions.push({
        label: "Flag for review",
        icon: HiOutlineFlag,
        onClick: () => moderate(p, "flag"),
      });
    }
    if (p.moderation_status !== "visible") {
      actions.push({
        label: "Restore",
        icon: HiOutlineArrowUturnLeft,
        onClick: () => moderate(p, "restore"),
      });
    }
    if (p.moderation_status !== "removed") {
      actions.push({
        label: "Remove",
        icon: HiOutlineTrash,
        danger: true,
        onClick: () => setTarget(p),
      });
    }
    return actions;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Community Moderation"
        description="Ensure community discussions remain safe and professional"
      />

      <AdminStatRow>
        <AdminStatCard
          icon={HiOutlineChatBubbleLeftRight}
          label="Total posts"
          value={counts?.total ?? "—"}
          tone="indigo"
        />
        <AdminStatCard
          icon={HiOutlineCheckCircle}
          label="Visible"
          value={counts?.visible ?? "—"}
          tone="emerald"
        />
        <AdminStatCard
          icon={HiOutlineFlag}
          label="Flagged"
          value={counts?.flagged ?? "—"}
          tone="amber"
        />
        <AdminStatCard
          icon={HiOutlineTrash}
          label="Removed"
          value={counts?.removed ?? "—"}
          tone="rose"
        />
      </AdminStatRow>

      <AdminTablePanel>
        <AdminTable>
          <AdminTableHead>
            <AdminTableTh>Post Title</AdminTableTh>
            <AdminTableTh>Author</AdminTableTh>
            <AdminTableTh>Date Posted</AdminTableTh>
            <AdminTableTh>Status</AdminTableTh>
            <AdminTableTh align="right">Actions</AdminTableTh>
          </AdminTableHead>
          <AdminTableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <AdminRowSkeleton key={i} columns={5} />
                ))
              : posts.map((p) => (
                  <AdminTableRow key={p.id}>
                    <AdminTableTd className="font-semibold text-gray-900">
                      {p.title}
                    </AdminTableTd>
                    <AdminTableTd>{p.author}</AdminTableTd>
                    <AdminTableTd>{formatDate(p.postedAt)}</AdminTableTd>
                    <AdminTableTd>
                      <StatusPill
                        tone={
                          p.moderation_status === "removed"
                            ? "rose"
                            : p.moderation_status === "flagged"
                              ? "amber"
                              : "emerald"
                        }
                      >
                        {p.moderation_status}
                      </StatusPill>
                    </AdminTableTd>
                    <AdminTableTd align="right">
                      <KebabMenu actions={rowActions(p)} />
                    </AdminTableTd>
                  </AdminTableRow>
                ))}
          </AdminTableBody>
        </AdminTable>
        {!isLoading && posts.length === 0 && (
          <AdminEmptyState
            title="Community posting isn't live yet"
            description="There's no way for members to publish posts on Vetriconn yet, so this queue stays empty. It will fill in once community posting ships."
            icon={HiOutlineChatBubbleLeftRight}
          />
        )}
      </AdminTablePanel>

      <DetailDrawer
        open={!!viewing}
        title="Post details"
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {viewing.title}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {viewing.author} · {formatDate(viewing.postedAt)}
              </p>
            </div>
            <StatusPill
              tone={
                viewing.moderation_status === "removed"
                  ? "rose"
                  : viewing.moderation_status === "flagged"
                    ? "amber"
                    : "emerald"
              }
            >
              {viewing.moderation_status}
            </StatusPill>
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {viewing.body}
            </p>
          </div>
        )}
      </DetailDrawer>

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
