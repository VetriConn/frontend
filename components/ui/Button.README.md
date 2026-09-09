# Button Component

A responsive, accessible button component that implements mobile-first design patterns with WCAG 2.1 Level AAA touch target compliance.

## Features

- ✅ **Touch Target Compliance**: Minimum 44px × 44px tap area (WCAG 2.1 Level AAA)
- ✅ **Responsive Padding**: `px-4 py-2` on mobile, `px-6 py-3` on desktop
- ✅ **Responsive Text Sizing**: `text-sm` on mobile, `text-base` on desktop
- ✅ **Mobile-First**: Full width on mobile, auto width on desktop (configurable)
- ✅ **Multiple Variants**: Primary, secondary, outline, ghost, danger
- ✅ **Multiple Sizes**: Small, medium, large
- ✅ **Icon Support**: Left and right icon slots
- ✅ **Loading State**: Built-in loading spinner
- ✅ **Accessible**: Proper ARIA attributes and focus states

## Usage

### Basic Usage

```tsx
import { Button } from "@/components/ui/Button";

export default function MyComponent() {
  return <Button>Click me</Button>;
}
```

### Variants

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
```

### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
```

### With Icons

```tsx
import { HiOutlineBriefcase, HiOutlineArrowRight } from "react-icons/hi2";

<Button leftIcon={<HiOutlineBriefcase className="w-5 h-5" />}>
  Find Jobs
</Button>

<Button rightIcon={<HiOutlineArrowRight className="w-5 h-5" />}>
  Continue
</Button>
```

### States

```tsx
<Button disabled>Disabled</Button>
<Button isLoading>Loading...</Button>
```

### Full Width

```tsx
<Button fullWidth>Full Width Button</Button>
```

### Custom Styling

```tsx
<Button className="custom-class">Custom Button</Button>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"primary" \| "secondary" \| "outline" \| "ghost" \| "danger"` | `"primary"` | Visual style variant |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Button size |
| `fullWidth` | `boolean` | `false` | Whether button should take full width |
| `isLoading` | `boolean` | `false` | Show loading spinner |
| `leftIcon` | `React.ReactNode` | - | Icon to display on the left |
| `rightIcon` | `React.ReactNode` | - | Icon to display on the right |
| `disabled` | `boolean` | `false` | Disable the button |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | HTML button type |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | - | Button content (required) |

All standard HTML button attributes are also supported.

## Responsive Behavior

### Mobile (< 768px)
- Full width by default (unless `fullWidth={false}`)
- Padding: `px-4 py-2` (medium size)
- Text size: `text-sm` (medium size)
- Minimum height: `44px` (touch target compliance)

### Desktop (≥ 768px)
- Auto width by default
- Padding: `px-6 py-3` (medium size)
- Text size: `text-base` (medium size)
- Minimum height: `44px` (maintained)

## Size Specifications

| Size | Mobile Padding | Desktop Padding | Mobile Text | Desktop Text |
|------|---------------|-----------------|-------------|--------------|
| Small | `px-3 py-1.5` | `px-4 py-2` | `text-xs` | `text-sm` |
| Medium | `px-4 py-2` | `px-6 py-3` | `text-sm` | `text-base` |
| Large | `px-6 py-3` | `px-8 py-4` | `text-base` | `text-lg` |

## Accessibility

- Minimum 44px × 44px touch target (WCAG 2.1 Level AAA)
- Visible focus indicators (`focus:ring-2`)
- Proper disabled state styling
- Loading state with `aria-busy` attribute
- Keyboard accessible
- Screen reader friendly

## Examples

### Form Actions

```tsx
<div className="flex flex-col sm:flex-row gap-3">
  <Button variant="outline">Cancel</Button>
  <Button variant="primary">Save Changes</Button>
</div>
```

### Hero CTA

```tsx
<div className="flex flex-col md:flex-row gap-4">
  <Button size="lg" leftIcon={<HiOutlineBriefcase />}>
    Browse Jobs
  </Button>
  <Button size="lg" variant="outline">
    Learn More
  </Button>
</div>
```

### Loading State

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

<Button isLoading={isSubmitting} onClick={handleSubmit}>
  Submit Application
</Button>
```

## Migration Guide

### Before (Inline Button)

```tsx
<button
  type="submit"
  className="bg-primary text-white py-3 px-7 rounded-[10px] text-sm hover:bg-red-700 disabled:bg-gray-300 w-full"
  disabled={isSubmitting}
>
  {isSubmitting ? "Signing In..." : "Sign In"}
</button>
```

### After (Button Component)

```tsx
<Button
  type="submit"
  variant="primary"
  isLoading={isSubmitting}
  fullWidth
>
  Sign In
</Button>
```

## Requirements Satisfied

This component satisfies the following requirements from the responsive design spec:

- **Requirement 2.1**: Minimum padding of `px-4 py-2` on mobile
- **Requirement 2.2**: Padding of `px-6 py-3` on desktop
- **Requirement 2.3**: All interactive elements meet 44px × 44px minimum
- **Requirement 2.5**: Buttons don't dominate mobile viewport (full width is configurable)
- **Requirement 1.4**: Button text scales from `text-sm` on mobile to `text-base` on desktop

## Testing

To view the Button component examples, create a test page:

```tsx
// app/test/buttons/page.tsx

export default function ButtonTestPage() {
  return <ButtonExamples />;
}
```

Then navigate to `/test/buttons` to see all button variants and states.
