'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
  Sparkles,
  Download,
  Eye,
  Save,
  Wand2,
  Palette,
  Check,
  RefreshCw,
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
  getAllResumes,
  getResume,
  saveResume,
  generateId,
  printResumeHTML,
  type SavedResume,
} from '@/lib/resume-storage'

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

const defaultExperiences: Experience[] = [
  {
    id: 1,
    title: 'Senior Product Designer',
    company: 'TechFlow Inc.',
    location: 'San Francisco, CA',
    startDate: '2021',
    endDate: 'Present',
    description:
      '• Led the redesign of the core product dashboard, resulting in a 20% increase in user engagement.\n• Collaborated with cross-functional teams to define product strategy and roadmap.\n• Mentored junior designers and established a design system for scalability.',
  },
  {
    id: 2,
    title: 'UX Designer',
    company: 'Creative Agency',
    location: 'New York, NY',
    startDate: '2018',
    endDate: '2021',
    description:
      '• Designed user-centric interfaces for web and mobile applications for Fortune 500 clients.\n• Conducted user research and usability testing to inform design decisions.',
  },
]

const defaultEducation: Education[] = [
  { id: 1, degree: 'BFA Interaction Design', school: 'California College of the Arts', year: '2014 – 2018' },
]

// ── Inner component (needs useSearchParams, wrapped in Suspense below) ─────

function ResumeBuilderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const editId = searchParams.get('id')

  const [resumeId, setResumeId]         = useState<string>(editId ?? generateId())
  const [experiences, setExperiences]   = useState<Experience[]>(defaultExperiences)
  const [education, setEducation]       = useState<Education[]>(defaultEducation)
  const [fullName, setFullName]         = useState('Alex Morgan')
  const [jobTitle, setJobTitle]         = useState('Senior Product Designer')
  const [email, setEmail]               = useState('alex.morgan@example.com')
  const [phone, setPhone]               = useState('+1 (555) 123-4567')
  const [location, setLocation]         = useState('San Francisco, CA')
  const [linkedin, setLinkedin]         = useState('linkedin.com/in/alexmorgan')
  const [skillsList, setSkillsList]     = useState(['Figma', 'Prototyping', 'Research', 'HTML/CSS', 'Strategy'])
  const [newSkill, setNewSkill]         = useState('')
  const [selectedTheme, setSelectedTheme] = useState('classic')
  const [themeColors, setThemeColors]   = useState<Record<string, ThemeColors>>(() =>
    Object.fromEntries(THEMES.map((t) => [t.id, { ...t.defaultColors }]))
  )

  // Save dialog
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [resumeTitle, setResumeTitle]       = useState('')
  const [justSaved, setJustSaved]           = useState(false)
  const [savedAt, setSavedAt]               = useState<string | null>(null)

  // PDF export
  const previewRef    = useRef<HTMLDivElement>(null)
  const [isPrinting, setIsPrinting] = useState(false)

  // ── Load existing resume on mount ──────────────────────────────────────
  useEffect(() => {
    if (!editId) return
    const saved = getResume(editId)
    if (!saved) return

    setResumeId(saved.id)
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

  // ── Helpers ────────────────────────────────────────────────────────────
  const currentThemeConfig = THEMES.find((t) => t.id === selectedTheme)
  const currentColors      = themeColors[selectedTheme]

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

  // ── Experience helpers ─────────────────────────────────────────────────
  const addExperience = () =>
    setExperiences([...experiences, { id: Date.now(), title: '', company: '', location: '', startDate: '', endDate: '', description: '' }])
  const removeExperience = (id: number) => setExperiences(experiences.filter((e) => e.id !== id))
  const updateExperience = (id: number, field: keyof Experience, value: string) =>
    setExperiences(experiences.map((e) => (e.id === id ? { ...e, [field]: value } : e)))

  // ── Education helpers ──────────────────────────────────────────────────
  const addEducation = () =>
    setEducation([...education, { id: Date.now(), degree: '', school: '', year: '' }])
  const removeEducation = (id: number) => setEducation(education.filter((e) => e.id !== id))
  const updateEducation = (id: number, field: keyof Education, value: string) =>
    setEducation(education.map((e) => (e.id === id ? { ...e, [field]: value } : e)))

  // ── Skill helpers ──────────────────────────────────────────────────────
  const addSkill = () => {
    if (newSkill.trim()) { setSkillsList([...skillsList, newSkill.trim()]); setNewSkill('') }
  }
  const removeSkill = (skill: string) => setSkillsList(skillsList.filter((s) => s !== skill))

  // ── Open save dialog ───────────────────────────────────────────────────
  const openSaveDialog = () => {
    if (!resumeTitle) setResumeTitle(jobTitle ? `${jobTitle} Resume` : `${fullName}'s Resume`)
    setSaveDialogOpen(true)
  }

  // ── Commit save ────────────────────────────────────────────────────────
  const commitSave = () => {
    const now = new Date().toISOString()
    const payload: SavedResume = {
      id: resumeId,
      title: resumeTitle || `${fullName}'s Resume`,
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

  // ── PDF via hidden iframe (no npm packages, Cloudflare-safe) ──────────
  const handleDownloadPDF = () => {
    if (!previewRef.current || isPrinting) return
    setIsPrinting(true)
    const html = previewRef.current.innerHTML
    const title = `${fullName || 'Resume'} — ${currentThemeConfig?.name ?? ''}`
    printResumeHTML(html, title)
    setTimeout(() => setIsPrinting(false), 2500)
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      <div className="flex h-[calc(100vh-5rem)] flex-col gap-0">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between border-b pb-4">
          <div>
            <h1 className="text-secondary text-2xl font-bold">CV Builder</h1>
            <p className="text-foreground text-xs">
              {resumeTitle || 'Untitled Resume'} ·{' '}
              <span className="font-medium" style={{ color: currentColors.accent }}>
                {currentThemeConfig?.name} Theme
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1 text-xs">
              <Sparkles className="text-primary h-3 w-3" />
              AI Assistant Active
            </Badge>
            {savedAt && !justSaved && (
              <span className="text-foreground hidden text-[10px] sm:block">
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
                <TabsTrigger value="personal"   className="flex-1 text-xs">Personal</TabsTrigger>
                <TabsTrigger value="experience" className="flex-1 text-xs">Experience</TabsTrigger>
                <TabsTrigger value="education"  className="flex-1 text-xs">Education</TabsTrigger>
                <TabsTrigger value="skills"     className="flex-1 text-xs">Skills</TabsTrigger>
                <TabsTrigger value="theme"      className="flex-1 gap-1 text-xs">
                  <Palette className="h-3 w-3" /> Theme
                </TabsTrigger>
              </TabsList>

              {/* ── Personal ── */}
              <TabsContent value="personal" className="mt-4 space-y-4">
                <p className="text-secondary text-xs font-semibold uppercase tracking-wide">Contact Information</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'fullName', label: 'Full Name',  value: fullName,  set: setFullName,  ph: 'Alex Morgan' },
                    { id: 'jobTitle', label: 'Job Title',  value: jobTitle,  set: setJobTitle,  ph: 'Senior Product Designer' },
                    { id: 'email',    label: 'Email',      value: email,     set: setEmail,     ph: 'alex@example.com' },
                    { id: 'phone',    label: 'Phone',      value: phone,     set: setPhone,     ph: '+1 (555) 123-4567' },
                    { id: 'loc',      label: 'Location',   value: location,  set: setLocation,  ph: 'San Francisco, CA' },
                    { id: 'linkedin', label: 'LinkedIn',   value: linkedin,  set: setLinkedin,  ph: 'linkedin.com/in/username' },
                  ].map(({ id, label, value, set, ph }) => (
                    <div key={id} className="space-y-1">
                      <Label htmlFor={id} className="text-foreground text-xs">{label}</Label>
                      <Input id={id} value={value} onChange={(e) => set(e.target.value)} placeholder={ph} />
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* ── Experience ── */}
              <TabsContent value="experience" className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-secondary text-xs font-semibold uppercase tracking-wide">Professional Experience</p>
                  <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs" onClick={addExperience}>
                    <Plus className="h-3 w-3" /> Add Role
                  </Button>
                </div>
                {experiences.map((exp, idx) => (
                  <Card key={exp.id} className="bg-accent">
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-secondary text-xs font-medium">{idx + 1}. {exp.title || 'New Role'}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeExperience(exp.id)}><Trash2 className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronUp className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6"><ChevronDown className="h-3 w-3" /></Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-foreground text-xs">Title</Label>
                          <Input value={exp.title} onChange={(e) => updateExperience(exp.id, 'title', e.target.value)} placeholder="Job Title" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground text-xs">Company</Label>
                          <Input value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} placeholder="Company Name" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground text-xs">Location</Label>
                          <Input value={exp.location} onChange={(e) => updateExperience(exp.id, 'location', e.target.value)} placeholder="City, State" className="h-8 text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-1">
                          <div className="space-y-1">
                            <Label className="text-foreground text-xs">From</Label>
                            <Input value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} placeholder="2021" className="h-8 text-sm" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-foreground text-xs">To</Label>
                            <Input value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} placeholder="Present" className="h-8 text-sm" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-foreground text-xs">Description</Label>
                          <Button variant="ghost" size="sm" className="text-primary h-6 gap-1 text-xs"><Wand2 className="h-3 w-3" /> Generate Bullets</Button>
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
                  <p className="text-secondary text-xs font-semibold uppercase tracking-wide">Education</p>
                  <Button variant="ghost" size="sm" className="text-primary gap-1 text-xs" onClick={addEducation}>
                    <Plus className="h-3 w-3" /> Add Education
                  </Button>
                </div>
                {education.map((edu) => (
                  <Card key={edu.id} className="bg-accent">
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-secondary text-xs font-medium">{edu.degree || 'New Entry'}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeEducation(edu.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="col-span-2 space-y-1">
                          <Label className="text-foreground text-xs">Degree / Program</Label>
                          <Input value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} placeholder="BFA Interaction Design" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground text-xs">School</Label>
                          <Input value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} placeholder="University name" className="h-8 text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-foreground text-xs">Year</Label>
                          <Input value={edu.year} onChange={(e) => updateEducation(edu.id, 'year', e.target.value)} placeholder="2014 – 2018" className="h-8 text-sm" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              {/* ── Skills ── */}
              <TabsContent value="skills" className="mt-4 space-y-4">
                <p className="text-secondary text-xs font-semibold uppercase tracking-wide">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {skillsList.map((skill) => (
                    <Badge key={skill} variant="secondary" className="cursor-pointer gap-1 pr-1" onClick={() => removeSkill(skill)}>
                      {skill}<span className="text-foreground text-xs">×</span>
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
                  <p className="text-secondary text-xs font-semibold uppercase tracking-wide">Layout</p>
                  <p className="text-foreground mt-1 text-xs">Choose a resume layout. Colors are customized below.</p>
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
                            <div className="bg-primary absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full shadow">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="bg-accent flex items-center gap-2 border-t px-2 py-1.5">
                          <div className="h-3 w-3 shrink-0 rounded-full border border-white/20 shadow-sm" style={{ background: themeColors[theme.id]?.accent ?? theme.accentColor }} />
                          <div className="min-w-0">
                            <p className={`truncate text-xs font-semibold ${isSelected ? 'text-primary' : 'text-secondary'}`}>{theme.name}</p>
                            <p className="text-foreground truncate text-[10px] leading-tight">{theme.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div>
                    <p className="text-secondary text-xs font-semibold uppercase tracking-wide">Colors</p>
                    <p className="text-foreground mt-1 text-xs">
                      Customize colors for the <span className="font-medium">{currentThemeConfig?.name}</span> theme.
                    </p>
                  </div>

                  {/* Accent */}
                  <div className="bg-accent space-y-2.5 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-secondary text-xs font-semibold">
                          {currentThemeConfig?.hasSecondary ? 'Accent / Highlight' : 'Accent Color'}
                        </p>
                        <p className="text-foreground mt-0.5 text-[10px]">
                          {currentThemeConfig?.hasSecondary
                            ? 'Highlights, skill tags, and ruled lines'
                            : 'Borders, headings, and section labels'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-foreground font-mono text-[10px]">{currentColors.accent}</span>
                        <div className="ring-primary h-5 w-5 rounded-full border border-white/30 shadow-sm ring-2" style={{ background: currentColors.accent }} />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ACCENT_PRESETS.map((color) => (
                        <button key={color} onClick={() => updateColor('accent', color)} title={color}
                          className={`h-6 w-6 rounded-full border-2 transition-all hover:scale-110 ${currentColors.accent === color ? 'border-primary scale-110 shadow-md' : 'border-transparent hover:border-border'}`}
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
                    <div className="bg-accent space-y-2.5 rounded-lg border p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-secondary text-xs font-semibold">Header / Background</p>
                          <p className="text-foreground mt-0.5 text-[10px]">Dark sidebar or header strip color</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-foreground font-mono text-[10px]">{currentColors.secondary}</span>
                          <div className="ring-primary h-5 w-5 rounded-full border border-white/30 shadow-sm ring-2" style={{ background: currentColors.secondary }} />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {SECONDARY_PRESETS.map((color) => (
                          <button key={color} onClick={() => updateColor('secondary', color)} title={color}
                            className={`h-6 w-6 rounded-full border-2 transition-all hover:scale-110 ${currentColors.secondary === color ? 'border-primary scale-110 shadow-md' : 'border-transparent hover:border-border'}`}
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
                    className="text-foreground text-xs underline-offset-2 transition-colors hover:underline"
                  >
                    Reset to default colors
                  </button>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right: Preview */}
          <div className="bg-accent flex flex-col overflow-hidden rounded-lg border">
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
                <span className="text-foreground text-xs">100%</span>
              </div>
            </div>

            {/* Resume live preview */}
            <div className="flex-1 overflow-y-auto p-4">
              <div ref={previewRef} className="mx-auto max-w-[520px] rounded shadow-md">
                <ThemeComponent data={resumeData} colors={currentColors} />
              </div>
            </div>

            {/* AI Suggestion Toast */}
            <div className="mx-4 mb-4 shrink-0 rounded-lg border bg-background p-3 shadow-md">
              <div className="flex items-start gap-2">
                <Sparkles className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                <div className="flex-1">
                  <p className="text-secondary text-sm font-semibold">Suggestion Available</p>
                  <p className="text-foreground mt-0.5 text-xs">
                    Your experience description could be stronger. Try adding metrics to the first bullet point.
                  </p>
                </div>
                <Button size="sm" className="shrink-0 text-xs">Apply</Button>
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
              <Label htmlFor="resumeTitle" className="text-foreground text-sm">Resume Title</Label>
              <Input
                id="resumeTitle"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                placeholder="e.g. Software Engineer Resume"
                onKeyDown={(e) => e.key === 'Enter' && commitSave()}
                autoFocus
              />
              <p className="text-foreground text-xs">This name appears in your saved resumes list.</p>
            </div>
            {/* Mini summary */}
            <div className="bg-accent rounded-md border px-3 py-2 text-xs space-y-0.5">
              <p className="text-secondary font-medium">{fullName || '—'}</p>
              <p className="text-foreground">{jobTitle || '—'}</p>
              <p className="text-foreground flex items-center gap-1.5 mt-1">
                <span className="h-2 w-2 rounded-full inline-block" style={{ background: currentColors.accent }} />
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

// ── Page export (wraps inner component in Suspense for useSearchParams) ───

export default function ResumeBuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[calc(100vh-5rem)] items-center justify-center">
        <RefreshCw className="text-primary h-6 w-6 animate-spin" />
      </div>
    }>
      <ResumeBuilderContent />
    </Suspense>
  )
}
