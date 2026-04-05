'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Check, X, Zap } from '@/components/icons'
import Link from 'next/link'

const plans = [
  {
    name: 'Weekend Warrior',
    description: 'For casual updates and quick edits.',
    price: { monthly: 0, yearly: 0 },
    badge: null,
    features: [
      'Basic AI Resume Scan',
      '1 Resume Builder Project',
      'Standard Templates',
      null,
      null,
    ],
    cta: 'Start Free',
    ctaVariant: 'outline' as const,
    href: '/sign-up',
  },
  {
    name: 'Job Hunter',
    description: 'Supercharge your search with AI.',
    price: { monthly: 19, yearly: 13 },
    badge: 'MOST POPULAR',
    features: [
      'Gemini Pro Access',
      'Unlimited Resume Builders',
      'ATS Keyword Optimization',
      'Cover Letter Generator',
      'Export to PDF & Word',
    ],
    cta: 'Get Pro Access',
    ctaVariant: 'default' as const,
    href: '/sign-up',
  },
  {
    name: 'Agency',
    description: 'Scale resume building for clients.',
    price: { monthly: 299, yearly: 209 },
    badge: null,
    features: [
      'API Access',
      'Team Management',
      'White-labeling Options',
      'Dedicated Support',
      'SSO Authentication',
    ],
    cta: 'Contact Sales',
    ctaVariant: 'outline' as const,
    href: '/sign-up',
  },
]

const comparisonRows = [
  { feature: 'AI Credits / Month', values: ['50', 'Unlimited', 'Unlimited'] },
  { feature: 'PDF Exports', values: ['3', 'Unlimited', 'Unlimited'] },
  {
    feature: 'Analysis Engine',
    values: ['Basic (GPT-3.5)', '⚡ Gemini Pro', 'Custom / Gemini Ultra'],
  },
  { feature: 'Cover Letter Generator', values: [false, true, true] },
  { feature: 'ATS Keyword Optimization', values: [false, true, true] },
  { feature: 'Version History', values: [false, true, true] },
  { feature: 'Team Management', values: [false, false, true] },
  { feature: 'Custom Branding', values: [false, false, true] },
  { feature: 'API Access', values: [false, false, true] },
  { feature: 'SSO Authentication', values: [false, false, true] },
]

const faqs = [
  {
    question: 'Can I cancel my subscription at any time?',
    answer:
      "Yes, you can cancel anytime from your billing settings. Your plan will remain active until the end of the current billing cycle, after which you'll be moved to the free tier.",
  },
  {
    question: 'What is "Gemini Pro Access"?',
    answer:
      "Gemini Pro Access unlocks our most powerful AI analysis engine, powered by Google's Gemini Pro model. This enables deeper ATS analysis, smarter keyword suggestions, and higher-quality resume rewrites compared to the basic GPT-3.5 engine.",
  },
  {
    question: 'Do you offer refunds?',
    answer:
      "We offer a 7-day money-back guarantee for new Pro subscriptions. If you're not satisfied, contact our support team within 7 days of your first charge for a full refund.",
  },
  {
    question: 'Can I switch plans later?',
    answer:
      'Absolutely. You can upgrade or downgrade your plan at any time. Upgrades take effect immediately (prorated), while downgrades take effect at the next billing cycle.',
  },
  {
    question: 'Is my resume data private?',
    answer:
      'Yes. Your resume data is encrypted at rest and in transit. We never share your data with third parties, and you can request deletion at any time from your account settings.',
  },
]

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <div className="bg-background relative min-h-screen">
      {/* Glow blobs matching landing page style */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="bg-primary/10 absolute -top-[10%] left-[50%] h-[40%] w-[60%] -translate-x-1/2 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute top-[30%] -right-[10%] h-[40%] w-[40%] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center">
        <h1 className="text-4xl font-bold lg:text-5xl">
          Build a Better Resume,{' '}
          <span className="text-primary underline decoration-wavy">
            Faster.
          </span>
        </h1>
        <p className="mt-4 text-lg">
          Simple pricing for developers and job seekers. No hidden fees. Cancel
          anytime.
        </p>

        {/* Monthly / Yearly toggle */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            onClick={() => setIsYearly(false)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              !isYearly
                ? 'bg-secondary text-secondary-foreground'
                : 'text-foreground hover:text-foreground/80'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsYearly(true)}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              isYearly
                ? 'bg-secondary text-secondary-foreground'
                : 'text-foreground hover:text-foreground/80'
            }`}
          >
            Yearly{' '}
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
              Save 30%
            </span>
          </button>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                i === 1 ? 'border-primary ring-primary ring-2' : ''
              }`}
            >
              {plan.badge && (
                <span className="bg-primary text-primary-foreground absolute inset-x-0 -top-3 mx-auto flex h-6 w-fit items-center rounded-full px-3 py-1 text-xs font-semibold">
                  {plan.badge}
                </span>
              )}
              <CardHeader className="pt-8 pb-4">
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <p className="text-sm">{plan.description}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-4xl font-bold">
                    ${isYearly ? plan.price.yearly : plan.price.monthly}
                  </span>
                  <span className="text-foreground mb-1 text-sm">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <hr className="mb-4 border-dashed" />
                <ul className="space-y-3">
                  {plan.features.map((feature, fi) => (
                    <li key={fi} className="flex items-center gap-2 text-sm">
                      {feature ? (
                        <>
                          <Check className="text-primary h-4 w-4 shrink-0" />
                          <span>{feature}</span>
                        </>
                      ) : (
                        <>
                          <X className="text-foreground/30 h-4 w-4 shrink-0" />
                          <span className="text-foreground/40 text-xs line-through">
                            Unavailable
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  asChild
                  variant={plan.ctaVariant}
                  className="w-full"
                  size="lg"
                >
                  <Link href={plan.href}>
                    {i === 1 && <Zap className="mr-2 h-4 w-4" />}
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">
          Compare Plans
        </h2>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2 font-semibold">
                  Core Feature
                </TableHead>
                <TableHead className="text-center">Weekend Warrior</TableHead>
                <TableHead className="text-primary text-center font-bold">
                  Job Hunter
                </TableHead>
                <TableHead className="text-center">Agency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparisonRows.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell className="font-medium">{row.feature}</TableCell>
                  {row.values.map((val, i) => (
                    <TableCell key={i} className="text-center">
                      {typeof val === 'boolean' ? (
                        val ? (
                          <Check className="text-primary mx-auto h-4 w-4" />
                        ) : (
                          <X className="text-foreground/30 mx-auto h-4 w-4" />
                        )
                      ) : (
                        <span
                          className={`text-sm ${i === 1 ? 'text-primary font-semibold' : ''}`}
                        >
                          {val}
                        </span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-2xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-semibold">
          Frequently Asked Questions
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-6 text-sm sm:flex-row">
          <p className="text-foreground">
            © 2024 ResumeAI Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-foreground hover:text-foreground/80 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-foreground hover:text-foreground/80 transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="text-foreground hover:text-foreground/80 transition-colors"
            >
              Twitter
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
