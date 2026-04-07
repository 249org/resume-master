import { redirect } from 'next/navigation'

export default async function ManageSubscriptionRedirect({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/users/${id}/settings/billing/checkout`)
}
