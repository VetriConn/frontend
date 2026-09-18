/**
 * The tour's step definitions.
 *
 * Phase 1 of the spec deliberately ships placeholder copy. The mechanism is
 * the risky part, and writing real copy against a mechanism that still moves
 * means writing it twice. Phase 2 replaces `title` and `body` here and nothing
 * else.
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
    body: "One account does both things here: you can apply for jobs and post them. This is a quick look at where everything lives.",
  },
  {
    id: "find-jobs",
    anchor: "nav-find-jobs",
    title: "Find Jobs",
    body: "Browse and search openings, and keep the ones worth another look under Saved Jobs.",
  },
  {
    id: "postings",
    anchor: "nav-postings",
    title: "My Postings",
    body: "Post a job and track who has applied. This is the same account you apply with, so you do not need a second one.",
  },
  {
    id: "inbox",
    anchor: "nav-inbox",
    title: "Inbox",
    body: "Messages between you and employers, or you and applicants, all land here.",
  },
  {
    id: "companies",
    anchor: "nav-companies",
    title: "Companies",
    body: "Your company profile and team. This step only appears once your account belongs to a company.",
  },
  {
    id: "account",
    anchor: "nav-account",
    title: "Your profile and settings",
    body: "Your profile, which is what helps employers find you, lives here. So does the text size control, and the button to watch this tour again.",
  },
];
