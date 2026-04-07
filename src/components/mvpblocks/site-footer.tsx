import Link from 'next/link'
import { Sparkles } from '@/components/icons'

const footerLinks = {
  product: [
    { label: 'Features', href: '/#features' },
    { label: 'How it works', href: '/#services' },
    { label: 'Pricing', href: '/pricing' },
  ],
  account: [
    { label: 'Sign in', href: '/sign-in' },
    { label: 'Get started', href: '/sign-up' },
  ],
  legal: [
    { label: 'Privacy', href: '/privacy-policy' },
    { label: 'Terms', href: '#' },
  ],
} as const

export default function SiteFooter() {
  return (
    <footer className="bg-background border-border border-t">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-lg">
                <Sparkles className="text-primary-foreground size-5" />
              </div>
              <span className="text-foreground text-lg font-semibold">
                Resume Master
              </span>
            </Link>
            <p className="text-muted-foreground mt-4 max-w-xs text-sm leading-relaxed">
              Beat the bots with ATS-aware analysis, AI feedback, and a builder
              that keeps your story clear.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="text-foreground text-sm font-semibold">Product</p>
              <ul className="mt-4 space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-foreground text-sm font-semibold">Account</p>
              <ul className="mt-4 space-y-3">
                {footerLinks.account.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-foreground text-sm font-semibold">Legal</p>
              <ul className="mt-4 space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="border-border text-muted-foreground mt-12 flex flex-col items-center justify-between gap-3 border-t pt-8 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Resume Master. All rights reserved.</p>
          <p>Built for job seekers who want signal, not spam.</p>
        </div>
      </div>
    </footer>
  )
}
