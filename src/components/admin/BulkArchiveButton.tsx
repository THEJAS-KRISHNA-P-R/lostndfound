'use client'

import { useState } from 'react'
import { bulkArchiveFlaggedItems } from '@/actions/items'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Loader2, Archive } from 'lucide-react'

export function BulkArchiveButton({ count }: { count: number }) {
  const [loading, setLoading] = useState(false)

  const handleArchive = async () => {
    if (!confirm(`Are you sure you want to archive all ${count} flagged items? This action cannot be undone.`)) return
    
    setLoading(true)
    try {
      const result = await bulkArchiveFlaggedItems()
      if (result.success) {
        toast.success(`Successfully archived ${count} items.`)
      } else {
        toast.error(result.error || 'Failed to archive items.')
      }
    } catch {
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (count === 0) return null

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleArchive}
      disabled={loading}
      className="border-amber-800/60 text-amber-400 hover:bg-amber-950/20 gap-2 h-8"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
      Bulk Archive Flagged
    </Button>
  )
}
