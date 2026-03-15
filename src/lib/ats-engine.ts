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
  if (hasSection(n, ['summary', 'objective', 'professional summary', 'profile'])) count++
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
  return /[\u2022\u2023\u25E6\u2043\u2219\-\*]\s+/m.test(text) || /^\s*[\-\*]\s+/m.test(text)
}

export function runAtsEngine(resumeText: string, jobTypeId: string): AtsReport {
  const jobType = getJobType(jobTypeId)
  const text = resumeText.trim()
  const normalized = normalize(text)
  const strongPoints: string[] = []
  const weakPoints: string[] = []
  const suggestions: string[] = []

  // Keyword match (up to 40)
  let keywordScore = 0
  const keywords = jobType?.keywords ?? []
  const matched = keywords.filter((kw) => {
    const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    return re.test(normalized)
  })
  const keywordRatio = keywords.length ? matched.length / keywords.length : 0
  keywordScore = Math.round(keywordRatio * 40)
  if (matched.length >= keywords.length * 0.5) {
    strongPoints.push(
      `Strong keyword match: your resume contains ${matched.length} of ${keywords.length} relevant terms for this role (e.g. ${matched.slice(0, 5).join(', ')})`
    )
  } else if (keywords.length && matched.length < keywords.length * 0.3) {
    weakPoints.push(
      `Few matching keywords: only ${matched.length} of ${keywords.length} typical terms found. Consider adding more role-specific skills and technologies.`
    )
    suggestions.push('Add more keywords from the job type (e.g. ' + keywords.slice(0, 5).join(', ') + ') to improve ATS match.')
  }

  // Sections (up to 25)
  const sectionsFound = countSectionMatches(text)
  const sectionScore = Math.min(25, sectionsFound * 5)
  if (sectionsFound >= 4) {
    strongPoints.push('Good structure: resume includes multiple standard sections (e.g. experience, education, skills) that ATS systems expect.')
  }
  if (!hasSection(text, ['summary', 'objective', 'professional summary', 'profile'])) {
    weakPoints.push('No professional summary or objective detected. ATS systems use this to quickly categorize candidates.')
    suggestions.push('Add a short professional summary at the top (2–3 lines).')
  }
  if (!hasSection(text, ['skills', 'technical skills'])) {
    weakPoints.push('No clear skills section detected. Many ATS systems parse a dedicated skills list.')
    suggestions.push('Include a clear "Skills" or "Technical Skills" section with relevant keywords.')
  }

  // Formatting (up to 15)
  let formatScore = 0
  if (hasDateFormats(text)) {
    formatScore += 5
    strongPoints.push('Dates appear in a recognizable format, which helps ATS parse your experience timeline.')
  } else {
    suggestions.push('Use consistent date formats (e.g. MM/YYYY or Month YYYY) for experience and education.')
  }
  if (hasBullets(text)) {
    formatScore += 5
  } else {
    suggestions.push('Use bullet points for experience and achievements to improve readability and parsing.')
  }
  formatScore = Math.min(15, formatScore + 5) // baseline

  // Length / action verbs (up to 20)
  const verbCount = countActionVerbs(text)
  const verbScore = Math.min(20, verbCount * 2)
  if (verbCount >= 5) {
    strongPoints.push(`Strong action verbs: resume uses ${verbCount}+ impact-oriented verbs (e.g. Led, Built, Delivered), which ATS and recruiters look for.`)
  } else if (verbCount < 3) {
    weakPoints.push('Few action verbs detected. Bullet points that start with verbs like "Led", "Built", "Delivered" tend to rank higher.')
    suggestions.push('Start bullet points with strong action verbs (e.g. Spearheaded, Orchestrated, Accelerated) instead of "Responsible for".')
  }

  const total = keywordScore + sectionScore + formatScore + verbScore
  const score = Math.min(100, Math.max(0, total))

  return {
    score,
    strongPoints: strongPoints.length ? strongPoints : ['Resume has been analyzed. Consider adding more role-specific content to improve your score.'],
    weakPoints,
    suggestions: suggestions.length ? suggestions : ['Review the weak points above and add missing sections or keywords.'],
  }
}
