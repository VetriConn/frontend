import { API_BASE_URL, apiFetch, ApiEnvelope } from "./client";

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  original_filename: string;
  bytes: number;
}

export interface SignatureData {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  folder: string;
  resource_type: string;
  transformation?: string;
  /** Signed format allow-list; must be sent back or the signature won't match. */
  allowed_formats?: string;
}

/**
 * Fetch a secure upload signature from the backend for direct uploads.
 */
export async function getUploadSignature(uploadType: string): Promise<SignatureData> {
  const response = await apiFetch<ApiEnvelope<SignatureData>>(
    `${API_BASE_URL}/api/v1/uploads/sign`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ upload_type: uploadType }),
    }
  );
  return response.data;
}

/**
 * Uploads a file directly to Cloudinary using the secure signature.
 */
export async function uploadDirectToCloudinary(
  file: File,
  signatureData: SignatureData
): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signatureData.api_key);
  formData.append("timestamp", String(signatureData.timestamp));
  formData.append("signature", signatureData.signature);
  formData.append("folder", signatureData.folder);

  if (signatureData.transformation) {
    formData.append("transformation", signatureData.transformation);
  }
  // Must echo the signed allow-list back or Cloudinary's signature check fails.
  if (signatureData.allowed_formats) {
    formData.append("allowed_formats", signatureData.allowed_formats);
  }

  const url = `https://api.cloudinary.com/v1_1/${signatureData.cloud_name}/${signatureData.resource_type}/upload`;

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary direct upload failed: ${errorText}`);
  }

  return await response.json();
}
