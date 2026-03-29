<div align="center">
  <img src="./public/logos/lofo-merged.png" alt="LOFO Logo" width="300" />
  <h3>Find what's yours. Confidently.</h3>
</div>

---

**LOFO** is a premium, campus-wide lost-and-found marketplace built for speed, security, and a visually stunning user experience. We help communities reclaim their belongings through an editorial-style interface and a "Zero-Leak" logic system.

## 🚀 "State-of-the-Art" Architecture

- **Next.js 16.2.0 (Turbopack)**: Blazing-fast development and optimized production bundles.
- **Editorial UI System**: A luxury, display-oriented marketplace design using **Premium Vanilla CSS** and **Framer Motion**.
- **"Zero-Leak" Security**: A proprietary "One-Way Contact" system where owners maintain total anonymity until they choose to initiate a return.
- **Truth-Bridge Notifications**: A resilient server-action backed unread indicator that bypasses client-side hydration races.

## ✨ Premium Features

- **Context-Aware Interactions**: The system distinguishes between "Claiming" (Found items) and "Returning" (Lost items), with mandatory proof-of-possession for lost items.
- **Command Centre Filters**: High-vis, glassmorphic dropdowns for seamless category and status filtering on `/browse`.
- **Dynamic DotGrid Hero**: An interactive, responsive landing page that reacts to cursor movement and provides a professional first impression.
- **Admin Management**: A secure, protected `/admin` portal for reviewing interaction requests and moderating items.

## 🛠 Tech Stack

- **Framework**: Next.js 16.2.0 (App Router)
- **Styling**: Hardened Vanilla CSS (No utility bloat)
- **Animations**: Framer Motion & Lucide Icons
- **Backend**: Supabase (Auth, Postgres, Storage)
- **Validation**: Zod & React Hook Form

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A [Supabase](https://supabase.com/) project.

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd lostndfound
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run development**:
   ```bash
   npm run dev
   ```

## 📂 Documentation (Blueprinted Reality)

- [**PROJECT_STATUS.md**](./PROJECT_STATUS.md): Core page directory and interactive file tree.
- [**ADMIN_OPERATIONS.md**](./ADMIN_OPERATIONS.md): Operational guide for the interaction review process and Zero-Leak security protocol.
- [**DEVELOPMENT_WORKFLOW.md**](./DEVELOPMENT_WORKFLOW.md): High-end architectural patterns (Truth-Bridge, Contextual Routing, Editorial UI).

---

## 🚀 Specialized Routes

- **`/claim/[id]`**: Reclaiming found items (Owner verification required).
- **`/report-found/[id]`**: Returning lost items (Mandatory photo proof of possession).

## 🤝 Community
Contributions, issues, and feature requests are welcome!

## 📜 License
This project is proprietary and built for [Campus/Client Name].
