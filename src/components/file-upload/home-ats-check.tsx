'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  CloudUpload,
  Upload as UploadIcon,
  FileTextIcon,
} from '@/components/icons'
import { cn } from '@/lib/utils'
import { extractTextFromFile, checkFile } from '@/lib/resume-extract'
import {
  HOME_ATS_DEFAULT_JOB_TYPE_ID,
  PENDING_ATS_STORAGE_KEY,
  PENDING_ATS_VERSION,
  type PendingAtsPayload,
} from '@/lib/pending-ats'

type PreviewSummary = {
  score: number
  jobTypeLabel: string
  jobTypeId: string
  teaser: string
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

  const signInHref = `/sign-in?callbackUrl=${encodeURIComponent('/continue/job-match')}`
  const signUpHref = `/sign-up?callbackUrl=${encodeURIComponent('/continue/job-match')}`

  const runForLoggedInUser = useCallback(
    async (text: string, name: string) => {
      const res = await fetch('/api/job-match/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: text.trim(),
          jobTypeId: HOME_ATS_DEFAULT_JOB_TYPE_ID,
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

  const runGuestPreview = useCallback(async (text: string, name: string) => {
    const res = await fetch('/api/job-match/ats-preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        resumeText: text.trim(),
        jobTypeId: HOME_ATS_DEFAULT_JOB_TYPE_ID,
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
      jobTypeId: HOME_ATS_DEFAULT_JOB_TYPE_ID,
    }
    try {
      sessionStorage.setItem(PENDING_ATS_STORAGE_KEY, JSON.stringify(payload))
    } catch {
      // ignore quota / private mode
    }
  }, [])

  const processFile = useCallback(
    async (file: File | null) => {
      if (!file) return
      setError(null)
      setSummary(null)
      setFileLabel(file.name)
      const err = checkFile(file)
      if (err) {
        setError(err)
        return
      }
      setBusy(true)
      try {
        const result = await extractTextFromFile(file)
        if (!result.ok) {
          setError(result.error)
          return
        }
        if (result.text.trim().length < 100) {
          setError(
            'Not enough text could be read from this file. Try another PDF or DOCX.'
          )
          return
        }
        if (homeUserId) {
          await runForLoggedInUser(result.text, file.name)
        } else {
          await runGuestPreview(result.text, file.name)
        }
      } finally {
        setBusy(false)
      }
    },
    [homeUserId, runForLoggedInUser, runGuestPreview]
  )

  const clearResult = () => {
    setSummary(null)
    setFileLabel(null)
    setError(null)
    try {
      sessionStorage.removeItem(PENDING_ATS_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }

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

        <div className="flex flex-col items-center gap-4">
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

          <div className="space-y-2">
            <h3 className="text-foreground text-lg font-semibold">
              Free ATS check
            </h3>
            <p className="text-muted-foreground text-sm font-medium">
              Drag and drop your resume PDF or DOCX (up to 5 MB)
            </p>
            <p className="text-muted-foreground mx-auto max-w-sm text-xs leading-relaxed">
              Preview uses a sample role ({' '}
              <span className="text-foreground font-medium">
                Software Engineer
              </span>
              ). After sign-in you can pick any title and keep full reports in
              Analyze resume.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="cursor-pointer rounded-full"
          >
            <UploadIcon className="size-4" />
            {busy ? (homeUserId ? 'Analyzing…' : 'Checking…') : 'Select file'}
          </Button>

          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 max-w-lg text-center text-xs font-normal"
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
              <p className="text-muted-foreground text-sm leading-relaxed">
                {summary.teaser}
              </p>
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
