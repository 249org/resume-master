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
  Download,
  Save,
  Wand2,
  Palette,
  Check,
  RefreshCw,
  Upload,
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
import { ManualImportStep } from './manual-import-step'

type BuilderView = 'manual-upload' | 'building'

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
  const [view, setView] = useState<BuilderView>(editId ? 'building' : 'manual-upload')

  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadedText, setUploadedText] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [importBusy, setImportBusy] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Resume form state ─────────────────────────────────────────────────
  const [resumeId] = useState<string>(editId ?? generateId())
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [education, setEducation] = useState<Education[]>([])
  const [fullName, setFullName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [bio, setBio] = useState('')
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
    setBio(saved.bio ?? '')
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

  // ── Manual continue: use extracted text as a starting reference (no AI) ──
  const handleManualContinue = () => {
    if (!uploadedText.trim()) return
    setImportBusy(true)
    setParseError(null)
    try {
      const t = uploadedText.trim()
      const max = 8000
      setBio((prev) => (prev.trim() ? prev : t.slice(0, max)))
      setView('building')
      clearUpload()
    } finally {
      setImportBusy(false)
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
    fullName, jobTitle, bio, email, phone, location, linkedin,
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
      fullName, jobTitle, bio, email, phone, location, linkedin,
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

  if (view === 'manual-upload') {
    return (
      <ManualImportStep
        uploadedFile={uploadedFile}
        uploadedText={uploadedText}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        parseError={parseError}
        importBusy={importBusy}
        fileInputRef={fileInputRef}
        onFileInputChange={(f) => handleFile(f)}
        onDropFile={(f) => handleFile(f)}
        onZoneClick={() => fileInputRef.current?.click()}
        onClearUpload={clearUpload}
        onContinueWithResume={handleManualContinue}
        onStartBlank={handleManualSkip}
      />
    )
  }

  // ══════════════════════════════════════════════════════════════════════
  // BUILDER VIEW
  // ══════════════════════════════════════════════════════════════════════
  return (
    <>
      <div className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col gap-0 pb-6 pt-2">

        {/* Top bar */}
        <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Resume builder
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {resumeTitle || 'Untitled resume'}
              <span className="text-border mx-2">·</span>
              <span className="font-medium text-foreground" style={{ color: currentColors.accent }}>
                {currentThemeConfig?.name}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setView('manual-upload')}
            >
              <Upload className="h-3.5 w-3.5" />
              Import from file
            </Button>
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
                <TabsTrigger value="personal" className="flex-1 text-xs sm:text-sm">Personal</TabsTrigger>
                <TabsTrigger value="experience" className="flex-1 text-xs sm:text-sm">Experience</TabsTrigger>
                <TabsTrigger value="education" className="flex-1 text-xs sm:text-sm">Education</TabsTrigger>
                <TabsTrigger value="skills" className="flex-1 text-xs sm:text-sm">Skills</TabsTrigger>
                <TabsTrigger value="theme" className="flex-1 gap-1 text-xs sm:text-sm">
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
                <div className="space-y-1">
                  <Label htmlFor="bio" className="text-xs text-foreground">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Short professional summary — paste your “About” or profile blurb (optional)"
                    className="min-h-[100px] text-sm"
                  />
                  <p className="text-[10px] text-muted-foreground">Shown under your header on every theme when filled in.</p>
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
              <div ref={previewRef} className="relative mx-auto max-w-[520px] rounded shadow-md">
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
            <Button
              onClick={commitSave}
              disabled={!resumeTitle.trim()}
            >
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
    <div className="flex min-h-0 min-w-0 max-w-full flex-1 flex-col">
      <Suspense
        fallback={
          <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
          </div>
        }
      >
        <ResumeBuilderContent />
      </Suspense>
    </div>
  )
}
