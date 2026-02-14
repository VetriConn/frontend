# Frontend Issues & TODOs

> Last updated: Feb 14, 2026

---

## 🔴 Critical — Blocking Real Usage

### 1. `lib/dummy-jobs.ts` — Entire File Is Dummy Data

- **Status:** Temporary — delete when backend is fully wired
- **Description:** Contains `DUMMY_JOBS` (8 hardcoded `Job` objects) and `getDummyJob()` helper. Used as a fallback wherever the Jobs API isn't returning data.
- **Action needed:** Delete the file once all consumers reliably use the real API.
- **Consumers (remove fallback from each):**
  - `app/dashboard/jobs/page.tsx` — imports `DUMMY_JOBS`, falls back when `allJobs` is empty
  - `app/jobs/page.tsx` — imports `DUMMY_JOBS`, falls back when API returns empty
  - `app/jobs/[id]/JobDetailClient.tsx` — imports `getDummyJob`, falls back when SWR + SSR miss
  - `app/jobs/[id]/apply/page.tsx` — imports `getDummyJob`, falls back when `useJob` returns nothing

### 2. `app/dashboard/jobs/page.tsx` — Error State Permanently Suppressed

- **Status:** Workaround in place
- **Description:** `effectiveError` is hardcoded to `false` (line ~156) to always show dummy data instead of "Something went wrong". This masks real API errors.
- **Action needed:** Once the backend reliably serves jobs, restore proper error handling: `const effectiveError = allJobs.length > 0 ? false : isError;`

### 3. Job Application Form — Fake Submission

- **Status:** No backend endpoint exists
- **Description:** `handleSubmit` in `components/pages/jobs/JobApplicationForm.tsx` does `await new Promise((r) => setTimeout(r, 1500))` — a fake delay — then sets `isSubmitted = true`. **No API call is made.** The "Save Draft" button just calls `alert()`.
- **Action needed:**
  - Create backend `POST /api/v1/applications` endpoint
  - Wire `handleSubmit` to send form data to that endpoint
  - Implement draft persistence (localStorage or backend)
- **Files:** `components/pages/jobs/JobApplicationForm.tsx` (lines ~208-218)

### 4. Job Application Form — Hardcoded Skills List

- **Status:** Placeholder data
- **Description:** `AVAILABLE_SKILLS` is a hardcoded array of 12 generic skill strings. Skills should come from the job posting or a backend skills taxonomy.
- **Action needed:** Derive skills from `job.qualifications`/`job.tags`, or fetch from backend.
- **Files:** `components/pages/jobs/JobApplicationForm.tsx` (lines ~33-46)

### 5. Profile Page — Dummy Work Experience, Education & Documents

- **Status:** Hardcoded fallback data
- **Description:** Three dummy arrays (`dummyWorkExperience`, `dummyEducation`, `dummyDocuments`) are defined at the top of the profile page. New users always see fake military experience/education entries instead of empty state.
- **Action needed:**
  - Remove the three `dummy*` arrays
  - Initialize local state with `[]` when user has no data
  - Show proper empty-state UI ("Add your first work experience", etc.)
- **Files:** `app/dashboard/profile/page.tsx` (lines ~36-82, ~134-151)

### 6. Profile Header — Lorem Ipsum Bio Text

- **Status:** Hardcoded placeholder
- **Description:** `components/pages/profile/ProfileHeader.tsx` (lines ~102-116) renders two blocks of lorem ipsum text as the bio. This is always visible regardless of actual user data.
- **Action needed:** Only render `user.bio` from profile; remove lorem ipsum. Show placeholder prompt if bio is empty.

### 7. Document Upload — Not Wired to Backend

- **Status:** API exists, not connected
- **Description:** `handleAddDocument` in `app/dashboard/profile/page.tsx` (line ~328) only stores the uploaded file in local component state. Comment says `"TODO: Upload to backend (Cloudinary) when API is ready"` — but the API already exists.
- **Action needed:** Call the attachments upload API from `hooks/useAttachments.ts` inside `handleAddDocument`.
- **Files:** `app/dashboard/profile/page.tsx` (line ~328), `hooks/useAttachments.ts`

### 8. Profile Photo Edit — Placeholder Dialog

- **Status:** Not implemented
- **Description:** Photo edit dialog in `app/dashboard/profile/page.tsx` (line ~580) renders only `"Profile photo editing coming soon..."`. Backend endpoints already exist (`POST /api/v1/auth/profile-picture`, `DELETE /api/v1/auth/profile-picture`).
- **Action needed:** Build photo upload UI using existing backend endpoints.

---

## 🟡 Important — Missing Features

### 9. Save Job Button — No Frontend Integration

- **Status:** Backend endpoints exist, frontend not wired
- **Description:** "Save Job" button in `components/ui/JobDescriptor.tsx` (line ~377) has no click handler — purely visual. Backend already has `POST /api/v1/auth/saved-jobs`, `DELETE /api/v1/auth/saved-jobs/:jobId`, `GET /api/v1/auth/saved-jobs`.
- **Action needed:** Wire the button to save/unsave API calls. Track saved state per user.

### 10. Saved Jobs Page — Missing

- **Status:** Not created
- **Description:** `DashboardNavbar` links to a saved jobs section, but no dedicated saved jobs page/view exists.
- **Action needed:** Create saved jobs page using `GET /api/v1/auth/saved-jobs` endpoint.

### 11. Applied Jobs — No Backend Support

- **Status:** Pending backend implementation
- **Description:** `QuickActionsCard` accepts `appliedJobsCount` prop but always defaults to `0`. No backend field or endpoint exists to track job applications.
- **Action needed:** Add `applied_jobs: string[]` to user schema, create API endpoints.
- **Depends on:** Issue #3 (job applications endpoint)

### 12. `components/ui/RecommendedJobs.tsx` — Hardcoded Recommended Jobs

- **Status:** No backend endpoint exists
- **Description:** Contains inline `recommendedJobs` array (8 objects). SWR call is commented out. `isLoading` is hardcoded to `false`.
- **Action needed:** Create backend `GET /api/v1/jobs/recommended` endpoint and wire up SWR.

### 13. Forgot/Reset Password — Missing Frontend Pages

- **Status:** Backend endpoints exist, no frontend
- **Description:** Backend has `POST /api/v1/auth/forgot-password` and `POST /api/v1/auth/reset-password`, but no frontend pages exist for these flows.
- **Action needed:** Create `/auth/forgot-password` and `/auth/reset-password` pages.

### 14. Employer Dashboard — Entirely Placeholder

- **Status:** Not started
- **Description:** `app/dashboard/employer/index.tsx` renders only "Employer Dashboard — Under Development" with an emoji. No real functionality.
- **Action needed:** Build employer dashboard (post jobs, manage listings, view applicants, analytics).

---

## 🟢 Cleanup — Code Quality

### 15. `lib/api.ts` — 35+ Console.log Debug Statements

- **Status:** Cleanup needed for production
- **Description:** Extensive `console.log` calls logging request URLs, response status, response data across all API functions. Also present in `lib/api/auth.ts` and `components/ui/DashboardNavbar.tsx`.
- **Action needed:** Remove or replace with proper logging service before production.

### 16. Duplicate API Functions

- **Status:** Redundant code
- **Description:** `loginUser`, `logoutUser`, `registerUser` exist in both `lib/api.ts` and `lib/api/auth.ts` with slightly different implementations.
- **Action needed:** Consolidate into a single source of truth.

### 17. Contact Form Endpoint Inconsistency

- **Status:** Potential bug
- **Description:** `sendContactMessage` in `lib/api.ts` posts to `${API_BASE_URL}/messages` — the **only** endpoint without the `/api/v1/` prefix. May not match backend route (`/api/v1/contact`).
- **Action needed:** Verify and fix the endpoint URL.

### 18. Tag Color Mapping — Meaningless Colors

- **Status:** Cosmetic issue
- **Description:** In `hooks/useJobs.ts` and `hooks/useJob.ts`, tags are mapped to colors via `["flutter", "dart", "mobile", ...]` — hardcoded names that don't match actual tag content.
- **Action needed:** Replace with semantic color mapping or derive from tag category.

### 19. Hardcoded Fallback Images

- **Status:** Minor
- **Description:** Company logo fallback `"/images/company-logo.jpg"` is hardcoded in `hooks/useJobs.ts`, `hooks/useJob.ts`, and `app/jobs/[id]/page.tsx`. File may not exist.
- **Action needed:** Verify fallback image exists or use a proper placeholder.

---

## ✅ Existing Backend API Endpoints (Already Working)

| Method | Endpoint                           | Purpose                   |
| ------ | ---------------------------------- | ------------------------- |
| POST   | `/api/v1/auth/register`            | User registration         |
| POST   | `/api/v1/auth/login`               | User login                |
| POST   | `/api/v1/auth/logout`              | User logout               |
| GET    | `/api/v1/auth/profile`             | Get user profile          |
| PATCH  | `/api/v1/auth/profile`             | Update user profile       |
| POST   | `/api/v1/auth/profile-picture`     | Upload profile picture    |
| DELETE | `/api/v1/auth/profile-picture`     | Delete profile picture    |
| POST   | `/api/v1/auth/verify-email`        | Verify email              |
| POST   | `/api/v1/auth/resend-verification` | Resend verification email |
| POST   | `/api/v1/auth/forgot-password`     | Forgot password           |
| POST   | `/api/v1/auth/reset-password`      | Reset password            |
| GET    | `/api/v1/auth/saved-jobs`          | Get saved jobs            |
| POST   | `/api/v1/auth/saved-jobs`          | Save a job                |
| DELETE | `/api/v1/auth/saved-jobs/:jobId`   | Unsave a job              |
| GET    | `/api/v1/jobs`                     | Get all jobs (paginated)  |
| GET    | `/api/v1/jobs/:id`                 | Get single job            |
| POST   | `/api/v1/jobs`                     | Create job                |
| PATCH  | `/api/v1/jobs/:id`                 | Update job                |
| DELETE | `/api/v1/jobs/:id`                 | Delete job                |
| POST   | `/api/v1/attachments/upload`       | Upload attachment         |
| GET    | `/api/v1/attachments/:id`          | Get attachment            |
| PUT    | `/api/v1/attachments/:id`          | Update attachment         |
| DELETE | `/api/v1/attachments/:id`          | Delete attachment         |
| POST   | `/api/v1/contact`                  | Send contact message      |
