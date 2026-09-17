# Dashboard tour: plan

A guided walkthrough of the dashboard, shown once on a new account's first
visit and replayable afterwards from Account Settings.

Status: **planned, not started.** This document is the brief for the session
that builds it.

## Settled decisions

- Runs **once automatically** on the first dashboard visit.
- **Replayable** from Account Settings. This is not a nice-to-have for an
  audience that skews 45+, where "can I see that again" is a normal request.
- One tour, not two. There is no seeker versus employer split to honour
  (see below).

## The hard part is not the steps

Three things make this harder here than a normal product tour, and all three
have bitten this codebase before.

### 1. The element a step points at may not be on screen

`DashboardNavbar` swaps the desktop bar for the drawer at `xl` instead of `lg`
when the accessibility text setting is not "normal"
(`components/ui/DashboardNavbar.tsx`, the `scaled` branch). So between 1024px
and 1280px, "Find Jobs" is a visible nav item at 100% text and a collapsed
drawer at 125%.

That switch is decided in JavaScript on purpose, because **a media query cannot
see the text setting**: `rem` inside a media query resolves against the
browser's initial 16px, never the scaled root font size, so `lg:` fires at
exactly 1024px no matter what the user picked.

**Rule:** a tour step must never anchor to an element whose presence depends on
a breakpoint. Either anchor to a stable wrapper that exists in both layouts, or
read `useAccessibility()` the same way the navbar does and branch the step, or
open the drawer as part of the step.

### 2. Half the nav is conditional on account state

Company entries only render once the account actually belongs to a company, and
postings, drafts, applicants and billing follow the same logic.

**Rule:** every step declares a precondition and is **skipped rather than
broken** when its target is absent. The step list is computed at runtime from
what is actually in the DOM, not hardcoded.

### 3. There is one account type

Not job seeker versus employer. The same account applies for jobs and posts
them. So there is one tour, whose company-related half simply does not appear
for accounts without a company.

## Architecture

**Anchors.** Add `data-tour="<id>"` attributes to targets. Never select by CSS
class or `nth-child`; both move the first time someone restyles the nav.

**`TourProvider`.** Context holding the resolved step list, current index, and
`start` / `next` / `back` / `stop`. Resolves the step list on start by querying
for each step's anchor and dropping the ones that are absent.

**`TourSpotlight`.** A portal rendering an overlay with a cutout over the
target's bounding rect, plus a popover positioned against it. Measure with
`getBoundingClientRect` on step change, resize and scroll.

**Sizing.** Everything in `rem`, including the popover width, the padding and
the cutout inset. A tour built in `px` will drift out of alignment at 112% and
125% exactly the way the avatar did, because the thing it points at grows and
the thing pointing at it does not.

**Scrolling.** `scrollIntoView({ block: "center" })` before measuring, then
wait a frame before positioning. Measuring during the scroll gives a stale rect.

## Persistence

**Server side, not `localStorage`.** This audience uses a phone and a laptop,
and `localStorage` means the tour ambushes them again on the second device.

Proposed: a nullable timestamp on the profile, `tour_completed_at`, written
when the tour finishes or is skipped, read on dashboard mount.

Replaying from settings starts the tour for that session only. It does **not**
clear the stored timestamp, so replaying does not re-arm the automatic trigger.

## Accessibility

Non-negotiable given the audience, and cheap if done from the start:

- Focus moves into the popover on each step. Escape exits the tour.
- One `aria-live` region announcing each step, so the tour is not silent to a
  screen reader.
- Next, Back and Skip at a minimum 44px target, which under `rem` sizing means
  `2.75rem` so the target grows with the text setting rather than staying put.
- Honour `prefers-reduced-motion`. `globals.css` already has the blocks for it.
- The spotlight must not be the only signal. Colour and a cutout alone are not
  enough; the popover text must name what it is pointing at.

## Steps

Keep the base tour to six. Nobody finishes eleven, and an unfinished tour is
worse than a short one because it trains people to dismiss it.

**Base, always shown**

1. Welcome, and the one thing people get wrong: this single account both
   applies for jobs and posts them.
2. Find Jobs.
3. Applications, where what you sent is tracked.
4. Inbox.
5. Profile, framed as the thing that makes you findable rather than as a chore.
6. Account Settings, pointing out the text size control and where to replay
   this tour.

**Company, only when the account has one.** Recommended as a *separate* short
tour triggered the first time the Companies page is opened, rather than bolting
three more steps onto the end of the base tour:

7. Companies.
8. Post a Job and My Postings.
9. Applicants.

## Phasing

**Phase 1, the mechanism.** Provider, spotlight, positioning, persistence and
the settings replay entry, driven by two throwaway steps. Nothing about copy.

**Phase 2, the real base tour.** The six steps and their copy.

**Phase 3, the company tour.** The conditional second tour.

Verify each phase at **all three text sizes** and at three widths (mobile,
the 1024 to 1280 band where the breakpoint switch bites, and wide desktop).
The middle band is where this will break, so test it first, not last.

## Open questions for the build session

1. **Does the tour navigate between pages, or stay put?** Navigating unmounts
   the anchors mid-tour and makes state much harder. Recommendation: a
   single-page tour on the dashboard home that points at nav entries, rather
   than one that visits each page.
2. **Where does `tour_completed_at` live**, profile or user, and does the
   existing profile update endpoint accept it or is a new one needed?
3. **What happens if the tour is interrupted** by a reload halfway. Resume at
   the same step, or treat it as seen? Recommendation: treat it as seen, and
   rely on the replay entry.
