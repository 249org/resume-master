'use client'

import { useState } from 'react'
import PageTitle from '@/components/page-title'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  POLAR_PLAN_DETAILS,
  type PolarCheckoutSlug,
} from '@/config/polar-products'
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'
import { toast } from 'sonner'
import { Check } from '@/components/icons'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { OpenPolarPortalButton } from '@/components/billing/billing-actions'

type BillingSummaryProps = {
  planName: string | null
  priceLabel: string | null
  renewsAtLabel: string | null
}

type Props = {
  userId: string
  availableSlugs: string[]
  hasRecurringSubscription: boolean
  showOneTimeBanner: boolean
  billingSummary: BillingSummaryProps
}

export function BillingCheckoutClient({
  userId,
  availableSlugs,
  hasRecurringSubscription,
  showOneTimeBanner,
  billingSummary,
}: Props) {
  const available = new Set(availableSlugs)
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null)

  const startCheckout = async (slug: PolarCheckoutSlug) => {
    if (!available.has(slug)) return
    setLoadingSlug(slug)
    try {
      await authClient.checkout({ slug })
    } catch (e) {
      console.error(e)
      toast.error(
        'Checkout failed. Use product UUIDs from Polar → Products, and set POLAR_ENV=sandbox if those products are in Sandbox (unset env defaults to production API).',
      )
    } finally {
      setLoadingSlug(null)
    }
  }

  const noProductsConfigured = availableSlugs.length === 0

  return (
    <div className="space-y-8">
      <PageTitle
        title={
          hasRecurringSubscription
            ? 'Your subscription'
            : 'Choose a plan'
        }
        subtitle={
          hasRecurringSubscription
            ? 'You already have an active subscription. Manage or change it in the Polar customer portal.'
            : 'You will be redirected to Polar Checkout to complete payment securely.'
        }
      />

      {hasRecurringSubscription ? (
        <Card className="bg-accent border-primary/30 max-w-xl">
          <CardContent className="pt-6">
            <p className="text-secondary text-lg font-semibold">
              {billingSummary.planName ?? 'Active plan'}
            </p>
            <p className="text-foreground mt-2 text-2xl font-bold">
              {billingSummary.priceLabel ?? '—'}
            </p>
            {billingSummary.renewsAtLabel ? (
              <p className="text-muted-foreground mt-2 text-sm">
                Renews on{' '}
                <span className="text-foreground font-medium">
                  {billingSummary.renewsAtLabel}
                </span>
              </p>
            ) : (
              <p className="text-muted-foreground mt-2 text-sm">
                Renewal date will appear here when Polar provides it.
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <OpenPolarPortalButton className="cursor-pointer">
                Manage billing & payment
              </OpenPolarPortalButton>
              <Button variant="outline" asChild>
                <Link href={`/users/${userId}/settings/billing`}>
                  Back to billing
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {showOneTimeBanner ? (
        <p className="bg-muted text-muted-foreground rounded-lg border px-4 py-3 text-sm">
          You have a <strong className="text-foreground">one-time purchase</strong>.
          You can subscribe to a recurring plan below, or manage billing in the
          portal.
        </p>
      ) : null}

      {noProductsConfigured ? (
        <p className="bg-muted text-muted-foreground rounded-lg border p-4 text-sm">
          No Polar products are configured. Add{' '}
          <code className="text-foreground">POLAR_PRODUCT_PRO_ID</code>,{' '}
          <code className="text-foreground">POLAR_PRODUCT_BASIC_ID</code>, and/or{' '}
          <code className="text-foreground">POLAR_PRODUCT_FREE_ID</code> to your
          environment with the product UUIDs from Polar (Products → copy ID).
        </p>
      ) : null}

      {!hasRecurringSubscription ? (
        <div className="grid gap-4 md:grid-cols-3">
          {POLAR_PLAN_DETAILS.map((plan) => {
            const slugOk = available.has(plan.slug)
            const busy = loadingSlug !== null

            return (
              <Card
                key={plan.slug}
                className={cn(
                  'bg-accent flex flex-col',
                  plan.popular &&
                    'ring-primary/30 border-primary/40 relative ring-2',
                )}
              >
                {plan.popular ? (
                  <Badge className="bg-primary text-primary-foreground absolute -top-2.5 left-1/2 -translate-x-1/2">
                    Popular
                  </Badge>
                ) : null}
                <CardContent className="flex flex-1 flex-col pt-6">
                  <p className="text-secondary text-lg font-semibold">
                    {plan.label}
                  </p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-foreground text-3xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                    {plan.period ? (
                      <span className="text-muted-foreground text-sm">
                        {plan.period}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {plan.description}
                  </p>
                  <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <Check className="text-primary mt-0.5 size-4 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 border-t pt-4">
                  <Button
                    className="w-full"
                    disabled={busy || !slugOk}
                    onClick={() => startCheckout(plan.slug)}
                    title={
                      !slugOk
                        ? 'Set POLAR_PRODUCT_*_ID for this plan in .env'
                        : undefined
                    }
                  >
                    {loadingSlug === plan.slug
                      ? 'Redirecting…'
                      : !slugOk
                        ? `Configure ${plan.label} in Polar`
                        : `Continue with ${plan.label}`}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : null}

      <p className="text-muted-foreground text-center text-sm">
        <Link
          href={`/users/${userId}/settings/billing`}
          className="text-primary underline-offset-4 hover:underline"
        >
          Back to billing
        </Link>
      </p>
    </div>
  )
}
