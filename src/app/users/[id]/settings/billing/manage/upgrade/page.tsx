'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import PageTitle from '@/components/page-title'
import { BarChart2, FileDown, History, Sparkles } from '@/components/icons'
import { Check, X } from '@/components/icons'

const planFeatures = [
  {
    icon: BarChart2,
    title: 'AI Resume Analysis',
    description: 'Get GPT-4 powered feedback to optimize your resume for any role.',
  },
  {
    icon: FileDown,
    title: 'Unlimited Exports',
    description: 'Download as many PDFs as you need, no watermarks.',
  },
  {
    icon: History,
    title: 'Version History',
    description: 'Access and restore previous versions of your CV.',
  },
]

const comparisonRows: { feature: string; values: (string | boolean)[] }[] = [
  { feature: 'AI Credits / Month', values: ['50', 'Unlimited', 'Unlimited'] },
  { feature: 'PDF Exports', values: ['3', 'Unlimited', 'Unlimited'] },
  { feature: 'AI Resume Analysis', values: ['Basic (GPT-3.5)', 'Gemini Pro', 'Custom / Gemini Ultra'] },
  { feature: 'Cover Letter Generator', values: [false, true, true] },
  { feature: 'ATS Keyword Optimization', values: [false, true, true] },
  { feature: 'Version History', values: [false, true, true] },
  { feature: 'Team Management', values: [false, false, true] },
  { feature: 'API Access', values: [false, false, true] },
  { feature: 'Dedicated Support', values: [false, false, true] },
]

export default function UpgradePlanPage() {
  const params = useParams()
  const userId = params.id as string

  return (
    <div className="space-y-8">
      <PageTitle
        title="Upgrade Plan"
        subtitle="Get more out of your resume with AI analysis, unlimited exports, and version history."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {planFeatures.map((feature) => (
          <Card key={feature.title} className="bg-accent">
            <CardContent className="pt-5">
              <feature.icon className="text-primary mb-3 h-6 w-6" />
              <p className="text-foreground text-sm font-semibold">{feature.title}</p>
              <p className="text-muted-foreground mt-1 text-xs">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan comparison */}
      <div>
        <h2 className="text-foreground mb-4 text-xl font-semibold">Compare plans</h2>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%] font-semibold">Feature</TableHead>
                <TableHead className="text-center font-medium">Weekend Warrior</TableHead>
                <TableHead className="text-primary text-center font-semibold">Job Hunter</TableHead>
                <TableHead className="text-center font-medium">Agency</TableHead>
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
                          <X className="text-muted-foreground/50 mx-auto h-4 w-4" />
                        )
                      ) : (
                        <span
                          className={`text-sm ${i === 1 ? 'text-primary font-medium' : 'text-foreground'}`}
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
        </Card>
      </div>

      <Card className="bg-primary/10 border-primary/20 p-6">
        <CardContent className="flex flex-col items-center gap-4 px-0 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="text-primary-foreground h-6 w-6" />
            </div>
            <div>
              <p className="text-foreground font-semibold">Job Hunter (Pro)</p>
              <p className="text-muted-foreground text-sm">
                AI analysis, unlimited exports, version history — from $13/mo yearly
              </p>
            </div>
          </div>
          <Button asChild size="lg" className="shrink-0 gap-2">
            <Link href="/pricing">View plans & pricing</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-2">
        <Button variant="ghost" asChild>
          <Link href={`/users/${userId}/settings/billing/manage`}>
            Back to Manage subscription
          </Link>
        </Button>
      </div>
    </div>
  )
}
