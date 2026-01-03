import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { BillingBreadcrumb } from '@/components/billing-breadcrumb'
import PageTitle from '@/components/page-title'
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from '@/components/kibo-ui/status'
import BillingCard from '@/components/kibo-ui/credit-card/billing-card'
import Link from 'next/link'
import { BadgeCheck, Bot, Mail } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { BillingTable } from '@/components/billing-table'

export default async function page() {
  return (
    <div>
      <BillingBreadcrumb />
      <PageTitle
        title="Billing & Subscriptions"
        subtitle="Manage your subscriptions, update payment methods, and download invoices"
      />
      <div className="mt-15 flex w-full flex-col gap-5 lg:flex-row">
        {/* Current Plan card */}
        <Card className="bg-accent flex-1 p-5">
          <CardTitle>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-foreground text-sm">Current Plan</span>
                <h2 className="text-secondary text-2xl font-semibold">Hobby</h2>
                <p className="text-foreground text-sm">
                  Renews on{' '}
                  <span className="text-secondary font-semibold">
                    Oct 24, 2026
                  </span>
                </p>
              </div>
              <div>
                <p className="text-secondary mb-2 text-2xl">
                  $0.00<span className="text-foreground text-sm">/mo</span>
                </p>
                <div className="flex justify-end">
                  <Status status="online">
                    <StatusIndicator />
                    <StatusLabel />
                  </Status>
                </div>
              </div>
            </div>
          </CardTitle>
          <CardContent className="mt-4 px-0">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex gap-2">
                <Bot className="text-primary" />
                <span className="text-secondary text-sm">
                  AI Usage This Month
                </span>
              </div>
              <span className="text-sm">
                <span className="text-secondary">12</span>
                /50 Credits
              </span>
            </div>
            <Progress value={80} />
            <span className="text-foreground mt-3 flex justify-end text-sm">
              Resets in 14 days
            </span>
          </CardContent>
          <CardFooter className="mt-3 flex flex-col border-t px-0">
            <p className="text-foreground mt-4 text-sm">
              Need more power? Upgrade to pro paln for unlimited resume analysis
              and priority support
            </p>
            <Button className="mt-4 mr-auto w-fit cursor-pointer p-6">
              <BadgeCheck className="text-secondary-foreground dark:text-secondary mr-2 h-4 w-4" />
              <span>Upgrade to pro - $19/mo</span>
            </Button>
          </CardFooter>
        </Card>

        {/* Payment method card */}
        <Card className="bg-accent flex-1 p-5">
          <CardTitle className="flex items-center justify-between">
            <h2 className="text-secondary text-2xl font-semibold">
              Payment Method
            </h2>
            <Link href={'/update'} className="text-primary text-sm">
              <span>Update</span>
            </Link>
          </CardTitle>
          <CardContent className="flex justify-center">
            <BillingCard />
          </CardContent>
          <CardFooter className="flex items-start gap-2 border-t">
            <Mail className="text-foreground" />
            <div className="flex flex-col">
              <span className="text-secondary text-sm font-semibold">
                Billing Email
              </span>
              <p className="text-foreground text-sm">dev@249ayman.com</p>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Billing history card */}
      <h1 className="text-secondary mt-10 mb-2 text-2xl font-semibold">
        Billing History
      </h1>
      <Card className="bg-accent overflow-hidden p-0">
        <CardContent className="px-0">
          <BillingTable />
        </CardContent>
      </Card>
    </div>
  )
}
