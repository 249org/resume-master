import type { Experience, Education, ThemeColors } from '@/app/users/[id]/resume-builder/resume-themes'

export interface SavedResume {
  id: string
  title: string
  fullName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  linkedin: string
  experiences: Experience[]
  education: Education[]
  skills: string[]
  selectedTheme: string
  themeColors: Record<string, ThemeColors>
  savedAt: string
}

const KEY = 'saved-resumes-v1'

export function getAllResumes(): SavedResume[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch {
    return []
  }
}

export function getResume(id: string): SavedResume | undefined {
  return getAllResumes().find((r) => r.id === id)
}

export function saveResume(resume: SavedResume): void {
  const all = getAllResumes()
  const idx = all.findIndex((r) => r.id === resume.id)
  if (idx >= 0) all[idx] = resume
  else all.unshift(resume)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function deleteResume(id: string): void {
  const all = getAllResumes().filter((r) => r.id !== id)
  localStorage.setItem(KEY, JSON.stringify(all))
}

export function generateId(): string {
  return `resume-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/** Convert a saved resume (from Resume Builder) to plain text for ATS/AI analysis. */
export function savedResumeToText(resume: SavedResume): string {
  const parts: string[] = []

  if (resume.fullName) parts.push(resume.fullName)
  if (resume.jobTitle) parts.push(resume.jobTitle)
  if (resume.email) parts.push(resume.email)
  if (resume.phone) parts.push(resume.phone)
  if (resume.location) parts.push(resume.location)
  if (resume.linkedin) parts.push(resume.linkedin)

  if (resume.experiences?.length) {
    parts.push('\nEXPERIENCE')
    for (const exp of resume.experiences) {
      parts.push(`${exp.title} at ${exp.company}${exp.location ? `, ${exp.location}` : ''} (${exp.startDate} – ${exp.endDate})`)
      if (exp.description?.trim()) parts.push(exp.description.trim())
    }
  }

  if (resume.education?.length) {
    parts.push('\nEDUCATION')
    for (const ed of resume.education) {
      parts.push(`${ed.degree} – ${ed.school} (${ed.year})`)
    }
  }

  if (resume.skills?.length) {
    parts.push('\nSKILLS')
    parts.push(resume.skills.join(', '))
  }

  return parts.join('\n\n').trim()
}

/** Print the resume HTML inside a hidden iframe — works everywhere,
 *  no npm packages, compatible with Cloudflare Workers deployment. */
export function printResumeHTML(html: string, title: string): void {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  // A4 at 96 dpi = 794 × 1123 px. Giving the iframe real dimensions is critical:
  // without a width the browser computes layout at 0 px wide, stacking all content
  // into a thin column that then prints squished at the top of the page.
  iframe.style.cssText =
    'position:fixed;left:-9999px;top:0;width:794px;height:1123px;border:none;visibility:hidden;'
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument ?? iframe.contentWindow?.document
  if (!doc) {
    document.body.removeChild(iframe)
    return
  }

  doc.open()
  doc.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html {
      background: #fff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      background: #fff;
      width: 210mm;
      min-height: 297mm;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page { size: A4 portrait; margin: 0; }
  </style>
</head>
<body>${html}</body>
</html>`)
  doc.close()

  iframe.contentWindow?.focus()

  const tryPrint = () => {
    iframe.contentWindow?.print()
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 2000)
  }

  if (iframe.contentDocument?.readyState === 'complete') {
    tryPrint()
  } else {
    iframe.contentWindow?.addEventListener('load', tryPrint)
  }
}
