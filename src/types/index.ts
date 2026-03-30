export type Profile = {
  id: string
  full_name: string
  email: string
  uni_reg_no: string
  phone?: string
  role: 'user' | 'admin'
  avatar_url?: string
  created_at: string
}

export type Category = {
  id: number
  name: string
}

export type Item = {
  id: string
  user_id: string
  type: 'lost' | 'found'
  title: string
  description?: string
  category_id?: number
  images?: string[]
  location: string
  date_occurred: string
  time_occurred?: string
  private_details?: string
  status: 'active' | 'claimed' | 'resolved' | 'archived' | 'flagged'
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  categories?: Pick<Category, 'id' | 'name'>
}

// Stripped version from the public_items VIEW (no private fields)
export type PublicItem = {
  id: string
  user_id: string
  type: 'lost' | 'found'
  title: string
  description?: string
  category_id?: number
  images?: string[]
  status: 'active' | 'claimed' | 'resolved' | 'archived' | 'flagged'
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  categories?: Pick<Category, 'id' | 'name'>
}

export type Claim = {
  id: string
  item_id: string
  claimer_id: string
  description: string
  proof_images?: string[]
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn'
  admin_note?: string
  reviewed_by?: string
  reviewed_at?: string
  poster_confirmed_at?: string | null
  claimer_confirmed_at?: string | null
  created_at: string
  profiles?: Pick<Profile, 'id' | 'full_name' | 'email' | 'phone' | 'uni_reg_no' | 'avatar_url'>
  items?: Pick<Item, 'id' | 'title' | 'type' | 'images' | 'status' | 'private_details'>
}

export type Notification = {
  id: string
  user_id: string
  sender_id?: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'claim_approved' | 'claim_rejected' | 'contact_shared' | 'match_found'
  is_read: boolean
  metadata?: {
    name?: string
    email?: string
    phone?: string
    admin_note?: string
    item_title?: string
    item_id?: string
    lost_item_title?: string
  }
  created_at: string
}

export type ResolvedItem = {
  id: string
  item_id: string
  claim_id: string
  finder_id: string
  claimer_id: string
  resolved_at: string
  resolution_note?: string
  items?: Pick<Item, 'id' | 'title' | 'type'>
  finder?: Pick<Profile, 'id' | 'full_name' | 'email'>
  claimer?: Pick<Profile, 'id' | 'full_name' | 'email'>
}

export type ActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
}

export type ItemFilters = {
  type?: 'lost' | 'found'
  category?: string
  status?: string
  q?: string
  sort?: 'latest' | 'oldest'
}
