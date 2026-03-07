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

type Invoice = {
  invoice: string
  paymentStatus: 'Paid' | 'Pending' | 'Unpaid'
  totalAmount: string
  date: string
}

const invoices: Invoice[] = [
  { invoice: 'INV001', paymentStatus: 'Paid',    totalAmount: '$250.00', date: 'Oct 24, 2025' },
  { invoice: 'INV002', paymentStatus: 'Pending', totalAmount: '$150.00', date: 'Oct 24, 2025' },
  { invoice: 'INV003', paymentStatus: 'Unpaid',  totalAmount: '$350.00', date: 'Oct 24, 2025' },
  { invoice: 'INV004', paymentStatus: 'Paid',    totalAmount: '$450.00', date: 'Sep 24, 2025' },
  { invoice: 'INV005', paymentStatus: 'Paid',    totalAmount: '$550.00', date: 'Sep 24, 2025' },
  { invoice: 'INV006', paymentStatus: 'Pending', totalAmount: '$200.00', date: 'Aug 24, 2025' },
  { invoice: 'INV007', paymentStatus: 'Unpaid',  totalAmount: '$300.00', date: 'Aug 24, 2025' },
  { invoice: 'INV008', paymentStatus: 'Paid',    totalAmount: '$350.00', date: 'Jul 24, 2025' },
  { invoice: 'INV009', paymentStatus: 'Paid',    totalAmount: '$350.00', date: 'Jun 24, 2025' },
  { invoice: 'INV010', paymentStatus: 'Paid',    totalAmount: '$350.00', date: 'May 24, 2025' },
  { invoice: 'INV011', paymentStatus: 'Unpaid',  totalAmount: '$350.00', date: 'Apr 24, 2025' },
  { invoice: 'INV012', paymentStatus: 'Paid',    totalAmount: '$350.00', date: 'Mar 24, 2025' },
  { invoice: 'INV013', paymentStatus: 'Pending', totalAmount: '$350.00', date: 'Feb 24, 2025' },
  { invoice: 'INV014', paymentStatus: 'Paid',    totalAmount: '$350.00', date: 'Jan 24, 2025' },
]

export function BillingTable() {
  const handleDownload = (invoiceId: string) => {
    // In a real app this would trigger a PDF download from the server
    const link = document.createElement('a')
    link.href = '#'
    link.download = `${invoiceId}.pdf`
    link.click()
  }

  return (
    <Table>
      <TableHeader className="sticky top-0 z-10">
        <TableRow className="[&>*]:text-secondary [&>*]:text-lg [&>*]:font-bold">
          <TableHead>Invoice</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Download</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.invoice}>
            <TableCell className="text-secondary font-medium">
              {invoice.invoice}
            </TableCell>
            <TableCell className="text-foreground">{invoice.date}</TableCell>
            <TableCell className="text-foreground">{invoice.totalAmount}</TableCell>
            <TableCell>
              <Status status={invoice.paymentStatus}>
                <StatusIndicator />
                <StatusLabel />
              </Status>
            </TableCell>
            <TableCell>
              {invoice.paymentStatus === 'Paid' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:text-primary gap-1.5 h-7 px-2 text-xs"
                  onClick={() => handleDownload(invoice.invoice)}
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
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
