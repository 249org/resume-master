import HomeAtsCheck from '@/components/file-upload/home-ats-check'
import { HomeFaqSection } from '@/components/mvpblocks/home-faq'
import {
  CareerToolkitSection,
  HowItWorksSection,
  OpenSourceSection,
} from '@/components/mvpblocks/home-page-sections'
import { Status, StatusIndicator } from '@/components/hero-badge'
import { auth } from '@/lib/auth'
import { pageMetadata, siteConfig } from '@/lib/seo'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export const metadata = pageMetadata({
  title: 'ATS resume checker & builder',
  description: siteConfig.description,
  path: '/',
})

export default async function page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const homeUserId = session?.user?.id ?? null

  return (
    <div className="bg-background">
      {/* hero */}
      <section className="relative flex w-full flex-col items-center justify-center overflow-hidden px-4 py-20 md:py-32">
        {/* Subtle dot grid confined to hero only */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Very soft bottom fade into next section */}
        <div className="from-card pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-gradient-to-t to-transparent" />

        <Status status="online" className="bg-secondary-foreground">
          <StatusIndicator />
          UPDATED FOR 2026 HIRING TRENDS
        </Status>
        <h1 className="mt-6 max-w-3xl text-center text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Beat the Bots{' '}
          <span className="bg-primary text-primary-foreground mt-2 inline-block rounded-xl px-4 py-2">
            Land the Interview
          </span>
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-center text-lg leading-relaxed">
          Check how your resume lines up with applicant tracking systems, refine it in the builder,
          or get AI-powered feedback when you&apos;re signed in.
        </p>
        <HomeAtsCheck homeUserId={homeUserId} className="mt-10 w-full max-w-xl" />
      </section>

      <CareerToolkitSection />
      <HowItWorksSection userId={homeUserId} />
      <OpenSourceSection />
      <HomeFaqSection />
    </div>
  )
}
