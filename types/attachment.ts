// Attachment types for Vetriconn platform

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type?: string;
  size?: number;
  uploadedAt?: string;
  preview?: string;
}

export interface AttachmentsResponse {
  success: boolean;
  message: string;
  data?: {
    attachments: Attachment[];
  };
  error?: string;
}
