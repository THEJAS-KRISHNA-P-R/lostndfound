<div align="center">
  <img src="./public/logos/lofo-merged.png" alt="LOFO Logo" width="300" />
  <h3>Find what's yours.</h3>
</div>

---

**LOFO** is a modern, responsive lost-and-found platform built to help campus communities seamlessly report, browse, and confidently reclaim lost items.

## ✨ Features

- **Secure Authentication**: Robust role-based access control and user registration powered by Supabase Auth.
- **Reporting System**: Easy submission forms to post missing belongings or items you've found on campus.
- **Advanced Dashboard & Browse**: Real-time browsing layout allowing efficient filtering and searching of logged items.
- **Claims & Notifications**: Notify users instantly when an item matches their report or their claim status is updated.
- **Admin Management**: Dedicated, protected `/admin` portal for platform administrators to review reports and oversee claims.
- **Stunning UI**: Highly polished, modern aesthetics using Tailwind CSS, including dark-mode configurations and fluid animations.

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase
- **Icons**: Lucide React
- **Forms**: React Hook Form & Zod
- **Image Processing**: Sharp (for logo/image manipulation)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- A [Supabase](https://supabase.com/) account for remote backend services.

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <your-repo-url>
   cd lostndfound
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the App**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Structure

LOFO relies on several primary Supabase tables tailored for standard reporting workflows:
- **`profiles`**: Extended user data synced to Auth events via triggers. Includes fields like `full_name`, `avatar_url`, and the `role` enum (`admin` or `user`).
- **`items`**: Catalog of items reported lost or found.
- **`claims`**: System tracking user requests attempting to reclaim an item from the registry.
- **`notifications`**: Persistent table driving the local dashboard alert feed.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📜 License
This project is proprietary and built for [Campus/Client Name].
