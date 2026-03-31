import { createClient } from '@supabase/supabase-js'

async function test() {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: updatedProfile, error } = await adminClient
    .from('profiles')
    .update({ 
      uni_reg_no: 'CCE24CS999', 
      phone: null 
    })
    .eq('id', '50ba4265-3f6c-4373-97d8-af2440ff6ff0') // artififour@gmail.com
    .select()
    .single()

  console.log('Update Error:', error)
  console.log('Updated Profile:', updatedProfile)

  // Verify what is actually in the db
  const { data: verifyRow } = await adminClient.from('profiles').select('*').eq('id', '50ba4265-3f6c-4373-97d8-af2440ff6ff0').single()
  console.log('Verified DB Row:', verifyRow)
}

test()
