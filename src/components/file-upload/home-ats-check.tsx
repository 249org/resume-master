'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CloudUpload,
  Sparkles,
  Upload as UploadIcon,
  FileTextIcon,
} from '@/components/icons'
import { cn } from '@/lib/utils'
import { extractTextFromFile, checkFile } from '@/lib/resume-extract'
import { JobTypeCombobox } from '@/components/job-type-combobox'
import {
  PENDING_ATS_STORAGE_KEY,
  PENDING_ATS_VERSION,
  type PendingAtsPayload,
} from '@/lib/pending-ats'

type PreviewSummary = {
  score: number
  jobTypeLabel: string
  jobTypeId: string
  teaser: string
  moreFeedback?: string[]
  statsLine?: string
}

export default function HomeAtsCheck({
  homeUserId,
  className,
}: {
  homeUserId: string | null
  className?: string
}) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<PreviewSummary | null>(null)
  const [fileLabel, setFileLabel] = useState<string | null>(null)
  const [resumeText, setResumeText] = useState<string | null>(null)
  const [jobTypeId, setJobTypeId] = useState<string>('')

  useEffect(() => {
    setSummary(null)
    setError(null)
  }, [jobTypeId])

  const signInHref = `/sign-in?callbackUrl=${encodeURIComponent('/continue/job-match')}`
  const signUpHref = `/sign-up?callbackUrl=${encodeURIComponent('/continue/job-match')}`

  const runForLoggedInUser = useCallback(
    async (text: string, name: string, roleId: string) => {
      const res = await fetch('/api/job-match/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: text.trim(),
          jobTypeId: roleId,
          fileName: name,
        }),
      })
      const data = (await res.json()) as {
        error?: string
        analysisId?: string
      }
      if (!res.ok) {
        setError(data.error ?? 'Analysis failed.')
        return
      }
      if (data.analysisId && homeUserId) {
        router.push(
          `/users/${homeUserId}/job-match?analysisId=${encodeURIComponent(data.analysisId)}`
        )
      }
    },
    [homeUserId, router]
  )

  const runGuestPreview = useCallback(
    async (text: string, name: string, roleId: string) => {
      const res = await fetch('/api/job-match/ats-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: text.trim(),
          jobTypeId: roleId,
        }),
      })
      const data = (await res.json()) as {
        error?: string
        summary?: PreviewSummary
      }
      if (!res.ok) {
        setError(data.error ?? 'Preview failed.')
        return
      }
      if (!data.summary) {
        setError('Unexpected response from server.')
        return
      }
      setSummary(data.summary)
      const payload: PendingAtsPayload = {
        v: PENDING_ATS_VERSION,
        resumeText: text.trim(),
        fileName: name,
        jobTypeId: roleId,
      }
      try {
        sessionStorage.setItem(PENDING_ATS_STORAGE_KEY, JSON.stringify(payload))
      } catch {
        // ignore quota / private mode
      }
    },
    []
  )

  const resetFile = useCallback(() => {
    setResumeText(null)
    setFileLabel(null)
    setJobTypeId('')
    setSummary(null)
    setError(null)
    try {
      sessionStorage.removeItem(PENDING_ATS_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

  /** Step 1: read file only — role is chosen afterward. */
  const processFile = useCallback(async (file: File | null) => {
    if (!file) return
    setError(null)
    setSummary(null)
    setResumeText(null)
    setJobTypeId('')
    setFileLabel(file.name)
    const err = checkFile(file)
    if (err) {
      setError(err)
      setFileLabel(null)
      return
    }
    setBusy(true)
    try {
      const result = await extractTextFromFile(file)
      if (!result.ok) {
        setError(result.error)
        setFileLabel(null)
        return
      }
      if (result.text.trim().length < 100) {
        setError(
          'Not enough text could be read from this file. Try another PDF or DOCX.'
        )
        setFileLabel(null)
        return
      }
      setResumeText(result.text)
      setJobTypeId('')
    } finally {
      setBusy(false)
    }
  }, [])

  /** Step 2: run ATS with chosen role. */
  const runAnalysis = useCallback(async () => {
    if (!resumeText?.trim() || !fileLabel || !jobTypeId.trim()) return
    setError(null)
    setBusy(true)
    try {
      if (homeUserId) {
        await runForLoggedInUser(resumeText, fileLabel, jobTypeId)
      } else {
        await runGuestPreview(resumeText, fileLabel, jobTypeId)
      }
    } finally {
      setBusy(false)
    }
  }, [
    resumeText,
    fileLabel,
    jobTypeId,
    homeUserId,
    runForLoggedInUser,
    runGuestPreview,
  ])

  const clearResult = () => {
    setSummary(null)
    resetFile()
  }

  const hasResume = !!resumeText
  const canRun = hasResume && !!jobTypeId.trim() && !busy

  return (
    <div className={cn('w-full max-w-xl rounded-xl', className)}>
      <div
        className={cn(
          'relative rounded-lg border border-dashed p-8 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-primary/25 hover:border-primary'
        )}
        onDragEnter={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          const f = e.dataTransfer.files[0]
          if (f) void processFile(f)
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) void processFile(f)
          }}
        />

        <div className="flex w-full flex-col items-center gap-4">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full',
              isDragging ? 'bg-primary/10' : 'bg-muted'
            )}
          >
            <CloudUpload
              className={cn(
                'h-6 w-6',
                isDragging ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-foreground text-lg font-semibold">
              Free ATS check
            </h3>
            <p className="text-muted-foreground text-sm font-medium">
              Drag and drop your resume PDF or DOCX (up to 5 MB)
            </p>
          </div>

          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="cursor-pointer rounded-full"
          >
            <UploadIcon className="size-4" />
            {!hasResume && busy
              ? 'Reading resume…'
              : hasResume
                ? 'Replace file'
                : 'Select file'}
          </Button>

          {hasResume && (
            <>
              <p className="text-muted-foreground w-full max-w-md text-center text-xs">
                <span className="text-foreground font-medium">{fileLabel}</span>
                {' · '}
                <button
                  type="button"
                  className="text-primary underline-offset-2 hover:underline"
                  onClick={resetFile}
                >
                  Clear
                </button>
              </p>

              <div className="w-full max-w-md space-y-2 text-left">
                <label
                  htmlFor="home-ats-job-type"
                  className="text-foreground text-sm font-medium"
                >
                  Target role
                </label>
                <JobTypeCombobox
                  id="home-ats-job-type"
                  value={jobTypeId}
                  onChange={setJobTypeId}
                />
                <p className="text-muted-foreground text-xs leading-relaxed">
                  The ATS check scores your resume against this role’s keyword
                  profile. You can change it before running the check.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => void runAnalysis()}
                disabled={!canRun}
                className="cursor-pointer rounded-full"
              >
                <Sparkles className="size-4" />
                {busy && hasResume
                  ? homeUserId
                    ? 'Analyzing…'
                    : 'Checking…'
                  : homeUserId
                    ? 'Analyze resume'
                    : 'Run ATS check'}
              </Button>
            </>
          )}

          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 max-w-full text-center text-xs font-normal lg:max-w-lg"
          >
            Guests see a short preview. Sign in to save the full ATS report to
            your account.
          </Badge>
        </div>
      </div>

      {error && (
        <p className="text-destructive mt-4 text-center text-sm" role="alert">
          {error}
        </p>
      )}

      {summary && !homeUserId && (
        <div className="border-border bg-card mt-6 rounded-xl border p-6 text-left shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <FileTextIcon className="text-primary size-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Preview · {summary.jobTypeLabel}
              </p>
              <p className="text-foreground text-2xl font-semibold tabular-nums">
                {summary.score}
                <span className="text-muted-foreground ml-1 text-sm font-medium">
                  / 100
                </span>
              </p>
              <p className="text-foreground text-sm leading-relaxed">
                {summary.teaser}
              </p>
              {(summary.moreFeedback?.length ?? 0) > 0 && (
                <ul className="text-muted-foreground mt-3 list-inside list-disc space-y-2 text-sm leading-relaxed">
                  {summary.moreFeedback!.map((line, i) => (
                    <li key={i} className="pl-0.5">
                      {line}
                    </li>
                  ))}
                </ul>
              )}
              {summary.statsLine && (
                <p className="text-muted-foreground mt-2 text-xs">
                  {summary.statsLine}
                </p>
              )}
              {fileLabel && (
                <p className="text-muted-foreground text-xs">{fileLabel}</p>
              )}
              <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:flex-wrap">
                <Button asChild className="w-full sm:w-auto">
                  <Link href={signInHref}>Sign in for full report</Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link href={signUpHref}>Create free account</Link>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={clearResult}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
