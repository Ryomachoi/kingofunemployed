'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return redirect('/login')
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string

  const { error } = await supabase
    .from('posts')
    .insert({ title, content, user_id: user.id })

  if (error) {
    console.error('Error creating post:', error)
    return redirect(`/qna/new?message=${encodeURIComponent('Failed to create post')}`)
  }

  revalidatePath('/qna')
  redirect('/qna')
}