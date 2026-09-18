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
}

export const BASE_TOUR: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to your dashboard",
    body: "One account does everything here. You can apply for jobs and post them, so there is nothing else to set up.",
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
