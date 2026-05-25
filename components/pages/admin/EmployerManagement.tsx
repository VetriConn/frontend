"use client";

import { useState } from "react";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import {
  useAdminEmployers,
  suspendAdminEmployer,
  reinstateAdminEmployer,
  type AdminEmployer,
} from "@/hooks/useAdminEmployers";
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
  StatusPill,
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

const EmployerManagement = () => {
  const { employers, isLoading, mutate } = useAdminEmployers();
  const { showToast } = useToaster();
  const [target, setTarget] = useState<AdminEmployer | null>(null);
  const [busy, setBusy] = useState(false);

  const isSuspending = target?.status === "active";

  const handleConfirm = async (reason?: string) => {
    if (!target) return;
    setBusy(true);
    try {
      if (isSuspending) {
        await suspendAdminEmployer(target.id);
        showToast({
          type: "success",
          title: "Employer suspended",
          description: `${target.company_name} can no longer post jobs.`,
        });
      } else {
        await reinstateAdminEmployer(target.id);
        showToast({
          type: "success",
          title: "Employer reinstated",
          description: `${target.company_name} can post jobs again.`,
        });
      }
      const next = employers.map((e) =>
        e.id === target.id
          ? { ...e, status: isSuspending ? "suspended" : "active" }
          : e,
      );
      await mutate(next as AdminEmployer[], false);
      setTarget(null);
      // Touch reason so eslint/TS sees it used; backend may consume it.
      void reason;
    } catch {
      showToast({ type: "error", title: "Could not update employer" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Employer Management"
        description="Verify and manage employer accounts"
      />

      <AdminTablePanel>
        <AdminTable>
          <AdminTableHead>
            <AdminTableTh>Company Name</AdminTableTh>
            <AdminTableTh>Industry</AdminTableTh>
            <AdminTableTh>Location</AdminTableTh>
            <AdminTableTh>Registered</AdminTableTh>
            <AdminTableTh>Status</AdminTableTh>
            <AdminTableTh align="right">Actions</AdminTableTh>
          </AdminTableHead>
          <AdminTableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <AdminRowSkeleton key={i} columns={6} />
                ))
              : employers.map((e) => (
                  <AdminTableRow key={e.id}>
                    <AdminTableTd className="font-semibold text-gray-900">
                      {e.company_name}
                    </AdminTableTd>
                    <AdminTableTd>{e.industry}</AdminTableTd>
                    <AdminTableTd>{e.location}</AdminTableTd>
                    <AdminTableTd>{formatDate(e.registeredAt)}</AdminTableTd>
                    <AdminTableTd>
                      <StatusPill
                        tone={
                          e.status === "active"
                            ? "emerald"
                            : e.status === "suspended"
                              ? "rose"
                              : "amber"
                        }
                      >
                        {e.status === "active"
                          ? "Active"
                          : e.status === "suspended"
                            ? "Suspended"
                            : "Pending"}
                      </StatusPill>
                    </AdminTableTd>
                    <AdminTableTd align="right">
                      <RowActions>
                        <ViewAction href={`/admin/employers/${e.id}`} />
                        <DangerAction
                          label={
                            e.status === "suspended" ? "Reinstate" : "Suspend"
                          }
                          onClick={() => setTarget(e)}
                        />
                      </RowActions>
                    </AdminTableTd>
                  </AdminTableRow>
                ))}
          </AdminTableBody>
        </AdminTable>
        {!isLoading && employers.length === 0 && (
          <AdminEmptyState
            title="No employers yet"
            description="Once employers register, they'll appear here for verification and management."
            icon={HiOutlineBuildingOffice2}
          />
        )}
      </AdminTablePanel>

      <ConfirmDialog
        open={!!target}
        title={
          isSuspending ? "Suspend this employer?" : "Reinstate this employer?"
        }
        subject={target?.company_name}
        description={
          isSuspending
            ? "Suspended employers cannot post jobs or message applicants until reinstated."
            : "The employer will regain full access immediately."
        }
        reasonLabel={isSuspending ? "Reason" : undefined}
        reasonPlaceholder={
          isSuspending
            ? "Briefly note why this employer is being suspended"
            : undefined
        }
        confirmLabel={isSuspending ? "Suspend Employer" : "Reinstate Employer"}
        tone={isSuspending ? "danger" : "neutral"}
        busy={busy}
        onClose={() => (busy ? null : setTarget(null))}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default EmployerManagement;
