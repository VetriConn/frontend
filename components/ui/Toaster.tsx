"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
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

export const ToasterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, "id">) => {
    setToasts((prev) => [...prev, { ...toast, id: Date.now() }]);
    setTimeout(() => setToasts((prev) => prev.slice(1)), 3500);
  };

  return (
    <ToasterContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4" style={{ zIndex: 9999 }}>
        {toasts.map((toast) => (
          <div key={toast.id} className={clsx("bg-white rounded-none shadow-lg py-3 px-6 text-base text-gray-900 flex flex-col gap-1 border border-gray-200", toast.type === "success" && "border-l-4 border-l-green-500", toast.type === "error" && "border-l-4 border-l-primary", toast.type === "loading" && "border-l-4 border-l-gray-500")} style={{ minWidth: '320px', maxWidth: '400px' }}>
            {toast.title && <div className="font-bold text-black">{toast.title}</div>}
            {toast.description && <div className="text-[0.85em] text-gray-700 leading-tight">{toast.description}</div>}
            {toast.action && <button className="bg-transparent border-none text-primary font-semibold cursor-pointer mt-2 self-end" onClick={toast.action.onClick}>{toast.action.label}</button>}
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
};
