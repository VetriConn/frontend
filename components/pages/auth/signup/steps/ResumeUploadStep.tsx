"use client";

import { StepProps } from "@/types/signup";
import { FileUploadZone } from "../FileUploadZone";

/**
 * Step 5: Resume Upload (Optional)
 * Allows users to upload their resume
 * Requirements: 6.1, 6.2, 6.9, 6.10, 6.11, 6.12
 */
export const ResumeUploadStep = ({
  formData,
  errors,
  onFieldChange,
  onNext,
  onBack,
  onSkip,
}: StepProps) => {
  const handleFileSelect = (file: File | null) => {
    onFieldChange("resumeFile", file);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Heading */}
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2 text-center">
        Upload your resume
      </h1>
      
      {/* Subtext */}
      <p className="text-gray-600 mb-8 text-center">
        Adding a resume helps employers understand your experience. You can always add one later.
      </p>

      {/* File Upload Zone */}
      <div className="mb-8">
        <FileUploadZone
          acceptedFormats={["PDF", "DOCX"]}
          maxSizeMB={10}
          file={formData.resumeFile}
          onFileSelect={handleFileSelect}
          error={errors.resumeFile}
        />
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 font-medium rounded-[10px] transition-all hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 px-6 bg-primary text-white font-medium rounded-[10px] transition-all hover:bg-primary/90"
        >
          Continue
        </button>
      </div>

      {/* Skip Link */}
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700 text-sm underline transition-colors"
        >
          upload later
        </button>
      </div>
    </div>
  );
};
