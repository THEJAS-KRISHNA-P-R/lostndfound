export const CATEGORIES = [
  'Electronics',
  'Documents',
  'Keys',
  'Clothing',
  'Accessories',
  'Bags',
  'Others',
] as const

export type CategoryName = (typeof CATEGORIES)[number]

export const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  active:   { bg: 'bg-green-950',  text: 'text-green-400',  border: 'border-green-800' },
  claimed:  { bg: 'bg-amber-950',  text: 'text-amber-400',  border: 'border-amber-800' },
  resolved: { bg: 'bg-blue-950',   text: 'text-blue-400',   border: 'border-blue-800'  },
  archived: { bg: 'bg-zinc-900',   text: 'text-zinc-400',   border: 'border-zinc-700'  },
  pending:  { bg: 'bg-amber-950',  text: 'text-amber-400',  border: 'border-amber-800' },
  approved: { bg: 'bg-green-950',  text: 'text-green-400',  border: 'border-green-800' },
  rejected: { bg: 'bg-red-950',    text: 'text-red-400',    border: 'border-red-800'   },
}

export const TYPE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  lost:  { bg: 'bg-red-950',   text: 'text-red-400',   border: 'border-red-800'   },
  found: { bg: 'bg-green-950', text: 'text-green-400', border: 'border-green-800' },
}

export const NOTIF_ICONS: Record<string, string> = {
  info:            'info',
  success:         'check-circle',
  warning:         'alert-triangle',
  claim_approved:  'check-circle',
  claim_rejected:  'x-circle',
  contact_shared:  'user-check',
  match_found:     'search',
}

export const ITEM_PLACEHOLDER = '/placeholder-item.svg'
export const AVATAR_PLACEHOLDER = '/placeholder-avatar.svg'
