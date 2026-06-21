'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Sparkles, FileText } from '@/components/icons'

export function EntryStep({
  onCreateWithAi,
  onBuildManually,
}: {
  onCreateWithAi: () => void
  onBuildManually: () => void
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Create Your Resume
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose how you&apos;d like to get started
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card
          className="relative flex cursor-pointer flex-col overflow-hidden border-2 border-primary ring-2 ring-primary ring-offset-2 ring-offset-background transition-all hover:shadow-lg"
          onClick={onCreateWithAi}
        >
          <CardContent className="flex flex-1 flex-col p-7">
            <Badge className="absolute top-4 right-4 bg-primary text-[10px] tracking-widest text-primary-foreground">
              RECOMMENDED
            </Badge>
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-sm">
              <Sparkles className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Create with AI</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Upload your resume and let AI tailor the content for your target role with ATS optimization.
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {[
                'AI-powered content optimization',
                'Role-targeted bullet points',
                'ATS keyword matching',
                'Parse any existing resume',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Button className="pointer-events-none mt-7 w-full gap-2">
              <Sparkles className="h-4 w-4" /> Start with AI
            </Button>
          </CardContent>
        </Card>

        <Card
          className="flex cursor-pointer flex-col overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg"
          onClick={onBuildManually}
        >
          <CardContent className="flex flex-1 flex-col p-7">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border bg-card">
              <FileText className="h-6 w-6 text-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Build Manually</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Take full control and fill in your details step by step. Optionally upload a resume to pre-fill the form.
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {[
                'Full control over every field',
                'Live preview as you type',
                '6 professional templates',
                'Upload to pre-fill fields',
              ].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-foreground">
                  <Check className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="pointer-events-none mt-7 w-full gap-2">
              <FileText className="h-4 w-4" /> Build Manually
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
