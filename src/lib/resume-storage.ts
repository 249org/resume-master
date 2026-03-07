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

/** Print the resume HTML inside a hidden iframe — works everywhere,
 *  no npm packages, compatible with Cloudflare Workers deployment. */
export function printResumeHTML(html: string, title: string): void {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText =
    'position:fixed;left:-9999px;top:0;width:0;height:0;border:none;visibility:hidden;'
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
    html, body {
      background: #fff;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @page { size: A4; margin: 0; }
  </style>
</head>
<body>${html}</body>
</html>`)
  doc.close()

  iframe.contentWindow?.focus()

  // Use onload to ensure the iframe is fully rendered before printing
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
