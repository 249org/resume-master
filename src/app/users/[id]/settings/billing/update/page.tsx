'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import PageTitle from '@/components/page-title'
import { Card, CardContent } from '@/components/ui/card'
import { OpenPolarPortalButton } from '@/components/billing/billing-actions'

export default function UpdateBillingPage() {
  const params = useParams()
  const userId = params.id as string

  return (
    <div className="space-y-8">
      <PageTitle
        title="Payment method"
        subtitle="Update your card and billing details in the Polar customer portal."
      />

      <Card className="bg-accent p-6">
        <CardContent className="space-y-4 px-0">
          <p className="text-foreground text-sm leading-relaxed">
            Resume Master does not store your card number. Payment methods and
            billing address are managed securely by Polar when you use the
            button below.
          </p>
          <OpenPolarPortalButton className="w-full sm:w-auto">
            Open Polar customer portal
          </OpenPolarPortalButton>
        </CardContent>
      </Card>

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
