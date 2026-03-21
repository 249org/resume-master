'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const faqs = [
  {
    q: 'What is an ATS and why does it matter?',
    a: 'Applicant tracking systems automatically filter resumes before a recruiter sees them. We simulate that pass so you can fix formatting, keywords, and structure before you apply.',
  },
  {
    q: 'Is my resume data private?',
    a: 'Your files are used only to generate your analysis and improve your documents. We never train public models on your personal resume content.',
  },
  {
    q: 'Can I use Resume Master without paying?',
    a: 'Yes. The free plan lets you run a scan and explore the builder. Upgrade when you want unlimited projects, deeper analysis, and AI rewrites.',
  },
  {
    q: 'What file formats do you support?',
    a: 'Upload common formats (PDF, DOCX) for analysis and export polished PDFs from the builder. Exact support can vary by plan — see pricing for details.',
  },
] as const

export function HomeFaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative overflow-hidden bg-card py-20 md:py-28"
    >
      {/* fade into bg-background (footer) below */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-28 bg-gradient-to-t from-background to-transparent" />
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-primary mb-3 text-xs font-semibold tracking-widest uppercase">
            FAQ
          </p>
          <h2
            id="faq-heading"
            className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Common questions
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed">
            Quick answers about ATS checks, privacy, and plans.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-12 w-full">
          {faqs.map((item, i) => (
            <AccordionItem
              key={item.q}
              value={`item-${i}`}
              className="border-border"
            >
              <AccordionTrigger className="text-foreground text-left text-base font-medium hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-5 text-sm leading-relaxed">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
