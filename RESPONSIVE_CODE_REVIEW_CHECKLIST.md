# Responsive Design Code Review Checklist

Use this checklist when reviewing pull requests that involve responsive design changes in the Vetriconn application.

## Quick Reference

✅ = Requirement met  
❌ = Needs attention  
⚠️ = Optional but recommended

---

## 1. Mobile-First Approach

- [ ] Base styles target mobile viewports (no prefix)
- [ ] Desktop styles use `md:` or `lg:` prefixes
- [ ] No desktop-first patterns (e.g., `lg:hidden` without mobile alternative)
- [ ] Breakpoints used consistently: `md:` (768px), `lg:` (1024px)

**Example:**
```tsx
// ✅ Good: Mobile-first
<div className="px-4 md:px-6 lg:px-8">

// ❌ Bad: Desktop-first
<div className="px-8 lg:px-6 md:px-4">
```

---

## 2. Spacing & Layout

### Padding
- [ ] Container padding: `px-4 md:px-6 lg:px-8`
- [ ] Card padding: `p-4 md:p-6`
- [ ] Button padding: `px-4 py-2 md:px-6 md:py-3`
- [ ] Form input padding: `px-3 py-2 md:px-4 md:py-3`
- [ ] No redundant nested padding

### Spacing Scale
- [ ] Uses Tailwind spacing scale (1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24)
- [ ] No arbitrary values where standard scale suffices (e.g., avoid `p-[18px]`)
- [ ] Vertical spacing: `space-y-4 md:space-y-6`
- [ ] Grid/flex gaps: `gap-4 md:gap-6`

### Margins
- [ ] Consistent margin patterns
- [ ] No excessive margins causing layout issues
- [ ] Negative margins used appropriately for full-width sections

**Example:**
```tsx
// ✅ Good: Standard spacing scale
<div className="p-4 md:p-6 space-y-4 md:space-y-6">

// ❌ Bad: Arbitrary values
<div className="p-[18px] space-y-[22px]">
```

---

## 3. Typography

### Text Sizing
- [ ] Body text: `text-sm md:text-base` (minimum 14px on mobile)
- [ ] Small text: `text-xs md:text-sm` (minimum 12px on mobile)
- [ ] Headings scale appropriately:
  - Hero H1: `text-3xl md:text-5xl lg:text-6xl`
  - Page H1: `text-2xl md:text-4xl`
  - H2: `text-xl md:text-3xl`
  - H3: `text-lg md:text-2xl`
- [ ] Button text: `text-sm md:text-base`
- [ ] No text too small on mobile (avoid `text-xs` base)
- [ ] No text too large on mobile (avoid `text-xl` base for body)

### Font Weights
- [ ] Appropriate font weights for hierarchy
- [ ] Consistent use of `font-medium`, `font-semibold`, `font-bold`

**Example:**
```tsx
// ✅ Good: Readable on mobile
<p className="text-sm md:text-base">

// ❌ Bad: Too small on mobile
<p className="text-xs md:text-base">
```

---

## 4. Touch Targets (WCAG 2.1 Level AAA)

### Minimum Dimensions
- [ ] All interactive elements: `min-h-[44px]` (44px minimum)
- [ ] Icon-only buttons: `min-h-[44px] min-w-[44px]`
- [ ] Links have adequate tap area
- [ ] Form inputs meet touch target requirements

### Button Sizing
- [ ] Text buttons: `px-4 py-2 md:px-6 md:py-3 min-h-[44px]`
- [ ] Icon buttons: `p-2 min-h-[44px] min-w-[44px]`
- [ ] Small buttons still meet 44px minimum height

### Spacing Between Targets
- [ ] Adequate spacing between adjacent interactive elements
- [ ] No overlapping touch targets

**Example:**
```tsx
// ✅ Good: Meets touch target requirements
<button className="px-4 py-2 min-h-[44px]">Click</button>

// ❌ Bad: Too small
<button className="px-2 py-1">Click</button>
```

---

## 5. Icons

### Icon Sizing
- [ ] Inline with text: `w-4 h-4 md:w-5 md:h-5`
- [ ] Button icons: `w-5 h-5 md:w-6 md:h-6`
- [ ] Standalone icons: `w-6 h-6 md:w-8 md:h-8`
- [ ] Large decorative: `w-8 h-8 md:w-12 md:h-12`
- [ ] Icons scale proportionally with context

### Icon Alignment
- [ ] Icon-text combinations use `inline-flex items-center gap-2`
- [ ] Icons vertically centered with text
- [ ] No misaligned icons

### Icon Library
- [ ] Uses react-icons (Heroicons v2 `hi2` or Lucide `lu`)
- [ ] Consistent icon style throughout component

**Example:**
```tsx
// ✅ Good: Proper alignment and sizing
<div className="inline-flex items-center gap-2">
  <HiOutlineBriefcase className="w-4 h-4 md:w-5 md:h-5" />
  <span className="text-sm md:text-base">Find Jobs</span>
</div>

// ❌ Bad: No alignment, fixed size
<div className="flex gap-2">
  <HiOutlineBriefcase className="w-5 h-5" />
  <span>Find Jobs</span>
</div>
```

---

## 6. Components

### Buttons
- [ ] Responsive padding: `px-4 py-2 md:px-6 md:py-3`
- [ ] Responsive text: `text-sm md:text-base`
- [ ] Touch target: `min-h-[44px]`
- [ ] Appropriate width: `w-full md:w-auto` or `max-w-xs`
- [ ] Hover/active states defined
- [ ] Transition effects for feedback

### Cards
- [ ] Surface comes from `PANEL_SURFACE`, not spelled out in the markup
- [ ] Responsive padding: `p-4 md:p-6`
- [ ] Border radius is not responsive: reject any new `rounded-lg md:rounded-xl`
- [ ] Admin screens use `ADMIN_PANEL_SURFACE`, which is meant to differ
- [ ] Content follows typography patterns
- [ ] Proper spacing between card elements

### Forms
- [ ] Input padding: `px-3 py-2 md:px-4 md:py-3`
- [ ] Input text: `text-sm md:text-base`
- [ ] Label spacing: `mb-1.5 md:mb-2`
- [ ] Label text: `text-sm`
- [ ] Visible focus states: `focus:ring-2 focus:ring-primary`
- [ ] Multi-column layouts: `grid-cols-1 md:grid-cols-2`
- [ ] Form spacing: `space-y-4 md:space-y-6`

### Modals
- [ ] Width: `w-[95%] md:w-full max-w-lg` (or appropriate size)
- [ ] Max height: `max-h-[90vh]`
- [ ] Scrollable content: `overflow-y-auto`
- [ ] Responsive padding: `p-4 md:p-6`
- [ ] Close button meets touch target: `min-h-[44px] min-w-[44px]`
- [ ] Backdrop click-to-close functionality

### Data Tables
- [ ] Mobile strategy defined (horizontal scroll or card layout)
- [ ] Horizontal scroll: `overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0`
- [ ] Card layout: `hidden md:block` for table, `md:hidden` for cards
- [ ] Card padding: `p-4`
- [ ] Full width cards: `w-full`

**Example:**
```tsx
// ✅ Good: Responsive modal
<div className="
  w-[95%] md:w-full
  max-w-lg
  max-h-[90vh]
  overflow-hidden
">
  <div className="overflow-y-auto p-4 md:p-6">
    {children}
  </div>
</div>

// ❌ Bad: No mobile consideration
<div className="w-full max-w-lg p-6">
  {children}
</div>
```

---

## 7. Layout Patterns

### Grid Layouts
- [ ] Mobile: `grid-cols-1`
- [ ] Tablet: `md:grid-cols-2` (where appropriate)
- [ ] Desktop: `lg:grid-cols-3` or `lg:grid-cols-4`
- [ ] Responsive gaps: `gap-4 md:gap-6`
- [ ] No arbitrary column counts

### Flex Layouts
- [ ] Mobile: `flex-col` for vertical stacking
- [ ] Desktop: `md:flex-row` for horizontal layout
- [ ] Responsive gaps: `gap-3 md:gap-4`
- [ ] Proper alignment: `items-stretch md:items-center`

### Containers
- [ ] Max width constraints: `max-w-7xl`, `max-w-[1340px]`, etc.
- [ ] Centered: `mx-auto`
- [ ] Responsive padding: `px-4 md:px-6 lg:px-8`
- [ ] Uses container utilities where appropriate

### Width Patterns
- [ ] Full width on mobile: `w-full`
- [ ] Constrained on desktop: `md:w-auto`, `md:w-1/2`, etc.
- [ ] Max width constraints: `max-w-lg`, `max-w-4xl`, etc.

**Example:**
```tsx
// ✅ Good: Responsive grid
<div className="
  grid
  grid-cols-1
  md:grid-cols-2
  lg:grid-cols-3
  gap-4 md:gap-6
">

// ❌ Bad: Fixed columns
<div className="grid grid-cols-3 gap-6">
```

---

## 8. Visibility & Display

### Show/Hide Patterns
- [ ] Hide on mobile: `hidden md:block` or `hidden md:flex`
- [ ] Hide on desktop: `md:hidden`
- [ ] No content unintentionally hidden
- [ ] Alternative content provided when hiding elements

### Navigation
- [ ] Desktop nav: `hidden md:flex`
- [ ] Mobile menu: `md:hidden`
- [ ] Hamburger icon meets touch target requirements
- [ ] Mobile menu has close functionality

**Example:**
```tsx
// ✅ Good: Proper show/hide
<nav className="hidden md:flex items-center gap-4">
  {/* Desktop nav */}
</nav>
<button className="md:hidden min-h-[44px] min-w-[44px]">
  {/* Mobile menu button */}
</button>

// ❌ Bad: No mobile alternative
<nav className="hidden md:flex">
  {/* Desktop nav only */}
</nav>
```

---

## 9. Accessibility

### Keyboard Navigation
- [ ] All interactive elements keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators visible at all breakpoints
- [ ] Escape key closes modals/menus
- [ ] Arrow keys work in dropdowns (where applicable)

### Focus States
- [ ] Visible focus indicators: `focus:ring-2 focus:ring-primary`
- [ ] Focus indicators not removed: no `outline-none` without replacement
- [ ] Focus trap in modals
- [ ] Focus returns to trigger element on close

### ARIA & Semantics
- [ ] ARIA labels for icon-only buttons: `aria-label="Close"`
- [ ] Semantic HTML elements used: `<button>`, `<nav>`, `<main>`, etc.
- [ ] Screen reader announcements for state changes
- [ ] Alt text for images

### Color Contrast
- [ ] Text contrast meets WCAG AA standards (4.5:1 for normal text)
- [ ] Interactive elements have sufficient contrast
- [ ] Focus indicators have sufficient contrast

**Example:**
```tsx
// ✅ Good: Accessible button
<button
  className="p-2 min-h-[44px] min-w-[44px] focus:ring-2 focus:ring-primary"
  aria-label="Close modal"
>
  <HiOutlineXMark className="w-5 h-5" />
</button>

// ❌ Bad: No accessibility
<button className="p-2" onClick={onClose}>
  <HiOutlineXMark className="w-5 h-5" />
</button>
```

---

## 10. Images & Media

### Image Optimization
- [ ] Uses Next.js Image component
- [ ] Responsive sizing: `w-full h-auto` or explicit dimensions
- [ ] Sizes prop for responsive breakpoints
- [ ] Alt text provided
- [ ] Lazy loading for below-fold images

### Image Fitting
- [ ] Appropriate object-fit: `object-cover` or `object-contain`
- [ ] Aspect ratio preserved: `aspect-video`, `aspect-square`, etc.
- [ ] No layout shift (explicit dimensions or aspect-ratio)

### Avatar Images
- [ ] Responsive sizing: `w-12 h-12 md:w-16 md:h-16`
- [ ] Rounded appropriately: `rounded-full`

**Example:**
```tsx
// ✅ Good: Optimized responsive image
<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  className="w-full h-auto"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>

// ❌ Bad: No optimization
<img src="/image.jpg" className="w-full" />
```

---

## 11. Performance

### CSS Optimization
- [ ] Mobile-first approach minimizes CSS payload
- [ ] No unused Tailwind classes
- [ ] Purge configuration correct in `tailwind.config.ts`

### Layout Shift
- [ ] Images have explicit dimensions or aspect-ratio
- [ ] Skeleton loaders match final content dimensions
- [ ] No content jumping during load
- [ ] CLS score < 0.1 (Lighthouse)

### Loading States
- [ ] Skeleton loaders are responsive
- [ ] Loading states match component dimensions
- [ ] Smooth transitions between loading and loaded states

**Example:**
```tsx
// ✅ Good: Prevents layout shift
<div className="aspect-video relative">
  <Image src="/image.jpg" alt="Description" fill />
</div>

// ❌ Bad: Causes layout shift
<Image src="/image.jpg" alt="Description" />
```

---

## 12. Testing

### Manual Testing
- [ ] Tested at 375px (iPhone SE)
- [ ] Tested at 390px (iPhone 12/13)
- [ ] Tested at 768px (tablet breakpoint)
- [ ] Tested at 850px (mobile max breakpoint)
- [ ] Tested at 1024px (desktop breakpoint)
- [ ] Tested at 1440px (common desktop)
- [ ] No horizontal scrollbars at any breakpoint
- [ ] Touch targets verified on actual device

### Breakpoint Boundaries
- [ ] Tested at exact breakpoint widths (768px, 850px, 1024px)
- [ ] No layout breaks at boundaries
- [ ] Content remains accessible at all widths

### Cross-Browser
- [ ] Chrome (desktop + mobile)
- [ ] Safari (desktop + iOS)
- [ ] Firefox (desktop + mobile)
- [ ] Edge (desktop)

### Accessibility Testing
- [ ] Keyboard navigation tested at all breakpoints
- [ ] Screen reader tested (VoiceOver or NVDA)
- [ ] High contrast mode tested
- [ ] Text scaling tested (100%, 125%, 150%)

---

## 13. Code Quality

### Consistency
- [ ] Follows existing patterns in codebase
- [ ] Consistent with RESPONSIVE_PATTERNS.md
- [ ] No conflicting responsive classes
- [ ] Naming conventions followed

### Documentation
- [ ] Complex responsive patterns documented
- [ ] Comments explain non-obvious breakpoint choices
- [ ] Props documented for reusable components

### Maintainability
- [ ] No magic numbers (use Tailwind scale)
- [ ] Reusable patterns extracted to utilities
- [ ] No duplicate responsive logic

---

## Common Issues to Watch For

### ❌ Red Flags
- Fixed pixel widths without max-width constraints
- Arbitrary spacing values (e.g., `p-[18px]`)
- Touch targets smaller than 44px
- Text smaller than 14px on mobile
- Horizontal scrollbars on mobile
- Redundant nested padding
- Missing responsive prefixes on desktop styles
- Icon-only buttons without ARIA labels
- No mobile strategy for complex tables
- Modals without max-height constraints

### ⚠️ Warning Signs
- Inconsistent spacing patterns
- Different breakpoint usage than rest of codebase
- Complex responsive logic that could be simplified
- Missing focus states
- No loading states for dynamic content
- Images without explicit dimensions

---

## Approval Criteria

### Must Have (Blocking)
- ✅ All touch targets meet 44px minimum
- ✅ No horizontal scrollbars on mobile
- ✅ Text is readable on mobile (minimum 14px)
- ✅ Tested at key breakpoints (375px, 768px, 1024px)
- ✅ Keyboard navigation works
- ✅ Focus indicators visible

### Should Have (Recommended)
- ✅ Follows RESPONSIVE_PATTERNS.md
- ✅ Uses Tailwind spacing scale
- ✅ Tested on actual devices
- ✅ Cross-browser tested
- ✅ Performance metrics acceptable

### Nice to Have (Optional)
- ✅ Visual regression tests added
- ✅ Accessibility tests added
- ✅ Documentation updated

---

## Quick Checklist Summary

Copy this for quick PR reviews:

```
## Responsive Design Review

- [ ] Mobile-first approach
- [ ] Touch targets ≥ 44px
- [ ] Text readable on mobile
- [ ] Spacing uses Tailwind scale
- [ ] Icons scale appropriately
- [ ] No horizontal scroll
- [ ] Tested at 375px, 768px, 1024px
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Cross-browser tested
```

---

## Resources

- [RESPONSIVE_PATTERNS.md](./RESPONSIVE_PATTERNS.md) - Pattern reference
- [RESPONSIVE_TROUBLESHOOTING.md](./RESPONSIVE_TROUBLESHOOTING.md) - Common issues
- [Design Document](.kiro/specs/responsive-design-implementation/design.md)
- [Requirements Document](.kiro/specs/responsive-design-implementation/requirements.md)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
