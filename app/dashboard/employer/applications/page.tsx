"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  getEmployerApplications,
  updateEmployerApplicationStatus,
} from "@/lib/api";
import { useToaster } from "@/components/ui/Toaster";
import {
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineDocumentArrowDown,
} from "react-icons/hi2";

function formatDate(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function getJobLabel(
  job:
    | string
    | {
        _id: string;
        id: string;
        role: string;
        company_name: string;
        location?: string;
        company_logo?: string;
      },
) {
  if (typeof job === "string") return "Job posting";
  return `${job.role} • ${job.company_name}`;
}

function ApplicationStatusBadge({ status }: { status: string }) {
  if (status === "accepted") {
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
        Accepted
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
        Rejected
      </span>
    );
  }

  if (status === "reviewed") {
    return (
      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
        Reviewed
      </span>
    );
  }

  return (
    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">
      Pending
    </span>
  );
}

export default function ApplicationsPage() {
  const { showToast } = useToaster();
  const [busyApplicationId, setBusyApplicationId] = useState<string | null>(
    null,
  );
  const {
    data: applications = [],
    isLoading,
    mutate,
  } = useSWR("employer-applications", getEmployerApplications);

  const handleStatusChange = async (
    applicationId: string,
    status: "reviewed" | "accepted" | "rejected",
  ) => {
    setBusyApplicationId(applicationId);
    try {
      await updateEmployerApplicationStatus(applicationId, status);
      await mutate();
      showToast({
        type: "success",
        title: "Application updated",
        description: `Status changed to ${status}`,
      });
    } catch (err) {
      showToast({
        type: "error",
        title: "Update failed",
        description:
          err instanceof Error
            ? err.message
            : "Could not update application status",
      });
    } finally {
      setBusyApplicationId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-300 mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Applications &amp; Applicants
          </h1>
          <p className="text-gray-500">
            Review and manage applications from job seekers.
          </p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-500">
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiOutlineUserGroup className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Applications Yet
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Once you post a job, applications from candidates will appear
              here. You&apos;ll be able to review profiles and manage your
              hiring pipeline.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((application) => (
              <div
                key={application._id}
                className="bg-white rounded-xl border border-gray-200 px-5 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {application.full_name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {application.email} • {application.phone}
                    </p>
                  </div>
                  <ApplicationStatusBadge status={application.status} />
                </div>

                <div className="mt-3 text-xs text-gray-500 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <HiOutlineBriefcase className="w-3.5 h-3.5" />
                    {getJobLabel(application.job_id)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <HiOutlineCalendar className="w-3.5 h-3.5" />
                    Applied{" "}
                    {formatDate(
                      application.applied_at || application.createdAt,
                    )}
                  </span>
                </div>

                {application.selected_skills &&
                  application.selected_skills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {application.selected_skills.slice(0, 6).map((skill) => (
                        <span
                          key={skill}
                          className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-700 text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={busyApplicationId === application._id}
                    onClick={() =>
                      handleStatusChange(application._id, "reviewed")
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-xs font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                  >
                    Mark Reviewed
                  </button>
                  <button
                    type="button"
                    disabled={busyApplicationId === application._id}
                    onClick={() =>
                      handleStatusChange(application._id, "accepted")
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-200 text-xs font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    disabled={busyApplicationId === application._id}
                    onClick={() =>
                      handleStatusChange(application._id, "rejected")
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  {application.resume_url && (
                    <a
                      href={application.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <HiOutlineDocumentArrowDown className="w-4 h-4" />
                      Resume
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
