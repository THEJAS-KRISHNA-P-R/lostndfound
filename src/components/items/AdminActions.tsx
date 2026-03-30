'use client'

import { useState } from 'react'
import { ShieldCheck, Copy, Check } from 'lucide-react'
import { DeleteItemButton } from './DeleteItemButton'
import toast from 'react-hot-toast'

interface AdminActionsProps {
  itemId: string
  itemTitle: string
}

export function AdminActions({ itemId, itemTitle }: AdminActionsProps) {
  const [copied, setCopied] = useState(false)

  const copyId = () => {
    navigator.clipboard.writeText(itemId)
    setCopied(true)
    toast.success('Item ID copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group overflow-hidden bg-[#1A1D23]/60 backdrop-blur-md border border-amber-500/20 rounded-[var(--radius-md)] mt-12 mb-6">
      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/40" />
      
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-amber-500" />
            <h3 className="font-[var(--font-display)] text-sm font-bold text-amber-500 uppercase tracking-widest">
              Admin Control Panel
            </h3>
          </div>
          <div className="text-[10px] text-amber-500/50 font-mono tracking-tighter">
            SECURE ACCESS · AUTHORIZED ONLY
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              As an administrator, you have elevated permissions to manage this post. 
              Always verify reports before taking irreversible actions.
            </p>
            
            <button 
              onClick={copyId}
              className="flex items-center gap-2 text-[11px] font-mono p-2 bg-black/30 border border-white/5 rounded-[var(--radius-sm)] text-[var(--color-text-muted)] hover:text-white transition-colors w-full"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span className="truncate">{itemId}</span>
            </button>
          </div>

          <div className="flex flex-col justify-end">
            <DeleteItemButton itemId={itemId} title={itemTitle} />
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-0 right-0 p-1 opacity-10 group-hover:opacity-25 transition-opacity">
        <ShieldCheck size={48} />
      </div>
    </div>
  )
}
