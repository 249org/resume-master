'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Upload, CloudUpload, AlertTriangle, CheckCircle, BarChart2, FileText, Sparkles } from '@/components/icons'
import { Loader2, X, ChevronsUpDown, Check, Cpu, Brain, FolderOpen, Trash2 } from 'lucide-react'
import PageTitle from '@/components/page-title'
import { JOB_TYPES, JOB_TYPE_CATEGORIES } from '@/lib/job-types'
import { extractTextFromFile, checkFile } from '@/lib/resume-extract'
import { getAllResumes, savedResumeToText, type SavedResume } from '@/lib/resume-storage'
import { cn } from '@/lib/utils'
import type { AtsReport } from '@/lib/ats-engine'
import type { AiReport } from '@/lib/job-match/ai-report'

interface AnalyzeResponse {
  atsReport?: AtsReport | null
  aiReport?: AiReport | null
  aiError?: string | null
  analysisId?: string
  error?: string
}

type AnalysisMode = 'ats' | 'ai'

interface AnalysisListItem {
  id: string
  fileName: string
  jobTypeId: string
  jobTypeLabel: string
  mode: AnalysisMode
  score: number | null
  createdAt: string
}

function formatAnalysisDate(isoOrDate: string): string {
  try {
    const d = new Date(isoOrDate)
    if (Number.isNaN(d.getTime())) return ''
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMins = Math.floor(diffMs / 60_000)
    const diffHours = Math.floor(diffMs / 3_600_000)
    const diffDays = Math.floor(diffMs / 86_400_000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
  } catch {
    return ''
  }
}

// ── Score ring ──────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 48
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const stroke = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#f43f5e'
  const label = score >= 75 ? 'Strong' : score >= 50 ? 'Moderate' : 'Weak'
  const labelColor = score >= 75 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-rose-500'

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-32 w-32 items-center justify-center">
        <svg className="-rotate-90" width="128" height="128" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={r} fill="none" stroke={stroke} strokeWidth="9" className="opacity-10" />
          <circle
            cx="64" cy="64" r={r} fill="none" stroke={stroke} strokeWidth="9" strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-foreground text-3xl font-bold leading-none">{score}</span>
          <span className="text-muted-foreground text-xs">/100</span>
        </div>
      </div>
      <span className={cn('text-sm font-semibold', labelColor)}>{label} match</span>
    </div>
  )
}

// ── Job type combobox ────────────────────────────────────────────────────────
function JobTypeCombobox({
  value,
  onChange,
  compact = false,
}: {
  value: string
  onChange: (v: string) => void
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)
  const selected = JOB_TYPES.find((j) => j.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'justify-between font-normal',
            compact ? 'h-8 gap-1.5 px-2.5 text-xs' : 'h-11 w-full gap-2 text-sm'
          )}
        >
          <span className={cn('truncate', !selected && 'text-muted-foreground')}>
            {selected ? selected.label : 'Search job title…'}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search job titles…" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {JOB_TYPE_CATEGORIES.map((cat) => (
              <CommandGroup key={cat} heading={cat}>
                {JOB_TYPES.filter((j) => j.category === cat).map((job) => (
                  <CommandItem
                    key={job.id}
                    value={job.label}
                    onSelect={() => {
                      onChange(job.id)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', value === job.id ? 'opacity-100' : 'opacity-0')} />
                    {job.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function JobMatchPage() {
  const [resumeText, setResumeText] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [jobTypeId, setJobTypeId] = useState<string>('')
  const [mode, setMode] = useState<AnalysisMode>('ai')
  const [isDragging, setIsDragging] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [atsReport, setAtsReport] = useState<AtsReport | null>(null)
  const [aiReport, setAiReport] = useState<AiReport | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadModalTab, setUploadModalTab] = useState<'upload' | 'saved'>('upload')
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([])
  const [savedResumeId, setSavedResumeId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [list, setList] = useState<AnalysisListItem[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)

  const hasResume = !!resumeText?.length
  const hasAtsResults = atsReport != null
  const hasAiResults = aiReport != null || aiError != null
  const hasResults = (mode === 'ats' && hasAtsResults) || (mode === 'ai' && hasAiResults)
  const showListView = analysisId === null

  const fetchList = useCallback(async () => {
    setListLoading(true)
    try {
      const res = await fetch('/api/job-match/analyses')
      if (res.ok) {
        const data = (await res.json()) as AnalysisListItem[]
        setList(Array.isArray(data) ? data : [])
      }
    } catch {
      setList([])
    } finally {
      setListLoading(false)
    }
  }, [])

  useEffect(() => {
    if (showListView) fetchList()
  }, [showListView, fetchList])

  useEffect(() => {
    if (!analysisId || hasResults) return
    setDetailLoading(true)
    fetch(`/api/job-match/analyses/${analysisId}`)
      .then((r) => r.json())
      .then((data: unknown) => {
        const d = data as { fileName?: string; jobTypeId?: string; jobTypeLabel?: string; mode?: AnalysisMode; atsReport?: AtsReport | null; aiReport?: AiReport | null; aiError?: string | null }
        setFileName(d.fileName ?? null)
        setJobTypeId(d.jobTypeId ?? '')
        setMode(d.mode ?? 'ai')
        setAtsReport(d.atsReport ?? null)
        setAiReport(d.aiReport ?? null)
        setAiError(d.aiError ?? null)
      })
      .catch(() => setAiError('Failed to load analysis.'))
      .finally(() => setDetailLoading(false))
  }, [analysisId, hasResults])

  useEffect(() => {
    setSavedResumes(getAllResumes())
  }, [uploadOpen])

  const handleFile = useCallback(async (file: File | null) => {
    if (!file) {
      setResumeText(null); setFileName(null); setExtractError(null); setSavedResumeId(null)
      setAtsReport(null); setAiReport(null); setAiError(null)
      return
    }
    const err = checkFile(file)
    if (err) { setExtractError(err); return }
    setExtractError(null); setSavedResumeId(null)
    setIsExtracting(true)
    try {
      const result = await extractTextFromFile(file)
      if (result.ok) {
        setResumeText(result.text)
        setFileName(file.name)
        setUploadOpen(false)
      } else {
        setExtractError(result.error)
      }
    } finally {
      setIsExtracting(false)
    }
  }, [])

  const handleSelectSavedResume = useCallback((resume: SavedResume) => {
    const text = savedResumeToText(resume)
    if (!text || text.length < 50) return
    setResumeText(text)
    setFileName(resume.title || `${resume.fullName || 'Resume'} (saved)`)
    setSavedResumeId(resume.id)
    setExtractError(null)
    setUploadOpen(false)
  }, [])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null)
    e.target.value = ''
  }

  const openUploadModal = (tab: 'upload' | 'saved' = 'upload') => {
    setExtractError(null)
    setUploadModalTab(tab)
    setUploadOpen(true)
  }

  const analyze = async () => {
    if (!resumeText?.trim() || !jobTypeId.trim()) return
    setIsAnalyzing(true); setAiError(null)
    try {
      const res = await fetch('/api/job-match/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobTypeId,
          mode,
          fileName: fileName ?? undefined,
        }),
      })
      const data = (await res.json()) as AnalyzeResponse
      if (!res.ok) { setAiError(data.error ?? 'Analysis failed'); return }
      setAtsReport(data.atsReport ?? null)
      setAiReport(data.aiReport ?? null)
      if (data.aiError) setAiError(data.aiError)
      if (data.analysisId) {
        setAnalysisId(data.analysisId)
        setUploadOpen(false)
      }
    } catch {
      setAiError('Request failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const goToList = () => {
    setAnalysisId(null)
    setAtsReport(null)
    setAiReport(null)
    setAiError(null)
    setFileName(null)
    setResumeText(null)
    setJobTypeId('')
    fetchList()
  }

  const openAnalysis = (id: string) => {
    setAtsReport(null)
    setAiReport(null)
    setAiError(null)
    setAnalysisId(id)
  }

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const removeAnalysis = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setDeletingId(id)
    try {
      const res = await fetch(`/api/job-match/analyses/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setList((prev) => prev.filter((x) => x.id !== id))
        if (analysisId === id) goToList()
      }
    } finally {
      setDeletingId(null)
    }
  }

  const canAnalyze = hasResume && jobTypeId && !isAnalyzing
  const selectedJob = JOB_TYPES.find((j) => j.id === jobTypeId)

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Analyze resume
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {showListView ? 'View past analyses or run a new one.' : 'Your analysis results.'}
          </p>
        </div>
        {showListView && (
          <Button className="gap-2 shrink-0" onClick={() => openUploadModal()}>
            <Upload className="h-4 w-4" /> Analyze resume
          </Button>
        )}
      </div>

      {/* ── List view ── */}
      {showListView ? (
        <div className="flex min-h-0 flex-1 flex-col gap-5">
          {listLoading ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading analyses…</p>
              </div>
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-16 text-center">
              <div className="bg-primary/5 mb-6 flex h-24 w-24 items-center justify-center rounded-2xl">
                <FileText className="text-primary h-12 w-12" />
              </div>
              <h2 className="text-lg font-medium text-foreground">No analyses yet</h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                Upload your resume, pick a role, and get an instant ATS or AI report. Results are saved here so you can revisit them anytime.
              </p>
              <Button className="mt-6 gap-2" size="lg" onClick={() => openUploadModal()}>
                <Upload className="h-4 w-4" /> Analyze resume
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-foreground">Recent analyses</h2>
                <span className="text-xs text-muted-foreground">{list.length} {list.length === 1 ? 'analysis' : 'analyses'}</span>
              </div>
              <ul className="grid list-none gap-3 overflow-y-auto p-0 m-0">
                {list.map((item) => (
                  <li
                    key={item.id}
                    className={cn(
                      'flex items-center overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow',
                      item.mode === 'ai' ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-amber-500/70'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => openAnalysis(item.id)}
                      className="flex min-w-0 flex-1 items-center gap-4 p-4 text-left transition-colors hover:bg-muted/30"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted/50">
                        <FileText className="text-muted-foreground h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{item.fileName}</p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground">
                          <span>{item.jobTypeLabel}</span>
                          <span className="text-border">·</span>
                          <span className={cn(
                            'rounded-full px-1.5 py-0.5 text-xs font-medium',
                            item.mode === 'ats' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-primary/10 text-primary'
                          )}>
                            {item.mode === 'ats' ? 'ATS' : 'AI'}
                          </span>
                          {formatAnalysisDate(item.createdAt) && (
                            <>
                              <span className="text-border">·</span>
                              <span>{formatAnalysisDate(item.createdAt)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {item.score != null && (
                        <span className={cn(
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white',
                          item.score >= 75 ? 'bg-emerald-500' : item.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        )}>
                          {item.score}
                        </span>
                      )}
                    </button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => removeAnalysis(e, item.id)}
                      disabled={deletingId === item.id}
                      aria-label="Remove analysis"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : detailLoading ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border bg-muted/10">
          <Loader2 className="text-muted-foreground h-9 w-9 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading analysis…</p>
        </div>
      ) : (
        /* ── Results ── */
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-6">

          {/* Context bar */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <div className="flex h-9 items-center gap-2 rounded-lg bg-muted/50 px-2.5">
                <FileText className="text-muted-foreground h-4 w-4 shrink-0" />
                <span className="truncate text-sm font-medium text-foreground max-w-[140px]">{fileName}</span>
              </div>
              <JobTypeCombobox value={jobTypeId} onChange={setJobTypeId} compact />
              <span className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
                mode === 'ats' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-primary/10 text-primary'
              )}>
                {mode === 'ats' ? <Cpu className="h-3 w-3" /> : <Brain className="h-3 w-3" />}
                {mode === 'ats' ? 'ATS' : 'AI'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs" onClick={goToList}>
                ← Back
              </Button>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => openUploadModal()}>
                <Upload className="h-3.5 w-3.5" /> Change resume
              </Button>
              <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={analyze} disabled={!canAnalyze}>
                {isAnalyzing ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Re-running…</> : 'Re-analyze'}
              </Button>
            </div>
          </div>

          {/* Results: ATS only or AI only depending on mode */}
          {mode === 'ats' && atsReport && (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="col-span-1 flex flex-col items-center justify-center gap-4 rounded-xl border bg-card py-8 shadow-sm">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">ATS Score</p>
                  <ScoreRing score={atsReport.score} />
                  <p className="max-w-[200px] text-center text-xs leading-relaxed text-muted-foreground">
                    {selectedJob ? `For ${selectedJob.label}` : 'Keywords & structure'}
                  </p>
                </Card>
                <Card className="col-span-1 flex flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm md:col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Cpu className="text-primary h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Overview</span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground">
                    Your resume scored <strong>{atsReport.score}/100</strong> for{' '}
                    <strong>{selectedJob?.label ?? 'this role'}</strong>.{' '}
                    {atsReport.score >= 75
                      ? 'It aligns well with typical ATS expectations.'
                      : atsReport.score >= 50
                      ? 'A few improvements could strengthen your match.'
                      : 'Several gaps were detected; see suggestions below.'}
                  </p>
                  <div className="mt-auto space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Compatibility</span>
                      <span className="font-medium text-foreground">{atsReport.score}%</span>
                    </div>
                    <Progress value={atsReport.score} className="h-2 rounded-full" />
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <section className="flex flex-col gap-3">
                  <SectionHeading icon={<CheckCircle className="h-4 w-4 text-emerald-500" />} label="What's working" count={atsReport.strongPoints.length} />
                  {atsReport.strongPoints.map((text, i) => <DetailCard key={i} variant="success" text={text} />)}
                </section>
                <section className="flex flex-col gap-3">
                  <SectionHeading icon={<AlertTriangle className="h-4 w-4 text-amber-500" />} label="Needs attention" count={atsReport.weakPoints.length} />
                  {atsReport.weakPoints.length > 0
                    ? atsReport.weakPoints.map((text, i) => <DetailCard key={i} variant="warning" text={text} />)
                    : <DetailCard variant="muted" text="No major weak points detected." />}
                </section>
                <section className="flex flex-col gap-3">
                  <SectionHeading icon={<BarChart2 className="h-4 w-4 text-primary" />} label="Suggestions" count={atsReport.suggestions.length} />
                  {atsReport.suggestions.map((text, i) => <DetailCard key={i} variant="default" text={text} />)}
                  {atsReport.suggestions.length === 0 && <DetailCard variant="muted" text="No suggestions." />}
                </section>
              </div>
            </>
          )}

          {mode === 'ai' && (
            <>
              {aiError && !aiReport && (
                <Card className="rounded-xl border-destructive/20 bg-destructive/5 p-6 shadow-sm">
                  <p className="font-medium text-destructive">AI analysis unavailable</p>
                  <p className="mt-2 text-sm text-muted-foreground">{aiError}</p>
                  <p className="mt-2 text-xs text-muted-foreground">Check OPENAI_API_KEY or try ATS-only analysis.</p>
                </Card>
              )}
              {aiReport && (
                <>
                  <Card className="rounded-xl border bg-card p-6 shadow-sm">
                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <Brain className="text-primary h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">AI overview</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground">{aiReport.summary}</p>
                  </Card>
                  <section className="flex flex-col gap-3">
                    <SectionHeading icon={<Sparkles className="h-4 w-4 text-primary" />} label="How to improve" count={aiReport.suggestions.length} />
                    {aiReport.suggestions.length > 0
                      ? aiReport.suggestions.map((text, i) => <DetailCard key={i} variant="ai" text={text} badge="AI" />)
                      : <DetailCard variant="muted" text="No additional suggestions." />}
                  </section>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Upload / Choose Resume Modal ── */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-lg gap-6 sm:gap-6">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-lg">Add resume</DialogTitle>
            <DialogDescription className="text-sm">
              Upload a PDF or DOCX, or choose a resume you saved in Resume Builder.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={uploadModalTab} onValueChange={(v) => setUploadModalTab(v as 'upload' | 'saved')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-lg bg-muted/50 p-1">
              <TabsTrigger value="upload" className="gap-2 rounded-md text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Upload className="h-4 w-4" /> Upload file
              </TabsTrigger>
              <TabsTrigger value="saved" className="gap-2 rounded-md text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <FolderOpen className="h-4 w-4" /> My resumes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-2">
              <div
                className={cn(
                  'flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-8 py-12 transition-colors',
                  isDragging ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {isExtracting ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="text-primary h-10 w-10 animate-spin" />
                    <p className="text-sm font-medium text-foreground">Reading your resume…</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted/50">
                      <CloudUpload className="text-primary h-7 w-7" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Drag & drop or browse</p>
                    <p className="mt-1 text-xs text-muted-foreground">PDF or DOCX · max 5 MB</p>
                    <Button className="mt-5 gap-2" variant="secondary" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4" /> Browse files
                    </Button>
                    <input ref={fileInputRef} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFileSelect} />
                  </div>
                )}
              </div>
              {extractError && (
                <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5">
                  <X className="text-destructive mt-0.5 h-4 w-4 shrink-0" />
                  <p className="text-sm text-destructive">{extractError}</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved" className="mt-2">
              {savedResumes.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted/50">
                    <FolderOpen className="text-muted-foreground h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No saved resumes yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Create and save a resume in Resume Builder to use it here.
                  </p>
                </div>
              ) : (
                <ul className="flex max-h-[280px] flex-col gap-1 overflow-y-auto rounded-xl border bg-muted/10 p-1.5">
                  {savedResumes.map((r) => (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectSavedResume(r)}
                        className={cn(
                          'flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/50',
                          savedResumeId === r.id && 'bg-primary/10 ring-1 ring-primary/20'
                        )}
                      >
                        <span className="text-sm font-medium text-foreground">{r.title || 'Untitled'}</span>
                        <span className="text-xs text-muted-foreground">
                          {r.fullName && `${r.fullName} · `}{r.jobTitle || 'No title'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          </Tabs>

          {hasResume && !isExtracting && (
            <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3 rounded-lg border bg-primary/5 px-3 py-2.5">
                <CheckCircle className="text-primary h-4 w-4 shrink-0" />
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{fileName}</p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {resumeText?.length?.toLocaleString()} chars
                </span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Job type</label>
                  <JobTypeCombobox value={jobTypeId} onChange={setJobTypeId} />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Analysis</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMode('ats')}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors',
                        mode === 'ats' ? 'border-amber-500/30 bg-amber-500/10' : 'border-border hover:bg-muted/30'
                      )}
                    >
                      <Cpu className={cn('h-4 w-4', mode === 'ats' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')} />
                      ATS only
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('ai')}
                      className={cn(
                        'flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors',
                        mode === 'ai' ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/30'
                      )}
                    >
                      <Brain className={cn('h-4 w-4', mode === 'ai' ? 'text-primary' : 'text-muted-foreground')} />
                      AI only
                    </button>
                  </div>
                </div>
                <Button onClick={analyze} disabled={!canAnalyze} className="w-full gap-2" size="default">
                  {isAnalyzing ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</>
                  ) : (
                    `Run ${mode === 'ats' ? 'ATS' : 'AI'} analysis`
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SectionHeading({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode
  label: string
  count: number
}) {
  return (
    <div className="flex items-center gap-2 pb-1">
      {icon}
      <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{label}</span>
      {count > 0 && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {count}
        </span>
      )}
    </div>
  )
}

function DetailCard({
  text,
  variant,
  badge,
}: {
  text: string
  variant: 'success' | 'warning' | 'default' | 'ai' | 'muted'
  badge?: string
}) {
  const styles = {
    success: 'border-emerald-500/20 bg-emerald-500/5',
    warning: 'border-amber-500/20 bg-amber-500/5',
    default: 'border-border bg-card',
    ai: 'border-primary/20 bg-primary/5',
    muted: 'border-border bg-muted/30',
  }

  return (
    <div className={cn('rounded-xl border p-4 shadow-sm', styles[variant])}>
      <div className="flex items-start gap-3">
        {variant === 'ai' && <Sparkles className="text-primary mt-0.5 h-4 w-4 shrink-0" />}
        <p className="flex-1 text-sm leading-relaxed text-foreground">{text}</p>
        {badge && (
          <span className="shrink-0 rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}
