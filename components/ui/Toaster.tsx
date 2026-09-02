"use client";
import React, { createContext, useContext, useRef, useState, ReactNode } from "react";
import clsx from "clsx";

interface Toast {
  id: number;
  type?: "success" | "error" | "loading";
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

interface ToasterContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
}

const ToasterContext = createContext<ToasterContextType | undefined>(undefined);

export const useToaster = () => {
  const ctx = useContext(ToasterContext);
  if (!ctx) throw new Error("useToaster must be used within ToasterProvider");
  return ctx;
};

/** How long a toast stays up. Errors linger: they usually require action. */
const TOAST_DURATION_MS = 7000;
const ERROR_TOAST_DURATION_MS = 10000;

export const ToasterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Monotonic ids: two toasts in the same millisecond must not share one.
  const nextId = useRef(1);

  const removeToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const showToast = (toast: Omit<Toast, "id">) => {
    const id = nextId.current++;
    setToasts((prev) => [...prev, { ...toast, id }]);
    // Remove by id, not from the front — overlapping timers were popping
    // whichever toast happened to be oldest, including ones just shown.
    setTimeout(
      () => removeToast(id),
      toast.type === "error" ? ERROR_TOAST_DURATION_MS : TOAST_DURATION_MS,
    );
  };

  return (
    <ToasterContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4" style={{ zIndex: 9999 }}>
        {toasts.map((toast) => (
          <div
            key={toast.id}
            // role="alert"/"status" makes insertion announce to screen
            // readers; without it every toast was visual-only.
            role={toast.type === "error" ? "alert" : "status"}
            className={clsx(
              "bg-white rounded-none shadow-lg py-3 pl-6 pr-2 text-base text-gray-900 flex items-start gap-2 border border-gray-200",
              toast.type === "success" && "border-l-4 border-l-green-500",
              toast.type === "error" && "border-l-4 border-l-primary",
              toast.type === "loading" && "border-l-4 border-l-gray-500",
            )}
            style={{ minWidth: "320px", maxWidth: "400px" }}
          >
            <div className="flex flex-col gap-1 flex-1 py-1">
              {toast.title && <div className="font-bold text-black">{toast.title}</div>}
              {toast.description && (
                <div className="text-sm text-gray-700 leading-snug">{toast.description}</div>
              )}
              {toast.action && (
                <button
                  className="bg-transparent border-none text-primary font-semibold cursor-pointer mt-2 self-end"
                  onClick={toast.action.onClick}
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => removeToast(toast.id)}
              className="shrink-0 w-11 h-11 -my-1 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
};
