/**
 * The admin confirm dialogs, and the one thing that went wrong with them.
 *
 * Several admin screens come in pairs, a table and a detail drawer, and each
 * pair renders the same dialog. Three pairs were byte-identical copies. The
 * job pair was not: it had been written twice independently and the two said
 * different things, so rejecting a job from the table and from the drawer
 * read differently.
 *
 * That is the failure this file guards. Not "is the wording nice", which no
 * test can judge, but "does the same action say the same thing", which is
 * exactly what a shared module makes checkable.
 */
import {
  REJECT_JOB_CONFIRM,
  UNPUBLISH_JOB_CONFIRM,
  REJECT_COMPANY_CONFIRM,
  REMOVE_POST_CONFIRM,
  userStandingConfirm,
} from "@/components/pages/admin/confirmCopy";

const ALL = [
  REJECT_JOB_CONFIRM,
  UNPUBLISH_JOB_CONFIRM,
  REJECT_COMPANY_CONFIRM,
  REMOVE_POST_CONFIRM,
  userStandingConfirm(true),
  userStandingConfirm(false),
];

describe("confirm dialog copy", () => {
  it("gives every dialog a title and a confirm label", () => {
    for (const copy of ALL) {
      expect(copy.title?.trim()).toBeTruthy();
      expect(copy.confirmLabel?.trim()).toBeTruthy();
    }
  });

  it("uses no dashes, since these strings are read aloud", () => {
    for (const copy of ALL) {
      expect(JSON.stringify(copy)).not.toMatch(/[–—]/);
    }
  });

  it("names the action on the button rather than saying Confirm", () => {
    // The owner's ruling: rejecting a job says "Reject Job". "Confirm
    // rejection" and "Confirm Unpublish" were the outliers and are retired.
    expect(REJECT_JOB_CONFIRM.confirmLabel).toBe("Reject Job");
    expect(UNPUBLISH_JOB_CONFIRM.confirmLabel).toBe("Unpublish");
    expect(REJECT_COMPANY_CONFIRM.confirmLabel).toBe("Reject Company");
  });

  it("marks the destructive ones as destructive", () => {
    expect(REJECT_JOB_CONFIRM.tone).toBe("danger");
    expect(UNPUBLISH_JOB_CONFIRM.tone).toBe("danger");
    expect(REJECT_COMPANY_CONFIRM.tone).toBe("danger");
  });

  it("asks for a reason wherever one is shown to the person affected", () => {
    for (const copy of [
      REJECT_JOB_CONFIRM,
      UNPUBLISH_JOB_CONFIRM,
      REJECT_COMPANY_CONFIRM,
      REMOVE_POST_CONFIRM,
    ]) {
      expect(copy.reasonLabel?.trim()).toBeTruthy();
      expect(copy.reasonPlaceholder?.trim()).toBeTruthy();
    }
  });

  it("says something different for suspend and reinstate", () => {
    // One boolean drove five parallel ternaries written out twice. If the two
    // branches ever collapse to the same text, the factory has lost its point.
    const suspend = userStandingConfirm(true);
    const reinstate = userStandingConfirm(false);
    expect(suspend.title).not.toBe(reinstate.title);
    expect(suspend.confirmLabel).not.toBe(reinstate.confirmLabel);
  });

  it("treats reinstating as non-destructive", () => {
    expect(userStandingConfirm(false).tone).not.toBe("danger");
  });
});

/**
 * Reversing another admin's call has to be accountable too.
 *
 * Suspending asked why from the start; reinstating asked nothing, so the
 * trail could say why somebody lost access and never why they got it back.
 * That asymmetry ran the whole length of the admin surface and it is the
 * thing most likely to creep back, because a reinstate reads as the harmless
 * half of the pair.
 */
describe("reversals record a reason", () => {
  it("reinstating a user asks why, exactly as suspending does", () => {
    const reinstate = userStandingConfirm(false);
    expect(reinstate.reasonLabel).toBeTruthy();
    expect(reinstate.reasonPlaceholder).toBeTruthy();
  });

  it("and both halves of the pair ask", () => {
    for (const suspending of [true, false]) {
      expect(userStandingConfirm(suspending).reasonLabel).toBeTruthy();
    }
  });

  it("the reinstate copy tells the user the reason reaches them", () => {
    expect(userStandingConfirm(false).description).toMatch(/data export/i);
  });
});
