'use client'

import type { RefObject } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Check,
  RefreshCw,
  Upload,
  FileText,
  X,
} from '@/components/icons'

export function AiImportStep({
  aiStep,
  aiJobTarget,
  setAiJobTarget,
  aiJobDesc,
  setAiJobDesc,
  aiDescExpanded,
  setAiDescExpanded,
  aiFullName,
  setAiFullName,
  aiEmail,
  setAiEmail,
  aiPhone,
  setAiPhone,
  aiLocation,
  setAiLocation,
  aiLinkedin,
  setAiLinkedin,
  uploadedFile,
  uploadedText,
  isDragging,
  setIsDragging,
  parseLoading,
  parseError,
  fileInputRef,
  onBack,
  onNextStep,
  onGenerate,
  onFileInputChange,
  onDropFile,
  onZoneClick,
  onClearUpload,
}: {
  aiStep: 1 | 2
  aiJobTarget: string
  setAiJobTarget: (v: string) => void
  aiJobDesc: string
  setAiJobDesc: (v: string) => void
  aiDescExpanded: boolean
  setAiDescExpanded: (v: boolean) => void
  aiFullName: string
  setAiFullName: (v: string) => void
  aiEmail: string
  setAiEmail: (v: string) => void
  aiPhone: string
  setAiPhone: (v: string) => void
  aiLocation: string
  setAiLocation: (v: string) => void
  aiLinkedin: string
  setAiLinkedin: (v: string) => void
  uploadedFile: File | null
  uploadedText: string
  isDragging: boolean
  setIsDragging: (v: boolean) => void
  parseLoading: boolean
  parseError: string | null
  fileInputRef: RefObject<HTMLInputElement | null>
  onBack: () => void
  onNextStep: () => void
  onGenerate: () => void
  onFileInputChange: (file: File | undefined | null) => void
  onDropFile: (file: File | undefined | null) => void
  onZoneClick: () => void
  onClearUpload: () => void
}) {
  const stepLabels = ['Resume & Role', 'Your Details']

  const uploadZone = (
    <div>
      {uploadedFile ? (
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{uploadedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {uploadedText ? 'Text extracted — ready to use' : 'Processing…'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClearUpload}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
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
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-8 py-10 transition-all ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/40 hover:bg-accent/50'
          }`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border bg-card">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Drop your resume here</p>
            <p className="mt-0.5 text-xs text-muted-foreground">or click to browse — PDF or DOCX, up to 5MB</p>
          </div>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={(e) => onFileInputChange(e.target.files?.[0])}
      />
    </div>
  )

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      {parseLoading ? (
        <div className="flex flex-col items-center justify-center gap-5 py-24">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
            <Sparkles className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-foreground">AI is building your resume…</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Tailoring content for{' '}
              <span className="font-medium text-foreground">{aiJobTarget}</span>
            </p>
          </div>
          <RefreshCw className="mt-2 h-5 w-5 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div>
            <div className="mb-3 flex items-center gap-1.5">
              {stepLabels.map((label, i) => {
                const stepNum = i + 1
                const isActive = aiStep === stepNum
                const isDone = aiStep > stepNum
                return (
                  <div key={label} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <div
                        className={`h-px w-6 transition-colors ${isDone || isActive ? 'bg-primary' : 'bg-border'}`}
                      />
                    )}
                    <div
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : isDone
                            ? 'bg-primary/15 text-primary'
                            : 'bg-accent text-muted-foreground'
                      }`}
                    >
                      {isDone ? <Check className="h-3 w-3" /> : <span>{stepNum}</span>}
                      {label}
                    </div>
                  </div>
                )
              })}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {aiStep === 1 ? 'Resume & Target Role' : 'Your Details'}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {aiStep === 1
                ? "Upload your current resume (optional), then tell us the role you're targeting."
                : 'Tell us a bit about yourself so your resume looks great from the start.'}
            </p>
          </div>

          {aiStep === 1 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-2">
                <Label className="block text-sm font-medium text-foreground">
                  Current resume{' '}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                {uploadZone}
                {!uploadedFile && (
                  <p className="text-center text-xs text-muted-foreground">
                    No existing resume? AI will generate one from scratch based on your role.
                  </p>
                )}
              </div>

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="aiJobTarget" className="text-sm font-medium text-foreground">
                    Target role <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="aiJobTarget"
                    value={aiJobTarget}
                    onChange={(e) => setAiJobTarget(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && aiJobTarget.trim()) onNextStep()
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    AI will tailor your resume&apos;s content to match this role.
                  </p>
                </div>

                {!aiDescExpanded ? (
                  <button
                    type="button"
                    onClick={() => setAiDescExpanded(true)}
                    className="flex items-center gap-1.5 text-sm text-primary underline-offset-4 transition-colors hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add job description for better matching
                  </button>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="aiJobDesc" className="text-sm font-medium text-foreground">
                        Job description{' '}
                        <span className="font-normal text-muted-foreground">(optional)</span>
                      </Label>
                      <button
                        type="button"
                        onClick={() => {
                          setAiDescExpanded(false)
                          setAiJobDesc('')
                        }}
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Clear
                      </button>
                    </div>
                    <Textarea
                      id="aiJobDesc"
                      value={aiJobDesc}
                      onChange={(e) => setAiJobDesc(e.target.value)}
                      placeholder="Paste the job description here for better keyword matching…"
                      className="min-h-[120px] resize-none text-sm"
                    />
                  </div>
                )}

                <Button
                  className="w-full gap-2"
                  size="lg"
                  disabled={!aiJobTarget.trim()}
                  onClick={onNextStep}
                >
                  Next — Add your details
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {aiStep === 2 && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="aiFullName" className="text-sm font-medium text-foreground">
                      Full name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="aiFullName"
                      value={aiFullName}
                      onChange={(e) => setAiFullName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="aiEmail" className="text-sm font-medium text-foreground">
                      Email address
                    </Label>
                    <Input
                      id="aiEmail"
                      type="email"
                      value={aiEmail}
                      onChange={(e) => setAiEmail(e.target.value)}
                      placeholder="alex@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="aiPhone" className="text-sm font-medium text-foreground">
                      Phone number
                    </Label>
                    <Input
                      id="aiPhone"
                      type="tel"
                      value={aiPhone}
                      onChange={(e) => setAiPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="aiLocation" className="text-sm font-medium text-foreground">
                      Location
                    </Label>
                    <Input
                      id="aiLocation"
                      value={aiLocation}
                      onChange={(e) => setAiLocation(e.target.value)}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="aiLinkedin" className="text-sm font-medium text-foreground">
                    LinkedIn{' '}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input
                    id="aiLinkedin"
                    value={aiLinkedin}
                    onChange={(e) => setAiLinkedin(e.target.value)}
                    placeholder="linkedin.com/in/alexmorgan"
                  />
                </div>

                {parseError ? (
                  <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {parseError}
                  </div>
                ) : null}

                <Button
                  className="w-full gap-2"
                  size="lg"
                  disabled={!aiFullName.trim()}
                  onClick={onGenerate}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate My Resume
                  <ChevronRight className="ml-auto h-4 w-4" />
                </Button>
                <p className="text-xs text-muted-foreground">
                  Only your name is required — all other fields are optional.
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border bg-card px-4 py-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Generating for
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{aiJobTarget}</p>
                      {uploadedFile ? (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Based on: {uploadedFile.name}
                        </p>
                      ) : (
                        <p className="mt-0.5 text-xs text-muted-foreground">Starting from scratch</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
