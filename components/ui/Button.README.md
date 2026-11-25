# Button Component

A responsive, accessible button component that implements mobile-first design patterns with a 44px minimum touch height.

## Features

- ✅ **Touch Target**: Minimum 44px height (`min-h-[44px]`). Width comes from padding and content; it is not forced to 44px
- ✅ **Responsive Padding**: `px-4 py-2` on mobile, `px-5 py-2.5` on desktop (medium size)
- ✅ **Responsive Text Sizing**: `text-sm` on mobile, `text-base` on desktop (medium size)
- ✅ **Mobile-First**: Always full width on mobile; `fullWidth` keeps it full width on desktop too
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
| `fullWidth` | `boolean` | `false` | Full width at every size. Without it the button is full width below `md` and auto width from `md` up |
| `isLoading` | `boolean` | `false` | Disables the button, sets `aria-busy`, and replaces the content and icons with a spinner and "Loading..." |
| `leftIcon` | `React.ReactNode` | - | Icon to display on the left, sized `w-4 h-4 md:w-5 md:h-5` |
| `rightIcon` | `React.ReactNode` | - | Icon to display on the right, same sizing |
| `disabled` | `boolean` | unset | Disable the button |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | HTML button type |
| `className` | `string` | - | Additional CSS classes |
| `children` | `React.ReactNode` | - | Button content (required) |

All standard HTML button attributes are passed through, and the component forwards its `ref` to the `<button>`. It is exported both as `Button` and as the default export.

## Responsive Behavior

### Mobile (< 768px)
- Always full width
- Padding: `px-4 py-2` (medium size)
- Text size: `text-sm` (medium size)
- Minimum height: `44px` (touch target compliance)

### Desktop (≥ 768px)
- Auto width, unless `fullWidth`
- Padding: `px-5 py-2.5` (medium size)
- Text size: `text-base` (medium size)
- Minimum height: `44px` (maintained)

## Size Specifications

| Size | Mobile Padding | Desktop Padding | Mobile Text | Desktop Text |
|------|---------------|-----------------|-------------|--------------|
| Small | `px-3 py-1.5` | `px-4 py-2` | `text-xs` | `text-sm` |
| Medium | `px-4 py-2` | `px-5 py-2.5` | `text-sm` | `text-base` |
| Large | `px-5 py-2.5` | `px-6 py-3` | `text-base` | `text-lg` |

## Accessibility

- Minimum 44px height on every size
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
  className="bg-primary text-white py-3 px-7 rounded-[10px] text-sm hover:bg-primary-hover disabled:bg-gray-300 w-full"
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

## Seeing every variant

`components/ui/Button.stories.tsx` renders the variants, sizes and states in Storybook: run `pnpm storybook` and open http://localhost:6006.
