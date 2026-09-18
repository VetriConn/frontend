import { isDrawerOpen } from "./anchors";

/**
 * The tour's step definitions.
 *
 * Phase 2 copy. Two sentences a step at most, and every step names its
 * subject in words rather than relying on the spotlight, because the
 * highlight is not available to a screen reader and is not much use to
 * anyone reading at 125%.
 *
 * No dashes of any kind in this copy. Ranges read as "to" and clauses are
 * separated with commas and full stops, which is how people actually write.
 *
 * A step is dropped, not broken, when its anchor is absent: an account with no
 * company has no `nav-companies` element and simply sees a shorter tour with a
 * correct "n of m".
 */

export interface TourStep {
  /** Stable id, also used as the React key. */
  id: string;
  /** `data-tour` anchor. Omit for a step that is centred on screen. */
  anchor?: string;
  title: string;
  body: string;
  /**
   * Only include this step when the nav is in its drawer layout.
   *
   * Used by the one step that asks the reader to open the menu, which would
   * be nonsense on a desktop bar where the items are already on screen.
   */
  drawerOnly?: boolean;
  /**
   * Hold this step until the reader does something, rather than showing Next.
   *
   * The tour advances by itself once the predicate passes. Only the open-the-
   * menu step uses it, and it is what replaced the tour clicking the drawer
   * open behind the reader's back.
   */
  waitFor?: () => boolean;
}

export const BASE_TOUR: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to your dashboard",
    body: "One account does everything here. You can apply for jobs and post them, so there is nothing else to set up.",
  },
  {
    id: "open-menu",
    anchor: "nav-menu-toggle",
    drawerOnly: true,
    waitFor: () => isDrawerOpen(),
    title: "Open the menu",
    body: "On a small screen everything lives behind this button. Tap it to carry on, and it will stay open for the rest of this tour.",
  },
  {
    id: "find-jobs",
    anchor: "nav-find-jobs",
    title: "Find Jobs",
    body: "Search and browse openings from here. Anything worth a second look can be saved, and your saved searches sit in the same menu.",
  },
  {
    id: "postings",
    anchor: "nav-postings",
    title: "My Postings",
    body: "Post a job and see who has applied. This is the same account you apply with, so you do not need a separate employer login.",
  },
  {
    id: "inbox",
    anchor: "nav-inbox",
    title: "Inbox",
    body: "Messages with employers, and with people who apply to you, all arrive here. You will get a notification when something new lands.",
  },
  {
    id: "companies",
    anchor: "nav-companies",
    title: "Companies",
    body: "Your company page and the people on your team. This only appears once your account belongs to a company.",
  },
  {
    id: "account",
    anchor: "nav-account",
    title: "Your profile and settings",
    body: "Your profile is what helps employers find you, so it is worth filling in. Settings is also where you change the text size, and where you can start this tour again.",
  },
];

/**
 * The company tour, shown on a first visit to the Companies page.
 *
 * Kept separate from the base tour rather than appended to it. Six steps is
 * already the limit of what people finish, and these three are only relevant
 * to an account that has a company, which most will not have on day one.
 */
export const COMPANY_TOUR: TourStep[] = [
  {
    id: "co-companies",
    anchor: "nav-companies",
    title: "Your companies",
    body: "Everything about the company lives here: its public page, its details, and the people on the team.",
  },
  {
    id: "co-postings",
    anchor: "nav-postings",
    title: "Posting as the company",
    body: "Jobs you post are shown under the company name once it is approved. Drafts stay private until you publish them.",
  },
  {
    id: "co-applicants",
    anchor: "nav-postings",
    title: "Who has applied",
    body: "Applicants for every company posting are in this menu. Anyone on the team with the right role can review them.",
  },
];

/** Which tours exist. The key is what the API is told on completion. */
export const TOURS = {
  dashboard: BASE_TOUR,
  company: COMPANY_TOUR,
} as const;

export type TourId = keyof typeof TOURS;

