# Vetriconn Frontend

A job board platform connecting Canadian retirees and veterans with meaningful work opportunities.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4 (mobile-first)
- **Data Fetching:** SWR v2
- **Validation:** Zod v4
- **Icons:** react-icons (Heroicons v2, Lucide)
- **Animations:** framer-motion v12
- **Testing:** Jest 30 + Testing Library
- **Package Manager:** pnpm v10

## Getting Started

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Authenticated user area
│   ├── jobs/               # Public job browsing
│   ├── signin/             # Authentication
│   └── signup/             # Registration wizard
├── components/
│   ├── pages/              # Page-specific components
│   ├── ui/                 # Reusable UI components
│   └── seo/                # SEO components
├── hooks/                  # SWR data fetching hooks
├── lib/
│   ├── api/                # API service layer
│   └── validation.ts       # Zod schemas
└── types/                  # TypeScript types
```

## Responsive Design Guidelines

Vetriconn follows a **mobile-first responsive design** approach using Tailwind CSS v4. All components and pages are optimized for mobile, tablet, and desktop viewports.

### Breakpoints

| Breakpoint | Width | Prefix | Usage |
|------------|-------|--------|-------|
| Mobile | ≤ 850px | `mobile:` | Mobile-specific overrides |
| Tablet | ≤ 768px | `tablet:` | Tablet-specific overrides |
| Medium | ≥ 768px | `md:` | Tablet and up |
| Large | ≥ 1024px | `lg:` | Desktop |

### Key Principles

1. **Mobile-First:** Base styles target mobile, use `md:` and `lg:` prefixes for larger screens
2. **Touch Targets:** All interactive elements meet 44px × 44px minimum (WCAG 2.1 Level AAA)
3. **Fluid Typography:** Text scales appropriately across breakpoints
4. **Consistent Spacing:** Use Tailwind's spacing scale (4, 6, 8, etc.)
5. **Accessibility:** Keyboard navigation, focus indicators, screen reader support

### Quick Reference

```tsx
// Responsive padding
className="px-4 md:px-6 lg:px-8"

// Responsive typography
className="text-sm md:text-base"
className="text-2xl md:text-4xl"

// Responsive grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"

// Show/hide
className="hidden md:block"  // Hide on mobile
className="md:hidden"        // Hide on desktop

// Touch targets
className="min-h-[44px] min-w-[44px]"
```

For comprehensive responsive patterns, see [RESPONSIVE_PATTERNS.md](./RESPONSIVE_PATTERNS.md).

## Component Guidelines

### Button Component

```tsx
<button className="
  px-4 py-2 md:px-6 md:py-3
  text-sm md:text-base
  min-h-[44px]
  bg-primary text-white
  rounded-lg
">
  Click me
</button>
```

### Card Component

The surface lives in `components/ui/panelStyles.ts`, not in the markup. Import
`PANEL_SURFACE` and add the padding the card needs. The radius does not change
across breakpoints: an earlier `rounded-lg md:rounded-xl` was retired in favour
of the plain `rounded-xl` the other ninety-seven panels already used.

```tsx
import { PANEL_SURFACE } from "@/components/ui/panelStyles";

<div className={`${PANEL_SURFACE} p-4 md:p-6`}>
  {/* Card content */}
</div>
```

The admin area has its own surface, `ADMIN_PANEL_SURFACE`, from the same file.
It is intentionally different and is not a variant to normalise away.

### Form Input

```tsx
<input className="
  w-full
  px-3 py-2 md:px-4 md:py-3
  text-sm md:text-base
  border border-gray-300
  rounded-lg
  focus:ring-2 focus:ring-primary
" />
```

## API Integration

The frontend communicates with the backend API at:
- **Development:** `http://localhost:5000`
- **Production:** `https://vetriconn-backend.onrender.com`

API configuration is managed in `lib/api-config.ts` based on `NEXT_PUBLIC_NODE_ENV`.

### Authentication

- JWT tokens stored in localStorage/sessionStorage
- Authorization header: `Bearer <token>`
- Protected routes redirect to `/signin` if unauthenticated

### Data Fetching

Use SWR hooks from the `hooks/` directory:

```tsx
import { useUserProfile } from '@/hooks/useUserProfile';

function ProfilePage() {
  const { profile, isLoading, error } = useUserProfile();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;
  
  return <div>{profile.full_name}</div>;
}
```

## Testing

```bash
# Run tests in watch mode
pnpm test

# Run tests once
pnpm test --run

# Run tests with coverage
pnpm test --coverage
```

Test files are located in `__tests__/` and follow the naming convention `*.test.tsx`.

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_BACKEND_URL_DEV=http://localhost:5000
NEXT_PUBLIC_BACKEND_URL_PROD=https://vetriconn-backend.onrender.com
NEXT_PUBLIC_NODE_ENV=development
```

**Important:** `NEXT_PUBLIC_*` variables are baked in at build time and must be set in your hosting platform for production.

## Code Style

- **Components:** PascalCase (`JobCard.tsx`)
- **Hooks:** camelCase with `use` prefix (`useUserProfile.ts`)
- **Utilities:** camelCase (`api-config.ts`)
- **Types:** PascalCase interfaces (`IUser`, `IJob`)

## Accessibility

- All interactive elements meet WCAG 2.1 Level AAA touch target requirements (44px × 44px)
- Keyboard navigation supported throughout
- Focus indicators visible on all interactive elements
- ARIA labels provided for icon-only buttons
- Semantic HTML elements used where possible

## Performance

- Next.js Image component for optimized images
- Lazy loading for below-the-fold content
- SWR for efficient data fetching and caching
- Mobile-first CSS to minimize payload for mobile users

## Contributing

1. Follow the responsive design patterns in `RESPONSIVE_PATTERNS.md`
2. Ensure all interactive elements meet touch target requirements
3. Test at multiple breakpoints (375px, 768px, 1024px, 1440px)
4. Write tests for new components
5. Run linting before committing

## Resources

- [Responsive Design Patterns](./RESPONSIVE_PATTERNS.md)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [SWR Documentation](https://swr.vercel.app/)

## License

Proprietary - Vetriconn

