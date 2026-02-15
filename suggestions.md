# Feature Suggestions — Veteran-Specific Enhancements

> For leadership review — these features differentiate Vetriconn as a **veteran-first** platform.
> Generated from industry analysis of Hire Heroes USA, Military.com, VetJobs, and Recruit Military.

---

## 1. Military Service Details (Structured Profile Section)

### What it is

A dedicated "Military Service" section on the user profile that captures structured data about a veteran's service history.

### Fields to collect

| Field               | Type          | Example                                                  |
| ------------------- | ------------- | -------------------------------------------------------- |
| Branch of service   | Select        | Army, Navy, Air Force, Marines, Coast Guard, Space Force |
| Rank at discharge   | Text / Select | E-5 / Sergeant                                           |
| MOS / AFSC / Rating | Text          | 11B (Infantryman), 0311, IT2                             |
| Service dates       | Date range    | Jan 2012 – Dec 2020                                      |
| Discharge type      | Select        | Honorable, General, Other Than Honorable                 |
| Duty stations       | Multi-text    | Fort Bragg, Camp Pendleton, Ramstein AB                  |

### Why it matters

- **Every serious veteran job board** (Hire Heroes, VetJobs, Recruit Military) collects this as structured data
- Enables employers to search/filter by branch, rank, and clearance
- Feeds the MOS-to-civilian translator (see below)
- Establishes credibility — "this is a real veteran platform"

### Implementation scope

- **Backend:** Add `military_service` object to user schema
- **Frontend:** New profile section with form fields + display card
- **Effort estimate:** Medium (2–3 days)

---

## 2. MOS-to-Civilian Job Title Translator

### What it is

A tool that takes a veteran's Military Occupational Specialty (MOS) code and automatically suggests equivalent civilian job titles and transferable skills.

### How it works

1. Veteran enters their MOS code (e.g., "11B") or selects from a dropdown
2. System maps it to civilian equivalents: "Team Leader", "Operations Manager", "Security Specialist"
3. Auto-suggests skills to add to their profile: "Leadership", "Risk Assessment", "Team Management"
4. Optionally auto-fills `job_title` and `skills[]` fields

### Why it matters

- **The #1 pain point** for transitioning veterans is "translating" military experience into civilian terms
- Hire Heroes USA pairs every veteran with a human transition specialist for exactly this task
- Military.com has a digital MOS translator — it's the most-used tool on their site
- Reduces friction → higher profile completion → better job matches

### Data source options

- O\*NET (U.S. Department of Labor) — free, comprehensive crosswalk database
- Military.com's translator API (if available for partnership)
- Custom-built mapping table (start with top 50 most common MOS codes)

### Implementation scope

- **Backend:** MOS-to-civilian mapping table/API, endpoint to query translations
- **Frontend:** Interactive translator widget on profile page + standalone tool page
- **Effort estimate:** Medium-High (3–5 days depending on data source)

---

## 3. Veteran Verification Badge

### What it is

A visible "Verified Veteran" badge on user profiles, earned by uploading DD-214 (Certificate of Release or Discharge) or verifying through ID.me.

### How it works

1. Veteran uploads DD-214 or connects via ID.me OAuth
2. Admin or automated system reviews/validates
3. Profile receives a visible ✓ badge ("Verified Veteran")

### Why it matters

- Builds trust for employers — they know they're hiring actual veterans
- Unlocks veteran-specific features and job listings
- Hire Heroes USA, VetJobs, and Military.com all verify veteran status
- Positions Vetriconn as a trustworthy, mission-driven platform

### Implementation scope

- **Backend:** Verification status field on user model, admin review queue, secure document storage
- **Frontend:** Upload flow, badge display, admin review interface
- **Effort estimate:** High (5–7 days including security considerations for PII)

---

## 4. Security Clearance Field

### What it is

A dedicated profile field for active/expired security clearance level.

### Options

| Level        | Description                                      |
| ------------ | ------------------------------------------------ |
| None         | No clearance                                     |
| Confidential | Basic clearance                                  |
| Secret       | Mid-level clearance                              |
| Top Secret   | High-level clearance                             |
| TS/SCI       | Top Secret / Sensitive Compartmented Information |

Also: **Active/Expired** toggle and **Expiration date** field.

### Why it matters

- Active security clearances are a **massive** hiring differentiator — ClearanceJobs.com exists solely for this
- Employers in defense, intelligence, and government contracting filter candidates by clearance level
- Many veteran-friendly employers (Booz Allen, Leidos, SAIC, Raytheon) specifically seek cleared veterans
- VetJobs and Recruit Military both surface clearance level prominently

### Implementation scope

- **Backend:** Two fields on user model (`clearance_level`, `clearance_active`)
- **Frontend:** Dropdown + toggle on profile, displayed on profile card
- **Effort estimate:** Low (half a day)

---

## 5. Transition Timeline / ETS Date

### What it is

An "Estimated Time of Separation" date field for service members who are still active duty but preparing to transition to civilian life.

### How it works

- Veteran sets their ETS date (e.g., "June 2026")
- Platform uses this to:
  - Show employers when the candidate will be available
  - Trigger timely transition resources and job alerts
  - Tailor onboarding (e.g., "You separate in 4 months — start building your civilian resume")

### Why it matters

- Hire Heroes USA and VetJobs both collect ETS date — it's standard for veteran platforms
- Many veterans start job searching 6–12 months before separation
- Employers in veteran hiring programs specifically plan around ETS dates
- Creates a natural engagement loop (progressively more actionable content as ETS approaches)

### Implementation scope

- **Backend:** `ets_date` field on user model
- **Frontend:** Date picker on profile, display as "Available: June 2026"
- **Effort estimate:** Low (half a day)

---

## Priority Recommendation

| #   | Feature                        | Impact   | Effort      | Suggested Order   |
| --- | ------------------------------ | -------- | ----------- | ----------------- |
| 4   | Security Clearance Field       | High     | Low         | ✅ Do first       |
| 5   | Transition Timeline / ETS Date | High     | Low         | ✅ Do first       |
| 1   | Military Service Details       | Critical | Medium      | 🔜 Do second      |
| 2   | MOS-to-Civilian Translator     | Critical | Medium-High | 🔜 Do third       |
| 3   | Veteran Verification Badge     | High     | High        | 📋 Plan for later |

Items 4 and 5 can be added to the existing profile in under a day. Items 1 and 2 are the strategic differentiators that make Vetriconn a real veteran platform. Item 3 requires careful security planning for PII handling.
