# Vetriconn Frontend

A job board connecting Canadian veterans and retirees with employers. One account both applies for jobs and hires through companies it belongs to, so there is a single dashboard rather than a job-seeker and an employer one.

## Tech stack

- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4, configured CSS-first in `app/globals.css` (no `tailwind.config.ts`)
- **Data fetching:** SWR 2
- **Validation:** Zod 4
- **Realtime:** socket.io-client, for message threads
- **Icons:** react-icons, Heroicons v2 outline (`react-icons/hi2`); Font Awesome 6 (`react-icons/fa6`) for brand marks
- **Testing:** Jest 30, Testing Library, fast-check
- **Component workshop:** Storybook 10
- **Package manager:** pnpm

## Getting started

```bash
pnpm install
pnpm dev
```

The app runs at http://localhost:3000 and talks to the backend at `NEXT_PUBLIC_BACKEND_URL_DEV` (see below). `predev` and `prebuild` copy the country flag SVGs into `public/flags`, which is gitignored.

| Script | What it does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build`, `pnpm start` | Production build and server |
| `pnpm build:check` | Production build into `.next-check`, so it does not clash with a running dev server |
| `pnpm lint` | ESLint |
| `pnpm test` | Jest in watch mode |
| `pnpm test:ci` | Jest once, for CI |
| `pnpm test:coverage` | Jest with coverage |
| `pnpm storybook` | Storybook at http://localhost:6006 |
| `pnpm analyze` | Bundle analysis |

## Environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL_DEV=http://localhost:5000
NEXT_PUBLIC_BACKEND_URL_PROD=https://api.vetriconn.ca
NEXT_PUBLIC_NODE_ENV=development
```

`lib/api-config.ts` uses the DEV URL when `NODE_ENV` or `NEXT_PUBLIC_NODE_ENV` is `development`, and the PROD URL otherwise. `NEXT_PUBLIC_*` values are baked in at build time, so they must be set on the hosting platform.

## Routes

| Area | Routes |
|---|---|
| Public | `/`, `/about`, `/faq`, `/jobs`, `/jobs/[id]`, `/jobs/[id]/apply`, `/privacy`, `/terms`, `/cookies` |
| Auth | `/signin`, `/signup`, `/forgot-password`, `/reset-password`, `/auth/email_verification`, `/auth/welcome`, `/companies/invites/accept`, `/accept-admin-invite/[token]` |
| Dashboard, finding work | `/dashboard`, `/dashboard/find-jobs`, `/dashboard/saved-jobs`, `/dashboard/saved-searches`, `/dashboard/applied-jobs`, `/dashboard/application-drafts` |
| Dashboard, hiring | `/dashboard/post-job`, `/dashboard/postings`, `/dashboard/drafts`, `/dashboard/applications`, `/dashboard/applications/[id]`, `/dashboard/companies`, `/dashboard/companies/apply`, `/dashboard/companies/[id]`, `/dashboard/companies/[id]/profile` |
| Dashboard, shared | `/dashboard/profile`, `/dashboard/inbox`, `/dashboard/notifications`, `/dashboard/community`, `/dashboard/billing`, `/dashboard/settings` |
| Admin console | `/admin`, `/admin/jobs`, `/admin/companies`, `/admin/users`, `/admin/users/[id]`, `/admin/reports`, `/admin/community`, `/admin/community/[id]`, `/admin/support`, `/admin/notifications`, `/admin/team`, `/admin/team/audit-log`, `/admin/telemetry`, `/admin/settings` |

The old role-prefixed dashboard URLs (`/dashboard/employer/*`, `/dashboard/job-seeker/*`) redirect permanently to these in `next.config.ts`. They appear in emails already sent, so the redirects stay.

## Project structure

```
frontend/
├── app/                    # App Router routes; (admin)/ is the admin console
├── components/
│   ├── auth/               # AuthGuard
│   ├── dashboard/          # Dashboard-only widgets (inbox and so on)
│   ├── pages/              # Page-level components, grouped by area
│   ├── providers/          # SWR, cookie consent, visit beacon
│   ├── security/           # Two-factor dialogs
│   ├── seo/                # JSON-LD
│   ├── tour/               # Dashboard tour
│   └── ui/                 # Shared UI: Button, CustomDropdown, FormField, panel and field styles
├── hooks/                  # SWR data hooks and UI hooks
├── lib/
│   ├── api/                # One module per backend area, re-exported from lib/api/index.ts
│   └── ...                 # Pure helpers: validation, consent, telemetry, job display, dates
├── types/                  # Shared TypeScript types
└── __tests__/              # Jest tests
```

## Data and auth

- Every API call goes through `apiFetch` in `lib/api/client.ts`. It sends cookies (`credentials: "include"`), the `X-Requested-With` header the backend's CSRF guard requires, and `X-Analytics-Consent` carrying the visitor's cookie choice. It returns the backend's `{ success, message, data }` envelope as is, and throws the server's message on an error status.
- The session is the backend's httpOnly `authToken` cookie. The frontend never stores a token.
- There is no `middleware.ts`. `components/auth/AuthGuard.tsx` wraps the dashboard and sends a signed-out visitor to `/signin` with a return URL; the admin layout additionally sends non-admins to `/dashboard`. When a call made from a `/dashboard` or `/admin` page returns 401, or 403 for an expired token, the client redirects once to `/signin?reason=session-expired` and comes back afterwards. The backend's guards are the real boundary; these are UX.
- Hooks wrap SWR around a `lib/api` function. App-wide defaults (`components/providers/SWRProvider.tsx`) turn off revalidate-on-focus and dedupe for 15 seconds; hooks tune from there.

```tsx
import { useUserProfile } from "@/hooks/useUserProfile";

function ProfileName() {
  const { userProfile, isLoading, isError } = useUserProfile();
  if (isLoading) return <p>Loading...</p>;
  if (isError || !userProfile) return <p>Could not load your profile.</p>;
  return <p>{userProfile.full_name}</p>;
}
```

`useUserProfile` also returns `profileCompletion` and `mutateProfile`.

## Responsive design

Mobile-first with Tailwind v4.

| Breakpoint | Width | Prefix | Defined |
|---|---|---|---|
| Mobile | ≤ 900px | `mobile:` | `@custom-variant` in `app/globals.css`; the navbar collapses here |
| Tablet | ≤ 768px | `tablet:` | `@custom-variant` in `app/globals.css` |
| Medium | ≥ 768px | `md:` | Tailwind default |
| Large | ≥ 1024px | `lg:` | Tailwind default |

- Touch targets: at least 44px tall (`min-h-[44px]`), and `min-w-[44px]` for icon-only buttons.
- Card surfaces: import `PANEL_SURFACE` from `components/ui/panelStyles.ts` and add padding. The admin area uses `ADMIN_PANEL_SURFACE` from the same file, which is intentionally different.
- Form fields: `FIELD_BASE` and `fieldBorder(hasError)` from `components/ui/fieldStyles.ts`. The focus ring is grey, because red means an error.
- Buttons: `components/ui/Button.tsx`, documented in `components/ui/Button.README.md`.
- Dropdowns, countries, skills and locations have shared components (`CustomDropdown`, `CountrySelect`, `SkillsInput`, `LocationFields`). Use them instead of a native `<select>`; two native selects remain to convert, in `components/ui/FormField.tsx` and the admin `SupportTickets` filter.

See [RESPONSIVE_PATTERNS.md](./RESPONSIVE_PATTERNS.md), [RESPONSIVE_CODE_REVIEW_CHECKLIST.md](./RESPONSIVE_CODE_REVIEW_CHECKLIST.md) and [RESPONSIVE_TROUBLESHOOTING.md](./RESPONSIVE_TROUBLESHOOTING.md).

## Testing

Tests live in `__tests__/`, as `*.test.ts` or `*.test.tsx`, grouped into `accessibility/`, `components/`, `copy/`, `hooks/`, `lib/` and `properties/` (property-based, with fast-check). `__tests__/copy/noDashes.test.ts` fails on a dash in user-facing copy (string literals and JSX text, not comments).

## Code style

- Components: PascalCase files and names (`JobResultCard.tsx`).
- Hooks: `useX` (`useUserProfile.ts`).
- `lib/` files: mostly kebab-case (`api-config.ts`, `job-display.ts`).
- Types: plain PascalCase names with no `I` prefix (`Job`, `UserProfile`).
- No `any`.

## Accessibility

- 44px minimum touch height on interactive elements
- Keyboard navigation and visible focus indicators
- ARIA labels on icon-only buttons
- `AccessibilityProvider` (`hooks/useAccessibility.tsx`): text size and high-contrast settings
- Tests under `__tests__/accessibility/`

## Module docs

Every module, frontend included, is documented in the backend repository under `docs/<module>/` (`../backend/docs/` when the repositories sit side by side). Each folder has the same nine files; `04-frontend.txt` covers this repository's side of the module. Start at `../backend/docs/README.txt`. Coding agents start at [CLAUDE.md](./CLAUDE.md).

- The account settings page: `profile/04-frontend.txt`
- Which admin hooks call which endpoints: `admin/04-frontend.txt`
- Dead-code findings that are not dead: [docs/cleanup-rejected-findings.md](./docs/cleanup-rejected-findings.md) for now; it moves to `platform/06-rules-and-traps.txt` when the platform folder lands

## Resources

- [Responsive Design Patterns](./RESPONSIVE_PATTERNS.md)
- [Tailwind CSS](https://tailwindcss.com/docs), [Next.js](https://nextjs.org/docs), [SWR](https://swr.vercel.app/)

## License

Proprietary, Vetriconn.
