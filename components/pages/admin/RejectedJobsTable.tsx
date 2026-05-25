"use client";

import { HiOutlineBriefcase } from "react-icons/hi2";
import { useAdminJobQueue } from "@/hooks/useAdminJobQueue";
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
} from "./AdminTablePanel";

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

const RejectedJobsTable = () => {
  const { jobs, isLoading } = useAdminJobQueue("rejected");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AdminPageHeader
        title="Rejected Jobs"
        description="Listings that did not meet quality standards"
      />

      <AdminTablePanel>
        <AdminTable>
          <AdminTableHead>
            <AdminTableTh>Job Title</AdminTableTh>
            <AdminTableTh>Company</AdminTableTh>
            <AdminTableTh>Rejected Date</AdminTableTh>
            <AdminTableTh>Reason</AdminTableTh>
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
                    <AdminTableTd>{formatDate(j.rejectedAt)}</AdminTableTd>
                    <AdminTableTd className="text-rose-600">
                      {j.rejection_reason ?? "—"}
                    </AdminTableTd>
                    <AdminTableTd align="right">
                      <RowActions>
                        <ViewAction href={`/admin/jobs/${j.id}`} />
                      </RowActions>
                    </AdminTableTd>
                  </AdminTableRow>
                ))}
          </AdminTableBody>
        </AdminTable>
        {!isLoading && jobs.length === 0 && (
          <AdminEmptyState
            title="No rejected jobs"
            description="Rejected listings will appear here for audit and reference."
            icon={HiOutlineBriefcase}
          />
        )}
      </AdminTablePanel>
    </div>
  );
};

export default RejectedJobsTable;
