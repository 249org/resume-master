'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Download,
  Save,
  Wand2,
  Palette,
  Check,
  RefreshCw,
  Upload,
  FileText,
  X,
} from '@/components/icons'
import {
  THEMES,
  THEME_COMPONENTS,
  type ResumeData,
  type Experience,
  type Education,
  type ThemeColors,
} from './resume-themes'
import {
  getResume,
  saveResume,
  generateId,
  printResumeHTML,
  type SavedResume,
} from '@/lib/resume-storage'
import { extractTextFromFile, checkFile } from '@/lib/resume-extract'

// ── Types ──────────────────────────────────────────────────────────────────

type BuilderView = 'entry' | 'ai-setup' | 'manual-upload' | 'building'

interface ParsedData {
  fullName?: string
  jobTitle?: string
  email?: string
  phone?: string
  location?: string
  linkedin?: string
  experiences?: Array<{
    title?: string
    company?: string
    location?: string
    startDate?: string
    endDate?: string
    description?: string
  }>
  education?: Array<{
    degree?: string
    school?: string
    year?: string
  }>
  skills?: string[]
}

interface ParseApiResponse {
  error?: string
  data?: ParsedData
}

// ── Color presets ──────────────────────────────────────────────────────────

const ACCENT_PRESETS = [
  '#0f4c81', '#0891b2', '#0d9488', '#16a34a',
  '#7c3aed', '#db2777', '#e05a1a', '#c0392b',
  '#d97706', '#1a1a1a',
]
const SECONDARY_PRESETS = [
  '#1e2a3a', '#2c3e50', '#18181b', '#14532d',
  '#3b0764', '#1e1b4b', '#1c1917', '#374151',
]

// ── Inner component ────────────────────────────────────────────────────────

function ResumeBuilderContent() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('id')

  // ── View state ────────────────────────────────────────────────────────
  const [view, setView] = useState<BuilderView>(editId ? 'building' : 'entry')

  // ── Wizard state ──────────────────────────────────────────────────────
  const [aiStep, setAiStep] = useState<1 | 2>(1)
  const [aiJobTarget, setAiJobTarget] = useState('')
  const [aiJobDesc, setAiJobDesc] = useState('')
  const [aiDescExpanded, setAiDescExpanded] = useState(false)
  // Step 2 — personal details
  const [aiFullName, setAiFullName] = useState('')
  const [aiEmail, setAiEmail] = useState('')
  const [aiPhone, setAiPhone] = useState('')
  const [aiLocation, setAiLocation] = useState('')
  const [aiLinkedin, setAiLinkedin] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedText, setUploadedText] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [parseLoading, setParseLoading] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Resume form state ─────────────────────────────────────────────────
  const [resumeId] = useState<string>(editId ?? generateId())
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [fullName, setFullName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [skillsList, setSkillsList] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('classic')
  const [themeColors, setThemeColors] = useState<Record<string, ThemeColors>>(() =>
    Object.fromEntries(THEMES.map((t) => [t.id, { ...t.defaultColors }]))
  )

  // Save dialog
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [resumeTitle, setResumeTitle] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  const [savedAt, setSavedAt] = useState<string | null>(null)

  // PDF export
  const previewRef = useRef<HTMLDivElement>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  // ── Load existing resume on mount ─────────────────────────────────────
  useEffect(() => {
    if (!editId) return
    const saved = getResume(editId)
    if (!saved) return
    setResumeTitle(saved.title)
    setFullName(saved.fullName)
    setJobTitle(saved.jobTitle)
    setEmail(saved.email)
    setPhone(saved.phone)
    setLocation(saved.location)
    setLinkedin(saved.linkedin)
    setExperiences(saved.experiences)
    setEducation(saved.education)
    setSkillsList(saved.skills)
    setSelectedTheme(saved.selectedTheme)
    setThemeColors((prev) => ({ ...prev, ...saved.themeColors }))
    setSavedAt(saved.savedAt)
  }, [editId])

  // ── File handling ─────────────────────────────────────────────────────
  const handleFile = async (file: File | undefined | null) => {
    if (!file) return
    const err = checkFile(file)
    if (err) { setParseError(err); return }
    setParseError(null)
    setUploadedFile(file)
    const result = await extractTextFromFile(file)
    if (!result.ok) {
      setParseError(result.error)
      setUploadedFile(null)
      return
    }
    setUploadedText(result.text)
  }

  const clearUpload = () => {
    setUploadedFile(null)
    setUploadedText('')
    setParseError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Apply parsed data to form ─────────────────────────────────────────
  const applyParsedData = (data: ParsedData) => {
    if (data.fullName) setFullName(data.fullName)
    if (data.jobTitle) setJobTitle(data.jobTitle)
    if (data.email) setEmail(data.email)
    if (data.phone) setPhone(data.phone)
    if (data.location) setLocation(data.location)
    if (data.linkedin) setLinkedin(data.linkedin)
    if (data.experiences?.length) {
      setExperiences(
        data.experiences.map((e, i) => ({
          id: Date.now() + i,
          title: e.title ?? '',
          company: e.company ?? '',
          location: e.location ?? '',
          startDate: e.startDate ?? '',
          endDate: e.endDate ?? '',
          description: e.description ?? '',
        }))
      )
    }
    if (data.education?.length) {
      setEducation(
        data.education.map((e, i) => ({
          id: Date.now() + i + 1000,
          degree: e.degree ?? '',
          school: e.school ?? '',
          year: e.year ?? '',
        }))
      )
    }
    if (data.skills?.length) setSkillsList(data.skills)
  }

  // ── AI generate ───────────────────────────────────────────────────────
  const handleGenerateWithAI = async () => {
    if (!aiJobTarget.trim()) return
    setParseLoading(true)
    setParseError(null)
    const jobDescAddition = aiJobDesc.trim()
      ? `\n\nJob description:\n${aiJobDesc.trim()}`
      : ''
    try {
      const res = await fetch('/api/resume-builder/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: uploadedText + jobDescAddition,
          jobTarget: aiJobTarget.trim(),
          mode: 'ai',
        }),
      })
      const json = (await res.json()) as ParseApiResponse
      if (!res.ok || json.error) throw new Error(json.error || 'Failed to generate resume')
      if (json.data) applyParsedData(json.data)
      // User-provided personal details always win over AI-parsed values
      if (aiFullName.trim()) setFullName(aiFullName.trim())
      if (aiEmail.trim()) setEmail(aiEmail.trim())
      if (aiPhone.trim()) setPhone(aiPhone.trim())
      if (aiLocation.trim()) setLocation(aiLocation.trim())
      if (aiLinkedin.trim()) setLinkedin(aiLinkedin.trim())
      setView('building')
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'An error occurred. Please try again.')
    } finally {
      setParseLoading(false)
    }
  }

  // ── Manual continue ───────────────────────────────────────────────────
  const handleManualContinue = async () => {
    if (!uploadedText) return
    setParseLoading(true)
    setParseError(null)
    try {
      const res = await fetch('/api/resume-builder/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: uploadedText, jobTarget: '', mode: 'parse' }),
      })
      const json = (await res.json()) as ParseApiResponse
      if (!res.ok || json.error) throw new Error(json.error || 'Failed to parse resume')
      if (json.data) applyParsedData(json.data)
      setView('building')
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Failed to parse resume. Try again or skip.')
    } finally {
      setParseLoading(false)
    }
  }

  const handleManualSkip = () => {
    clearUpload()
    setView('building')
  }

  // ── Builder helpers ───────────────────────────────────────────────────
  const currentThemeConfig = THEMES.find((t) => t.id === selectedTheme)
  const currentColors = themeColors[selectedTheme]

  const updateColor = (slot: 'accent' | 'secondary', value: string) =>
    setThemeColors((prev) => ({
      ...prev,
      [selectedTheme]: { ...prev[selectedTheme], [slot]: value },
    }))

  const resumeData: ResumeData = {
    fullName, jobTitle, email, phone, location, linkedin,
    experiences, education, skills: skillsList,
  }
  const ThemeComponent = THEME_COMPONENTS[selectedTheme]

  // ── Experience helpers ────────────────────────────────────────────────
  const addExperience = () =>
    setExperiences([...experiences, { id: Date.now(), title: '', company: '', location: '', startDate: '', endDate: '', description: '' }])
  const removeExperience = (id: number) => setExperiences(experiences.filter((e) => e.id !== id))
  const updateExperience = (id: number, field: keyof Experience, value: string) =>
    setExperiences(experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)))

  // ── Education helpers ─────────────────────────────────────────────────
  const addEducation = () =>
    setEducation([...education, { id: Date.now(), degree: '', school: '', year: '' }])
  const removeEducation = (id: number) => setEducation(education.filter((e) => e.id !== id))
  const updateEducation = (id: number, field: keyof Education, value: string) =>
    setEducation(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)))

  // ── Skill helpers ─────────────────────────────────────────────────────
  const addSkill = () => {
    if (newSkill.trim()) { setSkillsList([...skillsList, newSkill.trim()]); setNewSkill('') }
  }
  const removeSkill = (skill: string) => setSkillsList(skillsList.filter((s) => s !== skill))

  // ── Save helpers ──────────────────────────────────────────────────────
  const openSaveDialog = () => {
    if (!resumeTitle) setResumeTitle(jobTitle ? `${jobTitle} Resume` : `${fullName}'s Resume`)
    setSaveDialogOpen(true)
  }

  const commitSave = () => {
    const now = new Date().toISOString()
    const payload: SavedResume = {
      id: resumeId,
      title: resumeTitle || `${fullName || 'Untitled'}'s Resume`,
      fullName, jobTitle, email, phone, location, linkedin,
      experiences, education,
      skills: skillsList,
      selectedTheme,
      themeColors,
      savedAt: now,
    }
    saveResume(payload)
    setSavedAt(now)
    setSaveDialogOpen(false)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2500)
  }

  // ── PDF export ────────────────────────────────────────────────────────
  const handleDownloadPDF = () => {
    if (!previewRef.current || isPrinting) return
    setIsPrinting(true)
    const html = previewRef.current.innerHTML
    const title = `${fullName || 'Resume'} — ${currentThemeConfig?.name ?? ''}`
    printResumeHTML(html, title)
    setTimeout(() => setIsPrinting(false), 2500)
  }

  // ── Shared upload zone ────────────────────────────────────────────────
  const renderUploadZone = () => (
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
            onClick={clearUpload}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Remove file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragging(false)
            handleFile(e.dataTransfer.files[0])
          }}
          onClick={() => fileInputRef.current?.click()}
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
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  )

  // ── Error box ─────────────────────────────────────────────────────────
  const renderError = () =>
    parseError ? (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        {parseError}
      </div>
    ) : null

  // ══════════════════════════════════════════════════════════════════════
  // ENTRY VIEW
  // ══════════════════════════════════════════════════════════════════════
  if (view === 'entry') {
    return (
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Create Your Resume
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose how you&apos;d like to get started
          </p>
        </div>

        {/* Option cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

            {/* AI Card */}
            <Card
              className="relative flex cursor-pointer flex-col overflow-hidden border-2 border-primary ring-2 ring-primary ring-offset-2 ring-offset-background transition-all hover:shadow-lg"
              onClick={() => { setAiStep(1); setView('ai-setup') }}
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

            {/* Manual Card */}
            <Card
              className="flex cursor-pointer flex-col overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg"
              onClick={() => setView('manual-upload')}
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

  // ══════════════════════════════════════════════════════════════════════
  // AI SETUP VIEW
  // ══════════════════════════════════════════════════════════════════════
  if (view === 'ai-setup') {
    const stepLabels = ['Resume & Role', 'Your Details']

    return (
      <div className="space-y-6">

        {/* Back */}
        <button
          onClick={() => {
            if (aiStep === 2) {
              setAiStep(1)
              setParseError(null)
            } else {
              setView('entry')
              clearUpload()
              setParseError(null)
            }
          }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {parseLoading ? (
          /* Loading state */
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
            {/* Step indicator + heading */}
            <div>
              <div className="mb-3 flex items-center gap-1.5">
                {stepLabels.map((label, i) => {
                  const stepNum = i + 1
                  const isActive = aiStep === stepNum
                  const isDone = aiStep > stepNum
                  return (
                    <div key={label} className="flex items-center gap-1.5">
                      {i > 0 && (
                        <div className={`h-px w-6 transition-colors ${isDone || isActive ? 'bg-primary' : 'bg-border'}`} />
                      )}
                      <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                        isActive ? 'bg-primary text-primary-foreground' :
                        isDone ? 'bg-primary/15 text-primary' :
                        'bg-accent text-muted-foreground'
                      }`}>
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

            {/* ── STEP 1: Resume + Role ── */}
            {aiStep === 1 && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Upload zone */}
                <div className="space-y-2">
                  <Label className="block text-sm font-medium text-foreground">
                    Current resume{' '}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  {renderUploadZone()}
                  {!uploadedFile && (
                    <p className="text-center text-xs text-muted-foreground">
                      No existing resume? AI will generate one from scratch based on your role.
                    </p>
                  )}
                </div>

                {/* Role + job desc + CTA */}
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
                        if (e.key === 'Enter' && aiJobTarget.trim()) setAiStep(2)
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      AI will tailor your resume&apos;s content to match this role.
                    </p>
                  </div>

                  {!aiDescExpanded ? (
                    <button
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
                          onClick={() => { setAiDescExpanded(false); setAiJobDesc('') }}
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
                    onClick={() => setAiStep(2)}
                  >
                    Next — Add your details
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Personal Details ── */}
            {aiStep === 2 && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Form fields */}
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

                  {parseError && renderError()}

                  <Button
                    className="w-full gap-2"
                    size="lg"
                    disabled={!aiFullName.trim()}
                    onClick={handleGenerateWithAI}
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate My Resume
                    <ChevronRight className="ml-auto h-4 w-4" />
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Only your name is required — all other fields are optional.
                  </p>
                </div>

                {/* Summary sidebar */}
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
                        {uploadedFile && (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Based on: {uploadedFile.name}
                          </p>
                        )}
                        {!uploadedFile && (
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

  // ══════════════════════════════════════════════════════════════════════
  // MANUAL UPLOAD VIEW
  // ══════════════════════════════════════════════════════════════════════
  if (view === 'manual-upload') {
    return (
      <div className="space-y-6">

        {/* Back */}
        <button
          onClick={() => { setView('entry'); clearUpload(); setParseError(null) }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Build Manually
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload your current resume to pre-fill the form, or start fresh with a blank template.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Upload zone */}
          <div className="space-y-2">
            <Label className="block text-sm font-medium text-foreground">
              Upload resume{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            {renderUploadZone()}
          </div>

          {/* Actions */}
          <div className="flex flex-col justify-center gap-3">
            {renderError()}
            <Button
              className="w-full gap-2"
              size="lg"
              disabled={!uploadedFile || !uploadedText || parseLoading}
              onClick={handleManualContinue}
            >
              {parseLoading ? (
                <><RefreshCw className="h-4 w-4 animate-spin" /> Parsing resume…</>
              ) : (
                <>Continue with resume <ChevronRight className="ml-auto h-4 w-4" /></>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={handleManualSkip}
              disabled={parseLoading}
            >
              Skip — start with a blank template
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // ══════════════════════════════════════════════════════════════════════
  // BUILDER VIEW
  // ══════════════════════════════════════════════════════════════════════
  return (
    <>
      <div className="flex h-[calc(100vh-5rem)] flex-col gap-0">

        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              CV Builder
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {resumeTitle || 'Untitled Resume'} ·{' '}
              <span className="font-medium" style={{ color: currentColors.accent }}>
                {currentThemeConfig?.name} Theme
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {savedAt && !justSaved && (
              <span className="hidden text-[10px] text-foreground sm:block">
                Saved {new Date(savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <Button variant="outline" size="sm" className="gap-1" onClick={openSaveDialog}>
              {justSaved ? <Check className="h-3 w-3 text-green-500" /> : <Save className="h-3 w-3" />}
              <span className="hidden sm:inline">{justSaved ? 'Saved!' : 'Save'}</span>
            </Button>
            <Button size="sm" className="gap-1" onClick={handleDownloadPDF} disabled={isPrinting}>
              {isPrinting
                ? <><RefreshCw className="h-3 w-3 animate-spin" /> Preparing…</>
                : <><Download className="h-3 w-3" /> Export PDF</>
              }
            </Button>
          </div>
        </div>

        {/* Split panel */}
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">

          {/* Left: Editor */}
          <div className="overflow-y-auto">
            <Tabs defaultValue="personal">
              <TabsList className="w-full">
                <TabsTrigger value="personal" className="flex-1 text-xs">Personal</TabsTrigger>
                <TabsTrigger value="experience" className="flex-1 text-xs">Experience</TabsTrigger>
                <TabsTrigger value="education" className="flex-1 text-xs">Education</TabsTrigger>
                <TabsTrigger value="skills" className="flex-1 text-xs">Skills</TabsTrigger>
                <TabsTrigger value="theme" className="flex-1 gap-1 text-xs">
                  <Palette className="h-3 w-3" /> Theme
                </TabsTrigger>
              </TabsList>

              {/* ── Personal ── */}
              <TabsContent value="personal" className="mt-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Contact Information</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'fullName', label: 'Full Name', value: fullName, set: setFullName, ph: 'Alex Morgan' },
                    { id: 'jobTitle', label: 'Job Title', value: jobTitle, set: setJobTitle, ph: 'Senior Product Designer' },
                    { id: 'email', label: 'Email', value: email, set: setEmail, ph: 'alex@example.com' },
                    { id: 'phone', label: 'Phone', value: phone, set: setPhone, ph: '+1 (555) 123-4567' },
                    { id: 'loc', label: 'Location', value: location, set: setLocation, ph: 'San Francisco, CA' },
                    { id: 'linkedin', label: 'LinkedIn', value: linkedin, set: setLinkedin, ph: 'linkedin.com/in/username' },
                  ].map(({ id, label, value, set, ph }) => (
                    <div key={id} className="space-y-1">
                      <Label htmlFor={id} className="text-xs text-foreground">{label}</Label>
                      <Input id={id} value={value} onChange={(e) => set(e.target.value)} placeholder={ph} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* ── Experience ── */}
              <TabsContent value="experience" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Professional Experience</p>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary" onClick={addExperience}>
                    <Plus className="h-3 w-3" /> Add Role
                  </Button>
                </div>
                {experiences.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
                    <p className="text-sm text-muted-foreground">No experience added yet</p>
                    <Button variant="ghost" size="sm" className="mt-2 gap-1 text-xs text-primary" onClick={addExperience}>
                      <Plus className="h-3 w-3" /> Add your first role
                    </Button>
                  </div>
                )}
                {experiences.map((exp, idx) => (
                  <Card key={exp.id} className="bg-card">
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-secondary">{idx + 1}. {exp.title || 'New Role'}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExperience(exp.id)}><Trash2 className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronUp className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronDown className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs text-foreground">Title</Label>
                          <Input value={exp.title} onChange={(e) => updateExperience(exp.id, 'title', e.target.value)} placeholder="Job Title" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-foreground">Company</Label>
                          <Input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="Company Name" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-foreground">Location</Label>
                          <Input value={exp.location} onChange={(e) => updateExperience(exp.id, 'location', e.target.value)} placeholder="City, State" className="h-8 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="space-y-1">
                            <Label className="text-xs text-foreground">From</Label>
                            <Input value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="2021" className="h-8 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-foreground">To</Label>
                            <Input value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="Present" className="h-8 text-sm" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-foreground">Description</Label>
                          <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs text-primary"><Wand2 className="h-3 w-3" /> Generate Bullets</Button>
                        </div>
                        <Textarea value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} placeholder="Describe your role and achievements…" className="min-h-[80px] text-sm" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* ── Education ── */}
              <TabsContent value="education" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Education</p>
                  <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary" onClick={addEducation}>
                    <Plus className="h-3 w-3" /> Add Education
                  </Button>
                </div>
                {education.length === 0 && (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-10 text-center">
                    <p className="text-sm text-muted-foreground">No education added yet</p>
                    <Button variant="ghost" size="sm" className="mt-2 gap-1 text-xs text-primary" onClick={addEducation}>
                      <Plus className="h-3 w-3" /> Add education
                    </Button>
                  </div>
                )}
                {education.map((edu) => (
                  <Card key={edu.id} className="bg-card">
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-secondary">{edu.degree || 'New Entry'}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeEducation(edu.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs text-foreground">Degree / Program</Label>
                          <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder="BFA Interaction Design" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-foreground">School</Label>
                          <Input value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} placeholder="University name" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-foreground">Year</Label>
                          <Input value={edu.year} onChange={(e) => updateEducation(edu.id, 'year', e.target.value)} placeholder="2014 – 2018" className="h-8 text-sm" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* ── Skills ── */}
              <TabsContent value="skills" className="mt-4 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Skills</p>
                {skillsList.length === 0 && (
                  <p className="text-sm text-muted-foreground">No skills added yet. Add your first skill below.</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill) => (
                    <Badge key={skill} variant="secondary" className="cursor-pointer gap-1 pr-1" onClick={() => removeSkill(skill)}>
                      {skill}<span className="text-xs text-foreground">×</span>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a skill…" className="h-8 text-sm" onKeyDown={(e) => e.key === 'Enter' && addSkill()} />
                  <Button size="sm" variant="outline" onClick={addSkill}><Plus className="h-3 w-3" /></Button>
                </div>
              </TabsContent>

              {/* ── Theme ── */}
              <TabsContent value="theme" className="mt-4 space-y-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Layout</p>
                  <p className="mt-1 text-xs text-foreground">Choose a resume layout. Colors are customized below.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {THEMES.map((theme) => {
                    const isSelected = selectedTheme === theme.id
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={`group relative flex flex-col overflow-hidden rounded-lg border-2 text-left transition-all focus:outline-none ${
                          isSelected ? 'border-primary shadow-md' : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="relative h-24 w-full overflow-hidden bg-white">
                          {theme.thumbnail}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary shadow">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 border-t bg-card px-2 py-1.5">
                          <div className="h-3 w-3 shrink-0 rounded-full border border-white/20 shadow-sm" style={{ background: themeColors[theme.id]?.accent ?? theme.accentColor }} />
                          <div className="min-w-0">
                            <p className={`truncate text-xs font-semibold ${isSelected ? 'text-primary' : 'text-secondary'}`}>{theme.name}</p>
                            <p className="truncate text-[10px] leading-tight text-foreground">{theme.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Colors</p>
                    <p className="mt-1 text-xs text-foreground">
                      Customize colors for the <span className="font-medium">{currentThemeConfig?.name}</span> theme.
                    </p>
                  </div>

                  {/* Accent */}
                  <div className="space-y-2.5 rounded-lg border bg-card p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-secondary">
                          {currentThemeConfig?.hasSecondary ? 'Accent / Highlight' : 'Accent Color'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-foreground">
                          {currentThemeConfig?.hasSecondary
                            ? 'Highlights, skill tags, and ruled lines'
                            : 'Borders, headings, and section labels'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-foreground">{currentColors.accent}</span>
                        <div className="h-5 w-5 rounded-full border border-white/30 shadow-sm ring-2 ring-primary" style={{ background: currentColors.accent }} />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ACCENT_PRESETS.map((color) => (
                        <button key={color} onClick={() => updateColor('accent', color)} title={color}
                          className={`h-6 w-6 rounded-full border-2 transition-all hover:scale-110 ${currentColors.accent === color ? 'scale-110 border-primary shadow-md' : 'border-transparent hover:border-border'}`}
                          style={{ background: color }}
                        />
                      ))}
                      <label className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-border transition-colors hover:border-primary" title="Custom color">
                        <div className="absolute inset-0 rounded-full" style={{ background: currentColors.accent }} />
                        <input type="color" value={currentColors.accent} onChange={(e) => updateColor('accent', e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                      </label>
                    </div>
                  </div>

                  {/* Secondary (two-tone themes only) */}
                  {currentThemeConfig?.hasSecondary && (
                    <div className="space-y-2.5 rounded-lg border bg-card p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-secondary">Header / Background</p>
                          <p className="mt-0.5 text-[10px] text-foreground">Dark sidebar or header strip color</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-foreground">{currentColors.secondary}</span>
                          <div className="h-5 w-5 rounded-full border border-white/30 shadow-sm ring-2 ring-primary" style={{ background: currentColors.secondary }} />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {SECONDARY_PRESETS.map((color) => (
                          <button key={color} onClick={() => updateColor('secondary', color)} title={color}
                            className={`h-6 w-6 rounded-full border-2 transition-all hover:scale-110 ${currentColors.secondary === color ? 'scale-110 border-primary shadow-md' : 'border-transparent hover:border-border'}`}
                            style={{ background: color }}
                          />
                        ))}
                        <label className="relative h-6 w-6 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-border transition-colors hover:border-primary" title="Custom color">
                          <div className="absolute inset-0 rounded-full" style={{ background: currentColors.secondary }} />
                          <input type="color" value={currentColors.secondary} onChange={(e) => updateColor('secondary', e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                        </label>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => setThemeColors((prev) => ({ ...prev, [selectedTheme]: { ...currentThemeConfig!.defaultColors } }))}
                    className="text-xs text-foreground underline-offset-2 transition-colors hover:underline"
                  >
                    Reset to default colors
                  </button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Preview */}
          <div className="flex flex-col overflow-hidden rounded-lg border bg-card">
            {/* Preview toolbar */}
            <div className="flex shrink-0 items-center justify-between border-b px-4 py-2">
              <div className="flex gap-2">
                <button className="h-3 w-3 rounded-full bg-red-400" />
                <button className="h-3 w-3 rounded-full bg-yellow-400" />
                <button className="h-3 w-3 rounded-full bg-green-400" />
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white" style={{ background: currentColors.accent }}>
                  {currentThemeConfig?.name}
                </span>
                <span className="text-xs text-foreground">100%</span>
              </div>
            </div>

            {/* Resume live preview */}
            <div className="flex-1 overflow-y-auto p-4">
              <div ref={previewRef} className="mx-auto max-w-[520px] rounded shadow-md">
                <ThemeComponent data={resumeData} colors={currentColors} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Save Dialog ── */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-secondary">Save Resume</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="resumeTitle" className="text-sm text-foreground">Resume Title</Label>
              <Input
                id="resumeTitle"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                placeholder="e.g. Software Engineer Resume"
                onKeyDown={(e) => e.key === 'Enter' && commitSave()}
                autoFocus
              />
              <p className="text-xs text-foreground">This name appears in your saved resumes list.</p>
            </div>
            <div className="space-y-0.5 rounded-md border bg-card px-3 py-2 text-xs">
              <p className="font-medium text-secondary">{fullName || '—'}</p>
              <p className="text-foreground">{jobTitle || '—'}</p>
              <p className="mt-1 flex items-center gap-1.5 text-foreground">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: currentColors.accent }} />
                {currentThemeConfig?.name} theme
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
            <Button onClick={commitSave} disabled={!resumeTitle.trim()}>
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save Resume
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Page export ────────────────────────────────────────────────────────────

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    }>
      <ResumeBuilderContent />
    </Suspense>
  )
}
