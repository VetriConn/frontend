"use client";

import React, { useRef, useState } from "react";
import { HiOutlineArrowUpTray, HiOutlineDocumentText } from "react-icons/hi2";

export interface UploadDocumentFormProps {
  onFileSelected: (file: File) => void;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx";
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export const UploadDocumentForm: React.FC<UploadDocumentFormProps> = ({
  onFileSelected,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload a PDF, DOC, or DOCX file.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File is too large. Maximum size is ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = (file: File) => {
    const err = validateFile(file);
    if (err) {
      setError(err);
      setSelectedFile(null);
      return;
    }
    setError(null);
    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-red-400 bg-red-50"
            : "border-gray-300 hover:border-gray-400 bg-gray-50"
        }`}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <HiOutlineArrowUpTray className="text-red-500 text-xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PDF, DOC, DOCX (max {MAX_SIZE_MB}MB)
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleInputChange}
          className="hidden"
          aria-label="Upload document"
        />
      </div>

      {/* Error message */}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Selected file preview */}
      {selectedFile && !error && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <HiOutlineDocumentText className="text-red-500 text-base" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-400">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <span className="text-xs text-green-600 font-medium shrink-0">
            Ready to upload
          </span>
        </div>
      )}
    </div>
  );
};
