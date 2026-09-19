# Responsive Design Patterns — Vetriconn

This document provides a comprehensive reference for implementing responsive design patterns across the Vetriconn application using Tailwind CSS v4's mobile-first approach.

## Table of Contents

1. [Breakpoints](#breakpoints)
2. [Padding & Spacing Patterns](#padding--spacing-patterns)
3. [Width & Container Patterns](#width--container-patterns)
4. [Typography Scale](#typography-scale)
5. [Icon Sizing Guidelines](#icon-sizing-guidelines)
6. [Show/Hide Patterns](#showhide-patterns)
7. [Touch Target Requirements](#touch-target-requirements)
8. [Common Component Patterns](#common-component-patterns)

---

## Breakpoints

Vetriconn uses the following breakpoint system defined in `tailwind.config.ts`:

| Breakpoint | Width | Usage | Prefix |
|------------|-------|-------|--------|
| Mobile | ≤ 850px | Mobile-specific overrides | `mobile:` |
| Tablet | ≤ 768px | Tablet-specific overrides | `tablet:` |
| Medium | ≥ 768px | Tablet and up | `md:` |
| Large | ≥ 1024px | Desktop | `lg:` |

### Mobile-First Approach

All styles follow a mobile-first methodology:
1. Base styles target mobile viewports (≤850px)
2. `md:` prefix applies styles for tablet and up (≥768px)
3. `lg:` prefix applies styles for desktop (≥1024px)

```tsx
// Example: Mobile-first button
<button className="px-4 py-2 md:px-6 md:py-3 text-sm md:text-base">
  Click me
</button>
```

---

## Padding & Spacing Patterns

### Container Padding

Use consistent horizontal padding for page containers:

```tsx
// Dashboard pages
className="px-4 md:px-6 lg:px-8"

// Marketing pages
className="px-[5%] md:px-6"
```

### Component Padding

| Component Type | Mobile | Desktop | Classes |
|----------------|--------|---------|---------|
| Cards | 16px | 24px | `p-4 md:p-6` |
| Modals | 16px | 24px | `p-4 md:p-6` |
| Buttons | 16px × 8px | 24px × 12px | `px-4 py-2 md:px-6 md:py-3` |
| Form inputs | 12px × 8px | 16px × 12px | `px-3 py-2 md:px-4 md:py-3` |
| Sections | 24px | 32px | `py-6 md:py-8` |
| Hero sections | 48px | 80px | `py-12 md:py-20` |

### Vertical Spacing

Use consistent spacing between elements:

```tsx
// Between sections
className="space-y-4 md:space-y-6"

// Between form fields
className="space-y-4 md:space-y-6"

// Between cards in a list
className="space-y-3 md:space-y-4"
```

### Grid & Flex Gaps

```tsx
// Grid gap
className="gap-4 md:gap-6"

// Flex gap
className="gap-3 md:gap-4"
```

### Margin Patterns

```tsx
// Bottom margin
className="mb-4 md:mb-6"

// Top margin
className="mt-6 md:mt-8"
```

### Spacing Scale Reference

Use Tailwind's spacing scale (0.25rem increments):

| Value | Pixels | Usage |
|-------|--------|-------|
| `1` | 4px | Minimal spacing |
| `2` | 8px | Tight spacing |
| `3` | 12px | Small spacing |
| `4` | 16px | Default spacing (mobile) |
| `6` | 24px | Default spacing (desktop) |
| `8` | 32px | Large spacing |
| `10` | 40px | Extra large spacing |
| `12` | 48px | Section spacing |
| `16` | 64px | Major section spacing |
| `20` | 80px | Hero spacing |

---

## Width & Container Patterns

### Full Width with Constraints

```tsx
// Full width on mobile, auto on desktop
className="w-full md:w-auto"

// Full width with max constraint
className="w-full max-w-lg"
```

### Percentage-Based Widths

```tsx
// Half width on desktop
className="w-full md:w-1/2"

// Third width on desktop
className="w-full lg:w-1/3"

// Two-thirds width
className="w-full lg:w-2/3"
```

### Container Utilities

Use these predefined container classes (defined in `globals.css`):

```tsx
// Marketing pages (max-width: 1340px)
className="container-main"

// Dashboard pages (max-width: 1280px / 7xl)
className="container-dashboard"

// Narrow content (max-width: 896px / 4xl)
className="container-narrow"
```

### Modal Widths

| Modal Size | Mobile | Desktop | Classes |
|------------|--------|---------|---------|
| Small | 95% | 384px | `w-[95%] md:w-full max-w-sm` |
| Medium | 95% | 512px | `w-[95%] md:w-full max-w-lg` |
| Large | 95% | 672px | `w-[95%] md:w-full max-w-2xl` |
| Extra Large | 95% | 896px | `w-[95%] md:w-full max-w-4xl` |

---

## Typography Scale

### Heading Scale Mapping

| Element | Mobile Size | Desktop Size | Tailwind Classes |
|---------|-------------|--------------|------------------|
| Hero H1 | 32px (text-3xl) | 48px (text-5xl) | `text-3xl md:text-5xl lg:text-6xl` |
| Page H1 | 24px (text-2xl) | 36px (text-4xl) | `text-2xl md:text-4xl` |
| H2 | 20px (text-xl) | 30px (text-3xl) | `text-xl md:text-3xl` |
| H3 | 18px (text-lg) | 24px (text-2xl) | `text-lg md:text-2xl` |
| H4 | 16px (text-base) | 20px (text-xl) | `text-base md:text-xl` |

### Body Text Scale

| Element | Mobile Size | Desktop Size | Tailwind Classes |
|---------|-------------|--------------|------------------|
| Body text | 14px (text-sm) | 16px (text-base) | `text-sm md:text-base` |
| Small text | 12px (text-xs) | 14px (text-sm) | `text-xs md:text-sm` |
| Button text | 14px (text-sm) | 16px (text-base) | `text-sm md:text-base` |
| Label text | 14px (text-sm) | 14px (text-sm) | `text-sm` |

### Typography Examples

```tsx
// Hero heading
<h1 className="text-3xl md:text-5xl lg:text-6xl font-bold">
  Find Your Next Opportunity
</h1>

// Page heading
<h1 className="text-2xl md:text-4xl font-semibold">
  My Profile
</h1>

// Section heading
<h2 className="text-xl md:text-3xl font-semibold">
  Work Experience
</h2>

// Card heading
<h3 className="text-lg md:text-2xl font-medium">
  Senior Developer
</h3>

// Body text
<p className="text-sm md:text-base text-gray-600">
  Description text goes here
</p>

// Small text
<span className="text-xs md:text-sm text-gray-500">
  Posted 2 days ago
</span>
```

### Responsive Text Utilities

Create reusable text utilities in `globals.css`:

```css
@layer utilities {
  .text-responsive-h1 {
    @apply text-3xl md:text-5xl lg:text-6xl;
  }
  
  .text-responsive-h2 {
    @apply text-2xl md:text-4xl;
  }
  
  .text-responsive-body {
    @apply text-sm md:text-base;
  }
}
```

---

## Icon Sizing Guidelines

### Icon Size Reference

| Context | Mobile | Desktop | Tailwind Classes | Usage |
|---------|--------|---------|------------------|-------|
| Inline with text | 16px | 20px | `w-4 h-4 md:w-5 md:h-5` | Icons next to text |
| Button icon | 20px | 24px | `w-5 h-5 md:w-6 md:h-6` | Icons inside buttons |
| Standalone | 24px | 32px | `w-6 h-6 md:w-8 md:h-8` | Icons without text |
| Large decorative | 32px | 48px | `w-8 h-8 md:w-12 md:h-12` | Feature icons |
| Extra large | 48px | 64px | `w-12 h-12 md:w-16 md:h-16` | Hero icons |

### Icon Implementation

Use `react-icons` with Heroicons v2 (`hi2`) or Lucide (`lu`):

```tsx
import { HiOutlineBriefcase, HiOutlineXMark } from 'react-icons/hi2';

// Icon with text
<div className="inline-flex items-center gap-2">
  <HiOutlineBriefcase className="w-4 h-4 md:w-5 md:h-5" />
  <span className="text-sm md:text-base">Find Jobs</span>
</div>

// Standalone icon
<HiOutlineBell className="w-6 h-6 md:w-8 md:h-8 text-gray-600" />

// Icon button
<button className="p-2 min-h-[44px] min-w-[44px]">
  <HiOutlineXMark className="w-5 h-5 md:w-6 md:h-6" />
</button>

// Large decorative icon
<HiOutlineBriefcase className="w-12 h-12 md:w-16 md:h-16 text-primary" />
```

### Icon Alignment

Always use flexbox for proper icon-text alignment:

```tsx
// Horizontal alignment
<div className="inline-flex items-center gap-2">
  <Icon className="w-4 h-4" />
  <span>Text</span>
</div>

// Vertical alignment in buttons
<button className="flex items-center justify-center gap-2">
  <Icon className="w-5 h-5" />
  <span>Button Text</span>
</button>
```

---

## Show/Hide Patterns

### Hide on Mobile, Show on Desktop

```tsx
// Block element
className="hidden md:block"

// Flex element
className="hidden md:flex"

// Inline element
className="hidden md:inline"

// Grid element
className="hidden md:grid"
```

### Show on Mobile, Hide on Desktop

```tsx
// Block element
className="block md:hidden"

// Flex element
className="flex md:hidden"
```

### Responsive Display Changes

```tsx
// Stack vertically on mobile, horizontal on desktop
className="flex flex-col md:flex-row"

// Single column on mobile, grid on desktop
className="block md:grid md:grid-cols-2"
```

### Navigation Patterns

```tsx
// Desktop navigation (hidden on mobile)
<nav className="hidden md:flex items-center gap-4">
  {/* Desktop nav items */}
</nav>

// Mobile menu button (hidden on desktop)
<button className="md:hidden p-2">
  <HiOutlineBars3 className="w-6 h-6" />
</button>
```

---

## Touch Target Requirements

All interactive elements must meet WCAG 2.1 Level AAA touch target requirements (44px × 44px minimum).

### Minimum Dimensions

```tsx
// Touch target utility
className="min-h-[44px] min-w-[44px]"

// Or use the utility class (defined in globals.css)
className="touch-target"
```

### Button Touch Targets

```tsx
// Text button
<button className="px-4 py-2 md:px-6 md:py-3 min-h-[44px]">
  Click me
</button>

// Icon-only button
<button className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
  <HiOutlineXMark className="w-5 h-5" />
</button>

// Small button (still meets touch target)
<button className="px-3 py-1.5 min-h-[44px] text-sm">
  Small
</button>
```

### Link Touch Targets

```tsx
// Navigation link
<Link 
  href="/dashboard" 
  className="px-4 py-2 min-h-[44px] flex items-center"
>
  Dashboard
</Link>

// Icon link
<Link 
  href="/notifications" 
  className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
>
  <HiOutlineBell className="w-5 h-5" />
</Link>
```

---

## Common Component Patterns

### Button Pattern

```tsx
<button className="
  px-4 py-2 md:px-6 md:py-3
  text-sm md:text-base
  min-h-[44px]
  bg-primary text-white
  rounded-lg
  hover:bg-primary-hover
  transition-colors
">
  Primary Action
</button>
```

### Card Pattern

Padding, type and shadow are responsive. The surface is not: `PANEL_SURFACE`
from `components/ui/panelStyles.ts` carries one radius at every width. This
page used to show `rounded-lg md:rounded-xl` here, which is why that variant
kept reappearing in new cards; the majority pattern, plain `rounded-xl`, won.

```tsx
import { PANEL_SURFACE } from "@/components/ui/panelStyles";

<div className={`${PANEL_SURFACE} p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow`}>
  <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">
    Card Title
  </h3>
  <p className="text-sm md:text-base text-gray-600">
    Card content
  </p>
</div>
```

Admin screens use `ADMIN_PANEL_SURFACE` instead. That divergence is deliberate
and documented in the token itself.

### Form Input Pattern

```tsx
<div className="space-y-1.5 md:space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Label
  </label>
  <input
    type="text"
    className="
      w-full
      px-3 py-2 md:px-4 md:py-3
      text-sm md:text-base
      border border-gray-300
      rounded-lg
      focus:ring-2 focus:ring-primary focus:border-transparent
    "
  />
</div>
```

### Modal Pattern

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="absolute inset-0 bg-black/50" onClick={onClose} />
  <div className="
    relative
    w-[95%] md:w-full
    max-w-lg
    max-h-[90vh]
    bg-white
    rounded-lg
    overflow-hidden
  ">
    <div className="px-4 py-3 md:px-6 md:py-4 border-b">
      <h2 className="text-lg md:text-xl font-semibold">Modal Title</h2>
    </div>
    <div className="overflow-y-auto p-4 md:p-6">
      {/* Modal content */}
    </div>
  </div>
</div>
```

### Grid Layout Pattern

```tsx
// Job cards grid
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-4 md:gap-6
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Dashboard stats
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-4
  gap-4 md:gap-6
">
  {stats.map(stat => <StatCard key={stat.id} {...stat} />)}
</div>
```

### Flex Layout Pattern

```tsx
// Horizontal stack (mobile: vertical, desktop: horizontal)
<div className="
  flex
  flex-col md:flex-row
  gap-4 md:gap-6
  items-stretch md:items-center
">
  {items.map(item => <Item key={item.id} {...item} />)}
</div>

// Button group
<div className="flex flex-col sm:flex-row gap-3">
  <button className="flex-1 sm:flex-none">Primary</button>
  <button className="flex-1 sm:flex-none">Secondary</button>
</div>
```

### Data Table Pattern

```tsx
// Desktop: Table view
<div className="hidden md:block overflow-x-auto">
  <table className="w-full">
    {/* Table markup */}
  </table>
</div>

// Mobile: Card view
<div className="md:hidden space-y-4">
  {data.map(row => (
    <div key={row.id} className="bg-white border rounded-lg p-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm font-medium text-gray-500">Label:</span>
          <span className="text-sm text-gray-900">{row.value}</span>
        </div>
      </div>
    </div>
  ))}
</div>
```

---

## Quick Reference Cheat Sheet

### Padding
- Container: `px-4 md:px-6 lg:px-8`
- Card: `p-4 md:p-6`
- Button: `px-4 py-2 md:px-6 md:py-3`
- Input: `px-3 py-2 md:px-4 md:py-3`

### Spacing
- Between elements: `space-y-4 md:space-y-6`
- Grid gap: `gap-4 md:gap-6`
- Flex gap: `gap-3 md:gap-4`

### Typography
- Hero H1: `text-3xl md:text-5xl lg:text-6xl`
- Page H1: `text-2xl md:text-4xl`
- H2: `text-xl md:text-3xl`
- Body: `text-sm md:text-base`

### Icons
- Inline: `w-4 h-4 md:w-5 md:h-5`
- Button: `w-5 h-5 md:w-6 md:h-6`
- Standalone: `w-6 h-6 md:w-8 md:h-8`

### Width
- Full to auto: `w-full md:w-auto`
- Full to half: `w-full md:w-1/2`
- Modal: `w-[95%] md:w-full max-w-lg`

### Show/Hide
- Hide mobile: `hidden md:block` or `hidden md:flex`
- Hide desktop: `md:hidden`
- Stack to row: `flex-col md:flex-row`

### Touch Targets
- Minimum: `min-h-[44px] min-w-[44px]`
- Utility: `touch-target`

---

## Testing Checklist

When implementing responsive patterns, test at these breakpoints:

- [ ] 375px (iPhone SE - smallest modern mobile)
- [ ] 390px (iPhone 12/13 - common mobile)
- [ ] 768px (iPad - tablet breakpoint)
- [ ] 850px (Custom mobile breakpoint)
- [ ] 1024px (Desktop breakpoint)
- [ ] 1440px (Common desktop)

Verify:
- [ ] Touch targets meet 44px minimum
- [ ] Text is readable (not too large on mobile)
- [ ] No horizontal scrollbars
- [ ] Spacing is consistent
- [ ] Icons scale appropriately
- [ ] Layouts adapt correctly

---

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Touch Target Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html)
- [Design Document](.kiro/specs/responsive-design-implementation/design.md)
- [Requirements Document](.kiro/specs/responsive-design-implementation/requirements.md)
