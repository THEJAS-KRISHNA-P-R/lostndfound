# 📊 Project Status: LOFO (Lost & Found)

**Current Version**: 2.1.0-editorial
**Build Engine**: Next.js 16.2.0 (Turbopack)
**Style Engine**: Premium Vanilla CSS + Framer Motion
**Backend**: Supabase Auth / PostgreSQL / Storage

---

## 🗺️ Page Directory

### 🏠 Public & Landing
- `/` - **Home**: Interactive Hero with dynamic `DotGrid` and quick stats.
- `/browse` - **Marketplace**: Editorial-style grid with premium dual-tier dropdown filters.
- `/login` / `/register` - **Auth**: Fully functional role-based authentication.

### 🍱 Core Features
- `/items/[id]` - **Item Detail**: Context-aware action page (Link to Claim or Report Found).
- `/post` - **Create Item**: Advanced form for reporting lost or found items.
- `/claim/[id]` - **Claim Form**: Specialized route for reclaiming found items.
- `/report-found/[id]` - **Found Form**: Specialized route for returning lost items.
- `/notifications` - **Inbox**: Real-time status updates and admin-mediated contact shared events.

### 👤 User & Admin
- `/profile` - **Dashboard**: Manage your posts, claims, and verified contact info.
- `/admin/claims` - **Interaction Reviews**: Command Center for verifying and approving claims and found reports.
- `/admin/users` - **User Management**: Moderation and role assignment.

---

## 🛰️ Operational & Development Workflows

- [**ADMIN_OPERATIONS.md**](./ADMIN_OPERATIONS.md): Professional governance manual for "Zero-Leak" returns and ownership verification.
- [**DEVELOPMENT_WORKFLOW.md**](./DEVELOPMENT_WORKFLOW.md): Deep-dive into architectural patterns (Truth-Bridge, Contextual Routing, Editorial UI).

### 1. "Zero-Leak" Security
Implementing one-way contact sharing. Responders (finders/claimers) remain anonymous to posters until the poster chooses to initiate contact after admin verification.

### 2. "Truth-Bridge" Notifications
A server-action backed unread counter that handles React hydration races, ensuring the red badge is always accurate to the database.

### 3. Editorial UI System
A luxury aesthetic inspired by modern marketplaces, featuring:
- Glassmorphism dropdowns.
- Amber-gold glow effects on interaction.
- Centered, display-heavy typography.

---

## 📂 Project Structure

```text
src/
├── actions/          # Server Actions (Notifications, Claims, Auth)
├── app/              # Next.js 16 App Router (The "Truth" for routes)
│   ├── admin/        # Admin portal routes
│   ├── browse/       # Editorial marketplace grid
│   ├── claim/        # Context-aware interaction forms
│   ├── items/        # Dynamic detail pages
│   ├── notifications/# Inbox and status feeds
│   └── profile/      # User management
├── components/       # UI Component Library
│   ├── items/        # Cards, Filter Command Centre, Carousels
│   ├── layout/       # Navbar, Footer, PageShell (With DotGrid)
│   └── ui/           # Dropdowns, Badges, Modals, Lightbox
├── hooks/            # Custom React Hooks (useNotifications, useAuth)
├── lib/              # Core Logic (Supabase client/server, Validations)
├── store/            # State Management (Zustand Auth Store)
├── types/            # TypeScript Definitions
└── utils/            # Shared Helpers (Date formatting, Image processors)
```

---

## 📈 Recent Hardening
- [x] **Stabilized Bridge**: Resolved hydration race conditions in the notification indicator.
- [x] **Found-Not-Claimed**: Corrected the logical flow for returning lost items.
- [x] **Editorial Redesign**: Migrated from simple chips to premium dropdowns on `/browse`.
