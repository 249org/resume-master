import { auth } from '@/lib/auth'
import { pageMetadata } from '@/lib/seo'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

// This page reads session state — it must not be statically prerendered.
export const dynamic = 'force-dynamic'

export const metadata = pageMetadata({
  title: 'Account',
  description:
    'Redirecting to your Resume Master workspace and saved resumes.',
  path: '/users',
  noIndex: true,
})

export default async function page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session) {
    redirect('/sign-in')
  }
  redirect(`/users/${session.user?.id}/resumes`)
}
