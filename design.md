# LOFO — Design System & UI Specification

> A minimal, modern, locality-based Lost & Found web platform.
> Clean white surfaces. Orange as the single accent. No gradients. No noise.

---

## 1. Product Overview

**LOFO** is a community-driven Lost & Found platform where users post, browse, and claim lost or found items tied to real locations. The experience must feel trustworthy, fast, and effortless — like a well-designed local bulletin board, digitized.

**Core user actions:**
- Post a lost or found item with an image and location
- Browse a grid of items, filter by status and category
- Claim an item through a simple verification flow
- Manage posts, claims, and notifications from a profile

---

## 2. Design Principles

| Principle | What It Means |
|---|---|
| **Minimal** | No decoration for decoration's sake. Every element earns its place. |
| **Legible** | Information hierarchy is obvious at a glance. |
| **Trustworthy** | Calm, clean, professional — inspires confidence during sensitive claim flows. |
| **Fast to scan** | Grid-based, card-driven. Users find what they need in seconds. |
| **Mobile-first** | Designed for thumb reach. Desktop is an enhancement. |

---

## 3. Style Guide

### 3.1 Color Palette

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Page background |
| `--color-surface` | `#F9F9F9` | Card backgrounds, input fields |
| `--color-border` | `#E5E5E5` | Borders, dividers |
| `--color-text-primary` | `#111111` | Headings, item names |
| `--color-text-secondary` | `#555555` | Body text, descriptions |
| `--color-text-muted` | `#999999` | Timestamps, meta info, location |
| `--color-accent` | `#F97316` | Primary buttons, tags, active states, links |
| `--color-accent-hover` | `#EA6C0A` | Button hover state |
| `--color-accent-light` | `#FFF4ED` | Accent badge backgrounds |
| `--color-error` | `#DC2626` | Error states, rejected claim badges |
| `--color-success` | `#16A34A` | Success states, approved claim badges |

**Rule:** White and off-white dominate. Orange (`#F97316`) is used sparingly and intentionally — buttons, status tags, key actions only. No gradients anywhere. No shadows on backgrounds.

---

### 3.2 Typography

**Font Pairing:**
- **Display / Headings:** `DM Serif Display` — warm, editorial, slightly humanist serif for brand moments and item names
- **Body / UI:** `DM Sans` — clean, geometric, highly legible sans-serif for all functional text

```css
/* Import */
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600&display=swap');
```

| Role | Font | Size | Weight | Color |
|---|---|---|---|---|
| Brand / Logo | DM Serif Display | 20px | 400 | `#111111` |
| Page Title | DM Serif Display | 32–40px | 400 | `#111111` |
| Card Title | DM Sans | 15px | 600 | `#111111` |
| Body | DM Sans | 14px | 400 | `#555555` |
| Meta / Label | DM Sans | 12px | 400 | `#999999` |
| Button | DM Sans | 14px | 600 | `#FFFFFF` |
| Badge / Tag | DM Sans | 11px | 600 | varies |

---

### 3.3 Spacing System

All spacing is based on an **8pt grid**. Use multiples of 4 or 8.

| Token | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |

**Card internal padding:** 12px
**Section padding (mobile):** 16px
**Section padding (desktop):** 40px
**Grid gap:** 16px (mobile), 20px (desktop)

---

### 3.4 Border Radius

| Element | Radius |
|---|---|
| Cards | `10px` |
| Buttons (primary) | `8px` |
| Inputs | `8px` |
| Badges / Tags | `99px` (pill) |
| Avatar | `50%` (circle) |
| Modal | `12px` |

---

### 3.5 Shadows

Shadows are minimal and only on interactive cards.

| State | Shadow |
|---|---|
| Card (default) | `0 1px 3px rgba(0,0,0,0.07)` |
| Card (hover) | `0 4px 12px rgba(0,0,0,0.10)` |
| Modal | `0 8px 32px rgba(0,0,0,0.12)` |
| Dropdown | `0 4px 16px rgba(0,0,0,0.08)` |

---

## 4. Components

### 4.1 Navbar

**Behavior:** Sticky top. Thin. Separates from content via a subtle `1px` border-bottom (`#E5E5E5`). Background stays `#FFFFFF`.

**Layout (desktop):**
```
[ LOFO (logo) ]   [ _____ Search _____ ]   [ Post Item ]  [ Avatar / Login ]
```

**Layout (mobile):**
```
[ LOFO ]                                   [ 🔍 ] [ 👤 ]
```
Search expands to full-width on tap (mobile).

**Specs:**
- Height: `60px` desktop, `52px` mobile
- Logo: DM Serif Display, 20px, `#111111`
- Search input: centered, max-width `480px`, `8px` radius, `#F9F9F9` fill, `1px solid #E5E5E5` border
- "Post Item" button: orange accent, 8px radius, `14px 20px` padding
- Avatar: 32px circle, subtle border

---

### 4.2 Item Card

The atomic unit of the entire app. Must be scannable in under 2 seconds.

**Structure:**
```
┌──────────────────────────┐
│  [Avatar] Username       │  ← Header overlay on image OR above image
│                          │
│    [  1:1 Image  ]       │  ← Square image, fills card width
│                          │
│  Item Name (bold)        │  ← 15px, 600 weight
│  Short description       │  ← 13px, muted, max 2 lines, ellipsis
│                          │
│  [Lost] [📍 Location]    │  ← Badge + meta on same row
│  2 hours ago             │  ← Timestamp, muted
└──────────────────────────┘
```

**Card specs:**
- Background: `#FFFFFF`
- Border: `1px solid #E5E5E5`
- Border radius: `10px`
- Shadow: `0 1px 3px rgba(0,0,0,0.07)`
- Hover: shadow elevates to `0 4px 12px rgba(0,0,0,0.10)`, transition `200ms ease`
- Image: `aspect-ratio: 1 / 1`, `object-fit: cover`, top-rounded corners matching card
- Internal padding: `12px` (below image only)

**Status Badge:**
- `Lost`: orange pill — background `#FFF4ED`, text `#F97316`, border `1px solid #FDBA74`
- `Found`: dark pill — background `#F0FDF4`, text `#16A34A`, border `1px solid #86EFAC`
- Font: 11px, 600 weight, all caps

**User header (above or overlaid on image):**
- Avatar: 24px circle
- Username: 12px, `#555555`, DM Sans 500

---

### 4.3 Search Bar

- Full-width on mobile, max `480px` centered on desktop
- `#F9F9F9` background, `1px solid #E5E5E5` border
- Radius: `8px`
- Left icon: magnifying glass (`#999999`)
- Focus: border becomes `1px solid #F97316`, subtle outline gone
- Placeholder: `"Search items, locations..."` in `#BBBBBB`

---

### 4.4 Filter Bar

Horizontal scrollable chip row below the search or below the navbar on browse page.

**Chips:**
- Default: `#F9F9F9` bg, `#555555` text, `1px solid #E5E5E5` border
- Active: `#F97316` bg, `#FFFFFF` text, no border
- Shape: pill (`99px` radius)
- Font: 13px, 500

**Filter options:**
- All / Lost / Found (toggle — only one active)
- Categories: Electronics, Clothing, Accessories, Documents, Pets, Other
- Sort: Latest, Oldest, Nearby

---

### 4.5 Buttons

**Primary (Orange):**
```
background: #F97316
color: #FFFFFF
border: none
border-radius: 8px
padding: 10px 20px
font: 14px/600 DM Sans
hover: background #EA6C0A
active: scale(0.98)
transition: 150ms ease
```

**Secondary (Outline):**
```
background: transparent
color: #111111
border: 1px solid #E5E5E5
border-radius: 8px
padding: 10px 20px
font: 14px/500 DM Sans
hover: border-color #111111, background #F9F9F9
```

**Ghost / Link:**
```
background: transparent
color: #F97316
border: none
padding: 0
font: 14px/500 DM Sans
hover: text-decoration underline
```

**Danger:**
```
background: #DC2626
color: #FFFFFF
(same radius/padding as primary)
hover: background #B91C1C
```

---

### 4.6 Inputs & Forms

```
background: #F9F9F9
border: 1px solid #E5E5E5
border-radius: 8px
padding: 10px 14px
font: 14px DM Sans, color #111111
placeholder: #BBBBBB

:focus
  border-color: #F97316
  outline: none
  background: #FFFFFF

:invalid / error
  border-color: #DC2626

label:
  font: 13px/500 DM Sans
  color: #555555
  margin-bottom: 6px
  display: block

error message:
  font: 12px DM Sans
  color: #DC2626
  margin-top: 4px
```

---

### 4.7 Avatar

- Sizes: 24px (card), 32px (navbar), 40px (profile), 48px (claim card)
- Shape: circle, `overflow: hidden`
- Fallback: initials on `#F9F9F9` background, `#555555` text
- No decorative borders unless hovered in navbar

---

### 4.8 Modal

Used for: Claim confirmation, quick item preview, delete confirmation.

```
Backdrop: rgba(0,0,0,0.4), blur(4px)
Panel: #FFFFFF, border-radius 12px, max-width 480px
Padding: 32px
Shadow: 0 8px 32px rgba(0,0,0,0.12)
Close button: top-right, 24px icon, color #999999
Animation: fade + scale(0.97 → 1), 200ms ease
```

---

### 4.9 Notification Badge

Small dot or count on navbar icon:
- Background: `#F97316`
- Size: 8px dot or 18px pill for count
- Font: 10px, white, 700

---

## 5. Page-by-Page Specifications

### 5.1 Landing Page (`/`)

**Purpose:** First impression. Converts visitors to users. Light, confident, not flashy.

**Sections:**

**Hero:**
- Full-width, white background
- Headline: DM Serif Display, 48px (desktop), 32px (mobile)  
  → `"Lost something? Found something? Let's fix that."`
- Subtext: DM Sans, 16px, `#555555`, max-width 480px
- Two buttons: `[ Login ]` (outline) and `[ Register ]` (orange primary), side by side
- MagicRings animation: centered beneath or behind headline as ambient background element — white rings on white background, very subtle, adds depth without distraction
  - Props: `color="#F97316"`, `colorTwo="#FDBA74"`, `opacity={0.15}`, `followMouse={false}`, `blur={1}`
- The animation should feel like soft concentric halos, not a focal point

**Feature Cards (3 cards):**
- Light gray border cards, `#F9F9F9` background
- Icon (line style, orange), headline, one-line description
- Icons: 📍 Location-based · 🔒 Verified claims · ⚡ Post in seconds

**Live Item Preview Strip:**
- "Recently posted near you" header
- 3–4 item cards in a horizontal scroll row
- CTA: `[ Browse All Items → ]` in orange ghost style

---

### 5.2 Browse Page (`/browse`)

**Purpose:** Core discovery page. Fast, filterable, scannable.

**Layout:**
- Sticky navbar
- Filter bar (chips) below nav — scrollable on mobile
- Grid of item cards:
  - Mobile: 1 column (full-width cards)
  - Tablet: 2 columns
  - Desktop: 3 columns
  - Wide desktop: 4 columns
- Infinite scroll or "Load more" button (orange outline)

**Empty State:**
- Centered illustration or simple icon
- Text: `"No items found. Try adjusting your filters."`
- No heavy graphics — keep it clean

---

### 5.3 Item Detail Page (`/items/:id`)

**Layout:**
- Max-width container: `720px`, centered
- Top: large image (16:9 or original ratio), full-width, `10px` radius
- Below image: two-column split (desktop) or stacked (mobile)

**Left / Main:**
- Item name: DM Serif Display, 28px
- Description: DM Sans, 15px, `#555555`
- Location, date posted (muted, small)

**Right / Sidebar:**
- Posted by: avatar + username card
- Status badge (Lost / Found)
- `[ Claim This Item ]` — orange primary, full-width in sidebar
- `[ Report Item ]` — ghost red, small text link below

**Public info only:** Contact details hidden until claim is approved.

---

### 5.4 Post Item Page (`/post`)

**Purpose:** Let users report lost or found items quickly.

**Form layout (single column, max-width 560px, centered):**

1. **Image upload**
   - Large dashed border area, `#F9F9F9`, `10px` radius
   - Drag & drop or click to upload
   - Preview thumbnail appears after selection
   - No images decorating this — keep it purely functional

2. **Status toggle:** `[ Lost ]  [ Found ]` — pill toggle, orange = active

3. **Title input** — `"What is the item?"` label

4. **Category select** — dropdown, same input styles

5. **Description textarea** — optional, 3 rows, `"Describe the item..."`

6. **Location input** — `"Where was it lost/found?"`, optional pin icon

7. **Submit button** — full-width orange: `"Post Item"`

---

### 5.5 Claim Flow (`/claim/:itemId`)

**Purpose:** Verify the claimer is the real owner. Must feel trustworthy and guided.

**Step indicator:** 3 horizontal steps with connecting line
- Step 1: Verify · Step 2: Submit proof · Step 3: Await review
- Active step: orange circle; complete: orange filled check; inactive: gray

**Step 1 — Verification Questions:**
- 2–3 questions posted by item owner (color of item, serial number, etc.)
- Simple text inputs
- `[ Next ]` orange button

**Step 2 — Upload Proof (optional):**
- Image upload area (same style as post form)
- `[ Submit Claim ]` orange button

**Step 3 — Confirmation:**
- Centered check circle (not orange — use muted green `#16A34A`)
- Message: `"Your claim has been submitted."`
- `"You'll be notified when the owner reviews it."`
- `[ Back to Browse ]` outline button

---

### 5.6 Auth Pages (`/login`, `/register`)

**Layout:** Centered card, max-width `400px`, white background, subtle border

**Login:**
- Heading: `"Welcome back"` (DM Serif Display, 28px)
- Email + Password inputs
- `[ Log in ]` orange full-width
- `"Don't have an account? Register"` link (orange ghost)
- Forgot password link: small, muted

**Register:**
- Heading: `"Create your account"`
- Fields: Full name, Email, University Reg No, Phone, Password
- `[ Create Account ]` orange full-width
- `"Already have an account? Log in"` link

**No social login in initial design to keep it clean.**

---

### 5.7 Profile Page (`/profile`)

**Layout:**
- Top: avatar (48px) + name + email + edit button
- Tabs: `My Posts` · `My Claims`
- Tab active: orange underline, not filled
- Content: cards in the same grid layout as browse

**Claim status badges:**
- Pending: `#FFF4ED` / `#F97316`
- Approved: `#F0FDF4` / `#16A34A`
- Rejected: `#FEF2F2` / `#DC2626`

---

### 5.8 Notifications Page (`/notifications`)

- Stacked list of notification rows
- Each row: icon (colored by type) + message text + timestamp
- Unread: white background, thin orange left border (`3px`)
- Read: `#F9F9F9` background
- Types: claim update, admin message, contact revealed

---

### 5.9 Admin Pages (`/admin/*`)

**Dashboard (`/admin`):**
- 4 stat cards in a row: Total Items, Total Claims, Pending Claims, Users
- Cards: white bg, `1px` border, stat number in DM Serif Display (large), label in DM Sans muted
- Recent claims table below

**Common admin table pattern:**
- White bg, `1px solid #E5E5E5` border, `8px` radius
- Row hover: `#F9F9F9` background
- Status column: colored badge pills
- Action buttons: small, inline — "Approve" (green outline), "Reject" (red outline)
- Tab navigation: `All | Pending | Approved | Rejected` — orange active underline

---

## 6. Responsive Breakpoints

| Breakpoint | Width | Grid Columns |
|---|---|---|
| Mobile | `< 640px` | 1 |
| Tablet | `640px – 1023px` | 2 |
| Desktop | `1024px – 1279px` | 3 |
| Wide | `≥ 1280px` | 4 |

**Mobile-specific rules:**
- Navbar: logo + two icon buttons only
- Search: full-width below navbar
- Filter chips: horizontal scroll, no wrap
- Cards: full-width, compact padding
- Modals: slide up from bottom (bottom sheet pattern)
- Post form: single column, full-width inputs

---

## 7. Interaction & Motion

Keep motion **purposeful and subtle**. No page transitions with heavy animation.

| Interaction | Animation |
|---|---|
| Card hover | `box-shadow` elevate, `200ms ease` |
| Button hover | Background color shift, `150ms ease` |
| Button active | `scale(0.98)`, `100ms` |
| Modal open | Fade in + `scale(0.97 → 1.0)`, `200ms ease` |
| Filter chip toggle | Background/color swap, `150ms` |
| Tab switch | Orange underline slides, `150ms` |
| Notification dot | No animation (static badge) |
| Form focus | Border color shift to orange, `150ms` |
| Image load | `opacity(0 → 1)`, `300ms` fade |

**No scroll animations. No entrance animations on page load (except hero).**

---

## 8. Iconography

- **Style:** Line icons, 1.5px stroke, rounded ends
- **Library:** Lucide Icons (matches the DM Sans aesthetic perfectly)
- **Size:** 16px (inline), 20px (nav), 24px (large actions)
- **Color:** Inherit from context — `#555555` default, `#F97316` when active

Key icons used:
- 🔍 `search` — navbar, filter
- 📍 `map-pin` — location
- 🔔 `bell` — notifications
- 👤 `user` — profile
- ➕ `plus` — post item
- ✓ `check` — claim approved
- ✕ `x` — close, reject
- `chevron-right` — navigation arrows
- `upload-cloud` — image upload

---

## 9. Empty & Loading States

### Empty States
- Centered, minimal
- Small muted icon (Lucide, 48px, `#CCCCCC`)
- One-liner message: DM Sans, 15px, `#999999`
- CTA where relevant (orange outline button)

### Loading States
- Skeleton screens only — no spinners on full pages
- Skeleton: `#F0F0F0` background, animated shimmer (`background-position` sweep)
- Card skeleton matches exact card proportions

### Error States
- Red border on inputs
- Error message below input in red, 12px
- Page-level errors: centered message with retry button

---

## 10. Accessibility

- All interactive elements meet **WCAG AA** contrast ratios
- Orange `#F97316` on white passes for large text; use bold weight for smaller labels
- Focus states: `2px solid #F97316` outline, `2px offset`
- All images require `alt` text (enforced in post form)
- Form inputs have associated `<label>` elements
- Modals trap focus and return on close
- `aria-live` regions for claim status updates

---

## 11. Tech Stack Assumptions

| Concern | Choice |
|---|---|
| Framework | React (Next.js) |
| Styling | Tailwind CSS |
| Animation | CSS transitions + MagicRings (Three.js) for hero only |
| Icons | Lucide React |
| Fonts | Google Fonts (DM Sans + DM Serif Display) |
| Image handling | Next.js `<Image>` with `object-fit: cover` |

---

## 12. MagicRings Integration (Hero Only)

The MagicRings WebGL animation appears **only on the landing page hero section**, as a subtle ambient background layer — never as a focal element.

```tsx
// Hero background usage
<div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.12 }}>
  <MagicRings
    color="#F97316"
    colorTwo="#FDBA74"
    ringCount={5}
    speed={0.6}
    attenuation={12}
    lineThickness={1.5}
    baseRadius={0.3}
    radiusStep={0.12}
    scaleRate={0.08}
    opacity={1}
    blur={0}
    noiseAmount={0.05}
    rotation={0}
    ringGap={1.8}
    fadeIn={0.7}
    fadeOut={0.5}
    followMouse={false}
    mouseInfluence={0}
    hoverScale={1}
    parallax={0}
    clickBurst={false}
  />
</div>
```

**Rules:**
- Wrapped `div` has `opacity: 0.12` — barely visible, adds depth
- Orange tones match accent color
- `followMouse: false` — static, not distracting
- Only rendered on `/` route, not on any other page

---

*End of LOFO Design Specification — v1.0*
