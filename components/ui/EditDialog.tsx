"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import clsx from "clsx";

export interface EditDialogProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting?: boolean;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
}

/**
 * EditDialog - A reusable modal dialog component for editing profile sections
 * 
 * Features:
 * - Modal overlay with backdrop
 * - Focus trap (keeps focus within dialog when open)
 * - Focus restoration (returns focus to trigger button on close)
 * - Escape key handling
 * - Accessible with ARIA attributes
 * - Loading state for submit button
 * 
 * Requirements: 4.1, 14.2, 14.3
 */
export const EditDialog: React.FC<EditDialogProps> = ({
  isOpen,
  title,
  onClose,
  onSubmit,
  isSubmitting = false,
  children,
  submitLabel = "Save Changes",
  cancelLabel = "Cancel",
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const firstFocusableRef = useRef<HTMLElement | null>(null);
  const lastFocusableRef = useRef<HTMLElement | null>(null);

  // Store the element that triggered the dialog for focus restoration
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Focus restoration on close
  useEffect(() => {
    if (!isOpen && previousActiveElement.current) {
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [isOpen]);

  // Focus trap implementation
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const dialog = dialogRef.current;
    
    // Get all focusable elements within the dialog
    const getFocusableElements = (): HTMLElement[] => {
      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ');
      
      return Array.from(dialog.querySelectorAll(focusableSelectors)) as HTMLElement[];
    };

    const focusableElements = getFocusableElements();
    
    if (focusableElements.length > 0) {
      firstFocusableRef.current = focusableElements[0];
      lastFocusableRef.current = focusableElements[focusableElements.length - 1];
      
      // Focus the first element when dialog opens
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 0);
    }

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift + Tab on first element -> focus last element
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
      // Tab on last element -> focus first element
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    dialog.addEventListener('keydown', handleTabKey);

    return () => {
      dialog.removeEventListener('keydown', handleTabKey);
    };
  }, [isOpen]);

  // Handle Escape key to close dialog
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    },
    [isOpen, isSubmitting, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting) {
      onSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        className={clsx(
          "bg-white rounded-xl w-full shadow-2xl",
          "max-w-2xl max-h-[90vh] overflow-y-auto",
          "mobile:max-w-full mobile:h-full mobile:rounded-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dialog Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2
            id="dialog-title"
            className="text-xl font-semibold text-gray-900 m-0"
          >
            {title}
          </h2>
          <button
            type="button"
            className="bg-transparent border-none text-gray-400 cursor-pointer p-2 rounded-lg flex items-center justify-center transition-colors hover:text-gray-700 hover:bg-gray-100"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Dialog Content */}
        <form onSubmit={handleSubmit}>
          <div className="p-6">{children}</div>

          {/* Dialog Footer */}
          <div className="flex gap-3 p-6 pt-4 justify-end border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              type="button"
              className="bg-gray-100 text-gray-700 border-none rounded-lg py-2.5 px-5 text-sm font-medium cursor-pointer transition-colors hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label={cancelLabel}
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              className={clsx(
                "bg-primary text-white border-none rounded-lg py-2.5 px-5 text-sm font-medium cursor-pointer transition-colors",
                "hover:bg-primary-hover",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center gap-2"
              )}
              disabled={isSubmitting}
              aria-label={submitLabel}
              aria-busy={isSubmitting}
            >
              {isSubmitting && (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {isSubmitting ? "Saving..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDialog;
