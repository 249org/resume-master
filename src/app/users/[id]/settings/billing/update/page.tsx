'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  CreditCard,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  Trash2,
} from '@/components/icons'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import PageTitle from '@/components/page-title'
import { BillingBreadcrumb } from '@/components/billing-breadcrumb'
import BillingCard from '@/components/kibo-ui/credit-card/billing-card'

export default function UpdateBillingPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [cardNumber, setCardNumber] = useState('0123 4567 8901 2345')
  const [cardName, setCardName] = useState('John R. Doe')
  const [expiry, setExpiry] = useState('01/24')
  const [cvv, setCvv] = useState('')
  const [billingEmail, setBillingEmail] = useState('dev@249ayman.com')
  const [addressLine1, setAddressLine1] = useState('123 Innovation Dr, Suite 400')
  const [addressLine2, setAddressLine2] = useState('')
  const [city, setCity] = useState('San Francisco')
  const [state, setState] = useState('CA')
  const [zip, setZip] = useState('94105')
  const [country, setCountry] = useState('United States')
  const [taxId, setTaxId] = useState('US-123456789')

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return digits
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Header */}
      <BillingBreadcrumb />
      <div className="flex items-start justify-between">
        <PageTitle
          title="Update Payment Details"
          subtitle="Update your card information and billing address."
        />
        <Button
          className="shrink-0 gap-2"
          size="sm"
          onClick={() => router.push(`/users/${userId}/settings/billing`)}
        >
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row">
        {/* Left: Form */}
        <div className="flex-1 space-y-5">
          {/* Card Details */}
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-secondary text-xl">
                <CreditCard className="h-4 w-4" /> Card Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm">Card Number</Label>
                <Input
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm">Cardholder Name</Label>
                <Input
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John R. Doe"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-foreground text-sm">Expiry Date</Label>
                  <Input
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground text-sm">CVV</Label>
                  <Input
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                    type="password"
                    maxLength={4}
                    className="font-mono"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <ShieldCheck className="text-primary h-4 w-4 shrink-0" />
                <p className="text-foreground text-xs">
                  Your payment information is encrypted and stored securely. We never store raw card data.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Billing Contact */}
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-secondary text-xl">
                <Mail className="h-4 w-4" /> Billing Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm">Billing Email</Label>
                <Input
                  value={billingEmail}
                  onChange={(e) => setBillingEmail(e.target.value)}
                  type="email"
                  placeholder="billing@example.com"
                />
                <p className="text-foreground text-xs">
                  Invoices and payment receipts will be sent to this address.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm">Tax ID / VAT Number</Label>
                <Input
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  placeholder="US-123456789"
                />
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="flex items-center gap-2 text-secondary text-xl">
                <MapPin className="h-4 w-4" /> Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm">Address Line 1</Label>
                <Input
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Street address"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm">
                  Address Line 2{' '}
                  <span className="text-foreground text-xs">(optional)</span>
                </Label>
                <Input
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apt, suite, unit, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-foreground text-sm">City</Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="San Francisco" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground text-sm">State / Province</Label>
                  <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="CA" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-foreground text-sm">ZIP / Postal Code</Label>
                  <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="94105" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground text-sm">Country</Label>
                  <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="United States" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Remove card */}
          <Card className="bg-accent p-5">
            <CardContent className="flex items-center justify-between px-0">
              <div>
                <p className="text-secondary text-sm font-semibold">Remove Payment Method</p>
                <p className="text-foreground text-xs mt-0.5">
                  You will be downgraded to the free plan upon removal.
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive gap-1.5">
                <Trash2 className="h-3.5 w-3.5" /> Remove Card
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Live card preview + summary */}
        <div className="w-full space-y-5 lg:w-72 lg:shrink-0">
          {/* Card preview */}
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-secondary text-base">Card Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center px-0">
              <BillingCard />
            </CardContent>
          </Card>

          {/* Billing summary */}
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-secondary text-base">Billing Summary</CardTitle>
            </CardHeader>
            <CardContent className="px-0 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-foreground">Cardholder</span>
                <span className="text-secondary font-medium truncate max-w-[140px]">
                  {cardName || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">Card</span>
                <span className="text-secondary font-medium font-mono">
                  •••• {cardNumber.replace(/\s/g, '').slice(-4) || '——'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground">Expires</span>
                <span className="text-secondary font-medium">{expiry || '——'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-foreground">Billing Email</span>
                <span className="text-secondary font-medium truncate max-w-[140px] text-xs">
                  {billingEmail || '—'}
                </span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-foreground shrink-0">Address</span>
                <span className="text-secondary text-right text-xs leading-relaxed">
                  {[addressLine1, city, state, zip, country].filter(Boolean).join(', ') || '—'}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-foreground">Next Charge</span>
                <Badge variant="secondary" className="text-xs">Oct 24, 2026</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              className="w-full gap-2"
              onClick={() => router.push(`/users/${userId}/settings/billing`)}
            >
              <Save className="h-4 w-4" /> Save Changes
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/users/${userId}/settings/billing`}>Discard</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
