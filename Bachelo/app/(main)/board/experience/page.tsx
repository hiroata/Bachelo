import { redirect } from 'next/navigation'

export default async function ExperienceBoardRedirect() {
  // Get the experience category ID from the database
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/board_categories?slug=eq.confession`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
    },
    cache: 'no-store'
  })
  
  const categories = await response.json()
  const experienceCategory = categories[0]
  
  if (experienceCategory) {
    // Redirect to main board with experience category filter
    redirect(`/board?category=${experienceCategory.id}`)
  } else {
    // Fallback to main board if category not found
    redirect('/board')
  }
}