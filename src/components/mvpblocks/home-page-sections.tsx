import Link from 'next/link'
import { FileChartPie, FileCode, Pencil } from '@/components/icons'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

const toolkitItems = [
  {
    icon: FileChartPie,
    title: 'ATS Analysis',
    description:
      'See how your resume lines up with applicant tracking systems before a recruiter ever sees it.',
  },
  {
    icon: Pencil,
    title: 'Manual resume builder',
    description:
      'Structured sections, themes, and local saves — you control every line. Import PDF or DOCX text as a starting point.',
  },
  {
    icon: FileCode,
    title: 'Export to PDF',
    description:
      'Print a polished PDF from your theme preview. No lock-in: data stays in your browser until you save.',
  },
] as const

const steps = [
  {
    step: '01',
    title: 'Upload or build',
    body: 'Paste resume text for ATS checks, or open the builder to draft and theme your document manually.',
  },
  {
    step: '02',
    title: 'Get your ATS score',
    body: 'Run the same kind of checks many ATS tools use so you can fix formatting, keywords, and structure early.',
  },
  {
    step: '03',
    title: 'Export & apply',
    body: 'Download a clean PDF, iterate fast, and keep versions as you tailor for each application.',
  },
] as const

export function CareerToolkitSection() {
  return (
    <section
      id="features"
      aria-labelledby="toolkit-heading"
      className="relative overflow-hidden bg-card py-20 md:py-28"
    >
      {/* fade into bg-background below */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-28 bg-gradient-to-t from-background to-transparent" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-primary mb-3 text-xs font-semibold tracking-widest uppercase">
            Your career toolkit
          </p>
          <h2
            id="toolkit-heading"
            className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Everything you need to land the interview
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            Free, self-hostable tools: ATS-style checks plus a manual builder — no paid API or cloud AI required.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {toolkitItems.map((item) => (
            <div key={item.title} className="flex flex-col gap-4">
              <div className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-xl">
                <item.icon className="size-5" aria-hidden />
              </div>
              <h3 className="text-foreground text-lg font-semibold">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HowItWorksSection({
  userId = null,
}: {
  /** When set, primary CTA goes to the user dashboard instead of sign-up. */
  userId?: string | null
}) {
  const ctaHref = userId ? `/users/${userId}/resumes` : '/sign-up'
  const ctaLabel = userId ? 'Open app' : 'Get started'

  return (
    <section
      id="services"
      aria-labelledby="how-heading"
      className="relative overflow-hidden bg-background py-20 md:py-28"
    >
      {/* fade into next section below */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-28 bg-gradient-to-t from-muted to-transparent" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-primary mb-3 text-xs font-semibold tracking-widest uppercase">
              How it works
            </p>
            <h2
              id="how-heading"
              className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl"
            >
              From file to interview-ready in three steps
            </h2>
            <p className="text-muted-foreground mt-4 text-base leading-relaxed">
              No long courses or generic tips — just a focused loop: measure,
              fix, export.
            </p>
            <Button className="mt-8 rounded-full px-6" asChild>
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>
          </div>

          <ol className="flex flex-col gap-0">
            {steps.map((s, i) => (
              <li key={s.step} className="flex gap-5">
                {/* timeline column */}
                <div className="flex flex-col items-center">
                  <div className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                    {s.step}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="bg-border my-1 w-px flex-1" />
                  )}
                </div>
                {/* content */}
                <div className="min-w-0 pb-10">
                  <h3 className="text-foreground text-base font-semibold">
                    {s.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export function OpenSourceSection() {
  const repoUrl = process.env.NEXT_PUBLIC_GITHUB_REPO_URL?.trim() || ''

  return (
    <section
      id="oss"
      aria-labelledby="oss-heading"
      className="relative overflow-hidden bg-muted py-20 md:py-28"
    >
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-28 bg-gradient-to-t from-card to-transparent" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-primary mb-3 text-xs font-semibold tracking-widest uppercase">
            Open source
          </p>
          <h2
            id="oss-heading"
            className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Free to use and self-host
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            No subscriptions or checkout flows — fork the repo, run it locally or on your own stack, and adapt it for your team.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button className="gap-2 rounded-full px-6" asChild>
              <a
                href={repoUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!repoUrl}
              >
                <Github className="size-4" />
                View on GitHub
              </a>
            </Button>
            <Button variant="outline" className="rounded-full px-6" asChild>
              <Link href="/#faq">Read the FAQ</Link>
            </Button>
          </div>
          {!repoUrl ? (
            <p className="text-muted-foreground mt-4 text-xs">
              Set{' '}
              <code className="rounded bg-background px-1 py-0.5 font-mono text-[11px]">
                NEXT_PUBLIC_GITHUB_REPO_URL
              </code>{' '}
              to your repository URL.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
