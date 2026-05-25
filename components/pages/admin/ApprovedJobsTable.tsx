"use client";

import { useState } from "react";
import { HiOutlineBriefcase } from "react-icons/hi2";
import {
  useAdminJobQueue,
  unpublishAdminJob,
  type AdminJob,
} from "@/hooks/useAdminJobQueue";
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

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ApprovedJobsTable = () => {
  const { jobs, isLoading, mutate } = useAdminJobQueue("approved");
  const { showToast } = useToaster();
  const [target, setTarget] = useState<AdminJob | null>(null);
  const [busy, setBusy] = useState(false);

  const handleUnpublish = async (reason?: string) => {
    if (!target || !reason) return;
    setBusy(true);
    try {
      await unpublishAdminJob(target.id, reason);
      showToast({
        type: "success",
        title: "Listing unpublished",
        description: `${target.role} is no longer live.`,
      });
      await mutate(jobs.filter((j) => j.id !== target.id), false);
      setTarget(null);
    } catch {
      showToast({ type: "error", title: "Could not unpublish listing" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Approved Jobs"
        description="Currently live job listings"
      />

      <AdminTablePanel>
        <AdminTable>
          <AdminTableHead>
            <AdminTableTh>Job Title</AdminTableTh>
            <AdminTableTh>Company</AdminTableTh>
            <AdminTableTh>Date Approved</AdminTableTh>
            <AdminTableTh>Applications</AdminTableTh>
            <AdminTableTh align="right">Actions</AdminTableTh>
          </AdminTableHead>
          <AdminTableBody>
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <AdminRowSkeleton key={i} columns={5} />
                ))
              : jobs.map((j) => (
                  <AdminTableRow key={j.id}>
                    <AdminTableTd className="font-semibold text-gray-900">
                      {j.role}
                    </AdminTableTd>
                    <AdminTableTd>{j.company_name}</AdminTableTd>
                    <AdminTableTd>{formatDate(j.approvedAt)}</AdminTableTd>
                    <AdminTableTd className="tabular-nums">
                      {j.applications ?? 0}
                    </AdminTableTd>
                    <AdminTableTd align="right">
                      <RowActions>
                        <ViewAction href={`/admin/jobs/${j.id}`} />
                        <DangerAction
                          label="Unpublish"
                          onClick={() => setTarget(j)}
                        />
                      </RowActions>
                    </AdminTableTd>
                  </AdminTableRow>
                ))}
          </AdminTableBody>
        </AdminTable>
        {!isLoading && jobs.length === 0 && (
          <AdminEmptyState
            title="No approved jobs yet"
            description="Approved listings will appear here once you start working through the review queue."
            icon={HiOutlineBriefcase}
          />
        )}
      </AdminTablePanel>

      <ConfirmDialog
        open={!!target}
        title="Unpublish this job?"
        subject={target?.role}
        description="The listing will be removed from public view immediately. The employer will be notified."
        reasonLabel="Reason"
        reasonPlaceholder="Why is this listing being unpublished?"
        confirmLabel="Confirm Unpublish"
        busy={busy}
        onClose={() => (busy ? null : setTarget(null))}
        onConfirm={handleUnpublish}
      />
    </div>
  );
};

export default ApprovedJobsTable;
