"use client";

import { SWRConfig } from "swr";

/**
 * App-wide SWR defaults. Without this, every mounted list refetched on every
 * window refocus — an admin flicking between tabs re-ran every count and
 * table query on each return. Data here changes through explicit actions
 * (which already call mutate), so refocus revalidation buys nothing; a
 * mount-time fetch plus action-driven mutates keeps everything current.
 * Hooks that need live behavior opt back in per-call (e.g. refreshInterval).
 */
const SWRProvider = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig
    value={{
      revalidateOnFocus: false,
      // One identical request per key per 15s window; actions that need
      // fresher data call mutate() directly.
      dedupingInterval: 15_000,
    }}
  >
    {children}
  </SWRConfig>
);

export default SWRProvider;
