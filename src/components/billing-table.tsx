import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Status, StatusIndicator, StatusLabel } from './billing-status'

type Invoice = {
  invoice: string
  paymentStatus: 'Paid' | 'Pending' | 'Unpaid'
  totalAmount: string
  date: string
}

const invoices: Invoice[] = [
  {
    invoice: 'INV001',
    paymentStatus: 'Paid',
    totalAmount: '$250.00',
    date: 'Oct 24,2025',
  },
  {
    invoice: 'INV002',
    paymentStatus: 'Pending',
    totalAmount: '$150.00',
    date: 'Oct 24,2025',
  },
  {
    invoice: 'INV003',
    paymentStatus: 'Unpaid',
    totalAmount: '$350.00',
    date: 'Oct 24,2025',
  },
  {
    invoice: 'INV004',
    paymentStatus: 'Paid',
    totalAmount: '$450.00',
    date: 'Oct 24,2025',
  },
  {
    invoice: 'INV005',
    paymentStatus: 'Paid',
    totalAmount: '$550.00',
    date: 'Oct 24,2025',
  },
  {
    invoice: 'INV006',
    paymentStatus: 'Pending',
    totalAmount: '$200.00',
    date: 'Oct 24,2025',
  },
  {
    invoice: 'INV007',
    paymentStatus: 'Unpaid',
    totalAmount: '$300.00',
    date: 'Oct 24,2025',
  },
  {
    invoice: 'INV003',
    paymentStatus: 'Unpaid',
    totalAmount: '$350.00',
    date: 'Oct 24,2025',
  },
  {
    invoice: 'INV003',
    paymentStatus: 'Unpaid',
    totalAmount: '$350.00',
    date: 'Oct 24,2025',
  },
  {
    invoice: 'INV003',
    paymentStatus: 'Unpaid',
    totalAmount: '$350.00',
    date: 'Oct 24,2025',
  },
  {
    invoice: 'INV003',
    paymentStatus: 'Unpaid',
    totalAmount: '$350.00',
    date: 'Oct 24,2025',
  },
  {
    invoice: 'INV003',
    paymentStatus: 'Unpaid',
    totalAmount: '$350.00',
    date: 'Oct 24,2025',
  },
  {
    invoice: 'INV003',
    paymentStatus: 'Unpaid',
    totalAmount: '$350.00',
    date: 'Oct 24,2025',
  },
  {
    invoice: 'INV003',
    paymentStatus: 'Unpaid',
    totalAmount: '$350.00',
    date: 'Oct 24,2025',
  },
]

export function BillingTable() {
  return (
    <div>
      <Table className="">
        <TableHeader className="sticky top-0 z-10">
          <TableRow className="[&>*]:text-secondary sticky mb-10 rounded-lg [&>*]:text-lg [&>*]:font-bold">
            <TableHead>Invoice</TableHead>
            <TableHead> Date</TableHead>
            <TableHead>Amount </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Download</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.invoice}>
              <TableCell className="text-foreground font-medium">
                {invoice.invoice}
              </TableCell>
              <TableCell>{invoice.date}</TableCell>
              <TableCell>{invoice.totalAmount}</TableCell>

              <TableCell>
                <Status status={invoice.paymentStatus}>
                  <StatusIndicator />
                  <StatusLabel />
                </Status>
              </TableCell>
              <TableCell>{invoice.date}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
