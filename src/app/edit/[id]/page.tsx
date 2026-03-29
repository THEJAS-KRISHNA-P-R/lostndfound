import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageShell } from '@/components/layout/PageShell'
import { Navbar } from '@/components/layout/Navbar'
import { EditItemForm } from '@/components/items/EditItemForm'

interface EditItemPageProps {
  params: Promise<{ id: string }>
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch item with full details
  const { data: item, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !item) {
    notFound()
  }

  // Verify ownership
  if (item.user_id !== user.id) {
    redirect('/profile')
  }

  // Prevent editing of claimed items
  if (item.status !== 'active') {
    redirect(`/items/${id}`)
  }

  return (
    <PageShell>
      <Navbar />
      <EditItemForm item={item} />
    </PageShell>
  )
}
