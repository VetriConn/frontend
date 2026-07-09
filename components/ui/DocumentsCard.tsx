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
  onView?: (doc: UserDocument) => void;
  isUploading?: boolean;
  deletingDocId?: string;
}

export const DocumentsCard: React.FC<DocumentsCardProps> = ({
  documents,
  onUpload,
  onDownload,
  onDelete,
  onView,
  isUploading = false,
  deletingDocId,
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
      className="bg-white rounded-lg md:rounded-xl border border-gray-200 p-4 md:p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <HiOutlineDocumentText className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            Documents
          </h2>
        </div>
        <button
          onClick={onUpload}
          disabled={isUploading}
          className="flex items-center gap-1.5 px-4 py-2 md:px-5 md:py-2.5 min-h-[44px] bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm md:text-base disabled:opacity-50"
          aria-label="Upload document"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
          ) : (
            <HiOutlineArrowUpTray className="w-4 h-4 md:w-5 md:h-5" />
          )}
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {hasDocuments ? (
        <div className="space-y-4">
          {sortedDocuments.map((doc, index) => {
            const isDeleting = deletingDocId === doc._id;
            return (
              <div key={doc._id || index} className="flex items-center gap-4">
                {/* File icon */}
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <HiOutlineDocumentText className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
                </div>

                {/* File info */}
                {onView ? (
                  <button
                    onClick={() => onView(doc)}
                    className="flex-1 min-w-0 text-left group focus:outline-none cursor-pointer"
                    title={`View ${doc.name}`}
                  >
                    <h3 className="text-sm md:text-base font-medium text-gray-700 group-hover:text-red-600 transition-colors truncate">
                      {doc.name}
                    </h3>
                    <p className="text-xs text-gray-400 group-hover:text-red-500/80 transition-colors">
                      {formatFileSize(doc.file_size)}
                      {doc.upload_date && (
                        <>
                          {doc.file_size ? " • " : ""}
                          Uploaded {formatDate(doc.upload_date)}
                        </>
                      )}
                    </p>
                  </button>
                ) : (
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-medium text-gray-700 truncate">
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
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isDeleting ? (
                    <div 
                      className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-3"
                      aria-label="Deleting document"
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => onDownload?.(doc)}
                        className="p-2 min-h-[44px] min-w-[44px] text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
                        aria-label={`Download ${doc.name}`}
                      >
                        <HiOutlineArrowDownTray className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                      <button
                        onClick={() => onDelete?.(doc)}
                        className="p-2 min-h-[44px] min-w-[44px] text-gray-400 hover:text-red-500 transition-colors flex items-center justify-center"
                        aria-label={`Delete ${doc.name}`}
                      >
                        <HiOutlineTrash className="w-5 h-5 md:w-6 md:h-6" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <HiOutlineDocumentText className="w-8 h-8 md:w-12 md:h-12 text-gray-300 mx-auto mb-2" />
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
