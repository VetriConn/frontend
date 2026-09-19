import type { ConfirmDialogProps } from "./ConfirmDialog";

/**
 * The words in the admin confirm dialogs, in one place.
 *
 * Three of these dialogs are raised from two screens each: a table or queue
 * row action, and the detail drawer's own button for the very same record.
 * Both have to ask the same question, because an admin who suspends a user
 * from the list and an admin who suspends that user from the drawer are
 * doing one thing, not two. They did ask the same question, letter for
 * letter, in two files at once. Nothing was holding them to it.
 *
 * What is shared here is the copy, not the component. ConfirmDialog is
 * already the one dialog and stays the one dialog: these are prop objects
 * the call sites spread into it. The alternative, a small preset component
 * per dialog, would have put six wrappers around one dialog and left the
 * next variant wanting a seventh. A record of words wants only another
 * entry, and an entry costs nothing to read past.
 *
 * Everything that is not a word stays at the call site. open, subject, busy,
 * onClose and onConfirm are wired to one screen's own state and would mean
 * nothing here.
 *
 * Not every confirm dialog is in this file. The two job dialogs are raised
 * from the same two-screen pairing and say genuinely different things from
 * each place, down to which side of the transaction they name: the drawer
 * tells the admin "The employer will be notified", the table says the reason
 * "is shown to the poster". That reads like a decision, or at least like one
 * somebody has to make on purpose, so it was left where it is.
 */
type ConfirmCopy = Pick<
  ConfirmDialogProps,
  | "title"
  | "description"
  | "confirmLabel"
  | "tone"
  | "reasonLabel"
  | "reasonPlaceholder"
>;

/**
 * Suspending and reinstating are the same dialog wearing two faces, which is
 * why this one is a function while the others are constants. Five separate
 * ternaries on the same boolean were spelled out at both call sites; here
 * the boolean is read once.
 */
export const userStandingConfirm = (suspending: boolean): ConfirmCopy =>
  suspending
    ? {
        title: "Suspend this user?",
        description:
          "Suspended users cannot sign in or apply to jobs until reinstated.",
        reasonLabel: "Reason",
        reasonPlaceholder: "Note why this user is being suspended",
        confirmLabel: "Suspend User",
        tone: "danger",
      }
    : {
        title: "Reinstate this user?",
        description: "The user will regain access immediately.",
        confirmLabel: "Reinstate User",
        tone: "neutral",
      };

export const REMOVE_POST_CONFIRM: ConfirmCopy = {
  title: "Remove this post?",
  description:
    "The post will be hidden from the community immediately. The author will be notified.",
  reasonLabel: "Reason for removal",
  reasonPlaceholder: "What guideline did this post violate?",
  confirmLabel: "Confirm Removal",
};

export const REJECT_COMPANY_CONFIRM: ConfirmCopy = {
  title: "Reject this company?",
  description: "A reason is required and is shown to the applicant.",
  reasonLabel: "Reason for rejection",
  reasonPlaceholder: "What was missing or wrong?",
  confirmLabel: "Reject Company",
  tone: "danger",
};
