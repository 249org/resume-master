import { BillingBreadcrumb } from '@/features/billing/components/billing-breadcrumb'
import PageTitle from '@/features/dashboard/components/page-title'
import React from 'react'

export default function page() {
  return (
    <div>
      <BillingBreadcrumb />

      <PageTitle
        title="Manage billing"
        subtitle="Manage your billing information"
      />
    </div>
  )
}
