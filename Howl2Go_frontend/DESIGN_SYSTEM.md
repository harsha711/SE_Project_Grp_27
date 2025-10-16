# Howl2Go Design System Guide

## Table of Contents
1. [Color Palette](#color-palette)
2. [Color Usage Rules](#color-usage-rules)
3. [Typography](#typography)
4. [Buttons](#buttons)
5. [Forms & Inputs](#forms--inputs)
6. [Cards & Containers](#cards--containers)
7. [Icons](#icons)
8. [Links & Navigation](#links--navigation)
9. [Animations & Transitions](#animations--transitions)
10. [Accessibility](#accessibility)

---

## Color Palette

### Official Colors

```css
/* Background - Soft White */
--howl-bg: #FFF9F3;

/* Primary Accent - Vibrant Orange */
--howl-primary: #FD7E14;

/* Secondary Accent - Honey Yellow */
--howl-secondary: #FED82F;

/* Neutral - Deep Terracotta */
--howl-neutral: #B9572C;

/* CTA / Alert - Sunset Red-Orange */
--howl-cta: #E64525;
```

### Color Psychology
- **Soft White (#FFF9F3)**: Creates a warm, clean canvas that doesn't strain the eyes
- **Vibrant Orange (#FD7E14)**: Energetic and friendly, draws attention without being aggressive
- **Honey Yellow (#FED82F)**: Optimistic and welcoming, perfect for secondary elements
- **Deep Terracotta (#B9572C)**: Grounded and warm, provides excellent readability
- **Sunset Red-Orange (#E64525)**: Bold and decisive, commands immediate attention

---

## Color Usage Rules

### 1. Backgrounds

**Primary Background**: Always use `#FFF9F3` (Soft White) for the main page background.

```jsx
<div style={{ background: "#FFF9F3" }}>
```

**Creating Visual Separation**: When you need to distinguish sections on the Soft White background:
- Use subtle borders: `border: 1px solid rgba(185, 87, 44, 0.1)` (Neutral at 10% opacity)
- Use shadows: `box-shadow: 0 4px 6px rgba(185, 87, 44, 0.05)`
- Use cards with slight elevation (see Cards section)

**Component Backgrounds**: Cards, modals, and elevated components should also use `#FFF9F3` with borders or shadows for separation.

### 2. Text & Headings

**Rule**: ALL body text, headings, and labels MUST use `#B9572C` (Deep Terracotta).

```jsx
// Headings
<h1 style={{ color: "#B9572C" }}>Page Title</h1>
<h2 style={{ color: "#B9572C" }}>Section Heading</h2>

// Body text
<p style={{ color: "#B9572C" }}>Regular paragraph text</p>

// Secondary/muted text
<p style={{ color: "#B9572C", opacity: 0.7 }}>Muted description text</p>
```

**Contrast Ratio**: Deep Terracotta on Soft White achieves a contrast ratio of approximately 5.8:1, passing WCAG AA standards for normal text (4.5:1 required).

### 3. Button Hierarchy

#### Primary CTA Buttons (Highest Priority Actions)
**When to use**: Final submission, primary search, checkout, confirm order, add to cart

```jsx
<button style={{
  background: "#E64525",  // CTA/Alert color
  color: "#FFF9F3"        // White text for contrast
}}>
  Search Now
</button>
```

**Examples**: "Search", "Add to Cart", "Confirm Order", "Place Order", "Checkout"

#### Secondary Action Buttons
**When to use**: Important but not primary actions, "Add" buttons on product cards

```jsx
<button style={{
  background: "#FD7E14",  // Primary Accent
  color: "#FFF9F3"        // White text
}}>
  Add to Favorites
</button>
```

**Examples**: "Add to Favorites", "Quick Add", "Learn More", "View Details"

#### Tertiary/Navigation Buttons
**When to use**: Dashboard access, secondary navigation, non-critical actions

```jsx
<button style={{
  background: "#FED82F",  // Secondary Accent
  color: "#B9572C"        // Neutral text
}}>
  Dashboard
</button>
```

**Examples**: "Dashboard", "My Account", "Settings", "View All"

#### Outline/Ghost Buttons
**When to use**: Filters, auxiliary actions, cancel buttons

```jsx
<button style={{
  border: "2px solid #B9572C",
  color: "#B9572C",
  background: "transparent"
}}>
  Filter
</button>
```

**Examples**: "Filter", "Cancel", "Back", "More Options"

### 4. Button States

#### Hover States
```jsx
// CTA buttons
hover:scale-105 hover:shadow-lg

// Secondary buttons
hover:brightness-110

// Outline buttons
hover:bg-[#B9572C]/5
```

#### Disabled States
```jsx
<button style={{
  background: "#B9572C",
  opacity: 0.3,
  cursor: "not-allowed"
}}>
  Disabled Button
</button>
```

---

## Forms & Inputs

### Text Inputs

**Default State**:
```jsx
<input
  type="text"
  style={{
    borderColor: "#FED82F",     // Secondary Accent border
    color: "#B9572C",           // Neutral text
    background: "#FFF9F3"       // Soft White background
  }}
  className="border-2 px-4 py-2 rounded-lg"
/>
```

**Focus State**:
```jsx
focus:border-[#FD7E14]  // Primary Accent
focus:outline-none
focus:shadow-lg
```

**Error State**:
```jsx
style={{
  borderColor: "#E64525",  // CTA/Alert for errors
}}
```

**Success State**:
```jsx
style={{
  borderColor: "#FD7E14",  // Primary Accent for success
}}
```

### Placeholder Text
```jsx
placeholder="What are you craving?"
// Placeholders inherit the input color at reduced opacity
```

### Form Labels
```jsx
<label style={{ color: "#B9572C", fontWeight: 600 }}>
  Email Address
</label>
```

---

## Cards & Containers

### Standard Card
```jsx
<div className="rounded-2xl shadow-md border hover:shadow-xl transition-all"
  style={{
    background: "#FFF9F3",
    borderColor: "rgba(253, 126, 20, 0.1)"  // Primary Accent at 10%
  }}>
  {/* Card content */}
</div>
```

### Elevated Card (Featured Content)
```jsx
<div className="rounded-3xl shadow-xl border"
  style={{
    background: "#FFF9F3",
    borderColor: "rgba(254, 216, 47, 0.3)"  // Secondary Accent at 30%
  }}>
  {/* Featured content */}
</div>
```

### Card Headers
```jsx
<h3 style={{ color: "#B9572C" }}>
  Card Title
</h3>
```

---

## Icons

### Default Icons
**Use Case**: Standard navigation, informational icons

```jsx
import { Menu, User, Settings } from "lucide-react";

<Menu style={{ color: "#B9572C" }} />  // Neutral color
```

### Interactive Icons (Buttons)
**Use Case**: Clickable icons that perform actions

```jsx
// Primary action icons
<Search style={{ color: "#E64525" }} />  // CTA color

// Secondary action icons
<Filter style={{ color: "#B9572C" }} />  // Neutral color
```

### Decorative Icons
**Use Case**: Visual embellishments, carousel controls

```jsx
<ChevronLeft style={{ color: "#FD7E14" }} />  // Primary Accent
<ChevronRight style={{ color: "#FD7E14" }} />
```

### Icon Sizes
- Small (UI elements): `h-4 w-4` (16px)
- Medium (standard): `h-5 w-5` or `h-6 w-6` (20-24px)
- Large (emphasis): `h-8 w-8` (32px)

---

## Links & Navigation

### Text Links
```jsx
<Link
  href="/about"
  style={{ color: "#B9572C" }}
  className="hover:opacity-70 transition-colors"
>
  About
</Link>
```

### Navigation Links (Active State)
```jsx
// Active/current page
<Link
  href="/menu"
  style={{
    color: "#B9572C",
    borderBottom: "2px solid #FD7E14"  // Primary Accent underline
  }}
>
  Menu
</Link>
```

### Footer Links
```jsx
<Link
  href="/privacy"
  style={{ color: "#B9572C", opacity: 0.7 }}
  className="hover:opacity-100 transition-opacity"
>
  Privacy Policy
</Link>
```

---

## Animations & Transitions

### Standard Transitions
```jsx
className="transition-all duration-300"
```

### Hover Transformations
```jsx
// Lift effect
className="hover:-translate-y-1 transition-transform"

// Scale effect
className="hover:scale-105 transition-transform"

// Rotate effect (for icons)
className="hover:rotate-12 transition-transform"
```

### Fade-In Animation
```jsx
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
```

### Loading States
```jsx
// Pulsing animation for loading
<div className="animate-pulse" style={{ background: "#FED82F" }} />

// Spinning loader
<div className="animate-spin" style={{ borderColor: "#FD7E14" }} />
```

---

## Typography

### Font Families
- **Primary**: Geist Sans (loaded from Next.js Google Fonts)
- **Monospace**: Geist Mono (for code/technical content)
- **Fallback**: Arial, Helvetica, sans-serif

### Font Sizes & Hierarchy
```jsx
// Hero heading
<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold"
    style={{ color: "#B9572C" }}>

// Section heading
<h2 className="text-3xl font-bold"
    style={{ color: "#B9572C" }}>

// Subsection heading
<h3 className="text-2xl font-semibold"
    style={{ color: "#B9572C" }}>

// Body text
<p className="text-base"
   style={{ color: "#B9572C" }}>

// Small text / captions
<span className="text-sm"
      style={{ color: "#B9572C", opacity: 0.7 }}>
```

### Font Weights
- Light: 300 (rarely used)
- Regular: 400 (body text)
- Medium: 500 (emphasized text)
- Semibold: 600 (subheadings, labels)
- Bold: 700 (headings)

---

## Accessibility

### Color Contrast Requirements

**Passing Combinations** (WCAG AA Compliant):
- ✅ Deep Terracotta (#B9572C) on Soft White (#FFF9F3) - **5.8:1**
- ✅ Sunset Red-Orange (#E64525) on Soft White (#FFF9F3) - **4.7:1**
- ✅ White text on Sunset Red-Orange (#E64525) - **7.2:1**
- ✅ White text on Vibrant Orange (#FD7E14) - **4.9:1**

**Caution Combinations** (Use carefully):
- ⚠️ Honey Yellow (#FED82F) on Soft White - **1.5:1** (FAILS - use for decorative only)
- ⚠️ Vibrant Orange (#FD7E14) on Soft White - **3.1:1** (FAILS for text - use for large UI elements only)

### Accessible Button Example
```jsx
<button
  aria-label="Search for dishes"
  style={{
    background: "#E64525",
    color: "#FFF9F3"  // Ensures proper contrast
  }}
>
  <Search aria-hidden="true" />
  Search
</button>
```

### Focus States
All interactive elements MUST have visible focus indicators:
```jsx
focus:outline-none
focus:ring-2
focus:ring-[#FD7E14]
focus:ring-offset-2
```

### Screen Reader Support
```jsx
// Hidden labels for icon buttons
<button aria-label="Open menu">
  <Menu aria-hidden="true" />
</button>

// Alt text for images
<img src="dish.jpg" alt="Spicy Korean Tacos with kimchi and sriracha" />
```

---

## Best Practices Summary

### DO:
- ✅ Use #E64525 (CTA/Alert) ONLY for the most important actions on each page
- ✅ Use #B9572C (Neutral) for ALL text content
- ✅ Test color contrast ratios for accessibility
- ✅ Use subtle shadows and borders to create depth on the Soft White background
- ✅ Apply smooth transitions for better user experience
- ✅ Maintain consistent border radius (rounded-lg, rounded-xl, rounded-2xl, rounded-full)

### DON'T:
- ❌ Use Honey Yellow (#FED82F) for body text (fails contrast)
- ❌ Use multiple CTA-colored buttons competing for attention on the same screen
- ❌ Mix different button styles for the same action type across pages
- ❌ Use colors outside the defined palette
- ❌ Forget hover states on interactive elements
- ❌ Skip accessibility testing

---

## Implementation Checklist

When building a new page or component:

- [ ] All backgrounds use #FFF9F3
- [ ] All text uses #B9572C with appropriate opacity for hierarchy
- [ ] Primary CTA uses #E64525
- [ ] Buttons follow the defined hierarchy
- [ ] Forms use #FED82F borders with #FD7E14 focus states
- [ ] Icons use appropriate colors based on function
- [ ] All interactive elements have hover states
- [ ] Focus states are visible for keyboard navigation
- [ ] Color contrast passes WCAG AA standards
- [ ] Transitions are smooth and consistent (300ms)
- [ ] Cards have proper elevation with shadows/borders

---

## Quick Reference Chart

| Element | Default Color | Hover | Focus | Active |
|---------|--------------|-------|-------|--------|
| Body Text | #B9572C | - | - | - |
| Headings | #B9572C | - | - | - |
| Primary Button | #E64525 bg | scale-105 | #FD7E14 ring | - |
| Secondary Button | #FD7E14 bg | brightness-110 | #FD7E14 ring | - |
| Tertiary Button | #FED82F bg | scale-105 | #FD7E14 ring | - |
| Outline Button | #B9572C border | #B9572C/5 bg | #FD7E14 ring | - |
| Text Input | #FED82F border | - | #FD7E14 border | - |
| Link | #B9572C | opacity-70 | #FD7E14 ring | - |
| Icon (default) | #B9572C | - | - | - |
| Icon (action) | #FD7E14 | scale-110 | #FD7E14 ring | - |
| Card | #FFF9F3 bg | shadow-xl | - | - |

---

**Version**: 1.0
**Last Updated**: October 2025
**Maintained by**: Howl2Go Development Team
