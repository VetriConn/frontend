"use client";

import { use } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { CandidateDetail } from "@/components/pages/dashboard/CandidateDetail";

export default function CandidatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AuthGuard>
      <CandidateDetail applicationId={id} />
    </AuthGuard>
  );
}
