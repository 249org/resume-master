'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Status, StatusIndicator, StatusLabel } from './billing-status'
import { Download } from '@/components/icons'
import type { BillingOrderRow } from '@/lib/polar/orders-map'

type Props = {
  orders: BillingOrderRow[]
}

export function BillingTable({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <p className="text-muted-foreground px-6 py-10 text-center text-sm">
        No orders yet. When you subscribe or make a purchase, invoices will
        appear here. You can also open the Polar customer portal to view
        receipts.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 z-10">
        <TableRow className="[&>*]:text-secondary [&>*]:text-lg [&>*]:font-bold">
          <TableHead>Order</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Receipt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="text-secondary max-w-[200px] truncate font-medium">
              {row.id}
            </TableCell>
            <TableCell className="text-foreground">{row.date}</TableCell>
            <TableCell className="text-foreground">{row.amount}</TableCell>
            <TableCell>
              <Status status={row.status}>
                <StatusIndicator />
                <StatusLabel />
              </Status>
            </TableCell>
            <TableCell>
              {row.receiptUrl ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary h-7 gap-1.5 px-2 text-xs"
                  asChild
                >
                  <a href={row.receiptUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </Button>
              ) : (
                <span className="text-foreground text-xs">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
