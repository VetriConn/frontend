/**
 * Jobs API Service
 * Job listing, search, applications, and saved jobs
 */

import { API_BASE_URL } from "./client";
import type { JobsResponse } from "@/types/api";

// Fetch jobs from database
export async function getJobs(options?: {
  page?: number;
  limit?: number;
  location?: string;
  search?: string;
}): Promise<JobsResponse[]> {
  const { page = 1, limit = 10, location, search } = options || {};

  // Build query parameters
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (location) {
    queryParams.append("location", location);
  }

  if (search) {
    queryParams.append("search", search);
  }

  console.log(
    "Making jobs request to:",
    `${API_BASE_URL}/api/v1/jobs?${queryParams}`,
  );

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/jobs?${queryParams}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Jobs response status:", response.status);

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.log("Non-JSON response:", textResponse);
      throw new Error(
        `Server returned non-JSON response: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("Jobs response data:", data);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Backend wraps jobs in { success, data, pagination } — extract the array
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  } catch (error) {
    console.error("Jobs fetch error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to ${API_BASE_URL}. Please ensure the backend server is running.`,
      );
    }

    throw error;
  }
}

// Fetch single job by ID
export async function getJobById(jobId: string): Promise<JobsResponse> {
  console.log(
    "Making single job request to:",
    `${API_BASE_URL}/api/v1/jobs/${jobId}`,
  );

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Single job response status:", response.status);

    // Check if the response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.log("Non-JSON response:", textResponse);
      throw new Error(
        `Server returned non-JSON response: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("Single job response data:", data);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Backend returns job object directly
    return data;
  } catch (error) {
    console.error("Single job fetch error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to ${API_BASE_URL}. Please ensure the backend server is running.`,
      );
    }

    throw error;
  }
}

// Submit job application
export async function submitJobApplication(
  jobId: string,
  formData: FormData,
): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}/apply`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.message || data.error || "Failed to submit application",
      );
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to ${API_BASE_URL}. Please ensure the backend server is running.`,
      );
    }
    throw error;
  }
}

// Save a job
export async function saveJob(jobId: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}/save`, {
      method: "POST",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to save job");
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to ${API_BASE_URL}. Please ensure the backend server is running.`,
      );
    }
    throw error;
  }
}

// Unsave a job
export async function unsaveJob(jobId: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/jobs/${jobId}/save`, {
      method: "DELETE",
      credentials: "include",
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to unsave job");
    }
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(
        `Network error: Unable to connect to ${API_BASE_URL}. Please ensure the backend server is running.`,
      );
    }
    throw error;
  }
}
