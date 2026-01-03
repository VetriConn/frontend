"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import Image from "next/image";
import clsx from "clsx";

interface FileUploadZoneProps {
  acceptedFormats: string[];
  maxSizeMB: number;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  error?: string;
}

const MIME_TYPES: Record<string, string> = {
  PDF: "application/pdf",
  DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const FileUploadZone = ({
  acceptedFormats,
  maxSizeMB,
  file,
  onFileSelect,
  error,
}: FileUploadZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedMimeTypes = acceptedFormats
    .map((format) => MIME_TYPES[format.toUpperCase()])
    .filter(Boolean);

  const validateFile = (file: File): string | null => {
    // Check file type
    const isValidType = acceptedMimeTypes.includes(file.type);
    if (!isValidType) {
      return `Please upload a ${acceptedFormats.join(" or ")} file`;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFile = (file: File) => {
    const validationResult = validateFile(file);
    if (validationResult) {
      setValidationError(validationResult);
      onFileSelect(null);
    } else {
      setValidationError(null);
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setValidationError(null);
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayError = error || validationError;

  return (
    <div className="w-full">
      {!file ? (
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleClick();
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={clsx(
            "flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
            isDragOver
              ? "border-primary bg-red-50"
              : displayError
              ? "border-red-500 bg-red-50"
              : "border-gray-300 bg-gray-50 hover:border-primary hover:bg-gray-100"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedMimeTypes.join(",")}
            onChange={handleInputChange}
            className="hidden"
            aria-label="Upload file"
          />

          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Image
              src="/images/uploadfile.svg"
              alt="Upload file"
              width={24}
              height={24}
            />
          </div>

          <p className="text-base font-medium text-gray-700 mb-1">
            Drag and drop your resume here
          </p>
          <p className="text-sm text-gray-500 mb-4">
            or click to browse your files
          </p>

          <div className="text-xs text-gray-400 space-y-1 text-center">
            <p>Accepted formats: {acceptedFormats.join(", ")}</p>
            <p>Maximum size: {maxSizeMB}MB</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 border border-gray-300 rounded-xl bg-gray-50">
          <div className="flex items-center gap-3">
            <FileIcon className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
            aria-label="Remove file"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {displayError && (
        <p className="text-xs text-red-500 mt-2" role="alert" aria-live="polite">
          {displayError}
        </p>
      )}
    </div>
  );
};

// Upload icon component
const UploadIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

// File icon component
const FileIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

// Close icon component
const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
