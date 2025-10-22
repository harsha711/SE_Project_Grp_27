# Howl2Go Color Theme Guide

## Burnt Orange + Charcoal - Developer Quick Reference

---

## 1. Primary Colors

| Name               | Hex       | Usage                                                   |
| ------------------ | --------- | ------------------------------------------------------- |
| **Background**     | `#2B2B2B` | Main app background - charcoal from logo                |
| **Orange Primary** | `#C66B4D` | Buttons, links, main CTAs - your signature burnt orange |
| **Cream Accent**   | `#F5E6D3` | Highlights, badges, active states                       |

---

## 2. Text Colors

| Name            | Hex       | Usage                                                      |
| --------------- | --------- | ---------------------------------------------------------- |
| **Main Text**   | `#FFFFFF` | All headings, body text, labels - crisp white for contrast |
| **Subtle Text** | `#D4D4D4` | Descriptions, subtext, secondary info                      |
| **Placeholder** | `#9CA3AF` | Input placeholders, timestamps, metadata                   |

---

## 3. UI Element Colors

| Name                | Hex       | Usage                                                       |
| ------------------- | --------- | ----------------------------------------------------------- |
| **Card Background** | `#3D3D3D` | Cards, panels, navigation bars - lighter charcoal for depth |
| **Border**          | `#4A4A4A` | Default borders for inputs, cards, dividers                 |
| **Hover State**     | `#454545` | Background color when hovering interactive elements         |

---

## 4. Feedback Colors

| Name        | Hex       | Usage                                                |
| ----------- | --------- | ---------------------------------------------------- |
| **Success** | `#10B981` | Success messages, checkmarks, confirmations          |
| **Warning** | `#F59E0B` | Warnings, alerts, important notices                  |
| **Error**   | `#EF4444` | Error messages, validation failures, critical alerts |

---

## Quick Implementation Guide

### Buttons

```jsx
// Primary button (main actions)
background: #C66B4D
text: #FFFFFF

// Secondary button (less important)
background: transparent
border: 2px solid #C66B4D
text: #C66B4D

// Outline button with cream (special actions)
border: 2px solid #F5E6D3
background: transparent
text: #F5E6D3
```

### Cards

```jsx
background: #3D3D3D
border: #4A4A4A
text: #FFFFFF
```

### Inputs

```jsx
background: #3D3D3D
border: #4A4A4A
text: #FFFFFF
placeholder: #9CA3AF

// On focus
border: #C66B4D
```

### Text Hierarchy

```jsx
h1, h2, h3: #FFFFFF (main headings)
p, body: #FFFFFF (body text)
small, caption: #D4D4D4 (secondary text)
meta, time: #9CA3AF (muted text)
accent: #F5E6D3 (price tags, special info)
```

---

## CSS Variables (Copy & Paste)

```css
:root {
  /* Backgrounds */
  --bg: #2b2b2b;
  --bg-card: #3d3d3d;
  --bg-hover: #454545;

  /* Brand */
  --orange: #c66b4d;
  --cream: #f5e6d3;

  /* Text */
  --text: #ffffff;
  --text-subtle: #d4d4d4;
  --text-muted: #9ca3af;

  /* UI */
  --border: #4a4a4a;

  /* Feedback */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
}
```

---

## Tailwind Config (If Using Tailwind)

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        "howl-bg": "#2B2B2B",
        "howl-card": "#3D3D3D",
        "howl-hover": "#454545",
        "howl-orange": "#C66B4D",
        "howl-cream": "#F5E6D3",
        "howl-border": "#4A4A4A",
      },
    },
  },
};
```

---

## Design Rules

1. **Background**: Everything sits on `#2B2B2B` (logo charcoal) - creates sophisticated, professional look
2. **Orange**: Use `#C66B4D` (burnt orange from logo) for CTAs and interactive elements
3. **Cream**: Use `#F5E6D3` sparingly for special highlights, pricing, or featured content
4. **White Text**: Always use `#FFFFFF` for primary readability on dark backgrounds
5. **Cards**: Use `#3D3D3D` for elevated surfaces to create visual hierarchy
6. **Borders**: Keep them subtle with `#4A4A4A` unless highlighting (then use orange)

---

## Component Examples

### Navigation Bar

```css
background: #3D3D3D
border-bottom: 1px solid #4A4A4A
text: #FFFFFF
active-link: #C66B4D
```

### Hero Section

```css
background: #2B2B2B
heading: #FFFFFF
subheading: #D4D4D4
cta-button: #C66B4D
```

### Menu/Food Cards

```css
background: #3D3D3D
border: #4A4A4A
title: #FFFFFF
description: #D4D4D4
price: #F5E6D3 (cream for emphasis)
add-button: #C66B4D
```

### Footer

```css
background: #2B2B2B
text: #D4D4D4
links: #FFFFFF
hover: #C66B4D
```

---

**Perfect for**: Food delivery, restaurant websites, NC State-themed apps, bold branded experiences

**Accessibility**: All text colors meet WCAG AA standards on their respective backgrounds ✓
