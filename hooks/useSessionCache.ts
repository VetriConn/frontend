"use client";

import { useCallback } from "react";
import { useSWRConfig } from "swr";
import { getUserProfile } from "@/lib/api";
import { PROFILE_KEY } from "./useUserProfile";

/**
 * Drop every cached response when the signed-in identity changes.
 *
 * SWR's cache is keyed by URL, not by user, and it lives as long as the page.
 * Both auth transitions are soft navigations — sign-in does
 * `router.push("/dashboard")`, sign-out does `router.replace("/signin")` — so
 * the React tree survives, and so does the cache. Sign in as one person after
 * another and the second one is handed the first one's data under the same
 * keys: their name and avatar in the header, their saved jobs, their
 * applications, their inbox.
 *
 * `/auth/profile` made it worst of all, holding three settings that each
 * extend the window on their own: `dedupingInterval: 60_000` reuses the
 * previous answer for a full minute without asking, `keepPreviousData: true`
 * keeps serving it even once a refetch is in flight, and
 * `revalidateOnFocus: false` means returning to the tab does not correct it.
 * Its comment said "sign-in and sign-out call mutate() directly" — nothing
 * ever did. This is that call, and it covers every key rather than the one
 * that was noticed, because most of the twenty-odd useSWR hooks in the app
 * are per-user too.
 *
 * Not solved by rendering the shell on the server: the server would render
 * the right person, and hydration would paint the cached wrong one straight
 * over the top. The staleness is client-side and identity-shaped, so it has
 * to be cleared where it lives.
 */
export function useSessionCache(): {
  /**
   * @param revalidate Refetch mounted keys immediately. False on sign-out,
   * where every refetch would only earn a 401.
   */
  resetSessionCache: (revalidate: boolean) => Promise<unknown>;
  /**
   * Sign-in: drop the previous account, then fetch and seed the new profile
   * before anything renders off it. Returns the new role, which decides where
   * the session starts — routing on a stale or absent role is what made an
   * admin watch the job-seeker dashboard load first.
   */
  startSession: () => Promise<string | undefined>;
} {
  const { mutate } = useSWRConfig();

  const resetSessionCache = useCallback(
    (revalidate: boolean) =>
      // `() => true` matches every key in the cache.
      mutate(() => true, undefined, { revalidate }),
    [mutate],
  );

  const startSession = useCallback(async (): Promise<string | undefined> => {
    // No revalidate: the seed below is the fetch, and asking twice would race.
    await mutate(() => true, undefined, { revalidate: false });

    const profile = await getUserProfile();
    // Written under the key useUserProfile reads, so the destination page
    // renders the right person on its first frame rather than its loading
    // state — and keepPreviousData has nothing stale left to fall back on.
    await mutate(PROFILE_KEY, profile, { revalidate: false });

    return profile.data?.user?.role;
  }, [mutate]);

  return { resetSessionCache, startSession };
}
