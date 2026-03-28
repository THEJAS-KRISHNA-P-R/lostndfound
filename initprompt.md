Now I'll write the master prompt. This is going to be thorough, structured, and built to not break down.

---

```
╔══════════════════════════════════════════════════════════════╗
║         LOFO — LOST & FOUND MANAGEMENT SYSTEM               ║
║         MASTER PROMPT — FULL STACK BUILD                    ║
║         SUPABASE + REACT + PREMIUM UI                       ║
╚══════════════════════════════════════════════════════════════╝

You are a senior full-stack engineer and UI designer.
Build LOFO — a Lost and Found web platform for universities.

CRITICAL RULES — READ BEFORE ANYTHING ELSE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Do ONE section at a time. Wait for my "confirmed, 
   next section" before proceeding.
2. Never generate placeholder code or TODOs. 
   Every function must be fully implemented.
3. Never use lorem ipsum. Use realistic data.
4. Every file you generate must be 100% complete — 
   no "add your logic here" comments.
5. If something conflicts with Supabase's actual 
   API, fix it. Never write code that won't run.
6. Always write mobile-first responsive code.
   Test every layout at 375px, 768px, and 1440px.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 0 — PROJECT OVERVIEW & TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

App name    : LOFO
Tagline     : "Find what's yours."
Description : A university campus lost and found 
              platform. Students post lost/found items, 
              submit ownership claims, and admins 
              verify and connect people.

TECH STACK (do not change any of these):
  Frontend   : React 18 + Vite
  Styling    : Tailwind CSS + custom CSS variables
  Routing    : react-router-dom v6
  Backend    : Supabase (Auth + Database + Storage + 
               Realtime + Edge Functions)
  State      : Zustand (one store per domain)
  HTTP       : Supabase JS client (@supabase/supabase-js)
  Icons      : lucide-react
  Toasts     : react-hot-toast
  Animation  : framer-motion
  Image host : Supabase Storage buckets
  Forms      : react-hook-form + zod validation

ENVIRONMENT VARIABLES (.env):
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 1 — SUPABASE SCHEMA & SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate ONE complete SQL migration file.
Run this in Supabase SQL editor in order.
Do not split it up.

▸ TABLES:

-- profiles (extends auth.users)
CREATE TABLE profiles (
  id            UUID PRIMARY KEY 
                REFERENCES auth.users(id) 
                ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  uni_reg_no    TEXT NOT NULL UNIQUE,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'user'
                CHECK (role IN ('user','admin')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- categories
CREATE TABLE categories (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE
);
INSERT INTO categories(name) VALUES
  ('Electronics'),('Documents'),('Keys'),
  ('Clothing'),('Accessories'),('Bags'),('Others');

-- items
CREATE TABLE items (
  id              UUID DEFAULT gen_random_uuid() 
                  PRIMARY KEY,
  user_id         UUID REFERENCES profiles(id) 
                  ON DELETE CASCADE NOT NULL,
  type            TEXT NOT NULL 
                  CHECK (type IN ('lost','found')),
  title           TEXT NOT NULL,
  description     TEXT,
  category_id     INT REFERENCES categories(id),
  images          TEXT[],  -- array of storage URLs
  location        TEXT NOT NULL,
  date_occurred   DATE NOT NULL,
  time_occurred   TIME,
  -- PRIVATE: only visible to item owner + admin
  private_details TEXT,
  status          TEXT DEFAULT 'active'
                  CHECK (status IN 
                  ('active','claimed','resolved',
                   'archived')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- claims
CREATE TABLE claims (
  id              UUID DEFAULT gen_random_uuid() 
                  PRIMARY KEY,
  item_id         UUID REFERENCES items(id) 
                  ON DELETE CASCADE NOT NULL,
  claimer_id      UUID REFERENCES profiles(id) 
                  ON DELETE CASCADE NOT NULL,
  -- claimer must answer based on private_details
  description     TEXT NOT NULL,
  proof_images    TEXT[],
  status          TEXT DEFAULT 'pending'
                  CHECK (status IN 
                  ('pending','approved',
                   'rejected','withdrawn')),
  admin_note      TEXT,
  reviewed_by     UUID REFERENCES profiles(id),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(item_id, claimer_id)
);

-- notifications (admin → user messaging)
CREATE TABLE notifications (
  id          UUID DEFAULT gen_random_uuid() 
              PRIMARY KEY,
  user_id     UUID REFERENCES profiles(id) 
              ON DELETE CASCADE NOT NULL,
  sender_id   UUID REFERENCES profiles(id),
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  type        TEXT DEFAULT 'info'
              CHECK (type IN 
              ('info','success','warning',
               'claim_approved','claim_rejected',
               'contact_shared')),
  is_read     BOOLEAN DEFAULT FALSE,
  metadata    JSONB,  -- stores contact info when shared
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- resolved_items (completed claims archive)
CREATE TABLE resolved_items (
  id              UUID DEFAULT gen_random_uuid() 
                  PRIMARY KEY,
  item_id         UUID REFERENCES items(id),
  claim_id        UUID REFERENCES claims(id),
  finder_id       UUID REFERENCES profiles(id),
  claimer_id      UUID REFERENCES profiles(id),
  resolved_at     TIMESTAMPTZ DEFAULT NOW(),
  resolution_note TEXT
);

▸ STORAGE BUCKETS:
Create two buckets in Supabase dashboard:
  1. item-images   — public bucket
  2. proof-images  — private bucket

▸ ROW LEVEL SECURITY:

Enable RLS on ALL tables. Then:

-- profiles: users read all, edit own only
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read profiles"
  ON profiles FOR SELECT USING (true);
CREATE POLICY "users update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- items: public read active items 
--        but private_details hidden via view
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read items"
  ON items FOR SELECT USING (true);
CREATE POLICY "owners insert items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owners update own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "admin full access items"
  ON items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- CRITICAL: Create a VIEW that strips private_details
-- Use this view for all public item fetching
CREATE VIEW public_items AS
  SELECT 
    id, user_id, type, title, description,
    category_id, images, status,
    created_at, updated_at
    -- location, date_occurred, time_occurred 
    -- are intentionally excluded from public view
    -- private_details is intentionally excluded
  FROM items;

-- claims: claimers see own, item owners see 
--         claims on their items, admins see all
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "claimers see own claims"
  ON claims FOR SELECT
  USING (auth.uid() = claimer_id);
CREATE POLICY "item owners see their claims"
  ON claims FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM items
      WHERE items.id = claims.item_id
      AND items.user_id = auth.uid()
    )
  );
CREATE POLICY "admin full access claims"
  ON claims FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
CREATE POLICY "users insert own claims"
  ON claims FOR INSERT
  WITH CHECK (auth.uid() = claimer_id);

-- notifications: users see own only
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "admin insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

▸ DATABASE FUNCTIONS:

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, 
    uni_reg_no, phone)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'uni_reg_no',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at on items
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- When claim approved: resolve item, 
-- share contacts, archive to resolved_items
CREATE OR REPLACE FUNCTION approve_claim(
  p_claim_id UUID,
  p_admin_id UUID,
  p_admin_note TEXT
)
RETURNS void AS $$
DECLARE
  v_claim   claims%ROWTYPE;
  v_item    items%ROWTYPE;
  v_finder  profiles%ROWTYPE;
  v_claimer profiles%ROWTYPE;
BEGIN
  -- get claim
  SELECT * INTO v_claim 
  FROM claims WHERE id = p_claim_id;
  -- get item
  SELECT * INTO v_item 
  FROM items WHERE id = v_claim.item_id;
  -- get finder and claimer profiles
  SELECT * INTO v_finder 
  FROM profiles WHERE id = v_item.user_id;
  SELECT * INTO v_claimer 
  FROM profiles WHERE id = v_claim.claimer_id;

  -- update claim status
  UPDATE claims SET
    status = 'approved',
    admin_note = p_admin_note,
    reviewed_by = p_admin_id,
    reviewed_at = NOW()
  WHERE id = p_claim_id;

  -- update item status
  UPDATE items SET status = 'resolved'
  WHERE id = v_item.id;

  -- archive to resolved_items
  INSERT INTO resolved_items (
    item_id, claim_id, 
    finder_id, claimer_id
  )
  VALUES (
    v_item.id, p_claim_id,
    v_item.user_id, v_claim.claimer_id
  );

  -- notify finder with claimer contact
  INSERT INTO notifications (
    user_id, sender_id, title, message,
    type, metadata
  ) VALUES (
    v_item.user_id, p_admin_id,
    'Claim Approved — Contact Details',
    'Your item claim has been approved. '
    || 'Here are the claimant''s details.',
    'contact_shared',
    jsonb_build_object(
      'name', v_claimer.full_name,
      'email', v_claimer.email,
      'phone', v_claimer.phone,
      'admin_note', p_admin_note
    )
  );

  -- notify claimer with finder contact
  INSERT INTO notifications (
    user_id, sender_id, title, message,
    type, metadata
  ) VALUES (
    v_claim.claimer_id, p_admin_id,
    'Claim Approved — Your Item Is Found',
    'Your claim has been approved. '
    || 'Contact the finder to collect your item.',
    'contact_shared',
    jsonb_build_object(
      'name', v_finder.full_name,
      'email', v_finder.email,
      'phone', v_finder.phone,
      'admin_note', p_admin_note,
      'item_title', v_item.title
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

▸ SEED ADMIN ACCOUNT:
-- Run this AFTER creating the user via 
-- Supabase Auth dashboard with email 
-- admin@lofo.com and password: Lofo@admin2024
-- Then run:
UPDATE profiles 
SET role = 'admin', full_name = 'LOFO Admin',
    uni_reg_no = 'ADMIN001'
WHERE email = 'admin@lofo.com';


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 2 — PROJECT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate exact folder structure and 
every file listed below. No file is optional.

src/
├── lib/
│   └── supabase.js       ← supabase client init
│
├── store/
│   ├── authStore.js      ← zustand: user, session,
│   │                        login, logout, register
│   ├── itemStore.js      ← zustand: items, filters,
│   │                        fetch, create, update
│   └── notifStore.js     ← zustand: notifications,
│                            unread count, mark read
│
├── hooks/
│   ├── useAuth.js        ← wrapper around authStore
│   ├── useItems.js       ← wrapper around itemStore
│   └── useAdmin.js       ← admin-specific queries
│
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx    ← top nav, mobile hamburger,
│   │   │                    notification bell
│   │   └── Footer.jsx
│   │
│   ├── ui/
│   │   ├── Badge.jsx     ← status / type badges
│   │   ├── Spinner.jsx
│   │   ├── Modal.jsx     ← reusable modal wrapper
│   │   ├── ImageUpload.jsx ← drag + drop uploader
│   │   └── NotifBell.jsx ← bell with unread count
│   │
│   ├── items/
│   │   ├── ItemCard.jsx  ← instagram-style card
│   │   ├── ItemGrid.jsx  ← responsive grid
│   │   └── ModeToggle.jsx ← Lost | Found switcher
│   │
│   └── admin/
│       └── AdminSidebar.jsx
│
├── pages/
│   ├── Landing.jsx       
│   ├── Login.jsx         
│   ├── Register.jsx      
│   ├── Browse.jsx        ← main items feed
│   ├── ItemDetail.jsx    ← single item page
│   ├── PostItem.jsx      ← create lost/found post
│   ├── ClaimForm.jsx     ← submit claim for item
│   ├── MyProfile.jsx     ← user's own posts + claims
│   ├── Notifications.jsx ← inbox / messages
│   │
│   └── admin/
│       ├── AdminLayout.jsx
│       ├── AdminDashboard.jsx
│       ├── AdminUsers.jsx
│       ├── AdminItems.jsx
│       ├── AdminClaims.jsx
│       ├── AdminResolved.jsx
│       └── AdminNotify.jsx ← send messages to users
│
├── routes/
│   ├── ProtectedRoute.jsx
│   └── AdminRoute.jsx
│
├── utils/
│   ├── formatDate.js
│   ├── uploadImage.js    ← supabase storage upload
│   └── constants.js      ← status colors, categories
│
├── styles/
│   └── globals.css       ← CSS variables + base
│
├── App.jsx
└── main.jsx

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 3 — DESIGN SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AESTHETIC DIRECTION:
  Dark, editorial, magazine-quality.
  Think Notion meets Dribbble meets 
  a premium fintech app.
  NOT generic SaaS blue. NOT purple gradients.
  
  Primary feel: Deep dark navy backgrounds,
  crisp white cards that float, 
  warm amber/gold as the ONE accent color,
  clean editorial typography.

FONTS (import from Google Fonts):
  Display  : "Playfair Display" — headings, 
             hero text, item titles
  Body     : "DM Sans" — all UI text, 
             labels, body copy
  Mono     : "JetBrains Mono" — IDs, 
             timestamps, codes

CSS VARIABLES (globals.css):
:root {
  /* Core palette */
  --bg-base     : #0D0F14;   /* near-black bg */
  --bg-surface  : #161820;   /* card bg */
  --bg-elevated : #1E2028;   /* modal, dropdown bg */
  --bg-border   : #2A2D37;   /* subtle borders */
  
  /* Accent — warm amber gold */
  --accent       : #F5A623;
  --accent-hover : #E09410;
  --accent-dim   : rgba(245,166,35,0.12);

  /* Text */
  --text-primary  : #F0F2F5;
  --text-secondary: #8B8FA8;
  --text-muted    : #4E5262;

  /* Status */
  --status-active   : #22C55E;
  --status-claimed  : #F59E0B;
  --status-resolved : #3B82F6;
  --status-archived : #6B7280;
  --status-pending  : #F59E0B;
  --status-approved : #22C55E;
  --status-rejected : #EF4444;

  /* Type */
  --type-lost  : #EF4444;
  --type-found : #22C55E;

  /* Spacing */
  --radius-sm : 8px;
  --radius-md : 12px;
  --radius-lg : 20px;
  --radius-xl : 28px;
}

COMPONENT SPECS:

Navbar (mobile-first):
  - Mobile: full-width bottom tab bar with 
    4 icons (Home, Browse, Post, Profile)
  - Desktop: top fixed bar with logo left,
    nav links center, auth buttons right
  - Notification bell with red dot for unread
  - Hamburger on tablet only (768px)
  - Background: blur(20px) + 
    bg-[var(--bg-surface)] + border-bottom

ItemCard (Instagram card style):
  - Aspect ratio: 1:1 image on top (cover fit)
  - Below image: type badge (LOST/FOUND) 
    positioned as overlay on image top-right
  - Title in Playfair Display 
  - Category badge + status badge in a row
  - Username + relative time at bottom
  - Hover: slight scale(1.02) + 
    border color changes to --accent
  - On mobile: 2 columns
  - On tablet: 3 columns
  - On desktop: 4 columns
  - Click anywhere on card → /items/:id

ItemDetail page (like a product page):
  - Left: image gallery (swipeable on mobile)
  - Right: all item details
  - Title in large Playfair Display
  - Two-column detail grid: 
    Category, Type, Status
  - Description full width below
  - PRIVATE section — only shows to 
    owner and admin: 
    Location, Date/Time (inside locked card
    with 🔒 icon, visible only if 
    user.id === item.user_id or isAdmin)
  - Claim button: only shows if:
    - user is logged in
    - user is NOT the item owner
    - item status is 'active'
  - Owner view: shows a section "Claim 
    Requests" listing pending claims 
    with Approve/Reject buttons 
    (no, owners cannot approve — 
     only admin can. Show read-only view.)

ModeToggle:
  - Pill-shaped toggle: "Lost Items" | 
    "Found Items"
  - Selected side gets --accent color
  - Smooth sliding animation on switch
  - Updates URL query param: ?type=lost 
    or ?type=found

Landing page:
  - Use a Particle/Aurora/Beam animated 
    background from reactbits.dev concept:
    Implement a canvas-based floating 
    particle field with connecting lines 
    that move slowly — dark background 
    with gold/amber particle dots — 
    pure CSS + JS animation, 
    no external library needed
  - Hero: large Playfair Display headline
    split into two lines:
    "Lost something?" 
    "We'll find it." 
  - Subtext in DM Sans
  - Two CTA buttons side by side:
    "Post Found Item" (accent filled)
    "Report Lost Item" (outline)
  - Scroll down: 3 feature cards in a row
    with subtle border + icon + description
  - Scroll down: recent items preview 
    (live feed from DB, 6 cards)
  - Footer with app name

PostItem form:
  - Toggle at very top: 
    "I Found Something" | "I Lost Something"
    This sets the type field
  - Fields in order:
    Title (text)
    Category (dropdown)
    Description (textarea)
    Images (drag+drop, max 4, 
            uploads to Supabase Storage)
    Location where found/lost (text)
    Date it happened (date picker)
    Time it happened (time picker)
    Private Details (textarea, label says:
    "Secret details only you would know — 
     e.g. 'has a crack on back left corner'. 
     Admins use this to verify claims. 
     Never shown publicly.")
  - All location, date, time, private_details
    are stored but NEVER shown on public 
    item cards or detail pages
  - On submit: redirect to the new item's 
    detail page

ClaimForm page (/claim/:itemId):
  - Shows read-only item summary at top
  - Form fields:
    "Describe why this item is yours" 
    (textarea, required, min 50 chars)
    "Upload proof images (optional)" 
    (up to 3 images, uploads to 
     proof-images bucket)
  - IMPORTANT NOTE shown on page:
    "Your submission will be reviewed by 
     an admin. Do not include sensitive 
     personal data in this form. 
     The admin will contact you via 
     notification if approved."
  - Submit → creates claim record → 
    toast "Claim submitted. 
    You'll be notified of the decision."
  - User cannot submit a second claim 
    on the same item (check via unique 
    constraint, show error if duplicate)

Notifications page (/notifications):
  - Lists all notifications for the user
  - Each notification is a card showing:
    Title, message, timestamp, type icon
  - If type = 'contact_shared': 
    render a special expanded card showing
    the contact details in a formatted box
    (name, email, phone, admin note)
    with a "Copy Email" button
  - Mark all as read button at top
  - Unread notifications have a 
    left accent border in --accent color

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 4 — ADMIN PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Admin credentials:
  Email    : admin@lofo.com
  Password : Lofo@admin2024

Admin routes are behind AdminRoute.jsx 
which checks profile.role === 'admin'.
Admin has its own layout with sidebar.

AdminLayout.jsx:
  - Left sidebar 260px on desktop
  - Collapses to top bar on mobile
  - Logo + "LOFO Admin" at top
  - Nav links with icons (lucide-react):
      Dashboard    /admin
      Items        /admin/items
      Claims       /admin/claims  ← badge with count
      Users        /admin/users
      Resolved     /admin/resolved
      Send Message /admin/notify
  - Bottom of sidebar: 
    logged in as admin@lofo.com + logout

AdminDashboard.jsx (/admin):
  Stats row — 4 cards:
    Total Users | Active Items | 
    Pending Claims | Resolved Today
  
  Below: two tables side by side
    Left: Recent Claims (last 5, 
          with item title, claimer name, 
          status badge, "Review" link)
    Right: Recent Registrations (last 5 users,
           name, email, joined date)

AdminUsers.jsx (/admin/users):
  Full table with search bar at top.
  Columns:
    # | Full Name | Email | Uni Reg No | 
    Phone | Items Posted | Claims Made | 
    Joined | Actions
  
  "Items Posted" = count of their items
  "Claims Made" = count of their claims
  
  Actions column:
    View Profile (opens modal with full 
    user details)
    Send Notification (opens 
    AdminNotify inline for this user)

AdminItems.jsx (/admin/items):
  Two tabs at top: Lost Items | Found Items
  Full table of items in selected tab.
  Columns:
    # | Image | Title | Category | 
    Status | Posted By | Date | Actions
  
  Actions:
    View → /items/:id in new tab
    Edit Status → dropdown to change status
    Delete → confirm dialog then delete

AdminClaims.jsx (/admin/claims):
  THIS IS THE CORE ADMIN WORKFLOW.
  
  Three tabs: Pending | Approved | Rejected
  
  Each claim card (not table, use cards 
  for this page — easier to scan):
    Item image thumbnail on left
    Item title + type badge
    Claimed by: [user name + uni_reg_no]
    Their claim description (full text)
    Their proof images (thumbnails, 
    click to expand)
    Date submitted
    
    ── PRIVATE DETAILS SECTION ──
    (shown only here for admin verification)
    Item's private_details field shown 
    in a highlighted box labeled:
    "Private verification detail (from poster):"
    Admin compares claim description 
    against this to verify authenticity.
    ─────────────────────────────
    
    Two action buttons (only on Pending):
      ✓ Approve (green) — opens modal:
        "Admin approval note" (textarea)
        Confirm Approve button
        → calls approve_claim() DB function
        → automatically:
           sets claim status = approved
           sets item status = resolved  
           sends notification to both users
           with each other's contact details
           archives to resolved_items
      
      ✗ Reject (red) — opens modal:
        "Reason for rejection" (textarea)
        Confirm Reject button
        → updates claim status = rejected
        → sends rejection notification 
           to claimer with the reason

AdminResolved.jsx (/admin/resolved):
  Shows all resolved items from 
  resolved_items table.
  Columns:
    Item Title | Finder | Claimer | 
    Resolved Date | Admin Note
  Each row expandable to show full details.

AdminNotify.jsx (/admin/notify):
  Send custom notification to a user or 
  all users.
  
  Form:
    Recipient: dropdown (search users by 
    name/email) OR "All Users" option
    
    Type: select (info / warning / success)
    
    Title: text input
    
    Message: textarea
    
    Send button
  
  Below form: 
  "Recently Sent" table showing last 10 
  notifications sent by admin.
  Columns: To | Title | Type | Sent At

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 5 — AUTH FLOWS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Register (/register):
  Fields:
    Full Name
    University Email
    University Registration Number
    Phone Number
    Password (min 8 chars, 1 number, 
              1 uppercase enforced by zod)
    Confirm Password
  
  Calls: supabase.auth.signUp({
    email, password,
    options: { data: { 
      full_name, uni_reg_no, phone 
    }}
  })
  
  The handle_new_user() trigger 
  auto-creates the profile row.
  
  On success: "Check your email to verify 
  your account. Check spam if not received."
  
  Link at bottom: "Already have an account? 
  Log in →"

Login (/login):
  Fields: Email, Password
  
  Calls: supabase.auth.signInWithPassword()
  
  On success:
    - fetch profile to get role
    - if role === 'admin' → /admin
    - else → /browse
  
  Show error toast on wrong credentials.
  
  Link at bottom: 
  "Don't have an account? Register →"

AuthStore (Zustand):
  State: { user, session, profile, loading }
  
  On app init: supabase.auth.getSession()
    If session exists: fetch profile
    Subscribe to supabase.auth.onAuthStateChange
  
  login(email, password):
    signInWithPassword → fetch profile → 
    set state → redirect
  
  logout():
    supabase.auth.signOut() → clear state
    → redirect to /
  
  register(data):
    signUp with metadata → 
    show verify email message

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECTION 6 — RESPONSIVE LAYOUT RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Mobile (< 768px):
  - Bottom tab navigation (4 tabs:
    Home, Browse, Post, Profile)
  - Item grid: 2 columns
  - ItemDetail: stacked (image top, 
    details below, full width)
  - Admin: top navigation bar instead 
    of sidebar, tabs compress to icons

Tablet (768px – 1024px):
  - Top navbar
  - Item grid: 3 columns
  - ItemDetail: 60/40 split
  - Admin sidebar: icon-only (collapsed)

Desktop (> 1024px):
  - Top navbar
  - Item grid: 4 columns
  - ItemDetail: 55/45 split
  - Admin sidebar: full labels visible

TAILWIND CONFIG additions needed:
  - Custom colors matching CSS variables
  - Custom font families for Playfair 
    Display, DM Sans, JetBrains Mono
  - Custom animation: float, pulse-glow

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SECURITY RULES — NON-NEGOTIABLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. NEVER fetch private_details, location, 
   date_occurred, time_occurred from the 
   items table in any public query.
   Always use the public_items VIEW for 
   Browse and ItemDetail public sections.
   
2. NEVER show location or time data on 
   ItemCard or public ItemDetail.
   These are verification tools only.
   Only show them inside the 
   🔒 "Private Details" box 
   visible to owner + admin only.

3. Proof images bucket is PRIVATE.
   Admin fetches them via signed URLs.
   Never expose raw proof image paths.

4. Contact details (phone, email) are 
   NEVER shown publicly.
   They only appear in the 
   'contact_shared' notification 
   after admin approval.

5. A user cannot claim their own item.
   Enforce this both in UI (hide button) 
   and in DB (RLS policy checks 
   user_id !== claimer_id before insert).

6. Admin role check happens server-side 
   via RLS. Frontend isAdmin check is 
   only for UI routing. Never trust 
   frontend-only role checks for 
   data access.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BUILD ORDER — ONE AT A TIME
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Do NOT generate everything at once.
Follow this sequence exactly:

STEP 1 — Database & Supabase setup
  Generate the complete SQL migration.
  Generate supabase.js client.
  Generate seed instructions for admin.
  STOP. Wait for: "Step 1 confirmed."

STEP 2 — Project scaffold & base config
  Vite project init commands.
  tailwind.config.js with custom values.
  globals.css with all CSS variables.
  main.jsx with providers.
  App.jsx with all routes.
  STOP. Wait for: "Step 2 confirmed."

STEP 3 — Auth (Zustand store + pages)
  authStore.js
  Register.jsx (complete with form + zod)
  Login.jsx (complete)
  ProtectedRoute.jsx
  AdminRoute.jsx
  STOP. Wait for: "Step 3 confirmed."

STEP 4 — Landing page
  Landing.jsx with canvas particle animation,
  hero section, feature cards, live items 
  preview section.
  STOP. Wait for: "Step 4 confirmed."

STEP 5 — Items (store + components + pages)
  itemStore.js
  ItemCard.jsx
  ItemGrid.jsx
  ModeToggle.jsx
  Badge.jsx
  Browse.jsx (full with filters + toggle)
  ItemDetail.jsx (full with claim button)
  STOP. Wait for: "Step 5 confirmed."

STEP 6 — Post & Claim flows
  ImageUpload.jsx
  PostItem.jsx (full with image upload)
  ClaimForm.jsx (full)
  uploadImage.js utility
  STOP. Wait for: "Step 6 confirmed."

STEP 7 — Navbar + Notifications
  Navbar.jsx (desktop + mobile bottom tabs)
  notifStore.js
  NotifBell.jsx
  Notifications.jsx (with contact_shared 
  card rendering)
  STOP. Wait for: "Step 7 confirmed."

STEP 8 — User profile page
  MyProfile.jsx (own posts, own claims, 
  claim status, edit profile)
  STOP. Wait for: "Step 8 confirmed."

STEP 9 — Admin panel
  AdminLayout.jsx (sidebar + mobile)
  AdminDashboard.jsx
  AdminUsers.jsx
  AdminItems.jsx
  AdminClaims.jsx (with approve_claim call)
  AdminResolved.jsx
  AdminNotify.jsx
  STOP. Wait for: "Step 9 confirmed."

STEP 10 — Final pass
  Fix any broken imports.
  Ensure every page is mobile responsive.
  Add loading states and empty states 
  to every list/grid.
  Add error boundaries.
  Generate README.md with setup steps.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
START NOW — STEP 1 ONLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Execute Step 1 now. Generate:
1. The complete SQL migration 
   (all tables, RLS, functions, triggers)
   formatted to run top to bottom 
   in Supabase SQL editor without errors.
2. src/lib/supabase.js
3. Step-by-step instructions to:
   a) Create the Supabase project
   b) Create the two storage buckets 
      (item-images public, proof-images private)
   c) Create the admin account via 
      Supabase Auth dashboard
   d) Run the admin seed UPDATE statement
   e) Set VITE environment variables

Do not generate Step 2 until I say 
"Step 1 confirmed."
```

---

## After Each Step — What to Say

```
Step 1 confirmed. Move to Step 2.
Step 2 confirmed. Move to Step 3.
... and so on.
```

## Why This Won't Break Like Before

| Previous Problem | Fix in This Prompt |
|---|---|
| Auth not working | Supabase handles auth natively — no JWT manually, no bcrypt, no custom login route |
| Admin check broken | Role stored in `profiles.role`, checked server-side via RLS — not in a separate admins table that can desync |
| Backend crashing | No backend — Supabase IS the backend. Zero Express server to crash |
| DB connection errors | Supabase client is a single import. No pool, no .env DB strings to misconfigure |
| Contact sharing logic | Handled entirely by `approve_claim()` SQL function — atomic, can't partially fail |
| Admin can't see claims | RLS explicitly grants admin full access to all tables |
| Private data leaking | Dedicated `public_items` view strips private fields at DB level — impossible to accidentally include them |