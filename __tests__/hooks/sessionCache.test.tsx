/**
 * One account's cached data must not survive into the next account's session.
 *
 * SWR keys are URLs, not identities, and its cache lives as long as the page.
 * Both auth transitions are soft navigations — `router.push("/dashboard")` and
 * `router.replace("/signin")` — so the tree unmounts but the cache does not.
 * Sign in as one person after another and the second is handed the first's
 * data under the same keys: name and avatar in the header, saved jobs,
 * applications, inbox.
 *
 * `/auth/profile` widened the window three ways at once: a 60s
 * dedupingInterval, keepPreviousData, and no revalidate-on-focus.
 *
 * These tests share one cache across renders, because that is the thing under
 * test. A fresh cache per render would pass whether or not the fix exists.
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SWRConfig } from "swr";
import useSWR from "swr";
import type { State } from "swr";
import "@testing-library/jest-dom";
import { useSessionCache } from "@/hooks/useSessionCache";

/** Mirrors useUserProfile's real options — they are what make this bite. */
const PROFILE_OPTIONS = {
  revalidateOnFocus: false,
  keepPreviousData: true,
  shouldRetryOnError: false,
  dedupingInterval: 60_000,
} as const;

let currentUser = "Ada";
const fetchProfile = jest.fn(async () => ({ full_name: currentUser }));
const fetchSavedJobs = jest.fn(async () => [`${currentUser}-saved-job`]);

/** One cache for the whole page, exactly as the app has. */
let cache: Map<string, State>;

function Harness({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={{ provider: () => cache }}>{children}</SWRConfig>;
}

function Header() {
  const { data } = useSWR("/auth/profile", fetchProfile, PROFILE_OPTIONS);
  return <span data-testid="who">{data?.full_name ?? "signed out"}</span>;
}

/**
 * The reset is fired from a button rather than captured into a module
 * variable, which react-hooks/globals rightly refuses — and this is closer to
 * how it is actually invoked, from a click handler.
 */
function Session({ revalidate }: { revalidate: boolean }) {
  useSWR("/saved-jobs", fetchSavedJobs, PROFILE_OPTIONS);
  const { resetSessionCache } = useSessionCache();
  return (
    <button onClick={() => void resetSessionCache(revalidate)}>reset</button>
  );
}

const cachedData = (key: string): unknown => cache.get(key)?.data;
const clickReset = () => userEvent.click(screen.getByRole("button", { name: "reset" }));

beforeEach(() => {
  cache = new Map();
  currentUser = "Ada";
  fetchProfile.mockClear();
  fetchSavedJobs.mockClear();
});

describe("an identity change", () => {
  it("hands the next session the previous account's data when nothing clears it", async () => {
    const first = render(
      <Harness>
        <Header />
      </Harness>,
    );
    await waitFor(() => expect(screen.getByTestId("who")).toHaveTextContent("Ada"));
    first.unmount();

    // Ada signs out, Bo signs in — soft navigation, so the cache survives.
    currentUser = "Bo";

    render(
      <Harness>
        <Header />
      </Harness>,
    );

    // This is the reported bug: Bo is shown Ada. Inside the 60s dedupe window
    // SWR answers from cache without asking, so it is not even a brief flash.
    expect(screen.getByTestId("who")).toHaveTextContent("Ada");
  });

  it("hands the next session nothing once the cache is cleared", async () => {
    const first = render(
      <Harness>
        <Header />
        <Session revalidate={false} />
      </Harness>,
    );
    await waitFor(() => expect(screen.getByTestId("who")).toHaveTextContent("Ada"));

    // The sign-out path: drop everything, ask for nothing.
    await clickReset();
    first.unmount();

    currentUser = "Bo";
    render(
      <Harness>
        <Header />
      </Harness>,
    );

    // Nothing cached, so the new mount fetches instead of being served Ada.
    await waitFor(() => expect(screen.getByTestId("who")).toHaveTextContent("Bo"));
  });

  it("clears every key, not just the one that was noticed", async () => {
    render(
      <Harness>
        <Header />
        <Session revalidate={false} />
      </Harness>,
    );
    await waitFor(() => expect(cachedData("/auth/profile")).toBeDefined());
    await waitFor(() => expect(cachedData("/saved-jobs")).toEqual(["Ada-saved-job"]));

    await clickReset();

    // Asserted on the cache rather than on rendered output: keepPreviousData
    // means a component that stays mounted goes on painting the old value
    // even once its entry is emptied. In the app both transitions navigate
    // away, so what matters is what the NEXT mount finds — which is this.
    expect(cachedData("/auth/profile")).toBeUndefined();
    expect(cachedData("/saved-jobs")).toBeUndefined();
  });

  it("refetches immediately when asked to, for the sign-in path", async () => {
    render(
      <Harness>
        <Header />
        <Session revalidate />
      </Harness>,
    );
    await waitFor(() => expect(screen.getByTestId("who")).toHaveTextContent("Ada"));
    const before = fetchProfile.mock.calls.length;

    currentUser = "Bo";
    await clickReset();

    // revalidate:true is what keeps chrome that survives the navigation from
    // sitting empty; without it the header would wait out the dedupe window.
    expect(fetchProfile.mock.calls.length).toBeGreaterThan(before);
    await waitFor(() => expect(screen.getByTestId("who")).toHaveTextContent("Bo"));
  });
});
