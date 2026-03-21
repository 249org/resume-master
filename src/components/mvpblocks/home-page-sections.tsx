import Link from 'next/link'
import { BrainCircuit, FileChartPie, FileCode } from '@/components/icons'
import { Button } from '@/components/ui/button'

const toolkitItems = [
  {
    icon: FileChartPie,
    title: 'ATS Analysis',
    description:
      'See exactly how your resume scores against real applicant tracking systems before a recruiter ever sees it.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Resume Review',
    description:
      'Actionable feedback on impact, wording, and structure — calibrated for what hiring managers actually read.',
  },
  {
    icon: FileCode,
    title: 'Resume Builder',
    description:
      'Guided sections, clean layouts, and AI assist so you ship a polished PDF without wrestling the template.',
  },
] as const

const steps = [
  {
    step: '01',
    title: 'Upload or build',
    body: 'Drop your existing resume or start fresh in the builder — either way, the structure stays ATS-friendly.',
  },
  {
    step: '02',
    title: 'Get your score & fixes',
    body: 'ATS scan plus AI suggestions surface gaps, weak bullets, and missing keywords for the role you want.',
  },
  {
    step: '03',
    title: 'Export & apply',
    body: 'Download a clean PDF, iterate fast, and track versions as you tailor for each application.',
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
            One place to analyze, improve, and ship a resume that reads well to
            both software and humans.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {toolkitItems.map((item, i) => (
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

export function HowItWorksSection() {
  return (
    <section
      id="services"
      aria-labelledby="how-heading"
      className="relative overflow-hidden bg-background py-20 md:py-28"
    >
      {/* fade into bg-muted (pricing) below */}
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
              <Link href="/sign-up">Try it free</Link>
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
