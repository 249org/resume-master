import { Card, CardTitle } from '@/components/ui/card'
import { BillingBreadcrumb } from '@/features/billing/components/billing-breadcrumb'
import PageTitle from '@/features/dashboard/components/page-title'
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from '@/components/kibo-ui/status'
export default async function page() {
  return (
    <div>
      <BillingBreadcrumb />
      <PageTitle
        title="Billing & Subscriptions"
        subtitle="Manage your subscriptions, update payment methods, and download invoices"
      />
      <div className="mt-15 flex flex-col gap-5 lg:flex-row">
        <Card className="bg-accent flex-3 p-5">
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
        </Card>
        <Card className="bg-accent flex-2 p-5">
          <CardTitle>Payment Method</CardTitle>
        </Card>
      </div>
    </div>
  )
}
