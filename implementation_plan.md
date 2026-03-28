# LOFO — Definitive Implementation Plan

> **Next.js 16.2.0 · React 19 · Supabase SSR · Tailwind CSS · TypeScript**
> University Lost & Found Platform — Production Ready

---

## Core Architecture Decision Matrix

| Concern | Decision | Rationale |
|---|---|---|
| Routing | Next.js App Router | File-based, colocated layouts, streaming |
| Data fetching (reads) | Server Components | Zero client bundle cost for public data |
| Mutations (writes) | Server Actions | Secure, progressive, no API routes needed |
| Global client state | Zustand (auth + notif count only) | Minimal — only truly global state lives here |
| Session management | `@supabase/ssr` + Middleware | Single source of truth for cookies |
| Route protection | `middleware.ts` only | No ProtectedRoute/AdminRoute wrapper components |
| Forms | `react-hook-form` + `zod` + Server Actions | Client validation + server validation |
| Images | `next/image` + Supabase Storage | Optimized delivery + CDN |
| Fonts | `next/font/google` | Zero layout shift, no external CSS import |
| Animations | `DotGrid` + `MagicRings` as `'use client'` primitives | Isolated, no app logic dependency |

---

## Architecture Principles

### High Cohesion
- Files grouped by **domain** (`items/`, `admin/`, `auth/`), not by layer (`controllers/`, `services/`)
- Each feature folder owns its components, types, and logic
- Shared UI primitives in `components/ui/` — pure presentational, zero business logic

### Low Coupling
- Pages do **not** import from Supabase directly — they call Server Actions or pass Server Component data as props
- Client Components do **not** import from Supabase — they call Server Actions via `form action={}` or `startTransition`
- `ImageUpload` handles its own upload internally — callers receive only a `string[]` of URLs back
- `DotGrid` and `MagicRings` have **zero** imports from anything outside React and their respective libraries

### Simplicity Rules
- **No API routes** — Server Actions replace them entirely
- **No custom auth middleware logic** — `@supabase/ssr` handles cookie management
- **One Supabase client per context** — 3 factory functions max (browser, server, middleware)
- **No redundant abstraction layers** — hooks wrap Zustand or URL state, not DB calls

---

## Complete Folder Structure

```
lostndfound/
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root: fonts, providers, Toaster
│   │   ├── globals.css                 # CSS variables + Tailwind base
│   │   ├── page.tsx                    # Landing (Server Component)
│   │   │
│   │   ├── browse/
│   │   │   └── page.tsx               # Browse feed (Server Component)
│   │   │
│   │   ├── items/
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Item detail (Server, dynamic metadata)
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx               # Login page (Client form + Server Action)
│   │   │
│   │   ├── register/
│   │   │   └── page.tsx               # Register page (Client form + Server Action)
│   │   │
│   │   ├── post/
│   │   │   └── page.tsx               # Post item (protected, Client form)
│   │   │
│   │   ├── claim/
│   │   │   └── [itemId]/
│   │   │       └── page.tsx           # Claim flow (protected, Client form)
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx               # My Profile (protected, Server Component)
│   │   │
│   │   ├── notifications/
│   │   │   └── page.tsx               # Notifications (protected, Server Component)
│   │   │
│   │   └── admin/
│   │       ├── layout.tsx             # Admin layout with sidebar (admin-only)
│   │       ├── page.tsx               # Dashboard (Server Component)
│   │       ├── users/page.tsx         # Users table (Server Component)
│   │       ├── items/page.tsx         # Items management (Server Component)
│   │       ├── claims/page.tsx        # Claims review — CORE WORKFLOW (Server + Client)
│   │       ├── resolved/page.tsx      # Resolved archive (Server Component)
│   │       └── notify/page.tsx        # Send notifications (Client form)
│   │
│   ├── components/
│   │   ├── ui/                        # Pure primitives — NO business logic, NO Supabase
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── FilterChip.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   ├── StepIndicator.tsx
│   │   │   ├── ImageUpload.tsx        # Handles upload internally, returns URL[]
│   │   │   ├── NotifBell.tsx
│   │   │   ├── DotGrid.tsx            # GSAP + Canvas — 'use client', zero app deps
│   │   │   └── MagicRings.tsx         # Three.js WebGL — 'use client', zero app deps
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx             # 'use client' for mobile menu toggle
│   │   │   ├── Footer.tsx
│   │   │   └── PageShell.tsx          # DotGrid backdrop wrapper
│   │   │
│   │   ├── items/
│   │   │   ├── ItemCard.tsx           # Card (can be Server Component)
│   │   │   ├── ItemGrid.tsx           # Grid with Skeleton loader
│   │   │   ├── ModeToggle.tsx         # 'use client' — reads/writes URL search params
│   │   │   └── ItemFilters.tsx        # 'use client' — filter bar with URL sync
│   │   │
│   │   └── admin/
│   │       ├── AdminSidebar.tsx
│   │       ├── ClaimCard.tsx          # Admin claim review card (with approve/reject)
│   │       └── StatCard.tsx           # Dashboard stat card
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # createBrowserClient() — use in 'use client' components
│   │   │   ├── server.ts              # createServerClient() — use in Server Components + Actions
│   │   │   └── middleware.ts          # createServerClient() — use only in middleware.ts
│   │   │
│   │   └── validations/
│   │       ├── auth.ts                # zod: LoginSchema, RegisterSchema
│   │       ├── item.ts                # zod: PostItemSchema
│   │       └── claim.ts               # zod: ClaimSchema
│   │
│   ├── actions/                       # Server Actions — called from Client Components
│   │   ├── auth.ts                    # login(), register(), logout()
│   │   ├── items.ts                   # createItem(), updateItemStatus(), deleteItem()
│   │   ├── claims.ts                  # createClaim(), approveClaim(), rejectClaim()
│   │   └── notifications.ts           # sendNotification(), markAllRead()
│   │
│   ├── hooks/                         # Client hooks — UI state, URL params, stores
│   │   ├── useAuth.ts                 # Reads authStore — exposes {profile, isAdmin}
│   │   └── useNotifications.ts        # Supabase Realtime subscription for unread count
│   │
│   ├── store/
│   │   └── authStore.ts               # Zustand: { profile, session } — populated on mount
│   │
│   ├── types/
│   │   └── index.ts                   # All shared TS types: Profile, Item, Claim, Notification, etc.
│   │
│   └── utils/
│       ├── formatDate.ts              # formatRelative(), formatFull()
│       ├── uploadImage.ts             # uploadToSupabase(file, bucket) → string URL
│       └── constants.ts               # CATEGORIES[], STATUS_COLORS{}, TYPE_COLORS{}
│
├── middleware.ts                       # Session refresh + route protection
├── tailwind.config.ts
├── next.config.ts
└── .env.local
```

---

## Phase 1 — Database & Project Scaffold

### 1.1 Supabase Schema (executed via MCP against `ouhzuqdhfsgqznhyosem`)

Run in a single atomic migration:

**Tables** (in dependency order):
1. `profiles` — UUID PK referencing `auth.users`, fields: full_name, email, uni_reg_no, phone, role (user/admin), avatar_url
2. `categories` — seeded immediately with 7 rows: Electronics, Documents, Keys, Clothing, Accessories, Bags, Others
3. `items` — references profiles + categories; includes `private_details`, `location`, `date_occurred`, `time_occurred` (all private)
4. `claims` — references items + profiles; `UNIQUE(item_id, claimer_id)` enforces one claim per user
5. `notifications` — references profiles; `metadata JSONB` stores contact info on `contact_shared` type
6. `resolved_items` — archive table populated atomically by the `approve_claim()` function

**View:** `public_items` — strips `location`, `date_occurred`, `time_occurred`, `private_details`. **All public-facing queries use this view.**

**Functions & Triggers:**
- `handle_new_user()` → trigger on `auth.users INSERT` → auto-creates `profiles` row from `raw_user_meta_data`
- `update_updated_at()` → trigger on `items BEFORE UPDATE`
- `approve_claim(p_claim_id, p_admin_id, p_admin_note)` → atomic: updates claim + item + inserts `resolved_items` + sends 2 `contact_shared` notifications

**RLS:** Enabled on all 5 tables. Public data gated at VIEW level, private operations gated by `auth.uid()` checks.

**Storage:** Create two buckets: `item-images` (public) and `proof-images` (private).

### 1.2 Project Init

```bash
npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

### 1.3 Dependencies

```bash
npm install @supabase/ssr @supabase/supabase-js zustand lucide-react react-hot-toast framer-motion
npm install react-hook-form zod @hookform/resolvers
npm install gsap three @types/three
```

### 1.4 Environment

```env
NEXT_PUBLIC_SUPABASE_URL=https://ouhzuqdhfsgqznhyosem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## Phase 2 — Design System

### 2.1 `globals.css`

CSS custom properties:
- **Dark palette**: `--bg-base: #0D0F14`, `--bg-surface: #161820`, `--bg-elevated: #1E2028`, `--bg-border: #2A2D37`
- **Accent**: `--accent: #F5A623`, `--accent-hover: #E09410`, `--accent-dim: rgba(245,166,35,0.12)`
- **Text**: `--text-primary: #F0F2F5`, `--text-secondary: #8B8FA8`, `--text-muted: #4E5262`
- **Status tokens**: active (green), claimed (amber), resolved (blue), archived (gray)
- **Radius tokens**: sm 8px, md 12px, lg 20px, xl 28px
- **Shimmer keyframe** for Skeleton animation

### 2.2 `tailwind.config.ts`

Extend with:
- All CSS variable colors as Tailwind color tokens (`bg-base`, `accent`, `text-primary`, etc.)
- Font families: `display` (Playfair Display), `body` (DM Sans), `mono` (JetBrains Mono)
- Custom keyframes: `shimmer`, `float`, `pulse-glow`

### 2.3 `app/layout.tsx`

- Load all three fonts via `next/font/google` — applied as CSS variables to `<html>`
- Wrap `{children}` with `<Toaster>` (react-hot-toast)
- Include `<AuthProvider>` (thin Client Component that initializes `authStore` from session)

---

## Phase 3 — Supabase & Middleware

### 3.1 Supabase Client Factories (`src/lib/supabase/`)

```ts
// client.ts — for 'use client' components
export const createClient = () => createBrowserClient(URL, ANON_KEY)

// server.ts — for Server Components and Server Actions
export const createServerClient = async () => {
  const cookieStore = await cookies()
  return createServerClientSSR(URL, ANON_KEY, { cookies: cookieStore })
}

// middleware.ts — for middleware.ts only
export const createMiddlewareClient = (req, res) =>
  createServerClientSSR(URL, ANON_KEY, { cookies: { get, set, remove } })
```

### 3.2 `middleware.ts` — Route Protection & Session Refresh

- **Always refreshes** session on every request (required by `@supabase/ssr`)
- Redirects `/post`, `/claim/*`, `/profile`, `/notifications` → `/login` if no session
- Redirects `/admin/*` → `/browse` if session exists but `profile.role !== 'admin'`
- Redirects `/login`, `/register` → `/browse` if already logged in

### 3.3 Server Actions (`src/actions/`)

All functions are `'use server'` and follow this pattern:
1. Validate input with zod schema
2. Create server Supabase client
3. Perform DB operation
4. Return `{ success: boolean, error?: string, data?: T }`
5. Caller uses `toast()` based on result

```ts
// auth.ts
export async function login(formData: FormData): Promise<ActionResult>
export async function register(formData: FormData): Promise<ActionResult>
export async function logout(): Promise<void>  // calls redirect('/')

// items.ts
export async function createItem(formData: FormData): Promise<ActionResult<{id: string}>>
export async function updateItemStatus(id: string, status: string): Promise<ActionResult>
export async function deleteItem(id: string): Promise<ActionResult>

// claims.ts
export async function createClaim(formData: FormData): Promise<ActionResult>
export async function approveClaim(claimId: string, note: string): Promise<ActionResult>
export async function rejectClaim(claimId: string, reason: string): Promise<ActionResult>

// notifications.ts
export async function sendNotification(formData: FormData): Promise<ActionResult>
export async function markAllRead(): Promise<ActionResult>
```

---

## Phase 4 — Animation Components (Strictly Isolated)

### `DotGrid.tsx` — `'use client'`

- Exact provided source, ported to Next.js safely
- `dynamic(() => import('./DotGrid'), { ssr: false })` — prevents hydration mismatch
- Placed inside `PageShell.tsx` as `absolute inset-0 z-0 pointer-events-none`
- **Zero imports from any app module**

### `MagicRings.tsx` — `'use client'`

- Exact provided source, ported to Next.js safely
- `dynamic(() => import('./MagicRings'), { ssr: false })` — prevents hydration mismatch
- Used **only** in Landing hero: `absolute inset-0 z-0 opacity-[0.12]`
- **Zero imports from any app module**

### `PageShell.tsx`

```tsx
// 'use client' — wraps all non-hero pages
const DotGrid = dynamic(() => import('../ui/DotGrid'), { ssr: false })

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <DotGrid dotSize={2} gap={38} baseColor="#2A2D37" activeColor="#F5A623"
        proximity={90} speedTrigger={100} className="absolute inset-0 z-0" />
      <div className="relative z-10">{children}</div>
    </div>
  )
}
```

---

## Phase 5 — UI Component Library

All in `src/components/ui/`. Every component is props-only, no Supabase, no store access.

| Component | Key Props | Notes |
|---|---|---|
| `Button` | `variant` (primary/secondary/ghost/danger), `size`, `loading`, `disabled` | `scale(0.98)` on active |
| `Badge` | `type` ('lost'/'found'), `status` ('active'/'claimed'/'resolved'/'pending'/'approved'/'rejected') | Pill, color from constants |
| `Avatar` | `src?`, `fallback` (initials), `size` (24/32/40/48) | Circle, graceful fallback |
| `Modal` | `open`, `onClose`, `title`, `children` | Focus trap, backdrop blur, slide-up mobile |
| `Spinner` | `size` | Accessible `aria-live` |
| `Skeleton` | `variant` ('card'/'text'/'avatar'), `count?` | Shimmer CSS animation |
| `SearchBar` | `value`, `onChange`, `placeholder`, `onClear` | Orange focus border |
| `FilterChip` | `label`, `active`, `onClick` | Pill, orange when active |
| `FilterBar` | `filters[]`, `active`, `sortOptions[]`, `onFilterChange`, `onSortChange` | Horizontal scroll mobile |
| `StepIndicator` | `steps[]`, `currentStep` | Claim flow stepper |
| `ImageUpload` | `maxFiles`, `bucket`, `onComplete(urls)`, `onError` | Handles upload internally |
| `NotifBell` | `count` | Links to `/notifications` |

---

## Phase 6 — Layout Components

### `Navbar.tsx` — `'use client'`

Reads `useAuth()` for session state. Renders two layouts:

**Desktop (≥1024px):** Sticky, `60px`, `backdrop-blur-xl bg-bg-surface/80 border-b border-bg-border`
- Left: LOFO logo → `/`
- Center: `SearchBar` (max-w-[480px])
- Right: `[Post Item]` → `/post`, `NotifBell`, Avatar dropdown (Profile / Logout)

**Mobile (<768px):** `52px` top bar: Logo + icon buttons (search, bell, avatar)
- Bottom tab bar (fixed): Home / Browse / Post / Profile

Auth-aware: shows Login/Register if no session, Avatar dropdown if sessioned.

---

## Phase 7 — Pages

### Landing (`/`) — Server Component
```
[MagicRings bg — absolute, z-0, opacity-10]
Hero: headline "Lost something? / We'll find it."
      Two CTAs: "Browse Items" | "Post Found Item"
Feature Cards (3): Location · Verified Claims · Instant Post
Live Feed: 6 items from public_items (server-fetched)
Footer
```

### Browse (`/browse`) — Server Component
- Reads `searchParams`: `?type=lost|found&category=X&sort=latest&q=keyword`
- Fetches from `public_items` view on server
- Renders `<ItemFilters>` (Client) + `<ItemGrid>` (Server-rendered items passed as props)
- `ModeToggle` is inside `ItemFilters`, updates URL, triggers page re-render

### Item Detail (`/items/[id]`) — Server Component
- `generateMetadata()` for SEO (title, OG tags, description)
- Reads session server-side to determine: isOwner, isAdmin
- Public section: image, title, description, category/type/status
- Private section (`isOwner || isAdmin` only): Location, Date/Time in `🔒` card
- Claim button: shown only if `isAuthed && !isOwner && status === 'active'`
- Owner's view: read-only list of pending claims on this item
- Image gallery: CSS scroll-snap (swipeable mobile)

### Post Item (`/post`) — `'use client'` form
- `PageShell` (DotGrid)
- Type toggle (Found/Lost) at top
- `react-hook-form` + `PostItemSchema` validation
- `ImageUpload` (max 4, `item-images` bucket)
- All fields as per spec including Private Details textarea
- `startTransition(() => createItem(formData))` → success → redirect to new item

### Claim Form (`/claim/[itemId]`) — `'use client'` form
- `PageShell` (DotGrid)
- Read-only item summary at top (server-loaded data passed as prop)
- `StepIndicator` (3 steps)
- Warning banner
- Description textarea (min 50 chars)
- `ImageUpload` (max 3, `proof-images` bucket)
- Duplicate claim error handled gracefully (unique constraint → user-friendly message)

### Profile (`/profile`) — Server Component
- `PageShell` (DotGrid)
- Avatar + name + email + edit button
- Tabs: My Posts / My Claims (URL-based: `?tab=posts|claims`)
- My Posts: `ItemGrid` filtered by user_id
- My Claims: list with `Badge` for claim status

### Notifications (`/notifications`) — Server Component
- `PageShell` (DotGrid)
- "Mark all as read" button → calls `markAllRead()` Server Action
- Ordered list of notification cards
- Unread: `border-l-4 border-accent`
- `contact_shared` type: special expanded card with Name/Email/Phone/Admin Note + "Copy Email" button

---

## Phase 8 — Admin Panel

All under `/admin`. Middleware blocks non-admins at the route level.

### `/admin/layout.tsx`
- `AdminSidebar` on desktop, icon-only on tablet, top bar on mobile
- Sidebar links with icons: Dashboard / Items / Claims (+ pending badge) / Users / Resolved / Send Message

### `/admin/page.tsx` — Dashboard
- 4 `StatCard` components (Total Users / Active Items / Pending Claims / Resolved Today)
- Two panels: Recent Claims table + Recent Registrations table

### `/admin/claims/page.tsx` — Core Admin Workflow
- Three tab segments: Pending / Approved / Rejected (URL param: `?status=pending`)
- `ClaimCard` per claim:
  - Item thumbnail + title + type badge
  - Claimer: name + uni_reg_no + claim description
  - Proof image thumbnails → click opens `Modal` with signed URL
  - `🔒` Private Details box (item's `private_details` shown to admin for verification)
  - **Pending only:** Approve/Reject buttons → each opens confirmation `Modal` → calls Server Action

### Approve flow:
`approveClaim(claimId, note)` → calls `approve_claim()` Postgres RPC → atomic (claim + item + archive + 2 notifications) → toast success → revalidatePath('/admin/claims')

### Reject flow:
`rejectClaim(claimId, reason)` → updates claim + sends rejection notification → toast success → revalidatePath

---

## Phase 9 — Zustand Store & Hooks

### `authStore.ts`
```ts
interface AuthState {
  profile: Profile | null
  session: Session | null
  setProfile: (p: Profile | null) => void
  setSession: (s: Session | null) => void
}
```
Populated once on mount in `AuthProvider` Client Component using `createBrowserClient().auth.getSession()` + `onAuthStateChange`.

### `useAuth.ts`
```ts
export function useAuth() {
  const { profile, session } = useAuthStore()
  return { profile, session, isAdmin: profile?.role === 'admin', isAuthed: !!session }
}
```

### `useNotifications.ts`
Subscribes to Supabase Realtime on `notifications` table for the current user. Returns `unreadCount`. Used in `NotifBell`.

---

## Phase 10 — Types (`src/types/index.ts`)

```ts
export type Profile = { id: string; full_name: string; email: string; uni_reg_no: string; phone?: string; role: 'user' | 'admin'; avatar_url?: string; created_at: string }
export type Item = { id: string; user_id: string; type: 'lost' | 'found'; title: string; description?: string; category_id?: number; images?: string[]; status: 'active' | 'claimed' | 'resolved' | 'archived'; created_at: string; updated_at: string }
export type PublicItem = Omit<Item, 'location' | 'date_occurred' | 'time_occurred' | 'private_details'>
export type Claim = { id: string; item_id: string; claimer_id: string; description: string; proof_images?: string[]; status: 'pending' | 'approved' | 'rejected' | 'withdrawn'; admin_note?: string; created_at: string }
export type Notification = { id: string; user_id: string; sender_id?: string; title: string; message: string; type: 'info' | 'success' | 'warning' | 'claim_approved' | 'claim_rejected' | 'contact_shared'; is_read: boolean; metadata?: Record<string, string>; created_at: string }
export type ActionResult<T = void> = { success: boolean; error?: string; data?: T }
```

---

## Security Checklist

- [ ] `public_items` VIEW used on every public fetch — raw `items` table never queried from public routes
- [ ] Middleware blocks `/admin/*` for non-admins at the network level
- [ ] `approve_claim()` called only via Postgres RPC — never multi-step client UPDATE
- [ ] Proof images served as **signed URLs** — raw `proof-images` bucket paths never exposed
- [ ] `ImageUpload` validates file type (`image/*`) + max size (5MB) before upload
- [ ] User cannot claim own item: button hidden in UI **and** RLS blocks INSERT if `claimer_id = user_id`
- [ ] Duplicate claim caught by DB UNIQUE constraint → shown as user-friendly error toast

---

## Empty / Loading / Error State Contract

Every data-displaying component **must** handle:
1. **Loading** → `<Skeleton>` matching component shape (never full-page spinners)
2. **Empty** → Centered Lucide icon (48px, muted) + message text + optional CTA
3. **Error** → Centered error message + "Try again" button that re-calls the action/fetch

---

## Verification Checklist

| # | Check | Method |
|---|---|---|
| 1 | DB schema applied correctly | MCP: `list_tables` + `execute_sql` spot checks |
| 2 | `handle_new_user` trigger fires on signup | Register → verify profile row appears |
| 3 | `approve_claim()` atomically updates 3 tables + 2 notifications | Manual approve via admin panel |
| 4 | `public_items` view excludes private fields | `SELECT * FROM public_items LIMIT 1` via MCP |
| 5 | Middleware blocks `/admin` for non-admin session | Login as regular user → visit `/admin` |
| 6 | `DotGrid` renders without hydration errors | Browser console check on all protected pages |
| 7 | `MagicRings` renders only on `/` | Check other pages for absence |
| 8 | Mobile layout at 375px | Bottom tab bar, 2-col grid, stacked ItemDetail |
| 9 | Post Item form creates item + uploads images | Full end-to-end post flow |
| 10 | Duplicate claim shows user-friendly error | Submit claim twice on same item |
| 11 | Proof images are served as signed URLs | Inspect network tab on admin claims page |
| 12 | `contact_shared` notification renders contact box | Approve a claim → check notifications |
