import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function ContinueJobMatchPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user?.id) {
    redirect(
      '/sign-in?callbackUrl=' + encodeURIComponent('/continue/job-match')
    )
  }
  redirect(`/users/${session.user.id}/job-match?pending=1`)
}
