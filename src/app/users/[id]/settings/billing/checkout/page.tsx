import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCheckoutProductsForAuth } from '@/config/polar-products'
import { BillingCheckoutClient } from '@/components/billing/billing-checkout-client'
import { getBillingSnapshot } from '@/lib/polar/billing-snapshot'

export default async function BillingCheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const hdrs = await headers()
  const session = await auth.api.getSession({ headers: hdrs })
  if (!session) {
    redirect('/sign-in')
  }
  if (session.user.id !== id) {
    redirect(`/users/${session.user.id}/settings/billing/checkout`)
  }

  const configured = getCheckoutProductsForAuth()
  const availableSlugs = configured.map((p) => p.slug)

  const snapshot = await getBillingSnapshot(id, hdrs.get('cookie'))
  const { billing } = snapshot

  const hasRecurringSubscription =
    billing.purchaseKind === 'subscription' &&
    (billing.subscriptionStatus === 'active' ||
      billing.subscriptionStatus === 'trialing')

  const showOneTimeBanner =
    billing.purchaseKind === 'one_time' && !hasRecurringSubscription

  return (
    <BillingCheckoutClient
      userId={id}
      availableSlugs={availableSlugs}
      hasRecurringSubscription={hasRecurringSubscription}
      showOneTimeBanner={showOneTimeBanner}
      billingSummary={{
        planName: billing.planName,
        priceLabel: billing.priceLabel,
        renewsAtLabel: billing.renewsAtLabel,
      }}
    />
  )
}
