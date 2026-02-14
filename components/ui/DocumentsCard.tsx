"use client";
import React from "react";
import {
  HiOutlineArrowUpTray,
  HiOutlineArrowDownTray,
  HiOutlineTrash,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import { UserDocument } from "@/types/api";

interface DocumentsCardProps {
  documents: UserDocument[];
  onUpload: () => void;
  onDownload?: (doc: UserDocument) => void;
  onDelete?: (doc: UserDocument) => void;
}

export const DocumentsCard: React.FC<DocumentsCardProps> = ({
  documents,
  onUpload,
  onDownload,
  onDelete,
}) => {
  const formatDate = (date?: Date | string) => {
    if (!date) return "";
    try {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Sort by most recently uploaded first
  const sortedDocuments = [...documents].sort((a, b) => {
    const dateA = a.upload_date ? new Date(a.upload_date).getTime() : 0;
    const dateB = b.upload_date ? new Date(b.upload_date).getTime() : 0;
    return dateB - dateA;
  });

  const hasDocuments = sortedDocuments.length > 0;

  return (
    <div
      id="documents-card"
      className="bg-white rounded-xl border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Documents</h2>
        <button
          onClick={onUpload}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
          aria-label="Upload document"
        >
          <HiOutlineArrowUpTray className="text-base" />
          Upload
        </button>
      </div>

      {hasDocuments ? (
        <div className="space-y-4">
          {sortedDocuments.map((doc, index) => (
            <div key={doc._id || index} className="flex items-center gap-4">
              {/* File icon */}
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <HiOutlineDocumentText className="text-red-500 text-lg" />
              </div>

              {/* File info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate">
                  {doc.name}
                </h3>
                <p className="text-xs text-gray-400">
                  {formatFileSize(doc.file_size)}
                  {doc.upload_date && (
                    <>
                      {doc.file_size ? " • " : ""}
                      Uploaded {formatDate(doc.upload_date)}
                    </>
                  )}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onDownload?.(doc)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={`Download ${doc.name}`}
                >
                  <HiOutlineArrowDownTray className="text-lg" />
                </button>
                <button
                  onClick={() => onDelete?.(doc)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Delete ${doc.name}`}
                >
                  <HiOutlineTrash className="text-lg" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm mb-1">No documents added yet</p>
          <p className="text-gray-400 text-xs">
            Click &quot;Upload&quot; to add your documents
          </p>
        </div>
      )}

      {/* Accepted file types footer */}
      <p className="text-xs text-gray-400 italic mt-4">
        Accepted file types: PDF, DOC, DOCX (max 10MB)
      </p>
    </div>
  );
};
