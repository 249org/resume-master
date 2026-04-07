import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import PageTitle from '@/components/page-title'
import Link from 'next/link'
import { BadgeCheck, Bot, Mail } from '@/components/icons'
import { CreditCard } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { BillingTable } from '@/components/billing-table'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { enrichOrdersWithInvoiceUrls, getCardPaymentHintForEmail } from '@/lib/polar/billing-data'
import { getBillingSnapshot } from '@/lib/polar/billing-snapshot'
import { OpenPolarPortalButton } from '@/components/billing/billing-actions'

export default async function page({
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
    redirect(`/users/${session.user.id}/settings/billing`)
  }

  const cookie = hdrs.get('cookie')
  const snapshot = await getBillingSnapshot(id, cookie)
  const { stateResult, billing } = snapshot
  const orders = await enrichOrdersWithInvoiceUrls(snapshot.orders)

  const cardHint = session.user.email
    ? await getCardPaymentHintForEmail(session.user.email)
    : null

  const planTitle =
    billing.planName ??
    (billing.subscriptionStatus === 'none'
      ? 'No paid plan'
      : 'Paid subscription')

  const subscriptionBadge = (() => {
    switch (billing.subscriptionStatus) {
      case 'active':
        if (billing.purchaseKind === 'one_time') {
          return <Badge variant="secondary">Purchased</Badge>
        }
        return (
          <Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200">
            Active
          </Badge>
        )
      case 'trialing':
        return <Badge variant="secondary">Trial</Badge>
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>
      case 'none':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            No subscription
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  })()

  const priceLine = billing.priceLabel ?? '—'
  const renewLine = billing.renewsAtLabel ?? '—'

  const firstMeter = billing.meters[0]
  const isPaidWithoutMeters =
    !firstMeter &&
    (billing.purchaseKind === 'one_time' ||
      billing.subscriptionStatus === 'active' ||
      billing.subscriptionStatus === 'trialing')
  const usageLabel = firstMeter
    ? `${firstMeter.consumed} used · ${firstMeter.balance} remaining`
    : isPaidWithoutMeters
      ? 'No usage meters returned for this account yet. In Polar, attach meter benefits to your product and send usage events from this app.'
      : 'Configure usage meters in Polar to track AI credits here.'
  const usageCap =
    firstMeter &&
    (firstMeter.credited > 0
      ? firstMeter.credited
      : firstMeter.consumed + Math.max(0, firstMeter.balance))
  const usagePct =
    firstMeter && usageCap && usageCap > 0
      ? Math.min(100, (firstMeter.consumed / usageCap) * 100)
      : firstMeter
        ? 0
        : 0

  const stateBanner =
    stateResult.status === 'no_customer'
      ? 'No Polar customer yet — subscribe via checkout to activate billing.'
      : stateResult.status === 'error'
        ? `Could not load billing state: ${stateResult.message}`
        : null

  return (
    <div>
      <PageTitle
        title="Billing & Subscriptions"
        subtitle="Manage your subscription, usage, and invoices via Polar."
      />

      {stateBanner && (
        <p className="text-muted-foreground bg-muted/50 mb-6 rounded-lg border px-4 py-3 text-sm">
          {stateBanner}
        </p>
      )}

      <div className="mt-15 flex w-full flex-col gap-5 lg:flex-row">
        <Card className="bg-accent flex-1 p-5">
          <CardTitle>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-foreground text-sm">Current plan</span>
                <h2 className="text-secondary text-2xl font-semibold">
                  {planTitle}
                </h2>
                <p className="text-foreground text-sm">
                  {billing.purchaseKind === 'one_time' ? (
                    <span className="text-muted-foreground">
                      One-time purchase — no renewal billing.
                    </span>
                  ) : billing.renewsAtLabel ? (
                    <>
                      Renews on{' '}
                      <span className="text-secondary font-semibold">
                        {renewLine}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      Renewal date available when you have an active
                      subscription.
                    </span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-secondary mb-2 text-2xl">{priceLine}</p>
                <div className="flex justify-end">{subscriptionBadge}</div>
              </div>
            </div>
          </CardTitle>
          <CardContent className="mt-4 px-0">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex gap-2">
                <Bot className="text-primary" />
                <span className="text-secondary text-sm">
                  Usage (Polar meters)
                </span>
              </div>
              <span className="text-sm">
                <span className="text-secondary">{usageLabel}</span>
              </span>
            </div>
            <Progress value={usagePct} />
          </CardContent>
          <CardFooter className="mt-3 flex flex-col border-t px-0">
            <p className="text-foreground mt-4 text-sm">
              Upgrade or change plans via checkout. Cancel or update payment in
              the Polar customer portal.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button className="w-fit cursor-pointer p-6" asChild>
                <Link href={`/users/${id}/settings/billing/checkout`}>
                  <BadgeCheck className="text-secondary-foreground dark:text-secondary mr-2 h-4 w-4" />
                  Choose a plan
                </Link>
              </Button>
              <OpenPolarPortalButton />
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-destructive gap-1.5 text-sm"
                asChild
              >
                <Link href={`/users/${id}/settings/billing/manage/cancel`}>
                  Cancel or change plan
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="bg-accent flex-1 p-5">
          <CardTitle className="flex items-center justify-between">
            <h2 className="text-secondary text-2xl font-semibold">
              Payment & invoices
            </h2>
            <OpenPolarPortalButton variant="link" className="h-auto p-0">
              Open Polar portal
            </OpenPolarPortalButton>
          </CardTitle>
          <CardContent className="flex flex-col gap-4 pt-4">
            <p className="text-muted-foreground text-sm leading-relaxed">
              Cards and invoices are handled securely by Polar. Use the portal to
              update payment methods and download receipts.
            </p>
            <div className="bg-background/80 rounded-xl border p-4">
              <div className="flex items-start gap-3">
                <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-lg border">
                  <CreditCard className="text-primary size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-secondary text-sm font-semibold">
                    Payment method
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {cardHint ? (
                      <>
                        <span className="text-foreground font-mono text-base tracking-wide">
                          {cardHint.display}
                        </span>
                        <span className="mt-2 block">
                          Expiry and security code are never shown. Open the
                          Polar portal to update this card.
                        </span>
                      </>
                    ) : (
                      <>
                        Card hints need a token with{' '}
                        <code className="text-foreground">payments:read</code> — see{' '}
                        <a
                          href="https://polar.sh/docs/integrate/oat"
                          className="text-primary underline-offset-4 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Polar org tokens
                        </a>
                        . Open the portal to manage payment methods.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-start gap-2 border-t">
            <Mail className="text-foreground" />
            <div className="flex flex-col">
              <span className="text-secondary text-sm font-semibold">
                Account email
              </span>
              <p className="text-foreground text-sm">{session.user.email}</p>
            </div>
          </CardFooter>
        </Card>
      </div>

      <h2 className="text-foreground mt-10 mb-2 text-2xl font-semibold tracking-tight">
        Billing history
      </h2>
      <Card className="bg-accent overflow-hidden p-0">
        <CardContent className="px-0">
          <BillingTable orders={orders} />
        </CardContent>
      </Card>
    </div>
  )
}
