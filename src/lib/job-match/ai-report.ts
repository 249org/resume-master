import OpenAI from 'openai'
import { getJobTypeLabel } from '@/lib/job-types'
import type { AtsReport } from '@/lib/ats-engine'

export interface AiReport {
  summary: string
  suggestions: string[]
}

const MAX_RESUME_CHARS = 12_000

function truncateForPrompt(text: string, max: number): string {
  const t = text.trim()
  if (t.length <= max) return t
  return t.slice(0, max) + '\n\n[Resume truncated for AI analysis.]'
}

export async function generateAiReport(
  resumeText: string,
  jobTypeId: string,
  atsReport?: AtsReport | null
): Promise<{ ok: true; report: AiReport } | { ok: false; error: string }> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey?.trim()) {
    return { ok: false, error: 'OPENAI_API_KEY is not configured.' }
  }

  const openai = new OpenAI({ apiKey })
  const jobLabel = getJobTypeLabel(jobTypeId)
  const resumeSnippet = truncateForPrompt(resumeText, MAX_RESUME_CHARS)

  const atsContext =
    atsReport != null
      ? `\n\nATS analysis for this resume: score ${atsReport.score}/100. Strong points: ${atsReport.strongPoints.join('; ')}. Weak points: ${atsReport.weakPoints.join('; ')}.`
      : ''

  const systemPrompt = `You are an expert resume coach and career advisor. Given a resume and the type of job the candidate is targeting, provide concise, actionable feedback. Focus on how to improve the resume for ATS and for human recruiters. Be specific and practical.`

  const userPrompt = `Job type the candidate is targeting: "${jobLabel}".

Resume text:
---
${resumeSnippet}
---
${atsContext}

Respond with a JSON object only (no markdown, no code block), with exactly two keys:
- "summary": a short overall feedback paragraph (2-4 sentences).
- "suggestions": an array of 3-6 concrete improvement suggestions (each a short string).`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1024,
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) {
      return { ok: false, error: 'Empty response from OpenAI.' }
    }

    const parsed = JSON.parse(raw) as { summary?: string; suggestions?: string[] }
    const summary =
      typeof parsed.summary === 'string'
        ? parsed.summary
        : 'Unable to generate summary.'
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions.filter((s): s is string => typeof s === 'string')
      : []

    return {
      ok: true,
      report: { summary, suggestions: suggestions.length ? suggestions : ['Review your resume for clarity and relevance to the target role.'] },
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'OpenAI request failed'
    return { ok: false, error: message }
  }
}
