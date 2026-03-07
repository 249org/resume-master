'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'
import {
  FileText,
  Hammer,
  TrendingUp,
  Folder,
  ShieldCheck,
  Lightbulb,
  Upload,
  Pencil,
  Bot,
} from '@/components/icons'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Status, StatusIndicator, StatusLabel } from '@/components/kibo-ui/status'
import PageTitle from '@/components/page-title'

const scoreData = [
  { date: '01 Aug', score: 55 },
  { date: '08 Aug', score: 62 },
  { date: '15 Aug', score: 58 },
  { date: '22 Aug', score: 75 },
  { date: '25 Aug', score: 68 },
  { date: '28 Aug', score: 80 },
  { date: 'Today', score: 72 },
]

const chartConfig = {
  score: {
    label: 'Resume Score',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

const recentActivity = [
  {
    name: 'Software_Eng_V2.pdf',
    action: 'Analyzed 2h ago',
    score: 85,
    icon: FileText,
  },
  {
    name: 'Product Manager...',
    action: 'Edited yesterday',
    badge: 'Draft',
    icon: Pencil,
  },
  {
    name: 'Frontend Developer',
    action: 'Generated 2 days ago',
    score: 92,
    icon: Bot,
  },
  {
    name: 'Old_Resume_2023.p...',
    action: 'Uploaded 3 days ago',
    score: 45,
    icon: Upload,
  },
]

function ScoreBadge({ score }: { score: number }) {
  let bg = 'bg-primary'
  if (score < 60) bg = 'bg-destructive'
  else if (score < 80) bg = 'bg-primary/70'
  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${bg}`}
    >
      {score}
    </span>
  )
}

export default function DashboardClient({ userName }: { userName: string }) {
  const params = useParams()
  const userId = params.id as string

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <PageTitle
          title={`Welcome back, ${userName.split(' ')[0]}`}
          subtitle="Here is what's happening with your applications today."
        />
        <Status status="online">
          <StatusIndicator />
          <StatusLabel />
        </Status>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="bg-accent p-5">
          <CardHeader className="px-0 pt-0 pb-2">
            <CardTitle className="text-foreground flex items-center justify-between text-xs font-medium uppercase tracking-wide">
              Latest Resume Score
              <FileText className="text-foreground h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <p className="text-secondary text-3xl font-bold">
              72
              <span className="text-foreground text-base font-normal">
                /100
              </span>
            </p>
            <p className="text-primary mt-1 flex items-center gap-1 text-xs font-medium">
              <TrendingUp className="h-3 w-3" /> +5% this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-accent p-5">
          <CardHeader className="px-0 pt-0 pb-2">
            <CardTitle className="text-foreground flex items-center justify-between text-xs font-medium uppercase tracking-wide">
              Resumes Created
              <Folder className="text-foreground h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <p className="text-secondary text-3xl font-bold">4</p>
            <p className="text-primary mt-1 flex items-center gap-1 text-xs font-medium">
              <TrendingUp className="h-3 w-3" /> +1 new today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-accent p-5">
          <CardHeader className="px-0 pt-0 pb-2">
            <CardTitle className="text-foreground flex items-center justify-between text-xs font-medium uppercase tracking-wide">
              Job Match Rate
              <ShieldCheck className="text-foreground h-4 w-4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <p className="text-secondary text-3xl font-bold">High</p>
            <p className="text-primary mt-1 flex items-center gap-1 text-xs font-medium">
              <TrendingUp className="h-3 w-3" /> Top 10% of candidates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Left column: Quick Actions + Chart */}
        <div className="space-y-4 lg:col-span-2">
          {/* Quick Actions */}
          <div>
            <h2 className="text-secondary mb-3 text-2xl font-semibold">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Link href={`/users/${userId}/job-match`}>
                <Card className="bg-accent hover:border-primary cursor-pointer transition-colors">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="bg-background flex h-10 w-10 items-center justify-center rounded-lg">
                      <FileText className="text-secondary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-secondary font-semibold">
                        Analyze New Resume
                      </h3>
                      <p className="text-foreground mt-1 text-sm">
                        Upload a PDF to get AI-powered feedback instantly.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href={`/users/${userId}/resume-builder`}>
                <Card className="bg-accent hover:border-primary cursor-pointer transition-colors">
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="bg-background flex h-10 w-10 items-center justify-center rounded-lg">
                      <Hammer className="text-secondary h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-secondary font-semibold">
                        Resume Builder
                      </h3>
                      <p className="text-foreground mt-1 text-sm">
                        Create a professional CV using our smart templates.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Score History Chart */}
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-secondary text-xl font-semibold">
                    Score History
                  </h2>
                  <p className="text-foreground text-sm">
                    Last 30 Days Performance
                  </p>
                </div>
                <Badge className="bg-primary text-primary-foreground text-xs">
                  +15% Improvement
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <ChartContainer config={chartConfig} className="h-48 w-full">
                <AreaChart data={scoreData}>
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11 }}
                    className="fill-foreground"
                  />
                  <YAxis hide domain={[0, 100]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    fill="url(#scoreGradient)"
                    dot={false}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Recent Activity + AI Suggestion */}
        <div className="space-y-4">
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0 pb-2">
              <h2 className="text-secondary text-xl font-semibold">
                Recent Activity
              </h2>
            </CardHeader>
            <CardContent className="px-0 space-y-3">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="bg-background flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                    <item.icon className="text-foreground h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-secondary truncate text-sm font-medium">
                      {item.name}
                    </p>
                    <p className="text-foreground text-xs">{item.action}</p>
                  </div>
                  {item.score !== undefined && (
                    <ScoreBadge score={item.score} />
                  )}
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="text-primary mt-2 w-full text-xs"
                asChild
              >
                <Link href={`/users/${userId}/analyzer-history`}>
                  View Full History
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* AI Suggestion */}
          <Card className="bg-secondary text-secondary-foreground p-5">
            <CardContent className="px-0">
              <div className="flex items-start gap-2">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">AI Suggestion</p>
                  <p className="mt-1 text-xs opacity-80">
                    Your &quot;Experience&quot; section lacks quantitative
                    metrics. Try adding 2–3 bullet points with % or $ impact to
                    increase your score.
                  </p>
                  <Button
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 mt-3 text-xs"
                    asChild
                  >
                    <Link href={`/users/${userId}/resume-builder`}>
                      Apply Fix
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
