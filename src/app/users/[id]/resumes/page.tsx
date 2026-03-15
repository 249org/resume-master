'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Download,
  Plus,
  Search,
  Trash2,
  FileText,
  Wrench,
} from '@/components/icons'
import PageTitle from '@/components/page-title'
import {
  getAllResumes,
  deleteResume,
  saveResume,
  printResumeHTML,
  type SavedResume,
} from '@/lib/resume-storage'
import { THEMES, THEME_COMPONENTS, type ThemeColors } from '../resume-builder/resume-themes'

// ─────────────────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ResumesPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [resumes, setResumes]       = useState<SavedResume[]>([])
  const [query, setQuery]           = useState('')
  const [deleteTarget, setDeleteTarget] = useState<SavedResume | null>(null)
  const [renameTarget, setRenameTarget] = useState<SavedResume | null>(null)
  const [renameValue, setRenameValue]   = useState('')

  // Hidden render container for PDF export
  const [downloadTarget, setDownloadTarget] = useState<SavedResume | null>(null)
  const hiddenRef = useRef<HTMLDivElement>(null)

  // ── Load ──────────────────────────────────────────────────────────────
  const reload = useCallback(() => setResumes(getAllResumes()), [])
  useEffect(reload, [reload])

  // ── PDF export via hidden render + iframe print ───────────────────────
  useEffect(() => {
    if (!downloadTarget || !hiddenRef.current) return
    // Brief timeout so React can flush the render into the hidden div
    const t = setTimeout(() => {
      if (!hiddenRef.current) return
      const html     = hiddenRef.current.innerHTML
      const title    = `${downloadTarget.fullName || 'Resume'} — ${THEMES.find(t => t.id === downloadTarget.selectedTheme)?.name ?? ''}`
      printResumeHTML(html, title)
      setDownloadTarget(null)
    }, 150)
    return () => clearTimeout(t)
  }, [downloadTarget])

  // ── Filtered list ──────────────────────────────────────────────────────
  const filtered = resumes.filter((r) =>
    [r.title, r.fullName, r.jobTitle]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  // ── Actions ────────────────────────────────────────────────────────────
  const handleEdit = (r: SavedResume) =>
    router.push(`/users/${userId}/resume-builder?id=${r.id}`)

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteResume(deleteTarget.id)
    setDeleteTarget(null)
    reload()
  }

  const handleRename = () => {
    if (!renameTarget || !renameValue.trim()) return
    saveResume({ ...renameTarget, title: renameValue.trim() })
    setRenameTarget(null)
    reload()
  }

  const openRename = (r: SavedResume) => {
    setRenameTarget(r)
    setRenameValue(r.title)
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <PageTitle
          title="My Resumes"
          subtitle="All your saved resumes in one place. Edit, download, or delete them anytime."
        />
        <Button
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => router.push(`/users/${userId}/resume-builder`)}
        >
          <Plus className="h-3.5 w-3.5" /> New Resume
        </Button>
      </div>

      {/* Search */}
      {resumes.length > 0 && (
        <div className="relative max-w-sm">
          <Search className="text-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resumes…"
            className="pl-9"
          />
        </div>
      )}

      {/* Empty state */}
      {resumes.length === 0 && (
        <div className="bg-accent flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <div className="bg-background mb-4 flex h-14 w-14 items-center justify-center rounded-full border shadow-sm">
            <FileText className="text-secondary h-6 w-6" />
          </div>
          <p className="text-secondary text-base font-semibold">No resumes yet</p>
          <p className="text-foreground mt-1 text-sm">
            Create your first resume to get started.
          </p>
          <Button
            className="mt-5 gap-1.5"
            onClick={() => router.push(`/users/${userId}/resume-builder`)}
          >
            <Plus className="h-4 w-4" /> Create Resume
          </Button>
        </div>
      )}

      {/* Resume grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resume) => {
            const theme = THEMES.find((t) => t.id === resume.selectedTheme)
            const accent = resume.themeColors?.[resume.selectedTheme]?.accent ?? theme?.accentColor ?? '#000'
            return (
              <div
                key={resume.id}
                className="bg-accent flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
              >
                {/* Thumbnail */}
                <div className="relative h-36 w-full overflow-hidden bg-white">
                  {theme?.thumbnail && (
                    <div className="pointer-events-none h-full w-full scale-[1.8] origin-top-left p-2">
                      {theme.thumbnail}
                    </div>
                  )}
                  {/* Accent color bar at top */}
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: accent }} />
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col gap-1 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-secondary truncate font-semibold leading-tight">{resume.title}</p>
                    <p className="text-foreground truncate text-xs">{resume.fullName}{resume.jobTitle ? ` · ${resume.jobTitle}` : ''}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: accent }} />
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">{theme?.name ?? resume.selectedTheme}</Badge>
                    <span className="text-foreground ml-auto text-[10px]">{formatDate(resume.savedAt)}</span>
                  </div>
                </div>

                {/* Action row */}
                <div className="flex border-t">
                  <button
                    onClick={() => handleEdit(resume)}
                    className="text-secondary hover:bg-background flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors"
                  >
                    <Wrench className="h-3 w-3" /> Edit
                  </button>
                  <div className="w-px bg-border" />
                  <button
                    onClick={() => setDownloadTarget(resume)}
                    className="text-secondary hover:bg-background flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors"
                  >
                    <Download className="h-3 w-3" /> Download
                  </button>
                  <div className="w-px bg-border" />
                  <button
                    onClick={() => setDeleteTarget(resume)}
                    className="text-destructive hover:bg-background flex flex-1 items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* No search results */}
      {resumes.length > 0 && filtered.length === 0 && (
        <p className="text-foreground py-10 text-center text-sm">
          No resumes match &ldquo;{query}&rdquo;.
        </p>
      )}

      {/* ── Hidden render target for PDF export ── */}
      {downloadTarget && (() => {
        const ThemeComp = THEME_COMPONENTS[downloadTarget.selectedTheme]
        const colors: ThemeColors =
          downloadTarget.themeColors?.[downloadTarget.selectedTheme] ??
          THEMES.find((t) => t.id === downloadTarget.selectedTheme)?.defaultColors ??
          { accent: '#000000', secondary: '#000000' }
        return (
          <div
            ref={hiddenRef}
            aria-hidden
            style={{ position: 'fixed', left: '-9999px', top: 0, width: 794, background: 'white', pointerEvents: 'none' }}
          >
            <ThemeComp data={downloadTarget} colors={colors} />
          </div>
        )
      })()}

      {/* ── Delete Confirmation Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-secondary">Delete Resume</DialogTitle>
          </DialogHeader>
          <p className="text-foreground text-sm">
            Are you sure you want to delete{' '}
            <span className="text-secondary font-semibold">{deleteTarget?.title}</span>?
            This cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Rename Dialog ── */}
      <Dialog open={!!renameTarget} onOpenChange={(o) => !o && setRenameTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-secondary">Rename Resume</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Resume title"
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            autoFocus
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRenameTarget(null)}>Cancel</Button>
            <Button onClick={handleRename} disabled={!renameValue.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
