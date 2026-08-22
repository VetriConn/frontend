"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

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

  // These preferences belong to the signed-in app, not the public marketing
  // and auth pages — those have fixed, deliberately composed layouts that
  // should look the same for everyone. The provider stays at the root so the
  // settings screen can read and write them, but the DOM effects below only
  // take hold inside /dashboard; elsewhere the document renders at its
  // defaults regardless of what's stored.
  const pathname = usePathname();
  const inApp = pathname?.startsWith("/dashboard") ?? false;

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

  // Apply text-size to <html> — but only inside the app. On public routes the
  // style is removed, so a stored preference never reshapes a marketing or
  // auth page.
  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    if (inApp && state.textSize !== "normal") {
      html.style.fontSize = TEXT_SIZE_MAP[state.textSize];
    } else {
      html.style.removeProperty("font-size");
    }
  }, [state.textSize, mounted, inApp]);

  // Apply high-contrast class to <html> — likewise app-only.
  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    if (inApp && state.highContrast) {
      html.classList.add("high-contrast");
    } else {
      html.classList.remove("high-contrast");
    }
  }, [state.highContrast, mounted, inApp]);

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
