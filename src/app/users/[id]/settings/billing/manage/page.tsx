'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  AlertTriangle,
  BarChart2,
  Download as DownloadIcon,
  FileDown,
  History,
  ShieldAlert,
  Trash2,
} from '@/components/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import PageTitle from '@/components/page-title'
import { BillingBreadcrumb } from '@/components/billing-breadcrumb'
import { Status, StatusIndicator, StatusLabel } from '@/components/kibo-ui/status'

const lostFeatures = [
  {
    icon: BarChart2,
    title: 'AI Resume Analysis',
    description: 'Access to the GPT-4 optimization engine will be disabled.',
  },
  {
    icon: FileDown,
    title: 'Unlimited Exports',
    description: 'You will revert to 1 watermarked PDF download per month.',
  },
  {
    icon: History,
    title: 'Version History',
    description: 'Access to previous CV versions becomes read-only.',
  },
]

const leaveReasons = [
  { value: 'too_expensive', label: "It's too expensive" },
  { value: 'better_tool', label: 'I found a better tool' },
  { value: 'one_project', label: 'I only needed it for one project' },
  { value: 'missing_features', label: 'Missing specific features' },
  { value: 'other', label: 'Other' },
]

export default function ManageBillingPage() {
  const params = useParams()
  const userId = params.id as string
  const [leaveReason, setLeaveReason] = useState('too_expensive')
  const [feedback, setFeedback] = useState('')

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Breadcrumb + Header */}
      <BillingBreadcrumb />
      <PageTitle
        title="Cancel Subscription"
        subtitle="We're sorry to see you go. Review what you'll lose before confirming."
      />

      {/* Current Status */}
      <Card className="bg-accent p-5">
        <CardContent className="flex items-center justify-between px-0">
          <div>
            <p className="text-foreground text-xs font-semibold uppercase tracking-wider">
              Current Status
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-secondary text-lg font-semibold">Pro Plan</span>
              <Status status="online">
                <StatusIndicator />
                <StatusLabel>ACTIVE</StatusLabel>
              </Status>
            </div>
          </div>
          <div className="text-right">
            <p className="text-foreground text-xs font-semibold uppercase tracking-wider">
              Renews On
            </p>
            <p className="text-secondary mt-1 font-semibold">Oct 24, 2023</p>
          </div>
        </CardContent>
      </Card>

      {/* Features you'll lose */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="text-primary h-4 w-4" />
          <h2 className="text-secondary text-xl font-semibold">
            Features you will lose immediately
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {lostFeatures.map((feature) => (
            <Card key={feature.title} className="bg-accent">
              <CardContent className="pt-5">
                <feature.icon className="text-foreground mb-3 h-6 w-6" />
                <p className="text-secondary text-sm font-semibold">{feature.title}</p>
                <p className="text-foreground mt-1 text-xs">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Data Retention Policy */}
      <Card className="bg-accent p-5">
        <CardContent className="flex items-start gap-4 px-0">
          <ShieldAlert className="text-foreground mt-0.5 h-10 w-10 shrink-0" />
          <div className="flex-1">
            <p className="text-secondary font-semibold">
              Important: Data Retention Policy
            </p>
            <p className="text-foreground mt-1 text-sm">
              Upon cancellation, your historical resume parsing data will be stored
              for{' '}
              <span className="text-secondary font-semibold">30 days</span>. After
              this grace period, all non-active data is permanently deleted from our
              servers to comply with GDPR.
            </p>
          </div>
          <Button variant="outline" size="sm" className="shrink-0 gap-1">
            <DownloadIcon className="h-3 w-3" /> Backup Data
          </Button>
        </CardContent>
      </Card>

      {/* Why leaving */}
      <div className="space-y-3">
        <h2 className="text-secondary text-xl font-semibold">Why are you leaving?</h2>
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

      {/* Optional feedback */}
      <Textarea
        placeholder="Tell us more about your experience (optional)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="min-h-[100px] resize-none"
      />

      <Separator />

      {/* Actions */}
      <div className="flex flex-col items-center justify-between gap-3 pb-4 sm:flex-row">
        <button className="text-destructive flex items-center gap-1.5 text-sm font-medium hover:underline">
          <Trash2 className="h-3.5 w-3.5" />
          Confirm Cancellation
        </button>
        <div className="text-foreground flex items-center gap-3 text-sm">
          Need help?{' '}
          <Link href="#" className="text-primary underline">
            Contact Support
          </Link>
          <Button asChild>
            <Link href={`/users/${userId}/settings/billing`}>
              Nevermind, Keep My Plan
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
