import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Check } from '@/components/icons'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: null,
    description: 'Try the essentials — no credit card needed.',
    features: [
      'Basic ATS-style resume scan',
      '1 resume builder project',
      'Standard templates',
      'Limited exports per month',
    ],
    badge: null,
    href: '/sign-up',
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Job Hunter',
    price: '$19',
    period: '/ month',
    description: 'Full power for an active search.',
    features: [
      'Unlimited resume projects',
      'Deeper ATS & keyword analysis',
      'AI review & rewrite suggestions',
      'Export to PDF',
      'Job description match reports',
    ],
    badge: 'Most popular',
    href: '/sign-up',
    cta: 'Get started',
    highlighted: true,
  },
  {
    name: 'Agency',
    price: 'Custom',
    period: null,
    description: 'Teams and coaches managing many clients.',
    features: [
      'Volume & seat options',
      'Shared workflows',
      'Priority support',
      'API access',
    ],
    badge: null,
    href: '/pricing',
    cta: 'Talk to us',
    highlighted: false,
  },
] as const

export default function Pricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="relative overflow-hidden bg-muted py-20 md:py-28"
    >
      {/* bottom fade into bg-card (FAQ) */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-28 bg-gradient-to-t from-card to-transparent" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-primary mb-3 text-xs font-semibold tracking-widest uppercase">
            Pricing
          </p>
          <h2
            id="pricing-heading"
            className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Plans that match how hard you&apos;re searching
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            Start free, upgrade when you need unlimited projects and deeper
            analysis.{' '}
            <Link
              href="/pricing"
              className="text-primary font-medium underline-offset-4 hover:underline"
            >
              See full comparison
            </Link>
            .
          </p>
        </div>

        <div className="mt-14 grid items-start gap-4 sm:grid-cols-3 lg:gap-6">
          {plans.map((plan) =>
            plan.highlighted ? (
              /* Featured card — dark */
              <div
                key={plan.name}
                className="bg-secondary relative flex flex-col rounded-2xl p-6 lg:p-8"
              >
                <span className="bg-primary text-primary-foreground absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-semibold">
                  {plan.badge}
                </span>

                <p className="text-secondary-foreground/70 text-sm font-medium">
                  {plan.name}
                </p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-secondary-foreground text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-secondary-foreground/50 text-sm">
                    {plan.period}
                  </span>
                </div>
                <p className="text-secondary-foreground/60 mt-2 text-sm leading-relaxed">
                  {plan.description}
                </p>

                <div className="border-secondary-foreground/15 mt-6 border-t pt-6">
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check
                          className="text-primary mt-0.5 size-4 shrink-0"
                          aria-hidden
                        />
                        <span className="text-secondary-foreground/80 text-sm leading-snug">
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button asChild className="mt-8 w-full rounded-full">
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            ) : (
              /* Regular cards — light */
              <div
                key={plan.name}
                className="bg-card border-border relative flex flex-col rounded-2xl border p-6 lg:p-8"
              >
                <p className="text-muted-foreground text-sm font-medium">
                  {plan.name}
                </p>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-foreground text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {plan.description}
                </p>

                <div className="border-border mt-6 border-t pt-6">
                  <ul className="flex flex-col gap-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <Check
                          className="text-primary mt-0.5 size-4 shrink-0"
                          aria-hidden
                        />
                        <span className="text-foreground/80 text-sm leading-snug">
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  asChild
                  variant="outline"
                  className="mt-8 w-full rounded-full"
                >
                  <Link href={plan.href}>{plan.cta}</Link>
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  )
}
