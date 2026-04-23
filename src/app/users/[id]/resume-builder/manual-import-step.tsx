'use client'

import type { RefObject } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RefreshCw, Upload, FileText, X, Pencil } from '@/components/icons'
import PageTitle from '@/components/page-title'

export function ManualImportStep({
  uploadedFile,
  uploadedText,
  isDragging,
  setIsDragging,
  parseError,
  importBusy,
  fileInputRef,
  onFileInputChange,
  onDropFile,
  onZoneClick,
  onClearUpload,
  onContinueWithResume,
  onStartBlank,
}: {
  uploadedFile: File | null
  uploadedText: string
  isDragging: boolean
  setIsDragging: (v: boolean) => void
  parseError: string | null
  importBusy: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  onFileInputChange: (file: File | undefined | null) => void
  onDropFile: (file: File | undefined | null) => void
  onZoneClick: () => void
  onClearUpload: () => void
  onContinueWithResume: () => void
  onStartBlank: () => void
}) {
  const canContinue = Boolean(uploadedFile && uploadedText && !importBusy)

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col space-y-6">
      <PageTitle
        title="How would you like to start?"
        subtitle="Open a blank document and fill in each section, or import a PDF or Word file. We detect common section headings (Summary, Experience, Education, Skills) and split text into the right fields — you can always edit after. Nothing is uploaded until you save."
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8 lg:items-stretch">
        {/* Blank start */}
        <Card className="flex flex-col border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted/60">
              <Pencil className="h-5 w-5 text-foreground" aria-hidden />
            </div>
            <CardTitle className="text-lg">Start from scratch</CardTitle>
            <CardDescription>
              Best when you want full control. You&apos;ll add contact details, experience, education,
              and skills step by step.
            </CardDescription>
          </CardHeader>
          <CardFooter className="mt-auto border-t border-border pt-6">
            <Button
              type="button"
              className="h-11 w-full font-semibold"
              size="lg"
              onClick={onStartBlank}
              disabled={importBusy}
            >
              Continue to editor
            </Button>
          </CardFooter>
        </Card>

        {/* Import */}
        <Card className="flex flex-col border-border shadow-sm">
          <CardHeader className="pb-2">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-muted/60">
              <Upload className="h-5 w-5 text-foreground" aria-hidden />
            </div>
            <CardTitle className="text-lg">Import from a file</CardTitle>
            <CardDescription>
              PDF or DOCX, up to 5&nbsp;MB. Text is extracted locally and mapped into your builder
              draft — you still structure the resume yourself.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-4 pt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              className="sr-only"
              onChange={(e) => onFileInputChange(e.target.files?.[0])}
            />

            {uploadedFile ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {uploadedText ? 'Ready — open the editor with fields prefilled' : 'Extracting text…'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClearUpload}
                  className="shrink-0 rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onZoneClick()
                  }
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  onDropFile(e.dataTransfer.files[0])
                }}
                onClick={onZoneClick}
                className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-muted/20 hover:border-primary/40 hover:bg-muted/40'
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background shadow-sm">
                  <Upload className="h-7 w-7 text-muted-foreground" aria-hidden />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Drop a file here</p>
                  <p className="mt-1 text-xs text-muted-foreground">or click to choose PDF / DOCX</p>
                </div>
              </div>
            )}

            {parseError ? (
              <div className="rounded-md border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                {parseError}
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex-col gap-2 border-t border-border pt-6 sm:items-stretch">
            <Button
              type="button"
              className="h-11 w-full font-semibold"
              size="lg"
              disabled={!canContinue}
              onClick={onContinueWithResume}
            >
              {importBusy ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Opening editor…
                </>
              ) : (
                'Continue with imported text'
              )}
            </Button>
            {!canContinue && !importBusy ? (
              <p className="text-center text-xs text-muted-foreground">
                Select a file above to enable this option.
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
