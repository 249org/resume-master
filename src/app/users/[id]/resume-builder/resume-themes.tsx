import React from 'react'

export interface Experience {
  id: number
  title: string
  company: string
  location: string
  startDate: string
  endDate: string
  description: string
}

export interface Education {
  id: number
  degree: string
  school: string
  year: string
}

export interface ResumeData {
  fullName: string
  jobTitle: string
  bio: string
  email: string
  phone: string
  location: string
  linkedin: string
  experiences: Experience[]
  education: Education[]
  skills: string[]
}

/** Per-theme color slots. `secondary` is used as header/sidebar background in
 *  two-tone themes (Sidebar, Executive). Single-color themes only use `accent`. */
export interface ThemeColors {
  accent: string
  secondary: string
}

export interface ThemeConfig {
  id: string
  name: string
  description: string
  accentColor: string
  defaultColors: ThemeColors
  /** Whether this theme visibly uses both accent AND secondary color slots. */
  hasSecondary: boolean
  thumbnail: React.ReactNode
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

/** Append hex alpha (00–ff) to a 6-digit hex color for a light tint.
 *  e.g. tint('#0f4c81', '18') → '#0f4c8118'  */
function tint(hex: string, alpha: string) {
  return hex + alpha
}

/** Space between one role and the next in Experience (clearer than gap within bullets). */
const EXPERIENCE_BLOCK_MARGIN_BOTTOM = "2.1rem"

/**
 * Renders job bullets as a real list (not pre-line paragraphs). Parser stores
 * lines separated by newlines; strip stray "Responsibilities:" labels and bullet chars.
 */
function ExperienceDescription({
  text,
  listStyle,
}: {
  text: string
  listStyle: React.CSSProperties
}) {
  const clean = text
    .replace(/^\s*responsibilities:?\s*/i, "")
    .replace(/\s*responsibilities:?\s*$/i, "")
    .trim()
  if (!clean) return null
  const lines = clean
    .split(/\n+/)
    .map((l) =>
      l
        .replace(/^[•\-*▪·]\s*/u, "")
        .replace(/\s*responsibilities:?\s*$/i, "")
        .trim()
    )
    .filter((l) => l.length > 0 && !/^responsibilities:?$/i.test(l))
  if (lines.length === 0) return null
  return (
    <ul
      style={{
        margin: 0,
        paddingLeft: "1.15em",
        listStyle: "disc",
        listStylePosition: "outside",
        listStyleType: "disc",
        lineHeight: 1.45,
        ...listStyle,
      }}
    >
      {lines.map((line, i) => (
        <li
          key={i}
          style={{
            marginBottom: i < lines.length - 1 ? "0.3em" : 0,
            paddingLeft: "0.15em",
          }}
        >
          {line}
        </li>
      ))}
    </ul>
  )
}

// ─── Theme 1: Classic ──────────────────────────────────────────────────────────

export function ClassicTheme({ data, colors }: { data: ResumeData; colors: ThemeColors }) {
  const c = colors.accent

  const sectionHeader = (title: string) => (
    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 0.5, marginBottom: 6 }}>{title}</div>
      <div style={{ height: 1, background: '#1a1a1a' }} />
    </div>
  )

  const contactItems = [data.email, data.phone, data.location, data.linkedin].filter(Boolean)

  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', background: '#fff', padding: '2.75rem 3.25rem', fontSize: 12.5, minHeight: '297mm' }}>

      {/* ── Centered header ── */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: 23, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: c }}>
          {data.fullName || 'YOUR NAME'}
        </div>
        {data.jobTitle && (
          <div style={{ fontSize: 13, color: '#444', marginTop: 5 }}>{data.jobTitle}</div>
        )}
        {contactItems.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '5px', marginTop: 9, fontSize: 11, color: '#555' }}>
            {contactItems.map((v, i) => (
              <React.Fragment key={i}>
                <span>{v}</span>
                {i < contactItems.length - 1 && <span style={{ color: '#aaa', margin: '0 2px' }}>•</span>}
              </React.Fragment>
            ))}
          </div>
        )}
        <div style={{ height: '1.5px', background: c, marginTop: 14 }} />
      </div>

      {data.bio.trim() && (
        <div style={{ marginBottom: '2rem' }}>
          {sectionHeader('Bio')}
          <div style={{ fontSize: 12, color: '#333', lineHeight: 1.8, whiteSpace: 'pre-line', textAlign: 'left' }}>
            {data.bio}
          </div>
        </div>
      )}

      {/* ── Experience ── */}
      {data.experiences.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          {sectionHeader('Experience')}
          {data.experiences.map((exp) => (
            <div key={exp.id} style={{ marginBottom: EXPERIENCE_BLOCK_MARGIN_BOTTOM }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12.5 }}>{exp.company}</span>
                <span style={{ fontSize: 11, color: '#555' }}>{exp.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 1 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{exp.title}</span>
                <span style={{ fontSize: 11, color: '#555' }}>
                  {exp.startDate}{exp.endDate ? ` - ${exp.endDate}` : ''}
                </span>
              </div>
              {exp.description && (
                <ExperienceDescription
                  text={exp.description}
                  listStyle={{ marginTop: 6, fontSize: 12, color: '#333' }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Education ── */}
      {data.education.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          {sectionHeader('Education')}
          {data.education.map((edu) => (
            <div key={edu.id} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12.5 }}>{edu.school}</span>
                <span style={{ fontSize: 11, color: '#555' }}>{edu.year}</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, marginTop: 1 }}>{edu.degree}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Skills ── */}
      {data.skills.length > 0 && (
        <div>
          {sectionHeader('Skills')}
          <div style={{ fontSize: 12, color: '#333', lineHeight: 2 }}>
            {data.skills.join(' · ')}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Theme 2: Ocean ────────────────────────────────────────────────────────────

export function OceanTheme({ data, colors }: { data: ResumeData; colors: ThemeColors }) {
  const accent = colors.accent
  const light = tint(accent, '18')
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#1a1a1a', background: '#fff', padding: '2.5rem 3rem', fontSize: 13, minHeight: '297mm' }}>
      <div style={{ borderLeft: `5px solid ${accent}`, paddingLeft: '1rem', marginBottom: '1.75rem' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: accent, letterSpacing: 1 }}>{data.fullName || 'YOUR NAME'}</div>
        <div style={{ fontSize: 13, color: '#444', marginTop: 3 }}>{data.jobTitle}</div>
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: 11, color: '#555' }}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>✆ {data.phone}</span>}
          {data.location && <span>⌖ {data.location}</span>}
          {data.linkedin && <span style={{ color: accent }}>🔗 {data.linkedin}</span>}
        </div>
      </div>

      {data.bio.trim() && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ background: accent, color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 10px', marginBottom: '0.9rem' }}>Bio</div>
          <div style={{ paddingLeft: 10, color: '#444', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{data.bio}</div>
        </div>
      )}

      {data.experiences.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ background: accent, color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 10px', marginBottom: '0.9rem' }}>Experience</div>
          {data.experiences.map((exp) => (
            <div key={exp.id} style={{ marginBottom: EXPERIENCE_BLOCK_MARGIN_BOTTOM, paddingLeft: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: accent, fontSize: 13 }}>{exp.title}</span>
                <span style={{ color: '#666', fontSize: 11 }}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}</span>
              </div>
              {exp.company && <div style={{ color: '#555', fontSize: 11, marginTop: 1 }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>}
              {exp.description && (
                <ExperienceDescription
                  text={exp.description}
                  listStyle={{ marginTop: 4, color: '#444', fontSize: 12, lineHeight: 1.5 }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {data.education.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ background: accent, color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 10px', marginBottom: '0.9rem' }}>Education</div>
          {data.education.map((edu) => (
            <div key={edu.id} style={{ paddingLeft: 10, display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div><span style={{ fontWeight: 700 }}>{edu.degree}</span>{edu.school ? <span style={{ color: '#555' }}> — {edu.school}</span> : null}</div>
              <span style={{ color: '#666', fontSize: 11 }}>{edu.year}</span>
            </div>
          ))}
        </div>
      )}

      {data.skills.length > 0 && (
        <div>
          <div style={{ background: accent, color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '4px 10px', marginBottom: '0.9rem' }}>Skills</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 10 }}>
            {data.skills.map((s) => (
              <span key={s} style={{ background: light, color: accent, borderRadius: 3, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Theme 3: Sidebar ──────────────────────────────────────────────────────────

export function SidebarTheme({ data, colors }: { data: ResumeData; colors: ThemeColors }) {
  const sidebarBg = colors.secondary
  const accent = colors.accent
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', display: 'flex', minHeight: '297mm', fontSize: 13 }}>
      <div style={{ width: '36%', background: sidebarBg, color: '#e2e8f0', padding: '2rem 1.25rem', flexShrink: 0 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: sidebarBg, marginBottom: '1rem' }}>
          {(data.fullName || 'U')[0].toUpperCase()}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.3, marginBottom: 5 }}>{data.fullName || 'YOUR NAME'}</div>
        <div style={{ fontSize: 12, color: accent, marginBottom: '1.5rem' }}>{data.jobTitle}</div>

        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: accent, marginBottom: 6 }}>Contact</div>
        <div style={{ fontSize: 11, lineHeight: 2.1, color: '#cbd5e1', marginBottom: '1.5rem' }}>
          {data.email && <div>✉ {data.email}</div>}
          {data.phone && <div>✆ {data.phone}</div>}
          {data.location && <div>⌖ {data.location}</div>}
          {data.linkedin && <div>🔗 {data.linkedin}</div>}
        </div>

        {data.skills.length > 0 && (
          <>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: accent, marginBottom: 8 }}>Skills</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {data.skills.map((s) => (
                <div key={s} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 3, padding: '4px 9px', fontSize: 11 }}>{s}</div>
              ))}
            </div>
          </>
        )}

        {data.education.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: accent, marginBottom: 8 }}>Education</div>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{edu.degree}</div>
                <div style={{ fontSize: 10, color: '#94a3b8' }}>{edu.school}</div>
                <div style={{ fontSize: 10, color: '#64748b' }}>{edu.year}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, background: '#fff', padding: '2rem 1.75rem' }}>
        {data.bio.trim() && (
          <div style={{ marginBottom: '1.35rem' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: sidebarBg, borderBottom: `2px solid ${accent}`, paddingBottom: 4, marginBottom: '0.65rem' }}>Bio</div>
            <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{data.bio}</div>
          </div>
        )}
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: sidebarBg, borderBottom: `2px solid ${accent}`, paddingBottom: 4, marginBottom: '1rem' }}>Experience</div>
        {data.experiences.map((exp) => (
          <div key={exp.id} style={{ marginBottom: EXPERIENCE_BLOCK_MARGIN_BOTTOM }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 700, color: sidebarBg, fontSize: 13 }}>{exp.title}</span>
              <span style={{ fontSize: 10, color: '#64748b' }}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}</span>
            </div>
            {exp.company && <div style={{ fontSize: 11, color: '#475569', marginTop: 1 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>}
            {exp.description && (
              <ExperienceDescription
                text={exp.description}
                listStyle={{ marginTop: 4, color: '#475569', fontSize: 11, lineHeight: 1.5 }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Theme 4: Bold ─────────────────────────────────────────────────────────────

export function BoldTheme({ data, colors }: { data: ResumeData; colors: ThemeColors }) {
  const accent = colors.accent
  const lightBg = tint(accent, '14')
  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#1a1a1a', background: '#fff', fontSize: 13, minHeight: '297mm' }}>
      <div style={{ background: accent, color: '#fff', padding: '1.75rem 2.5rem' }}>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>{data.fullName || 'YOUR NAME'}</div>
        <div style={{ fontSize: 13, opacity: 0.9, marginTop: 4, marginBottom: 12 }}>{data.jobTitle}</div>
        <div style={{ display: 'flex', gap: '1.5rem', fontSize: 11, opacity: 0.85, flexWrap: 'wrap' }}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>✆ {data.phone}</span>}
          {data.location && <span>⌖ {data.location}</span>}
          {data.linkedin && <span>🔗 {data.linkedin}</span>}
        </div>
      </div>

      <div style={{ padding: '1.75rem 2.5rem' }}>
        {data.bio.trim() && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.6rem' }}>
              <div style={{ width: 4, height: 16, background: accent, borderRadius: 2 }} />
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>Bio</div>
            </div>
            <div style={{ color: '#555', lineHeight: 1.75, whiteSpace: 'pre-line', paddingLeft: 14 }}>{data.bio}</div>
          </div>
        )}
        {data.experiences.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
              <div style={{ width: 4, height: 16, background: accent, borderRadius: 2 }} />
              <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>Experience</div>
            </div>
            {data.experiences.map((exp) => (
              <div key={exp.id} style={{ marginBottom: EXPERIENCE_BLOCK_MARGIN_BOTTOM, paddingLeft: 14, borderLeft: '2px solid #f0f0f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{exp.title}</span>
                  <span style={{ color: '#777', fontSize: 11 }}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}</span>
                </div>
                {exp.company && <div style={{ color: accent, fontSize: 11, fontWeight: 600, marginTop: 1 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ''}</div>}
                {exp.description && (
                  <ExperienceDescription
                    text={exp.description}
                    listStyle={{ marginTop: 4, color: '#555', fontSize: 12, lineHeight: 1.5 }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '2.5rem' }}>
          {data.education.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.6rem' }}>
                <div style={{ width: 4, height: 16, background: accent, borderRadius: 2 }} />
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>Education</div>
              </div>
              {data.education.map((edu) => (
                <div key={edu.id} style={{ paddingLeft: 14, borderLeft: '2px solid #f0f0f0', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700 }}>{edu.degree}</div>
                  <div style={{ color: '#555', fontSize: 11 }}>{edu.school}</div>
                  <div style={{ color: '#888', fontSize: 10 }}>{edu.year}</div>
                </div>
              ))}
            </div>
          )}
          {data.skills.length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.6rem' }}>
                <div style={{ width: 4, height: 16, background: accent, borderRadius: 2 }} />
                <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2 }}>Skills</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 14 }}>
                {data.skills.map((s) => (
                  <span key={s} style={{ background: lightBg, color: accent, border: `1px solid ${accent}`, borderRadius: 3, padding: '3px 9px', fontSize: 11, fontWeight: 600 }}>{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Theme 5: Minimal ──────────────────────────────────────────────────────────

export function MinimalTheme({ data, colors }: { data: ResumeData; colors: ThemeColors }) {
  const accent = colors.accent
  return (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", color: '#111', background: '#fafafa', padding: '2.5rem 3rem', fontSize: 13, minHeight: '297mm' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.25rem', borderBottom: '1px solid #e0e0e0' }}>
        <div style={{ fontSize: 26, fontWeight: 300, letterSpacing: 6, textTransform: 'uppercase' }}>{data.fullName || 'YOUR NAME'}</div>
        {data.jobTitle && <div style={{ fontSize: 12, color: accent, marginTop: 5, letterSpacing: 2, textTransform: 'uppercase' }}>{data.jobTitle}</div>}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginTop: 10, fontSize: 10, color: '#888' }}>
          {[data.email, data.phone, data.location, data.linkedin].filter(Boolean).map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
      </div>

      {data.bio.trim() && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: accent, marginBottom: '0.6rem', fontWeight: 600 }}>Bio</div>
          <div style={{ color: '#555', lineHeight: 1.75, whiteSpace: 'pre-line', fontSize: 12, maxWidth: 560, margin: '0 auto', textAlign: 'left' }}>
            {data.bio}
          </div>
          <div style={{ borderBottom: '1px solid #e8e8e8', marginTop: '1.25rem' }} />
        </div>
      )}

      {data.experiences.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: accent, marginBottom: '0.75rem', fontWeight: 600 }}>Experience</div>
          {data.experiences.map((exp) => (
            <div key={exp.id} style={{ marginBottom: EXPERIENCE_BLOCK_MARGIN_BOTTOM }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{exp.title}{exp.company ? <span style={{ fontWeight: 400, color: '#555' }}>, {exp.company}</span> : null}</span>
                <span style={{ color: '#888', fontSize: 11 }}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}</span>
              </div>
              {exp.location && <div style={{ color: '#999', fontSize: 10, marginBottom: 2 }}>{exp.location}</div>}
              {exp.description && (
                <ExperienceDescription
                  text={exp.description}
                  listStyle={{ marginTop: 3, color: '#555', fontSize: 12, lineHeight: 1.5 }}
                />
              )}
            </div>
          ))}
          <div style={{ borderBottom: '1px solid #e8e8e8', marginTop: 6 }} />
        </div>
      )}

      {data.education.length > 0 && (
        <div style={{ marginBottom: '1.75rem' }}>
          <div style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: accent, marginBottom: '0.75rem', fontWeight: 600 }}>Education</div>
          {data.education.map((edu) => (
            <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span>{edu.degree}{edu.school ? <span style={{ color: '#555' }}>, {edu.school}</span> : null}</span>
              <span style={{ color: '#888', fontSize: 11 }}>{edu.year}</span>
            </div>
          ))}
          <div style={{ borderBottom: '1px solid #e8e8e8', marginTop: 10 }} />
        </div>
      )}

      {data.skills.length > 0 && (
        <div>
          <div style={{ fontSize: 9, letterSpacing: 4, textTransform: 'uppercase', color: accent, marginBottom: '0.6rem', fontWeight: 600 }}>Skills</div>
          <div style={{ color: '#333', fontSize: 11, lineHeight: 2.1 }}>{data.skills.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ─── Theme 6: Executive ────────────────────────────────────────────────────────

export function ExecutiveTheme({ data, colors }: { data: ResumeData; colors: ThemeColors }) {
  const headerBg = colors.secondary
  const accent = colors.accent
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#1a1a1a', background: '#fff', fontSize: 13, minHeight: '297mm' }}>
      <div style={{ background: headerBg, color: '#fff', padding: '1.75rem 2.5rem' }}>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 1 }}>{data.fullName || 'YOUR NAME'}</div>
        {data.jobTitle && <div style={{ fontSize: 13, color: '#bdc3c7', marginTop: 5 }}>{data.jobTitle}</div>}
      </div>

      <div style={{ background: accent, color: '#fff', padding: '6px 2.5rem', display: 'flex', gap: '1.75rem', fontSize: 10, flexWrap: 'wrap' }}>
        {data.email && <span>{data.email}</span>}
        {data.phone && <span>{data.phone}</span>}
        {data.location && <span>{data.location}</span>}
        {data.linkedin && <span>{data.linkedin}</span>}
      </div>

      <div style={{ padding: '1.75rem 2.5rem' }}>
        {data.bio.trim() && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.65rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: headerBg }}>Bio</div>
              <div style={{ flex: 1, height: 1, background: accent }} />
            </div>
            <div style={{ color: '#444', lineHeight: 1.75, whiteSpace: 'pre-line' }}>{data.bio}</div>
          </div>
        )}
        {data.experiences.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.9rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: headerBg }}>Experience</div>
              <div style={{ flex: 1, height: 1, background: accent }} />
            </div>
            {data.experiences.map((exp) => (
              <div key={exp.id} style={{ marginBottom: EXPERIENCE_BLOCK_MARGIN_BOTTOM }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{exp.title}</span>
                  <span style={{ color: '#777', fontSize: 11 }}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : ''}</span>
                </div>
                {exp.company && <div style={{ color: accent, fontSize: 11, fontStyle: 'italic', marginTop: 1 }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</div>}
                {exp.description && (
                  <ExperienceDescription
                    text={exp.description}
                    listStyle={{ marginTop: 5, color: '#444', fontSize: 12, lineHeight: 1.5 }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {data.education.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.9rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: headerBg }}>Education</div>
              <div style={{ flex: 1, height: 1, background: accent }} />
            </div>
            {data.education.map((edu) => (
              <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                <div><span style={{ fontWeight: 700 }}>{edu.degree}</span>{edu.school ? <span style={{ color: '#555', fontStyle: 'italic' }}> — {edu.school}</span> : null}</div>
                <span style={{ color: '#777', fontSize: 11 }}>{edu.year}</span>
              </div>
            ))}
          </div>
        )}

        {data.skills.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.9rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: headerBg }}>Skills</div>
              <div style={{ flex: 1, height: 1, background: accent }} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {data.skills.map((s) => (
                <span key={s} style={{ border: `1px solid ${accent}`, color: accent, borderRadius: 2, padding: '3px 10px', fontSize: 11 }}>{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Theme registry ────────────────────────────────────────────────────────────

export const THEMES: ThemeConfig[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean & timeless serif layout',
    accentColor: '#1a1a1a',
    defaultColors: { accent: '#1a1a1a', secondary: '#1a1a1a' },
    hasSecondary: false,
    thumbnail: (
      <div className="flex h-full flex-col gap-1 p-2">
        <div className="flex justify-between border-b border-gray-800 pb-1">
          <div className="h-2 w-16 rounded bg-gray-800" />
          <div className="flex flex-col items-end gap-0.5">
            <div className="h-1 w-8 rounded bg-gray-400" />
            <div className="h-1 w-6 rounded bg-gray-400" />
          </div>
        </div>
        <div className="mt-1 h-1 w-10 rounded bg-gray-300" />
        {[1,2].map(i => <div key={i} className="mt-0.5 h-1 w-full rounded bg-gray-200" />)}
        <div className="mt-1 h-1 w-10 rounded bg-gray-300" />
        <div className="mt-0.5 h-1 w-full rounded bg-gray-200" />
        <div className="mt-1 flex gap-1">
          {[1,2,3].map(i => <div key={i} className="h-2 w-6 rounded border border-gray-400" />)}
        </div>
      </div>
    ),
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Bold section bars, colored accents',
    accentColor: '#0f4c81',
    defaultColors: { accent: '#0f4c81', secondary: '#0f4c81' },
    hasSecondary: false,
    thumbnail: (
      <div className="flex h-full flex-col gap-1 p-2">
        <div className="flex items-start gap-1 border-l-2 border-[#0f4c81] pl-1.5">
          <div>
            <div className="h-2 w-14 rounded bg-[#0f4c81]" />
            <div className="mt-0.5 h-1 w-8 rounded bg-gray-400" />
          </div>
        </div>
        <div className="mt-1 h-2 w-full rounded bg-[#0f4c81]" />
        {[1,2].map(i => <div key={i} className="mt-0.5 h-1 w-full rounded bg-gray-200" />)}
        <div className="mt-0.5 h-2 w-full rounded bg-[#0f4c81]" />
        <div className="mt-0.5 h-1 w-full rounded bg-gray-200" />
        <div className="mt-0.5 flex gap-1">
          {[1,2,3].map(i => <div key={i} className="h-2 w-5 rounded bg-[#e8f0f9]" />)}
        </div>
      </div>
    ),
  },
  {
    id: 'sidebar',
    name: 'Sidebar',
    description: 'Two-column with dark sidebar',
    accentColor: '#60a5fa',
    defaultColors: { accent: '#60a5fa', secondary: '#1e2a3a' },
    hasSecondary: true,
    thumbnail: (
      <div className="flex h-full overflow-hidden rounded">
        <div className="w-2/5 bg-[#1e2a3a] p-1.5 flex flex-col gap-1">
          <div className="h-4 w-4 rounded-full bg-[#60a5fa]" />
          <div className="h-1.5 w-full rounded bg-gray-400" />
          <div className="h-1 w-3/4 rounded bg-[#60a5fa]" />
          <div className="mt-1 h-1 w-1/2 rounded bg-[#60a5fa]" />
          {[1,2,3].map(i => <div key={i} className="mt-0.5 h-1 w-full rounded bg-white/20" />)}
        </div>
        <div className="flex-1 bg-white p-1.5 flex flex-col gap-1">
          <div className="h-1 w-1/2 rounded border-b border-[#60a5fa]" />
          {[1,2,3].map(i => <div key={i} className="mt-0.5 h-1 w-full rounded bg-gray-200" />)}
          <div className="mt-1 h-1 w-1/2 rounded border-b border-[#60a5fa]" />
          {[1,2].map(i => <div key={i} className="mt-0.5 h-1 w-full rounded bg-gray-200" />)}
        </div>
      </div>
    ),
  },
  {
    id: 'bold',
    name: 'Bold',
    description: 'Colored header, high-contrast layout',
    accentColor: '#e05a1a',
    defaultColors: { accent: '#e05a1a', secondary: '#e05a1a' },
    hasSecondary: false,
    thumbnail: (
      <div className="flex h-full flex-col">
        <div className="bg-[#e05a1a] p-1.5">
          <div className="h-2 w-16 rounded bg-white/90" />
          <div className="mt-0.5 h-1 w-10 rounded bg-white/60" />
          <div className="mt-0.5 flex gap-1">
            {[1,2,3].map(i => <div key={i} className="h-1 w-4 rounded bg-white/40" />)}
          </div>
        </div>
        <div className="flex-1 p-1.5 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <div className="h-2 w-1 rounded bg-[#e05a1a]" />
            <div className="h-1 w-12 rounded bg-gray-700" />
          </div>
          {[1,2].map(i => <div key={i} className="ml-2 h-1 w-full rounded bg-gray-200" />)}
          <div className="mt-0.5 flex gap-2">
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex items-center gap-1"><div className="h-2 w-1 rounded bg-[#e05a1a]" /><div className="h-1 w-8 rounded bg-gray-700" /></div>
              <div className="ml-2 h-1 w-full rounded bg-gray-200" />
            </div>
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="flex items-center gap-1"><div className="h-2 w-1 rounded bg-[#e05a1a]" /><div className="h-1 w-8 rounded bg-gray-700" /></div>
              <div className="ml-2 flex gap-1"><div className="h-2 w-5 rounded bg-[#fef0e8] border border-[#e05a1a]" /></div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Centered, ultra-clean monochrome',
    accentColor: '#888',
    defaultColors: { accent: '#888888', secondary: '#888888' },
    hasSecondary: false,
    thumbnail: (
      <div className="flex h-full flex-col items-center gap-1 p-2">
        <div className="h-2 w-20 rounded bg-gray-700 font-light tracking-widest" />
        <div className="h-1 w-12 rounded bg-gray-400" />
        <div className="flex gap-1 mt-0.5">
          {[1,2,3].map(i => <div key={i} className="h-1 w-5 rounded bg-gray-300" />)}
        </div>
        <div className="w-full border-t border-gray-300 mt-1" />
        <div className="self-start h-1 w-10 rounded bg-gray-300 mt-0.5" />
        {[1,2].map(i => <div key={i} className="w-full h-1 rounded bg-gray-200" />)}
        <div className="w-full border-t border-gray-200 mt-0.5" />
        <div className="self-start h-1 w-10 rounded bg-gray-300 mt-0.5" />
        <div className="w-full h-1 rounded bg-gray-200" />
      </div>
    ),
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Dark header strip with accent bar',
    accentColor: '#c0392b',
    defaultColors: { accent: '#c0392b', secondary: '#2c3e50' },
    hasSecondary: true,
    thumbnail: (
      <div className="flex h-full flex-col">
        <div className="bg-[#2c3e50] p-1.5">
          <div className="h-2 w-16 rounded bg-white/90" />
          <div className="mt-0.5 h-1 w-10 rounded bg-white/50" />
        </div>
        <div className="bg-[#c0392b] px-1.5 py-0.5 flex gap-2">
          {[1,2,3].map(i => <div key={i} className="h-1 w-6 rounded bg-white/60" />)}
        </div>
        <div className="flex-1 p-1.5 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <div className="h-1 w-10 rounded bg-[#2c3e50]" />
            <div className="flex-1 h-px bg-[#c0392b]" />
          </div>
          {[1,2].map(i => <div key={i} className="h-1 w-full rounded bg-gray-200" />)}
          <div className="flex items-center gap-1 mt-0.5">
            <div className="h-1 w-8 rounded bg-[#2c3e50]" />
            <div className="flex-1 h-px bg-[#c0392b]" />
          </div>
          {[1].map(i => <div key={i} className="h-1 w-full rounded bg-gray-200" />)}
        </div>
      </div>
    ),
  },
]

export const THEME_COMPONENTS: Record<string, React.ComponentType<{ data: ResumeData; colors: ThemeColors }>> = {
  classic: ClassicTheme,
  ocean: OceanTheme,
  sidebar: SidebarTheme,
  bold: BoldTheme,
  minimal: MinimalTheme,
  executive: ExecutiveTheme,
}
