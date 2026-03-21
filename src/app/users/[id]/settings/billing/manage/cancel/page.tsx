'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import PageTitle from '@/components/page-title'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { OpenPolarPortalButton } from '@/components/billing/billing-actions'

const leaveReasons = [
  { value: 'too_expensive', label: "It's too expensive" },
  { value: 'better_tool', label: 'I found a better tool' },
  { value: 'one_project', label: 'I only needed it for one project' },
  { value: 'missing_features', label: 'Missing specific features' },
  { value: 'other', label: 'Other' },
]

export default function CancelSubscriptionPage() {
  const params = useParams()
  const userId = params.id as string
  const [leaveReason, setLeaveReason] = useState('too_expensive')
  const [feedback, setFeedback] = useState('')

  return (
    <div className="space-y-6">
      <PageTitle
        title="Cancel or change subscription"
        subtitle="Subscriptions and payment methods are managed in Polar. You can cancel or downgrade from your Polar customer portal."
      />

      <Card className="bg-accent p-5">
        <CardContent className="space-y-4 px-0">
          <p className="text-foreground text-sm leading-relaxed">
            We use Polar for billing. When you open the portal, you can cancel
            renewal, update your card, and download invoices — all in one place.
          </p>
          <OpenPolarPortalButton className="w-full sm:w-auto">
            Open Polar customer portal
          </OpenPolarPortalButton>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-secondary text-xl font-semibold">
          Optional feedback
        </h2>
        <p className="text-muted-foreground text-sm">
          This does not cancel your subscription. Help us improve by sharing why
          you’re considering leaving.
        </p>
        <Card className="bg-accent p-5">
          <CardContent className="px-0">
            <RadioGroup
              value={leaveReason}
              onValueChange={setLeaveReason}
              className="space-y-3"
            >
              {leaveReasons.map((reason) => (
                <div key={reason.value} className="flex items-center gap-3">
                  <RadioGroupItem value={reason.value} id={reason.value} />
                  <Label
                    htmlFor={reason.value}
                    className="text-foreground cursor-pointer text-sm font-normal"
                  >
                    {reason.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      <Textarea
        placeholder="Tell us more about your experience (optional)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="min-h-[100px] resize-none"
      />

      <Separator />

      <div className="flex flex-col items-center justify-between gap-3 pb-4 sm:flex-row">
        <Button variant="ghost" asChild>
          <Link href={`/users/${userId}/settings/billing`}>
            Back to billing
          </Link>
        </Button>
        <p className="text-muted-foreground text-center text-sm">
          Questions? Check your invoices and receipts in the Polar portal.
        </p>
      </div>
    </div>
  )
}
