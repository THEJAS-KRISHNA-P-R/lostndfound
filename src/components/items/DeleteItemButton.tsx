'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { deleteItem } from '@/actions/items'

interface DeleteItemButtonProps {
  itemId: string
  title: string
  isCompact?: boolean
}

export function DeleteItemButton({ itemId, title, isCompact }: DeleteItemButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const result = await deleteItem(itemId)
        // Note: deleteItem might redirect on success, but we handle it just in case
        if (result?.success === false) {
          toast.error(result.error ?? 'Failed to delete item.')
          setIsOpen(false)
        } else {
          toast.success('Item deleted successfully.')
          router.push('/browse')
        }
      } catch {
        toast.error('Failed to delete item. Please try again.')
      } finally {
        setIsOpen(false)
      }
    })
  }

  return (
    <>
      <Button 
        variant="outline" 
        fullWidth={!isCompact} 
        size={isCompact ? 'sm' : 'lg'} 
        onClick={() => setIsOpen(true)}
        className={`${isCompact ? 'text-[10px] py-2' : ''} group/del relative border-red-500/20 text-red-400 hover:text-white hover:bg-red-500 hover:border-red-500 transition-all duration-300 shadow-lg shadow-red-500/5 hover:shadow-red-500/20`}
      >
        {!isCompact && <div className="absolute inset-x-0 bottom-0 h-0.5 bg-red-500 origin-left scale-x-0 group-hover/del:scale-x-100 transition-transform duration-500" />}
        <Trash2 size={isCompact ? 14 : 18} className={`${isCompact ? 'mr-1' : 'mr-2'} group-hover/del:animate-bounce`} />
        <span className={`relative z-10 font-bold uppercase tracking-widest ${isCompact ? 'text-[10px]' : 'text-[11px]'}`}>
          {isCompact ? 'Delete' : 'Delete Item'}
        </span>
      </Button>

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Deletion"
        maxWidth="max-w-md"
      >
        <div className="space-y-6 p-1">
          <div className="relative overflow-hidden bg-red-500/5 border border-red-500/20 rounded-[var(--radius-lg)] p-5">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <AlertTriangle size={80} />
            </div>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 text-red-500 animate-pulse">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-red-500 text-lg">Irreversible Action</h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  You are about to permanently remove <span className="text-[var(--color-text-primary)] font-semibold">&quot;{title}&quot;</span>. 
                  This data cannot be recovered.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button 
              variant="outline" 
              fullWidth
              onClick={() => setIsOpen(false)}
              disabled={isPending}
              className="order-2 sm:order-1"
            >
              Keep Post
            </Button>
            <Button 
              fullWidth
              onClick={handleDelete}
              loading={isPending}
              className="bg-red-500 hover:bg-red-600 text-white border-none shadow-xl shadow-red-500/20 order-1 sm:order-2"
            >
              Delete Forever
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
