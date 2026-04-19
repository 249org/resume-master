import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Pricing',
  description:
    'Compare Resume Master plans—from free ATS scans to pro features. Pick what fits your job search.',
  path: '/pricing',
})

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
