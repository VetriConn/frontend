"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ─── Types ──────────────────────────────────────────────────────────────────────

export type TextSize = "normal" | "large" | "extra-large";

interface AccessibilityState {
  textSize: TextSize;
  highContrast: boolean;
}

interface AccessibilityContextValue extends AccessibilityState {
  setTextSize: (size: TextSize) => void;
  setHighContrast: (enabled: boolean) => void;
}

const STORAGE_KEY = "vetriconn-accessibility";

const defaults: AccessibilityState = {
  textSize: "normal",
  highContrast: false,
};

// ─── Font-size mapping ──────────────────────────────────────────────────────────

const TEXT_SIZE_MAP: Record<TextSize, string> = {
  normal: "100%",
  large: "112%",
  "extra-large": "125%",
};

// ─── Context ────────────────────────────────────────────────────────────────────

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null,
);

// ─── Provider ───────────────────────────────────────────────────────────────────

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(defaults);
  const [mounted, setMounted] = useState(false);

  // Load persisted preferences on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<AccessibilityState>;
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // ignore parse errors
    }
    setMounted(true);
  }, []);

  // Persist whenever state changes (after mount)
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, mounted]);

  // Apply text-size to <html> element
  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    html.style.fontSize = TEXT_SIZE_MAP[state.textSize];
  }, [state.textSize, mounted]);

  // Apply high-contrast class to <html> element
  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    if (state.highContrast) {
      html.classList.add("high-contrast");
    } else {
      html.classList.remove("high-contrast");
    }
  }, [state.highContrast, mounted]);

  const setTextSize = useCallback((size: TextSize) => {
    setState((prev) => ({ ...prev, textSize: size }));
  }, []);

  const setHighContrast = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, highContrast: enabled }));
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        textSize: state.textSize,
        highContrast: state.highContrast,
        setTextSize,
        setHighContrast,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "useAccessibility must be used within an <AccessibilityProvider>",
    );
  }
  return ctx;
}
