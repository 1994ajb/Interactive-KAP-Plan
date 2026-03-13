import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to the Vaseline UK account by default
  // In production, this would come from Supabase
  redirect('/accounts/vaseline-uk')
}
