'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Upload, CloudUpload, AlertTriangle, CheckCircle, BarChart2, FileText } from '@/components/icons'
import { Loader2, X, ChevronsUpDown, Check, FolderOpen, Trash2 } from 'lucide-react'
import PageTitle from '@/components/page-title'
import { JOB_TYPES, JOB_TYPE_CATEGORIES } from '@/lib/job-types'
import { extractTextFromFile, checkFile } from '@/lib/resume-extract'
import { getAllResumes, savedResumeToText, type SavedResume } from '@/lib/resume-storage'
import { cn } from '@/lib/utils'
import type { AtsReport } from '@/lib/ats-engine'
import {
  parsePendingAtsPayload,
  PENDING_ATS_STORAGE_KEY,
} from '@/lib/pending-ats'

let pendingAtsAnalyzeInFlight = false

interface AnalyzeResponse {
  atsReport?: AtsReport | null
  analysisId?: string
  error?: string
}

interface AnalysisListItem {
  id: string
  fileName: string
  jobTypeId: string
  jobTypeLabel: string
  mode: string
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

// ── List row score: ring + readable numeric (dashboard list) ────────────────
function ListScoreDisplay({ score }: { score: number }) {
  const r = 22
  const size = 64
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const stroke =
    score >= 75
      ? 'text-emerald-600 dark:text-emerald-500'
      : score >= 50
        ? 'text-amber-600 dark:text-amber-500'
        : 'text-rose-600 dark:text-rose-500'

  return (
    <div
      className="flex shrink-0 items-center gap-3"
      title={`Match score: ${score} out of 100`}
    >
      <div className="relative flex shrink-0" style={{ width: size, height: size }}>
        <svg
          className="text-muted-foreground/30 absolute inset-0 -rotate-90"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            className={stroke}
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
          />
        </svg>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">Match</span>
        <p className="text-foreground leading-none">
          <span className="text-2xl font-semibold tabular-nums tracking-tight">{score}</span>
          <span className="text-muted-foreground ml-1 text-sm font-medium tabular-nums">/ 100</span>
        </p>
      </div>
    </div>
  )
}

// ── Score ring (report hero) ─────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 40
  const circ = 2 * Math.PI * r
  const filled = (score / 100) * circ
  const label = score >= 75 ? 'Strong alignment' : score >= 50 ? 'Room to improve' : 'Needs attention'

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-[108px] w-[108px] items-center justify-center">
        <svg className="text-muted-foreground/30 -rotate-90" width="108" height="108" viewBox="0 0 108 108" aria-hidden>
          <circle cx="54" cy="54" r={r} fill="none" stroke="currentColor" strokeWidth="5" />
          <circle
            cx="54"
            cy="54"
            r={r}
            fill="none"
            className="text-primary"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.6s ease-out' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-foreground text-2xl font-semibold tabular-nums tracking-tight">{score}</span>
          <span className="text-muted-foreground mt-0.5 text-[11px]">of 100</span>
        </div>
      </div>
      <span className="text-muted-foreground max-w-[12rem] text-center text-xs leading-snug">{label}</span>
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
function JobMatchPage() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const urlAnalysisApplied = useRef(false)

  const [resumeText, setResumeText] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [jobTypeId, setJobTypeId] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [atsReport, setAtsReport] = useState<AtsReport | null>(null)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
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
  const hasResults = atsReport != null
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
    if (urlAnalysisApplied.current) return
    const aid = searchParams.get('analysisId')
    if (aid && /^[0-9a-f-]{36}$/i.test(aid)) {
      urlAnalysisApplied.current = true
      setAnalysisId(aid)
      router.replace(pathname, { scroll: false })
    }
  }, [searchParams, pathname, router])

  useEffect(() => {
    if (searchParams.get('pending') !== '1') return
    if (searchParams.get('analysisId')) return
    if (pendingAtsAnalyzeInFlight) return

    const raw = sessionStorage.getItem(PENDING_ATS_STORAGE_KEY)
    const payload = parsePendingAtsPayload(raw)
    if (!payload) {
      router.replace(pathname, { scroll: false })
      return
    }

    pendingAtsAnalyzeInFlight = true
    setResumeText(payload.resumeText)
    setFileName(payload.fileName)
    setJobTypeId(payload.jobTypeId)
    setIsAnalyzing(true)
    setAnalysisError(null)

    fetch('/api/job-match/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeText: payload.resumeText,
        jobTypeId: payload.jobTypeId,
        fileName: payload.fileName,
      }),
    })
      .then(async (res) => {
        const data = (await res.json()) as AnalyzeResponse
        if (!res.ok) {
          setAnalysisError(data.error ?? 'Analysis failed')
          try {
            sessionStorage.setItem(
              PENDING_ATS_STORAGE_KEY,
              JSON.stringify(payload)
            )
          } catch {
            /* ignore */
          }
          return
        }
        try {
          sessionStorage.removeItem(PENDING_ATS_STORAGE_KEY)
        } catch {
          /* ignore */
        }
        if (data.analysisId) setAnalysisId(data.analysisId)
        setAtsReport(data.atsReport ?? null)
        router.replace(pathname, { scroll: false })
      })
      .catch(() => {
        setAnalysisError('Request failed. Please try again.')
        try {
          sessionStorage.setItem(
            PENDING_ATS_STORAGE_KEY,
            JSON.stringify(payload)
          )
        } catch {
          /* ignore */
        }
      })
      .finally(() => {
        setIsAnalyzing(false)
        pendingAtsAnalyzeInFlight = false
      })
  }, [searchParams, pathname, router])

  useEffect(() => {
    if (!analysisId || hasResults) return
    setDetailLoading(true)
    fetch(`/api/job-match/analyses/${analysisId}`)
      .then((r) => r.json())
      .then((data: unknown) => {
        const d = data as {
          fileName?: string
          jobTypeId?: string
          jobTypeLabel?: string
          atsReport?: AtsReport | null
        }
        setFileName(d.fileName ?? null)
        setJobTypeId(d.jobTypeId ?? '')
        setAtsReport(d.atsReport ?? null)
        setAnalysisError(null)
      })
      .catch(() => setAnalysisError('Failed to load analysis.'))
      .finally(() => setDetailLoading(false))
  }, [analysisId, hasResults])

  useEffect(() => {
    setSavedResumes(getAllResumes())
  }, [uploadOpen])

  const handleFile = useCallback(async (file: File | null) => {
    if (!file) {
      setResumeText(null); setFileName(null); setExtractError(null); setSavedResumeId(null)
      setAtsReport(null); setAnalysisError(null)
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
    setIsAnalyzing(true)
    setAnalysisError(null)
    try {
      const res = await fetch('/api/job-match/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobTypeId,
          fileName: fileName ?? undefined,
        }),
      })
      const data = (await res.json()) as AnalyzeResponse
      if (!res.ok) {
        setAnalysisError(data.error ?? 'Analysis failed')
        return
      }
      setAtsReport(data.atsReport ?? null)
      if (data.analysisId) {
        setAnalysisId(data.analysisId)
        setUploadOpen(false)
      }
    } catch {
      setAnalysisError('Request failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const goToList = () => {
    setAnalysisId(null)
    setAtsReport(null)
    setAnalysisError(null)
    setFileName(null)
    setResumeText(null)
    setJobTypeId('')
    fetchList()
  }

  const openAnalysis = (id: string) => {
    setAtsReport(null)
    setAnalysisError(null)
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
    <div className="flex min-h-[calc(100dvh-8.5rem)] flex-1 flex-col gap-6 md:gap-8">
      {/* Header */}
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-4">
        <PageTitle
          title="Analyze resume"
          subtitle={
            showListView
              ? 'Compare your resume to a target role and keep every run in one place.'
              : 'Review scores, notes, and next steps for this file.'
          }
        />
        {showListView && (
          <Button className="shrink-0 gap-2 shadow-sm" size="sm" onClick={() => openUploadModal()}>
            <Upload className="h-4 w-4" /> New analysis
          </Button>
        )}
      </div>

      {/* ── List view ── */}
      {showListView ? (
        <div
          className={cn(
            'flex min-h-0 flex-1 flex-col gap-5',
            list.length > 0 && 'bg-card border-border/70 rounded-2xl border p-4 shadow-sm md:p-6'
          )}
        >
          {listLoading ? (
            <div className="flex min-h-0 flex-1 flex-col space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-muted/50 h-[4.75rem] animate-pulse rounded-2xl border border-border/40"
                />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/80 bg-gradient-to-b from-primary/[0.06] via-card to-card px-6 py-16 text-center shadow-sm">
              <div className="bg-background/80 mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border shadow-sm backdrop-blur-sm">
                <FileText className="text-primary h-7 w-7 opacity-80" />
              </div>
              <p className="text-foreground text-lg font-semibold tracking-tight">Start your first analysis</p>
              <p className="text-muted-foreground mx-auto mt-2 max-w-md text-sm leading-relaxed">
                Upload a PDF or Word file, pick a job title, and run an ATS check. Results stay here for easy access.
              </p>
              <Button className="mt-8 gap-2" onClick={() => openUploadModal()}>
                <Upload className="h-4 w-4" /> New analysis
              </Button>
            </div>
          ) : (
            <>
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-foreground text-sm font-semibold tracking-tight">Recent analyses</h2>
                  <p className="text-muted-foreground mt-0.5 text-xs">Open a row to see the full report.</p>
                </div>
                <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium tabular-nums">
                  {list.length} saved
                </span>
              </div>
              <ul className="m-0 flex min-h-0 flex-1 list-none flex-col gap-3 overflow-y-auto p-0">
                {list.map((item) => (
                  <li key={item.id}>
                    <div
                      className={cn(
                        'border-border/80 bg-background flex min-w-0 flex-wrap items-center overflow-hidden rounded-xl border shadow-sm transition-[box-shadow,border-color] duration-200 sm:flex-nowrap',
                        'hover:border-primary/20 hover:shadow-md'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => openAnalysis(item.id)}
                        className="hover:bg-muted/50 flex min-w-0 flex-1 items-center gap-3 px-3 py-4 text-left sm:gap-4 sm:px-4"
                      >
                        <div className="from-primary/15 ring-primary/10 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br to-transparent ring-1 sm:h-12 sm:w-12">
                          <FileText className="text-primary h-5 w-5 opacity-90" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground truncate text-[15px] font-medium leading-snug">{item.fileName}</p>
                          <div className="text-muted-foreground mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                            <span className="truncate">{item.jobTypeLabel}</span>
                            {formatAnalysisDate(item.createdAt) && (
                              <>
                                <span className="text-border" aria-hidden>
                                  ·
                                </span>
                                <time dateTime={item.createdAt}>{formatAnalysisDate(item.createdAt)}</time>
                              </>
                            )}
                            <Badge
                              variant="outline"
                              className="text-muted-foreground h-5 border-border/80 px-2 text-[10px] font-normal uppercase tracking-wide"
                            >
                              {item.mode === 'ai' ? 'Legacy' : 'ATS'}
                            </Badge>
                          </div>
                        </div>
                      </button>
                      <div className="border-border/60 bg-muted/20 flex w-full shrink-0 items-center justify-end gap-2 border-t px-3 py-2 sm:w-auto sm:border-t-0 sm:border-l sm:px-4 sm:py-0">
                        {item.score != null ? (
                          <ListScoreDisplay score={item.score} />
                        ) : (
                          <span className="text-muted-foreground px-2 text-xs">No score</span>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="text-muted-foreground hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive h-10 w-10 shrink-0 rounded-lg border-border/80"
                          onClick={(e) => removeAnalysis(e, item.id)}
                          disabled={deletingId === item.id}
                          aria-label="Delete analysis"
                        >
                          {deletingId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : detailLoading ? (
        <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-3 py-20">
          <Loader2 className="text-primary h-7 w-7 animate-spin opacity-70" />
          <p className="text-sm font-medium text-foreground">Opening report…</p>
        </div>
      ) : (
        /* ── Results ── */
        <div className="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto pb-6">

          {/* Context bar */}
          <div className="border-border/80 bg-card flex flex-col gap-4 rounded-2xl border p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:p-5">
            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="bg-muted/80 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <FileText className="text-muted-foreground h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-muted-foreground text-[11px] font-medium uppercase tracking-wide">File</p>
                  <p className="text-foreground truncate text-sm font-medium">{fileName}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:border-border/60 sm:border-l sm:pl-4">
                <JobTypeCombobox value={jobTypeId} onChange={setJobTypeId} compact />
                <Badge variant="secondary" className="h-6 px-2 text-[10px] font-normal">
                  ATS scan
                </Badge>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 sm:border-t-0 sm:pt-0">
              <Button variant="ghost" size="sm" className="h-9 text-xs" onClick={goToList}>
                All analyses
              </Button>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={() => openUploadModal()}>
                <Upload className="h-3.5 w-3.5" /> Replace file
              </Button>
              <Button size="sm" className="h-9 text-xs shadow-sm" onClick={analyze} disabled={!canAnalyze}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Running…
                  </>
                ) : (
                  'Re-run'
                )}
              </Button>
            </div>
          </div>

          {analysisError && (
            <Card className="rounded-2xl border border-destructive/20 bg-card p-6 shadow-sm">
              <p className="text-destructive text-sm font-semibold">Something went wrong</p>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{analysisError}</p>
            </Card>
          )}

          {atsReport && (
            <>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <Card className="col-span-1 flex flex-col items-center justify-center gap-4 rounded-2xl border border-border/80 bg-card py-10 shadow-sm">
                  <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">Match score</p>
                  <ScoreRing score={atsReport.score} />
                  <p className="text-muted-foreground max-w-[14rem] px-4 text-center text-xs leading-relaxed">
                    {selectedJob ? `Compared against ${selectedJob.label}` : 'Keyword and structure fit'}
                  </p>
                </Card>
                <Card className="col-span-1 flex flex-col justify-center gap-5 rounded-2xl border border-border/80 bg-card p-6 shadow-sm lg:col-span-2">
                  <div>
                    <h3 className="text-foreground text-sm font-semibold">At a glance</h3>
                    <p className="text-muted-foreground mt-1 text-xs">How this resume reads to typical ATS filters.</p>
                  </div>
                  <p className="text-foreground text-[15px] leading-relaxed">
                    <span className="font-semibold tabular-nums">{atsReport.score}</span>
                    <span className="text-muted-foreground">/100</span> for{' '}
                    <span className="font-medium">{selectedJob?.label ?? 'the selected role'}</span>.{' '}
                    {atsReport.score >= 75
                      ? 'You are in a strong position for automated screening.'
                      : atsReport.score >= 50
                      ? 'Small edits to keywords and layout could lift your signal.'
                      : 'Prioritize the gaps and suggestions in the columns below.'}
                  </p>
                  <div className="space-y-2 pt-1">
                    <div className="text-muted-foreground flex justify-between text-xs font-medium">
                      <span>Overall weighting</span>
                      <span className="text-foreground tabular-nums">{atsReport.score}%</span>
                    </div>
                    <Progress value={atsReport.score} className="bg-muted/80 h-2" />
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
                <section className="flex flex-col gap-3">
                  <SectionHeading icon={<CheckCircle className="text-emerald-600/80 dark:text-emerald-500/90 h-4 w-4" />} label="Strengths" count={atsReport.strongPoints.length} />
                  {atsReport.strongPoints.map((text, i) => <DetailCard key={i} variant="success" text={text} />)}
                </section>
                <section className="flex flex-col gap-3">
                  <SectionHeading icon={<AlertTriangle className="text-amber-600/80 dark:text-amber-500/90 h-4 w-4" />} label="Gaps" count={atsReport.weakPoints.length} />
                  {atsReport.weakPoints.length > 0
                    ? atsReport.weakPoints.map((text, i) => <DetailCard key={i} variant="warning" text={text} />)
                    : <DetailCard variant="muted" text="No major gaps flagged." />}
                </section>
                <section className="flex flex-col gap-3">
                  <SectionHeading icon={<BarChart2 className="text-primary h-4 w-4 opacity-90" />} label="Next steps" count={atsReport.suggestions.length} />
                  {atsReport.suggestions.map((text, i) => <DetailCard key={i} variant="default" text={text} />)}
                  {atsReport.suggestions.length === 0 && <DetailCard variant="muted" text="No suggestions." />}
                </section>
              </div>
            </>
          )}

          {!atsReport && !analysisError && !detailLoading && (
            <Card className="rounded-2xl border border-border/80 bg-card p-6 text-center shadow-sm">
              <p className="text-muted-foreground text-sm">
                No ATS report loaded for this analysis.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* ── Upload / Choose Resume Modal ── */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-md gap-6 border-border/80 p-6 sm:max-w-lg sm:p-8">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-lg font-semibold tracking-tight">New analysis</DialogTitle>
            <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
              Add a resume, select the target role, then run an ATS check. Nothing is shared until you start the run.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={uploadModalTab} onValueChange={(v) => setUploadModalTab(v as 'upload' | 'saved')} className="w-full">
            <TabsList className="bg-muted/70 grid h-10 w-full grid-cols-2 rounded-xl p-1 ring-1 ring-border/50">
              <TabsTrigger
                value="upload"
                className="gap-2 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"
              >
                <Upload className="h-3.5 w-3.5 opacity-70" /> Upload
              </TabsTrigger>
              <TabsTrigger
                value="saved"
                className="gap-2 rounded-lg text-xs font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"
              >
                <FolderOpen className="h-3.5 w-3.5 opacity-70" /> Saved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <div
                className={cn(
                  'flex flex-col items-center justify-center rounded-xl border border-dashed border-border/90 bg-gradient-to-b from-muted/30 to-muted/10 px-6 py-11 transition-colors',
                  isDragging && 'border-primary/35 from-primary/[0.06] to-primary/[0.02]'
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
                    <CloudUpload className="text-muted-foreground mb-3 h-8 w-8" />
                    <p className="text-foreground text-sm font-medium">Drop a file here</p>
                    <p className="text-muted-foreground mt-1 text-xs">PDF or Word · 5 MB max</p>
                    <Button className="mt-4 gap-2" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4" /> Choose file
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

            <TabsContent value="saved" className="mt-3">
              {savedResumes.length === 0 ? (
                <div className="border-border flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 px-4 py-10 text-center">
                  <FolderOpen className="text-muted-foreground mb-2 h-7 w-7" />
                  <p className="text-foreground text-sm font-medium">No saved resumes</p>
                  <p className="text-muted-foreground mt-1 text-xs">Save one from Resume Builder to select it here.</p>
                </div>
              ) : (
                <ul className="border-border flex max-h-[280px] flex-col gap-0 overflow-y-auto rounded-lg border p-0">
                  {savedResumes.map((r) => (
                    <li key={r.id} className="border-border border-b last:border-b-0">
                      <button
                        type="button"
                        onClick={() => handleSelectSavedResume(r)}
                        className={cn(
                          'hover:bg-muted/50 flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left transition-colors',
                          savedResumeId === r.id && 'bg-muted/60'
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
            <div className="border-border/80 space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
              <div className="bg-primary/[0.06] flex items-center gap-3 rounded-xl border border-primary/10 px-3 py-2.5">
                <CheckCircle className="text-primary h-4 w-4 shrink-0 opacity-80" />
                <p className="text-foreground min-w-0 flex-1 truncate text-sm font-medium">{fileName}</p>
                <span className="text-muted-foreground shrink-0 text-[11px] tabular-nums">
                  {resumeText?.length?.toLocaleString()} chars
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-foreground mb-2 block text-xs font-semibold">Target role</label>
                  <JobTypeCombobox value={jobTypeId} onChange={setJobTypeId} />
                </div>
                <Button onClick={analyze} disabled={!canAnalyze} className="w-full shadow-sm" size="default">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running…
                    </>
                  ) : (
                    'Run ATS analysis'
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

export default function JobMatchPageEntry() {
  return (
    <Suspense
      fallback={
        <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">
          Loading…
        </div>
      }
    >
      <JobMatchPage />
    </Suspense>
  )
}

function SectionHeading({
  icon,
  label,
  count,
}: {
  icon?: React.ReactNode
  label: string
  count: number
}) {
  return (
    <div className="flex w-full items-center gap-2.5 pb-1">
      {icon}
      <span className="text-foreground text-[13px] font-semibold tracking-tight">{label}</span>
      {count > 0 && (
        <span className="bg-muted text-muted-foreground ml-auto shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium tabular-nums">
          {count}
        </span>
      )}
    </div>
  )
}

function DetailCard({
  text,
  variant,
}: {
  text: string
  variant: 'success' | 'warning' | 'default' | 'ai' | 'muted'
}) {
  return (
    <div
      className={cn(
        'rounded-xl py-3.5 pr-4 pl-4 text-[13px] leading-relaxed shadow-sm',
        variant === 'success' &&
          'border border-emerald-500/20 border-l-[3px] border-l-emerald-600/60 bg-emerald-500/[0.04] text-foreground dark:border-l-emerald-400/70',
        variant === 'warning' &&
          'border border-amber-500/20 border-l-[3px] border-l-amber-600/60 bg-amber-500/[0.04] text-foreground dark:border-l-amber-400/70',
        (variant === 'default' || variant === 'ai') && 'border-border/80 bg-card text-foreground border',
        variant === 'muted' && 'border-border/60 bg-muted/30 text-muted-foreground border shadow-none'
      )}
    >
      {text}
    </div>
  )
}
