# Vetriconn Frontend — Developer Context

A job board platform connecting Canadian veterans and retirees with employers. This document captures project styles, preferences, and conventions for any developer continuing work.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (using `@theme` in globals.css + tailwind.config.ts)
- **Data Fetching:** SWR
- **Validation:** Zod v4
- **Package Manager:** pnpm

---

## Colors

| Token                    | Hex                              | Usage                                                  |
| ------------------------ | -------------------------------- | ------------------------------------------------------ |
| Primary                  | `#e53e3e`                        | Buttons, links, active states                          |
| Primary hover            | `#dc2626`                        | Button hover states                                    |
| Primary light / opaque   | `bg-red-50`                      | Icon backgrounds, badge backgrounds, subtle highlights |
| Primary text on light bg | `text-red-500` or `text-red-700` | Icons, secondary action text                           |
| Text default             | `#1f2937` (`text-gray-900`)      | Headings, body text                                    |
| Text muted               | `#666666` (`text-gray-500`)      | Labels, descriptions                                   |
| Background               | `bg-gray-50`                     | Page backgrounds                                       |
| Card background          | `bg-white`                       | Cards, panels                                          |
| Border                   | `border-gray-200`                | Card borders, dividers                                 |

---

## Icons

- **Library:** `react-icons` (installed)
- **Preferred families (in order of preference):**
  1. `hi2` — Heroicons v2 outline (`HiOutline*` from `react-icons/hi2`)
  2. `lu` — Lucide (`Lu*` from `react-icons/lu`)
  3. `hi` — Heroicons v1 (`HiOutline*` from `react-icons/hi`)
  4. `fa` — Font Awesome (`Fa*` from `react-icons/fa`) — legacy, avoid for new work
- **Style:** Always use **outlined** icons, never solid/filled
- **Size:** Typically `w-5 h-5` inside icon containers
- **Icon containers:** Rounded (`rounded-full` or `rounded-lg`), `bg-red-50`, `w-10 h-10`, centered with `flex items-center justify-center`

---

## Typography

- **Font families:**
  - Body: Open Sans (`font-open-sans`)
  - Headings: Lato (`font-lato`) or Outfit (`font-outfit`)
- **Heading sizes:** See `tailwind.config.ts` for `heading-1`, `heading-2`, `heading-3`
- **Card titles:** `text-xl font-bold text-gray-900` or `text-lg font-bold text-gray-900`
- **Labels:** `text-sm font-medium text-gray-500`
- **Values:** `text-base text-gray-900 font-medium`

---

## Component Patterns

### Cards

- Background: `bg-white rounded-xl border border-gray-200 p-6`
- Section title: `text-xl font-bold text-gray-900 mb-4`

### Edit Buttons (on cards)

- Style: `bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100`
- Include icon + "Edit" text: `<FaEdit /> Edit`

### Buttons

- Primary: `bg-red-600 text-white hover:bg-red-700 rounded-lg px-6 py-3 font-semibold`
- Secondary/ghost: `bg-red-50 text-red-700 border border-red-200 hover:bg-red-100`

### Avatar / Initials Fallback

- When no image: Show initials in `bg-red-50 text-red-600 font-bold` circle
- Size varies: profile header uses `w-20 h-20`, smaller contexts use `w-10 h-10`

### Quick Actions

- Icon in `bg-red-50 rounded-lg` square, label + subtitle, chevron arrow on right
- Wrapped in Next.js `<Link>` for navigation

---

## Layout

- **Dashboard pages** are wrapped by `app/dashboard/layout.tsx` which provides `DashboardNavbar` + `AuthFooter`. **Do NOT** add these in child pages.
- **Profile page grid:** `grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start`
- **Max container width:** `max-w-[1200px] mx-auto` (or `max-w-300` in Tailwind v4)
- **Responsive breakpoints:** `mobile: max-width 850px`, `tablet: max-width 768px`

---

## Data Flow

- **API base URL:** `API_BASE_URL` from env vars → functions in `lib/api.ts`
- **Hooks:** SWR-based hooks in `hooks/` directory
  - `useUserProfile` — user profile data + completion calculation
  - `useJobs` — job listings with search/filter params
  - `useJob` — single job detail
  - `usePatchProfile` — PATCH profile updates
- **Profile completion:** Calculated from filled fields (role, full_name, phone_number, city, country, job_title, industry, years_of_experience, documents)

---

## File Organization

```
app/                    → Next.js App Router pages
components/
  pages/                → Page-specific compound components
    auth/               → Sign in, sign up wizard
    home/               → Landing page sections
    profile/            → Profile page components
  seo/                  → JSON-LD structured data
  ui/                   → Reusable UI components
hooks/                  → SWR data-fetching hooks
lib/                    → API functions, utilities, validation
types/                  → TypeScript interfaces
public/images/          → Static assets
```

---

## Conventions

- All components are `"use client"` unless purely presentational
- Use `React.FC<Props>` for component typing
- Export named components (not default) for UI components
- Default exports for page components (`export default function PageName()`)
- Use `useCallback` for handlers passed as props
- Use `aria-label` on interactive elements for accessibility
- Tailwind v4: Prefer utility shorthand (`shrink-0` over `flex-shrink-0`, etc.)

---

## Backend API

- **Base:** Express.js + MongoDB + Mongoose
- **Auth:** JWT tokens (access + refresh) stored in httpOnly cookies
- **Key endpoints:**
  - `GET /api/v1/auth/profile` — user profile
  - `PATCH /api/v1/auth/profile` — update profile
  - `GET /api/v1/jobs` — job listings (supports `q`, `location`, `type`, `experience` params)
  - `GET /api/v1/jobs/:id` — single job
  - `GET /api/v1/auth/saved-jobs` — saved jobs
  - `POST/DELETE /api/v1/auth/saved-jobs/:jobId` — save/unsave job
