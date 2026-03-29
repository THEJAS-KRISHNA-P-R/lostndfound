# 🛰️ Development Workflow: LOFO (Lost & Found)

This document maps out the high-end architectural patterns and procedures for continuous development on the LOFO platform.

---

## 🚀 Core Architectural Patterns

### 1. The "Truth-Bridge" (Server Actions)
Our notification system handles React hydration race conditions by bypassing client-side RLS for unread counts.
- **Hook**: `src/hooks/useNotifications.ts`
- **Action**: `src/actions/notifications.ts:getUnreadCount`
- **Pattern**: A 500ms settlement delay allows the Supabase session to initialize before fetching the "Truth" from a server action.

### 2. Contextual Routing (Interaction Logic)
We decouple interaction logic from routes to ensure perfect UX terminology.
- **Shared Component**: `src/components/items/InteractionForm.tsx`
- **Routes**:
  - `/claim/[id]`: For Found items (Claiming).
  - `/report-found/[id]`: For Lost items (Returning).
- **Rule**: Metadata must match the URL path for professional "Blueprinted Reality" feel.

### 3. Editorial UI System
All new UI components should follow the "Editorial" design language.
- **Tokens**: Use `var(--color-...)` variables in `src/app/globals.css`.
- **Animations**: Use `framer-motion` for all entrances and state changes.
- **Premium Glows**: Apply `hover:shadow-glow` for interaction feedback.

---

## 🛠 Adding a New Feature

When adding a new feature, follow this five-phase logic:
1. **Model**: Update `types/index.ts` and Supabase DB.
2. **Action**: Implement a Server Action in `actions/`.
3. **Logic**: Create a hook in `hooks/` if state persistence is needed.
4. **Component**: Build a premium, animated UI component in `components/`.
5. **Route**: Implement the page shell in `app/`.

---

## 🗺️ Continuous Hardening
- **Linting**: Keep the build cycle clean of warnings.
- **Type Safety**: Avoid using `any` where possible.
- **Performance**: High-quality images on `/browse` should be optimized via `next/image` with quality `95`.
