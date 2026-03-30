-- ============================================================
-- LOFO Database Schema
-- Run this in Supabase SQL Editor to set up all tables
-- ============================================================

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO categories (name) VALUES
  ('Electronics'),
  ('Documents'),
  ('Keys'),
  ('Clothing'),
  ('Accessories'),
  ('Bags'),
  ('Others')
ON CONFLICT (name) DO NOTHING;

-- 2. Profiles (extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  uni_reg_no TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Items
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES categories(id),
  images TEXT[] DEFAULT '{}',
  location TEXT NOT NULL,
  date_occurred DATE NOT NULL,
  time_occurred TIME,
  private_details TEXT,
  security_location TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'claimed', 'resolved', 'archived', 'flagged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Items are viewable by everyone"
  ON items FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert items"
  ON items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own active items"
  ON items FOR UPDATE USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can delete their own items"
  ON items FOR DELETE USING (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- 4. Public Items View (hides private_details)
CREATE OR REPLACE VIEW public_items AS
  SELECT
    id, user_id, type, title, description, category_id,
    images, status, created_at, updated_at
  FROM items;

-- 5. Claims
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  claimer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  proof_images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  admin_note TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  poster_confirmed_at TIMESTAMPTZ,
  claimer_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(item_id, claimer_id)
);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Claims viewable by involved parties and admins"
  ON claims FOR SELECT USING (
    auth.uid() = claimer_id
    OR EXISTS (SELECT 1 FROM items WHERE items.id = claims.item_id AND items.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Authenticated users can create claims"
  ON claims FOR INSERT WITH CHECK (auth.uid() = claimer_id);

CREATE POLICY "Admins and involved users can update claims"
  ON claims FOR UPDATE USING (
    auth.uid() = claimer_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- 7. Resolved Items
CREATE TABLE IF NOT EXISTS resolved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  finder_id UUID NOT NULL REFERENCES profiles(id),
  claimer_id UUID NOT NULL REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolution_note TEXT
);

ALTER TABLE resolved_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Resolved items viewable by admins"
  ON resolved_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR auth.uid() = finder_id
    OR auth.uid() = claimer_id
  );

-- 8. Approve Claim RPC Function
CREATE OR REPLACE FUNCTION approve_claim(
  p_claim_id UUID,
  p_admin_id UUID,
  p_admin_note TEXT DEFAULT ''
) RETURNS VOID AS $$
DECLARE
  v_item_id UUID;
  v_claimer_id UUID;
  v_finder_id UUID;
BEGIN
  -- Get claim details
  SELECT item_id, claimer_id INTO v_item_id, v_claimer_id
  FROM claims WHERE id = p_claim_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Claim not found';
  END IF;

  -- Get item poster
  SELECT user_id INTO v_finder_id
  FROM items WHERE id = v_item_id;

  -- Update claim status
  UPDATE claims
  SET status = 'approved',
      reviewed_by = p_admin_id,
      reviewed_at = now(),
      admin_note = p_admin_note
  WHERE id = p_claim_id;

  -- Update item status
  UPDATE items SET status = 'claimed' WHERE id = v_item_id;

  -- Create resolved_items record
  INSERT INTO resolved_items (item_id, claim_id, finder_id, claimer_id)
  VALUES (v_item_id, p_claim_id, v_finder_id, v_claimer_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 10. Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, uni_reg_no)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'uni_reg_no', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
