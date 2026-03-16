import { API_BASE_URL, apiFetch, ApiEnvelope } from "./client";
import type {
  ApplicationItem,
  EmployerJobSummary,
  EmployerThreadDetail,
  EmployerThreadMessage,
  EmployerThreadSummary,
} from "@/types/api";

export async function getEmployerJobs(): Promise<EmployerJobSummary[]> {
  const response = await apiFetch<ApiEnvelope<{ jobs: EmployerJobSummary[] }>>(
    `${API_BASE_URL}/api/v1/employer/jobs`,
    { method: "GET" },
  );

  return response.data?.jobs || [];
}

export async function getEmployerApplications(): Promise<ApplicationItem[]> {
  const response = await apiFetch<
    ApiEnvelope<{ applications: ApplicationItem[] }>
  >(`${API_BASE_URL}/api/v1/employer/applications`, { method: "GET" });

  return response.data?.applications || [];
}

export async function getEmployerMessageThreads(): Promise<
  EmployerThreadSummary[]
> {
  const response = await apiFetch<
    ApiEnvelope<{ threads: EmployerThreadSummary[] }>
  >(`${API_BASE_URL}/api/v1/employer/messages/threads`, { method: "GET" });

  return response.data?.threads || [];
}

export async function getEmployerThreadMessages(
  applicationId: string,
): Promise<{
  thread: EmployerThreadDetail;
  messages: EmployerThreadMessage[];
}> {
  const response = await apiFetch<
    ApiEnvelope<{
      thread: EmployerThreadDetail;
      messages: EmployerThreadMessage[];
    }>
  >(`${API_BASE_URL}/api/v1/employer/messages/${applicationId}`, {
    method: "GET",
  });

  return {
    thread: response.data?.thread,
    messages: response.data?.messages || [],
  };
}

export async function sendEmployerMessage(
  applicationId: string,
  content: string,
): Promise<EmployerThreadMessage> {
  const response = await apiFetch<
    ApiEnvelope<{ message: EmployerThreadMessage }>
  >(`${API_BASE_URL}/api/v1/employer/messages/${applicationId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  if (!response.data?.message) {
    throw new Error("Message not returned by server");
  }

  return response.data.message;
}
