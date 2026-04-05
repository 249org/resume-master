import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

// This page reads session state — it must not be statically prerendered.
export const dynamic = 'force-dynamic'

export default async function page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    redirect('/sign-in')
  }
  redirect(`/users/${session.user?.id}/resumes`)
}
