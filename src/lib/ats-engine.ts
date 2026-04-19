import { getJobType } from './job-types'

export interface AtsReport {
  score: number
  strongPoints: string[]
  weakPoints: string[]
  suggestions: string[]
}

const ACTION_VERBS = [
  'led',
  'built',
  'developed',
  'implemented',
  'managed',
  'created',
  'designed',
  'launched',
  'improved',
  'increased',
  'reduced',
  'spearheaded',
  'orchestrated',
  'accelerated',
  'drove',
  'established',
  'delivered',
  'achieved',
  'optimized',
  'automated',
]

const DATE_PATTERNS = [
  /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}\b/gi,
  /\b\d{1,2}\/\d{4}\b/g,
  /\b\d{4}\s*[-–—]\s*(?:present|current|now)\b/gi,
]

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ')
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Detect if a job keyword appears in normalized resume text.
 * Plain `\b…\b` misses many real CV tokens (Node.js, C++, A/B testing, REST APIs).
 */
export function resumeContainsKeyword(
  normalizedResume: string,
  keyword: string
): boolean {
  const raw = keyword.trim()
  if (!raw) return false
  const n = normalizedResume
  const k = raw.toLowerCase()

  if (k.includes(' ')) {
    const pattern = k
      .split(/\s+/)
      .map((p) => escapeRegExp(p))
      .join('\\s+')
    return new RegExp(pattern, 'i').test(n)
  }

  const escaped = escapeRegExp(k)
  // Tech / symbols: don't rely on \b (breaks on + . / # etc.)
  if (/[+.#/]/.test(k) || k === 'c++' || k.includes('++')) {
    return new RegExp(escaped.replace(/\\\./g, '.'), 'i').test(n)
  }

  // Short tokens (Go, R, UX, …): avoid matching inside unrelated words
  if (k.length <= 2) {
    return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, 'i').test(n)
  }

  return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, 'i').test(n)
}

function hasSection(text: string, names: string[]): boolean {
  const n = normalize(text)
  return names.some((name) => {
    const pattern = new RegExp(`\\b${name.replace(/\s+/g, '\\s+')}\\b`, 'i')
    return pattern.test(n) || n.includes(name.toLowerCase())
  })
}

function countSectionMatches(text: string): number {
  const n = normalize(text)
  let count = 0
  if (hasSection(n, ['summary', 'objective', 'professional summary', 'profile']))
    count++
  if (hasSection(n, ['experience', 'work', 'employment'])) count++
  if (hasSection(n, ['education'])) count++
  if (hasSection(n, ['skills', 'technical'])) count++
  if (hasSection(n, ['projects', 'certifications', 'achievements'])) count++
  return count
}

function countActionVerbs(text: string): number {
  const n = normalize(text)
  return ACTION_VERBS.filter((verb) => {
    const re = new RegExp(`\\b${verb}\\w*\\b`, 'i')
    return re.test(n)
  }).length
}

function hasDateFormats(text: string): boolean {
  return DATE_PATTERNS.some((re) => re.test(text))
}

function hasBullets(text: string): boolean {
  return (
    /[\u2022\u2023\u25E6\u2043\u2219\-\*]\s+/m.test(text) ||
    /^\s*[\-\*]\s+/m.test(text)
  )
}

/** Primary guest-preview sentence: real ATS feedback only (never word-count metadata). */
export function previewTeaserFromReport(report: AtsReport): string {
  return buildGuestAtsPreviewCopy(report).teaser
}

export type GuestAtsPreviewCopy = {
  teaser: string
  moreFeedback: string[]
}

/**
 * Builds guest card copy: main insight + extra bullets from the same analysis.
 */
export function buildGuestAtsPreviewCopy(report: AtsReport): GuestAtsPreviewCopy {
  const teaser = pickPrimaryFeedbackTeaser(report)
  const moreFeedback = pickExtraFeedbackLines(report, teaser, 2)
  return { teaser, moreFeedback }
}

function pickPrimaryFeedbackTeaser(report: AtsReport): string {
  const { strongPoints, weakPoints, suggestions } = report

  const keywordInsight = strongPoints.find(
    (s) =>
      /overlap|keyword|terms (for this role|detected|appear)/i.test(s) ||
      /role-relevant terms/i.test(s)
  )
  if (keywordInsight) return keywordInsight

  if (weakPoints.length) return weakPoints[0]
  if (suggestions.length) return suggestions[0]

  const nonGeneric = strongPoints.find(
    (s) => !s.startsWith('Good structure')
  )
  if (nonGeneric) return nonGeneric

  return (
    strongPoints[0] ??
    'Sign in for section-by-section strengths, gaps, and tailored fixes for your resume.'
  )
}

function pickExtraFeedbackLines(
  report: AtsReport,
  teaser: string,
  max: number
): string[] {
  const out: string[] = []
  const push = (s: string) => {
    if (!s || s === teaser || out.includes(s)) return
    out.push(s)
  }

  for (const w of report.weakPoints) {
    push(w)
    if (out.length >= max) return out
  }
  for (const s of report.suggestions) {
    push(s)
    if (out.length >= max) return out
  }
  for (const s of report.strongPoints) {
    if (s === teaser) continue
    push(s)
    if (out.length >= max) return out
  }
  return out
}

export function runAtsEngine(resumeText: string, jobTypeId: string): AtsReport {
  const jobType = getJobType(jobTypeId)
  const text = resumeText.trim()
  const normalized = normalize(text)
  const strongPoints: string[] = []
  const weakPoints: string[] = []
  const suggestions: string[] = []

  // Keyword match (up to 40)
  const keywords = jobType?.keywords ?? []
  const matched = keywords.filter((kw) => resumeContainsKeyword(normalized, kw))
  const keywordRatio = keywords.length ? matched.length / keywords.length : 0
  const keywordScore = Math.round(keywordRatio * 40)

  if (keywords.length) {
    const examples = matched.slice(0, 8).join(', ')
    if (matched.length >= keywords.length * 0.5) {
      strongPoints.push(
        `Strong role keyword overlap: ${matched.length}/${keywords.length} typical terms for this role appear in your CV (e.g. ${examples}).`
      )
    } else if (matched.length >= keywords.length * 0.25) {
      strongPoints.push(
        `Moderate keyword overlap: ${matched.length}/${keywords.length} role-relevant terms detected in your document (e.g. ${examples || 'see full report'}).`
      )
    } else {
      weakPoints.push(
        `Low overlap with this role’s keyword set: only ${matched.length}/${keywords.length} typical terms found in your resume text. Different roles will score differently because keyword lists are not the same.`
      )
      suggestions.push(
        `Weigh your bullets toward this role: add missing skills from this track (examples from the list: ${keywords.slice(0, 8).join(', ')}).`
      )
    }
  }

  // Sections (up to 25)
  const sectionsFound = countSectionMatches(text)
  const sectionScore = Math.min(25, sectionsFound * 5)
  if (sectionsFound >= 4) {
    strongPoints.push(
      'Good structure: resume includes multiple standard sections (e.g. experience, education, skills) that ATS systems expect.'
    )
  }
  if (!hasSection(text, ['summary', 'objective', 'professional summary', 'profile'])) {
    weakPoints.push(
      'No professional summary or objective detected. ATS systems use this to quickly categorize candidates.'
    )
    suggestions.push('Add a short professional summary at the top (2–3 lines).')
  }
  if (!hasSection(text, ['skills', 'technical skills'])) {
    weakPoints.push(
      'No clear skills section detected. Many ATS systems parse a dedicated skills list.'
    )
    suggestions.push(
      'Include a clear "Skills" or "Technical Skills" section with relevant keywords.'
    )
  }

  // Formatting (up to 15)
  let formatScore = 0
  if (hasDateFormats(text)) {
    formatScore += 5
    strongPoints.push(
      'Dates appear in a recognizable format, which helps ATS parse your experience timeline.'
    )
  } else {
    suggestions.push(
      'Use consistent date formats (e.g. MM/YYYY or Month YYYY) for experience and education.'
    )
  }
  if (hasBullets(text)) {
    formatScore += 5
  } else {
    suggestions.push(
      'Use bullet points for experience and achievements to improve readability and parsing.'
    )
  }
  formatScore = Math.min(15, formatScore + 5)

  // Length / action verbs (up to 20)
  const verbCount = countActionVerbs(text)
  const verbScore = Math.min(20, verbCount * 2)
  if (verbCount >= 5) {
    strongPoints.push(
      `Strong action verbs: your text uses ${verbCount} distinct impact-style verbs (e.g. led, built, delivered), which parsers and recruiters weight heavily.`
    )
  } else if (verbCount < 3) {
    weakPoints.push(
      'Few action verbs detected. Bullet points that start with verbs like "Led", "Built", "Delivered" tend to rank higher.'
    )
    suggestions.push(
      'Start bullet points with strong action verbs (e.g. Spearheaded, Orchestrated, Accelerated) instead of "Responsible for".'
    )
  }

  const total = keywordScore + sectionScore + formatScore + verbScore
  const score = Math.min(100, Math.max(0, total))

  return {
    score,
    strongPoints: strongPoints.length
      ? strongPoints
      : [
          'Analysis complete. Add more role-specific content and sections to improve your score.',
        ],
    weakPoints,
    suggestions: suggestions.length
      ? suggestions
      : [
          'Review the weak points above and add missing sections or keywords drawn from your target role.',
        ],
  }
}
