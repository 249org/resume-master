import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import OpenAI from 'openai'

const MAX_RESUME_CHARS = 12_000

function truncateForPrompt(text: string): string {
  const t = text.trim()
  if (t.length <= MAX_RESUME_CHARS) return t
  return t.slice(0, MAX_RESUME_CHARS) + '\n\n[Resume truncated.]'
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { resumeText?: unknown; jobTarget?: unknown; mode?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const resumeText = typeof body.resumeText === 'string' ? body.resumeText.trim() : ''
  const jobTarget = typeof body.jobTarget === 'string' ? body.jobTarget.trim() : ''
  const mode = body.mode === 'parse' ? 'parse' : 'ai'

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey?.trim()) {
    return NextResponse.json({ error: 'AI service not configured.' }, { status: 503 })
  }

  const openai = new OpenAI({ apiKey })

  const resumeSection = resumeText
    ? `Resume text:\n---\n${truncateForPrompt(resumeText)}\n---`
    : 'No resume text provided — the user is starting from scratch.'

  const optimizationNote =
    mode === 'ai' && jobTarget
      ? `\n\nTarget role: "${jobTarget}"\n\nIMPORTANT: Rewrite the experience bullet points to be ATS-optimized, start with strong action verbs, and be tailored for this role. Add specific metrics where plausible. Set the jobTitle field to "${jobTarget}" if the resume's job title is empty or less relevant.`
      : ''

  const prompt = `You are a professional resume writer. Extract structured resume data from the provided text and return it as valid JSON.

${resumeSection}${optimizationNote}

Return ONLY a JSON object (no markdown, no code fences) with this exact structure:
{
  "fullName": "string — full name, empty string if not found",
  "jobTitle": "string — current or most recent job title",
  "email": "string — email address, empty string if not found",
  "phone": "string — phone number, empty string if not found",
  "location": "string — city and state or country, empty string if not found",
  "linkedin": "string — LinkedIn URL or handle, empty string if not found",
  "experiences": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "string — year or month/year e.g. 2021 or Jan 2021",
      "endDate": "string — year, month/year, or Present",
      "description": "string — 2 to 4 bullet points each starting with • on a new line"
    }
  ],
  "education": [
    {
      "degree": "string — degree and field e.g. BS Computer Science",
      "school": "string — institution name",
      "year": "string — graduation year or year range e.g. 2018 or 2014 – 2018"
    }
  ],
  "skills": ["string"]
}

Rules:
- Maximum 5 experience entries, 3 education entries, 20 skills
- Use empty strings for missing scalar fields, empty arrays for missing list fields
- All experience descriptions must use • bullet points, one per line
- Keep each bullet under 150 characters`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 2048,
    })

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) {
      return NextResponse.json({ error: 'Empty response from AI.' }, { status: 500 })
    }

    const parsed = JSON.parse(raw)
    return NextResponse.json({ data: parsed })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'AI request failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
