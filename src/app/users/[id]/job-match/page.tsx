'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Upload,
  CloudUpload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Zap,
  AlertTriangle,
  CheckCircle,
  BarChart2,
  Send,
  FileText,
} from '@/components/icons'
import PageTitle from '@/components/page-title'
import { BillingBreadcrumb } from '@/components/billing-breadcrumb'

const strongPoints = [
  {
    title: 'Strong Technical Keywords',
    description: 'Your resume contains 8 out of 10 key technical terms from the job description, including "React", "TypeScript", and "REST API".',
  },
  {
    title: 'Quantified Achievements',
    description: 'You have 3 bullet points with measurable outcomes (e.g., "20% increase in engagement"), which ATS systems rank highly.',
  },
  {
    title: 'Consistent Formatting',
    description: 'Date formats and section headers are consistent throughout, reducing parse errors.',
  },
]

const weakPoints = [
  {
    title: 'Missing Soft Skills',
    description: 'The job description mentions "cross-functional collaboration" and "stakeholder management" which are absent from your resume.',
  },
  {
    title: 'Summary Section Missing',
    description: 'No professional summary detected. ATS systems use this section to quickly categorize candidates.',
  },
]

const suggestions = [
  {
    icon: Zap,
    title: 'Missing Action Verbs',
    description: 'Your bullet points under "Project Manager" lack impact. Use stronger verbs like "Spearheaded", "Orchestrated", or "Accelerated" instead of "Responsible for".',
    action: 'FIX WITH AI',
  },
  {
    icon: AlertTriangle,
    title: 'Inconsistent Date Formatting',
    description: 'You use "MM/YYYY" in the Education section but "Month Year" in Experience. ATS parsers prefer consistency.',
    action: 'STANDARDIZE ALL DATES',
  },
  {
    icon: BarChart2,
    title: 'Skill Gap Analysis',
    description: 'The job description emphasizes "React Native", but your resume focuses heavily on web React. Consider highlighting any mobile experience.',
    action: 'SHOW EXAMPLES',
  },
]

export default function JobMatchPage() {
  const [hasFile, setHasFile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files.length > 0) setHasFile(true)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setHasFile(true)
  }

  const sendMessage = () => {
    setChatInput('')
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col gap-4">
      {/* Breadcrumb + Header */}
      <BillingBreadcrumb />
      <div className="flex items-start justify-between">
        <PageTitle
          title="Job Match"
          subtitle="Upload your resume and get an instant ATS compatibility analysis."
        />
        <Button size="sm" className="gap-1 shrink-0">
          <Upload className="h-3 w-3" /> New Upload
        </Button>
      </div>

      {/* Split panel */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left: Resume viewer / uploader */}
        <div className="flex flex-col overflow-hidden rounded-lg border">
          {!hasFile ? (
            <div
              className={`flex flex-1 flex-col items-center justify-center p-8 transition-colors ${
                isDragging ? 'bg-primary/5' : 'bg-accent'
              }`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center text-center max-w-xs">
                <div className="bg-background mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <CloudUpload className="text-primary h-8 w-8" />
                </div>
                <h3 className="text-secondary text-lg font-semibold">Upload Resume</h3>
                <p className="text-foreground mt-2 text-sm">
                  Drag & drop your PDF or DOCX file here to start the AI analysis.
                </p>
                <Button className="mt-6 gap-2" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4" /> Select File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="text-foreground mt-4 flex gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" /> PDF
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" /> DOCX
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <span className="text-foreground text-xs">100%</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="bg-accent flex-1 overflow-auto p-6">
                <div className="bg-background mx-auto max-w-sm space-y-3 rounded p-6 shadow-md text-sm">
                  <div className="bg-primary/20 h-5 w-3/4 rounded" />
                  <div className="space-y-1">
                    <div className="bg-accent h-3 w-full rounded" />
                    <div className="bg-accent h-3 w-5/6 rounded" />
                    <div className="bg-accent h-3 w-4/6 rounded" />
                  </div>
                  <Separator />
                  <div className="bg-accent h-4 w-1/3 rounded" />
                  <div className="space-y-1">
                    <div className="bg-accent h-3 w-full rounded" />
                    <div className="bg-accent h-3 w-full rounded" />
                    <div className="bg-accent h-3 w-3/4 rounded" />
                  </div>
                  <Separator />
                  <div className="bg-accent h-4 w-1/4 rounded" />
                  <div className="flex flex-wrap gap-1">
                    {['React', 'TypeScript', 'Node.js', 'AWS'].map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: ATS Analysis panel */}
        <div className="flex flex-col gap-3 overflow-hidden">
          {/* Score card */}
          <Card className="bg-accent p-5">
            <CardHeader className="px-0 pt-0 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground text-xs font-semibold uppercase tracking-wider">
                    ATS COMPATIBILITY
                  </p>
                  <p className="text-foreground text-xs">
                    Based on Job Description analysis
                  </p>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-secondary text-4xl font-bold">78</span>
                  <span className="text-foreground mb-1 text-sm">/100</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <Progress value={78} className="h-2" />
            </CardContent>
          </Card>

          {/* Analysis tabs */}
          <Tabs defaultValue="suggestions" className="flex min-h-0 flex-1 flex-col">
            <TabsList className="w-full">
              <TabsTrigger value="strong" className="flex-1 gap-1 text-xs">
                <CheckCircle className="h-3 w-3" /> Strong Points
              </TabsTrigger>
              <TabsTrigger value="weak" className="flex-1 gap-1 text-xs">
                <AlertTriangle className="h-3 w-3" /> Weak Points
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex-1 gap-1 text-xs">
                <BarChart2 className="h-3 w-3" /> Suggestions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="strong" className="mt-3 flex-1 overflow-y-auto space-y-3">
              {strongPoints.map((point, i) => (
                <Card key={i} className="bg-accent">
                  <CardContent className="flex items-start gap-3 pt-4">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-secondary text-sm font-semibold">{point.title}</p>
                      <p className="text-foreground mt-1 text-xs">{point.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="weak" className="mt-3 flex-1 overflow-y-auto space-y-3">
              {weakPoints.map((point, i) => (
                <Card key={i} className="bg-accent">
                  <CardContent className="flex items-start gap-3 pt-4">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <p className="text-secondary text-sm font-semibold">{point.title}</p>
                      <p className="text-foreground mt-1 text-xs">{point.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="suggestions" className="mt-3 flex-1 overflow-y-auto space-y-3">
              {suggestions.map((suggestion, i) => (
                <Card key={i} className="bg-accent">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-background flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                        <suggestion.icon className="text-primary h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-secondary text-sm font-semibold">
                          {suggestion.title}
                        </p>
                        <p className="text-foreground mt-1 text-xs">
                          {suggestion.description}
                        </p>
                        <Button size="sm" className="mt-3 gap-1 text-xs">
                          <Zap className="h-3 w-3" />
                          {suggestion.action}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {/* Chat input */}
          <div className="relative">
            <Textarea
              placeholder="Ask Gemini about your resume..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="min-h-[52px] resize-none pr-12"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2"
              onClick={sendMessage}
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
