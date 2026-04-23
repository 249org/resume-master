import type { Education, Experience } from "@/app/users/[id]/resume-builder/resume-themes"

export type ParsedResumeFromText = {
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
  /** True when we fell back to putting most of the CV in the bio (messy/flat PDFs). */
  usedFullTextFallback: boolean
}

const EMAIL_RE = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/gi
const LINKEDIN_RE =
  /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[\w%\-]+\/?/gi
const PHONE_RE =
  /(\+?\d{1,3}[\s.-])?(?:\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}|\d{10,})/g
const LOOSE_PHONE = /\b\(?\d{3}\)?\s*[\-–.]?\s*\d{3}\s*[\-–.]?\s*\d{4}\b/g

const DATE_RANGE_LINE =
  /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*\s+)?\d{4}|\b20\d{2}/i
const RANGE_DASH = /\s[–—\-]\s|\s+to\s+|\s+-\s+/i

/** Full line match after normalize — allows bullets, numbers, colons, markdown */
function matchSectionType(normalized: string): "bio" | "experiences" | "education" | "skills" | null {
  const s = normalized
  if (s.length < 2 || s.length > 90) {
    return null
  }
  if (s.includes(".") && s.length > 62) {
    return null
  }
  if (
    /^(?:(?:professional|career|qualifications?)\s+)?(?:summary|profile|objective|overview|about|highlights?)$/i.test(
      s
    ) ||
    /^(?:personal\s+)?profile$/i.test(s)
  ) {
    return "bio"
  }
  if (
    /^(?:(?:work|relevant|professional|key|selected|recent|previous)\s+)?(?:employment|work)?\s*experience$|^career(\s+history)?$|^employment(\s+history)?$|^experience$|^work\s+history$/i.test(
      s
    ) ||
    /^relevant\s+projects$/i.test(s)
  ) {
    return "experiences"
  }
  if (
    /^(?:academic|educational)?\s*(?:background|qualifications?|history)?$|^education$|^academics$|^academic$|^university$|^universities$|^qualifications$|^qualification$/i.test(
      s
    )
  ) {
    return "education"
  }
  if (
    /^(?:(?:technical|core|key|relevant|computer|it|soft)\s+)?(?:skills?|expertise|competenc(?:y|ies))$/i.test(
      s
    ) ||
    /^core\s+competencies$|^tool(?:s|kit)?$|^languages?$|^stack$/i.test(s)
  ) {
    return "skills"
  }
  if (
    /^(?:\d+\.?\s*)?experience\.?$/i.test(s) &&
    s.length < 20
  ) {
    return "experiences"
  }
  if (/^(?:\d+\.?\s*)?education\.?$/i.test(s) && s.length < 20) {
    return "education"
  }
  if (/^(?:\d+\.?\s*)?skills?\.?$/i.test(s) && s.length < 18) {
    return "skills"
  }
  return null
}

function normalizeLineForSection(line: string): string {
  return line
    .replace(/^\*+|#+|\*+$/g, "")
    .replace(/^\d+[\.\)\-:]\s*/, "")
    .replace(/^[[(]?\d+[\].)]\s*/, "")
    .replace(/^[-•*▪·]+\s*/u, "")
    .replace(/\s*:+\s*$/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
}

/** If PDF squashed the CV into few lines, insert breaks before obvious section words. */
function ensureNewlinesBeforeSectionKeywords(text: string): string {
  if (text.split("\n").length >= 7 || text.length < 200) return text
  return text
    .replace(
      /([a-z.!?0-9)%])([ \t]{1,2})((?:(?:Relevant|Key|Work|Employment|Professional|Career)\s+)(?:History|Experience)|(?:Employment|Work)\s+History|Experience)\b/gi,
      "$1\n\n$3"
    )
    .replace(
      /([a-z.!?0-9)%])([ \t]{1,2})((?:Academic|Educational|Higher)\s+)?(Education|Qualifications)\b/gi,
      "$1\n\n$4"
    )
    .replace(
      /([a-z.!?0-9)%])([ \t]{1,2})((?:Core|Key|Relevant|Technical|Professional|Computer)\s+)?(Skills?|Competencies)\b/gi,
      (all, a, _s, pfx, w) => {
        if (/\b(?:soft|people|communication|Java|Python)\s+skills?\b/i.test(all)) return all
        return `${a}\n\n${(pfx || "") + w}`
      }
    )
    .replace(
      /([a-z.!?0-9)%])([ \t]{1,2})((?:(?:Professional|Executive|Personal|Career)\s+)?(?:Summary|Profile|Overview)|Career\s+Objectives?)\b/gi,
      "$1\n\n$3"
    )
}

let idCounter = 0
function nextId() {
  idCounter += 1
  return Date.now() + idCounter
}

function stripUrlLike(line: string): string {
  return line
    .replace(EMAIL_RE, " ")
    .replace(LINKEDIN_RE, " ")
    .replace(PHONE_RE, " ")
    .trim()
}

function extractContacts(text: string) {
  const email = (text.match(EMAIL_RE)?.[0] ?? "").toLowerCase() || ""
  const liMatch = text.match(LINKEDIN_RE)
  const linkedin = liMatch
    ? liMatch[0].replace(/^https?:\/\/(www\.)?/i, "https://")
    : ""
  let phone = ""
  for (const re of [PHONE_RE, LOOSE_PHONE]) {
    const m = text.match(re)
    if (m?.[0] && m[0].length >= 10) {
      phone = m[0].trim()
      break
    }
  }
  return { email, phone, linkedin }
}

function isProbableHeaderLine(line: string): boolean {
  const s = line.trim()
  if (s.length < 2 || s.length > 80) return false
  if (matchSectionType(normalizeLineForSection(s))) return true
  if (/^#{1,3}\s+/.test(s) || /^\*+\s+\*?/.test(s)) return /experience|education|skill|summary|profile/i.test(s)
  if (/^[A-Z][A-Z\s&/\-:]{1,50}$/u.test(s) && s.length < 52) {
    if (/EXPERIENCE|EDUCATION|SKILLS|SUMMARY|PROFILE|EMPLOYMENT|QUALIFICATION/i.test(s)) return true
  }
  return false
}

type Section = "preamble" | "bio" | "experiences" | "education" | "skills" | "other"

function refineSegments(lines: string[]): { section: Section; text: string }[] {
  const segs: { section: Section; text: string }[] = []
  let cur: Section = "preamble"
  const buf: string[] = []
  const flush = () => {
    if (buf.length) {
      segs.push({
        section: cur,
        text: buf
          .join("\n")
          .replace(/\n{3,}/g, "\n\n")
          .trim(),
      })
      buf.length = 0
    }
  }
  for (const line of lines) {
    const l = line.trim()
    if (!l) {
      if (buf.length) buf.push("")
      continue
    }
    const n = normalizeLineForSection(l)
    const sec = matchSectionType(n)
    if (sec) {
      flush()
      cur = sec
      continue
    }
    if (isProbableHeaderLine(l) && n.length < 50) {
      if (/educ|qualif|academic/i.test(n)) {
        flush()
        cur = "education"
        continue
      }
      if (/exper|work|employ|project|position|career|history|intern/i.test(n)) {
        flush()
        cur = "experiences"
        continue
      }
      if (/skill|competen|expert|technolog|stack|langua|tool/i.test(n)) {
        flush()
        cur = "skills"
        continue
      }
      if (/summary|profile|objective|overview|about|highlight/i.test(n)) {
        flush()
        cur = "bio"
        continue
      }
      flush()
      cur = "other"
      continue
    }
    buf.push(l)
  }
  flush()
  if (!segs.length) segs.push({ section: "preamble", text: lines.join("\n") })
  return segs
}

function joinSection(
  segs: { section: Section; text: string }[],
  section: Section
): string {
  return segs
    .filter((s) => s.section === section)
    .map((s) => s.text)
    .filter(Boolean)
    .join("\n\n")
}

const DATE_IN_LINE = /(?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*\s+)?\d{4}|\b20\d{2}/i

function parseDateRangeInText(block: string): { start: string; end: string; rest: string } {
  const m = block.match(
    /((?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*\s+)?\d{4}|\b20\d{2})\s*[–—\-]\s*(Present|Current|Now|Today|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*\s+)?\d{4})/i
  )
  if (m) {
    const i = m.index ?? 0
    const start = m[1]!.trim()
    const end = m[2]!.trim()
    const rest = (block.slice(0, i) + block.slice(i + m[0]!.length)).replace(
      /\n{3,}/g,
      "\n\n"
    )
    return { start, end, rest: rest.trim() }
  }
  return { start: "", end: "", rest: block }
}

function parseExperienceBlock(text: string): Experience | null {
  const t = text.trim()
  if (t.length < 6) return null
  const { start, end, rest } = parseDateRangeInText(t)
  const lines = rest
    .split("\n")
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean)
  if (!lines.length) return null
  const head = lines[0]!
  const second = lines[1] || ""
  let title = head
  let company = ""
  let location = ""
  const at = /\s+at\s+(.+)$/i.exec(head)
  const pipe = head.split(/\s*\|\s*/)
  if (at) {
    title = head.slice(0, at.index).trim()
    const restC = at[1]!
    if (restC.includes(",")) {
      const p = restC.indexOf(",")
      company = restC.slice(0, p).trim()
      location = restC.slice(p + 1).trim()
    } else {
      company = restC.trim()
    }
  } else if (pipe.length >= 2) {
    title = pipe[0]!.trim()
    company = pipe[1]!.split(/\s*[|–—]\s*/)[0]!.replace(/\s*\(.+$/, "").trim()
  } else if (head.includes(",") && !DATE_RANGE_LINE.test(head)) {
    const p = head.indexOf(",")
    const left = head.slice(0, p).trim()
    const right = head.slice(p + 1).trim()
    if (right.split(" ").length <= 8) {
      title = left
      if (right.match(/\b(Inc|LLC|Corp|Ltd|LLP)\b/i)) {
        company = right
      } else if (right.split(" ").length <= 4) {
        title = head
        company = second || ""
      } else {
        company = right
      }
    }
  }
  if (!company && second) {
    if (DATE_IN_LINE.test(second) && RANGE_DASH.test(second)) {
      /* single-line title; company below */
    } else {
      company = second.split(/\s*[|–—]\s*/)[0]!.split(/\s+\(/)[0]!.trim()
    }
  }
  const bodyLines: string[] = []
  for (const ln of lines) {
    if (ln === head || (company && ln === second)) continue
    if (DATE_IN_LINE.test(ln) && RANGE_DASH.test(ln) && !bodyLines.length) continue
    if (ln === second && company) continue
    bodyLines.push(ln)
  }
  if (!company) {
    const m = head.match(
      /^(.*?)[\s–—|]+\s*([^,|–—]+?)(?:\s*[|,]\s*([^,]+))?(?:$|\n)/i
    )
    if (m) {
      title = m[1]!.trim()
      company = m[2]!.replace(/\s*\(.+$/, "").trim()
      if (m[3]) location = m[3]!.trim()
    }
  }
  const description = bodyLines
    .filter(
      (l) =>
        l !== company &&
        l !== title &&
        l !== second &&
        !(DATE_IN_LINE.test(l) && l.length < 40 && RANGE_DASH.test(l))
    )
    .join("\n")
  return {
    id: nextId(),
    title: title || head.slice(0, 200),
    company: company || (start || end ? "—" : head.slice(0, 40)),
    location,
    startDate: start,
    endDate: end,
    description,
  }
}

function splitIntoExperienceEntries(section: string): string[] {
  const raw = section.replace(/\r/g, "\n")
  const blocks: string[] = []
  for (const para of raw.split(/\n{2,}/)) {
    if (para.trim().length > 5) blocks.push(para.trim())
  }
  if (blocks.length <= 1) {
    const lines = section.split("\n")
    const chunk: string[] = []
    for (const line of lines) {
      if (!line.trim()) {
        if (chunk.length) {
          blocks.push(chunk.join("\n"))
          chunk.length = 0
        }
        continue
      }
      if (
        DATE_IN_LINE.test(line) &&
        RANGE_DASH.test(line) &&
        chunk.length >= 1 &&
        /.{6,}/.test(chunk[0]!)
      ) {
        if (chunk.length) blocks.push(chunk.join("\n"))
        chunk.length = 0
        chunk.push(line)
        continue
      }
      chunk.push(line)
    }
    if (chunk.length) blocks.push(chunk.join("\n"))
  }
  return blocks
}

function parseExperiencesFromSection(section: string): Experience[] {
  const entries = splitIntoExperienceEntries(section)
  const out: Experience[] = []
  for (const e of entries) {
    const p = parseExperienceBlock(e)
    if (p) out.push(p)
  }
  if (!out.length && section.length > 20) {
    const p = parseExperienceBlock(section)
    if (p) out.push(p)
  }
  return out
}

/** When there are no "Experience" section headers, split on date ranges. */
function inferExperiencesFromUnstructured(_preamble: string, full: string): Experience[] {
  const out: Experience[] = []
  for (const para of full.split(/\n{2,}/)) {
    const p = para.trim()
    if (p.length < 20) continue
    if (DATE_IN_LINE.test(p) && RANGE_DASH.test(p)) {
      const e = parseExperienceBlock(p)
      if (e && (e.startDate || e.endDate)) out.push(e)
    }
  }
  if (out.length) return out
  return parseExperiencesFromSection(full).filter((e) => e.startDate || e.endDate)
}

const EDU_HINT =
  /(?:Bachelor|B\.?S\.?c?|B\.?A\.?|Master|M\.?S\.?|M\.?B\.?A\.?|Ph\.?D|Doctor|Associate|Diploma|Certificate|B\.?Sc|B\.?E\.?|B\.?Tech|M\.?Eng)/i
const SCHOOL_HINT =
  /(University|College|Institute|Polytechnic|School|Academy)(?:\s+of\s+[\w\s]+)?/i

function inferEducationFromText(text: string): Education[] {
  const out: Education[] = []
  for (const c of text.split(/\n{2,}/)) {
    const t = c.trim()
    if (t.length < 15 || t.length > 500) continue
    if (!EDU_HINT.test(t) && !SCHOOL_HINT.test(t)) continue
    if (/^\d+[\s.]*years?\s+(?:at|with)/i.test(t)) continue
    const lines = t.split("\n").map((l) => l.trim()).filter(Boolean)
    const yearM = t.match(/\b(20\d{2}|19\d{2})\b/g)
    const year = (yearM && yearM[yearM.length - 1]) || ""
    const schoolMatch = t.match(SCHOOL_HINT)
    let school = schoolMatch
      ? t.slice(
          t.search(SCHOOL_HINT),
          Math.min(t.length, t.search(SCHOOL_HINT) + 80)
        )
      : "—"
    if (lines.length >= 2) {
      const maybeSchool = lines.find((l) => SCHOOL_HINT.test(l)) ?? school
      school = maybeSchool
    }
    const degree = lines[0]!.length < 5 ? t.slice(0, 120) : lines[0]!
    out.push({
      id: nextId(),
      degree: degree.replace(/\s+/g, " ").trim(),
      school: school.replace(/\s+/g, " ").trim().split("\n")[0]!,
      year: year || "",
    })
  }
  return out.slice(0, 6)
}

function inferSkillsFromBlob(text: string): string[] {
  for (const line of text.split("\n")) {
    const l = line.replace(/^[-•*]\s*/, "").trim()
    if (l.length > 20 && l.split(/[,;·]/).length >= 6) {
      return parseSkillsSection(l)
    }
  }
  return []
}

function parseEducationSection(section: string): Education[] {
  const structured = (() => {
    const out: Education[] = []
    const chunks = section.split(/\n{2,}/)
    for (const c of chunks) {
      const lines = c
        .split("\n")
        .map((l) => l.replace(/^[-•*]\s*/, "").trim())
        .filter(Boolean)
      if (!lines.length) continue
      const line0 = lines.join(" ")
      const yearM = line0.match(/\b(20\d{2}|19\d{2})\b/g)
      const year = (yearM && yearM[yearM.length - 1]) || ""
      let school = ""
      let degree = ""
      if (lines.length === 1) {
        const l = line0
        if (l.includes("—") || l.includes("–") || l.includes(" - ")) {
          const parts = l.split(/[—–-]\s*|\s+at\s+/i)
          if (parts.length >= 2) {
            degree = parts[0]!.trim()
            school = parts[1]!.replace(/\b20\d{2}\b.*/, "").trim()
          } else {
            degree = l
          }
        } else {
          degree = l
          const uni = l.match(
            /([A-Z][A-Za-z\s&'.,-]+?(?:University|College|Institute|School|Polytechnic|Academy))/
          )
          if (uni) {
            school = uni[1]!
            degree = l.replace(uni[0]!, "").replace(/^[,;]\s*/, "").trim()
          }
        }
      } else {
        degree = lines[0]!
        school = lines[1]!
      }
      if (degree && degree.length < 3) {
        school = [degree, school].filter(Boolean).join(" — ")
      }
      if (!degree) degree = line0
      if (degree && degree.length < 4 && !year) continue
      out.push({
        id: nextId(),
        degree: degree.replace(/\s+/g, " ").trim() || "Education",
        school: (school || "—").replace(/\s+/g, " ").trim(),
        year: year || "",
      })
    }
    return out
  })()
  if (structured.length) return structured
  return inferEducationFromText(section)
}

function parseSkillsSection(section: string): string[] {
  const t = section.replace(/\n/g, ",")
  const parts = t.split(/[,;|/·]|(?:\s{2,})/)
  const skills = new Set<string>()
  for (const p of parts) {
    const s = p.replace(/^[–•*\-·]\s*/, "").trim()
    if (s.length > 1 && s.length < 60 && /[A-Za-z]/.test(s)) {
      if (!/^\d+(\.\d+)?$/.test(s) && !/years?$/i.test(s)) skills.add(s)
    }
  }
  if (skills.size < 2) {
    for (const line of section.split("\n")) {
      const s = line.replace(/^[-•*]\s*/, "").trim()
      if (s.length > 1 && s.length < 50) skills.add(s)
    }
  }
  return [...skills].slice(0, 40)
}

function truncateBio(s: string, max: number) {
  const t = s.replace(/\n{3,}/g, "\n\n").trim()
  if (t.length <= max) return t
  return t.slice(0, max) + (t.length > max ? "…" : "")
}

function guessNameTitle(preamble: string) {
  const contactFree = extractContacts(preamble)
  let t = preamble
  if (contactFree.email) t = t.replace(EMAIL_RE, " ")
  if (contactFree.linkedin) {
    t = t.replace(
      new RegExp(
        contactFree.linkedin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "gi"
      ),
      " "
    )
  }
  if (contactFree.phone) t = t.replace(PHONE_RE, " ")
  t = t.replace(LINKEDIN_RE, " ")

  const asLines = t.split("\n")
  if (asLines.length === 1 && asLines[0]!.length > 200) {
    t = asLines[0]!.split(/\s{2,}|\s*[|•]\s*/)[0] ?? asLines[0]!
  }

  const lineArr = t
    .split("\n")
    .map((l) => l.trim())
    .filter(
      (l) =>
        l.length > 0 &&
        !EMAIL_RE.test(l) &&
        !LINKEDIN_RE.test(l) &&
        !/linkedin\.com/i.test(l) &&
        !/^\W*phone/i.test(l) &&
        !/^\W*e-?mail/i.test(l) &&
        !/^\W*e-mail/i.test(l) &&
        !/^\W*name\s*:/i.test(l)
    )
  let fullName = ""
  let jobTitle = ""
  let i = 0
  for (; i < lineArr.length; i++) {
    const line = lineArr[i]!
    if (EMAIL_RE.test(line) || /^\d[\d\s\-()]{8,}$/.test(line)) continue
    const wc = line.split(/\s+/).length
    if (wc >= 2 && wc <= 7 && !/@/.test(line) && !DATE_IN_LINE.test(line)) {
      if (!/^\d+[\s%]/.test(line) && !/^\d+[\.)]\s/.test(line)) {
        fullName = line.replace(/^(?:name|applicant|candidate)\s*:\s*/i, "")
        i++
        break
      }
    }
  }
  if (i < lineArr.length) {
    const candidate = lineArr[i]!
    if (
      candidate.length > 0 &&
      candidate.length < 120 &&
      !EMAIL_RE.test(candidate) &&
      !/^[A-Z][A-Z\s]{3,50}$/u.test(candidate)
    ) {
      if (!/^\d+[\.\)]\s/.test(candidate) && !DATE_IN_LINE.test(candidate)) {
        jobTitle = candidate
      }
    }
  }
  if (!fullName && lineArr[0] && lineArr[0]!.length < 100) {
    fullName = lineArr[0]!
  }
  return { fullName, jobTitle }
}

function pickLocation(preamble: string, name: string) {
  const lines = preamble.split("\n").map((l) => l.trim())
  for (const line of lines) {
    if (line.length > 3 && line.length < 100 && /,/.test(line)) {
      if (line === name) continue
      if (
        /[A-Za-z]/.test(line) &&
        !EMAIL_RE.test(line) &&
        !LINKEDIN_RE.test(line)
      ) {
        if (!DATE_IN_LINE.test(line)) {
          if (
            /[A-Z]{2}\s+\d{5}|[A-Z]{2},?\s*[A-Z]/.test(line) ||
            /,\s*[A-Z][a-z]/.test(line)
          ) {
            return line
          }
        }
      }
    }
  }
  return ""
}

function scoreParse(r: {
  fullName: string
  jobTitle: string
  bio: string
  email: string
  experiences: Experience[]
  education: Education[]
  skills: string[]
}) {
  let s = 0
  if (r.email) s += 2
  if (r.fullName) s += 1
  if (r.jobTitle) s += 1
  if (r.bio && r.bio.length > 40) s += 2
  s += r.experiences.length * 2
  s += r.education.length
  s += r.skills.length > 2 ? 2 : r.skills.length > 0 ? 1 : 0
  return s
}

export function parseResumeTextToForm(raw: string): ParsedResumeFromText {
  idCounter = 0
  let text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\t/g, " ")
  text = ensureNewlinesBeforeSectionKeywords(text)

  const { email, phone, linkedin } = extractContacts(text)
  const lines = text.split("\n")
  const segs = refineSegments(lines)
  const preambleSeg = segs.find((s) => s.section === "preamble")
  const experienceText = joinSection(segs, "experiences")
  const educationText = joinSection(segs, "education")
  const skillsText = joinSection(segs, "skills")

  const preamble = (preambleSeg?.text ?? text.slice(0, 8000)).trim()
  const { fullName, jobTitle } = guessNameTitle(preamble)
  const location = pickLocation(preamble, fullName)

  let bio = joinSection(segs, "bio").trim()
  if (!bio) {
    const preLines = preamble.split("\n").map((l) => l.trim())
    if (preLines.length > 2) {
      const tail = preLines
        .slice(2)
        .join("\n")
        .split(/\n{2,}/)[0]!
        .trim()
      if (
        tail &&
        tail.length < 1600 &&
        !/^\s*(experience|work history)\b/i.test(tail)
      ) {
        bio = tail
      }
    }
  }
  bio = truncateBio(
    stripUrlLike(
      bio
        .split("\n")
        .filter((l) => !isProbableHeaderLine(l))
        .join("\n")
    ),
    1800
  )

  if (!bio && !experienceText) {
    const preOnly = preambleSeg?.text
    if (preOnly && preOnly.length < 2000) {
      const cut = preOnly.split("\n\n")[0] ?? preOnly
      if (cut && cut.length < 1500) bio = truncateBio(cut, 800)
    }
  }

  if (!bio) bio = ""
  if (bio && experienceText && bio.length > 1500) {
    const firstBlock = bio.split(/\n{2,}/)[0] ?? bio
    bio = truncateBio(firstBlock, 1200) || ""
  }

  let experiences = experienceText
    ? parseExperiencesFromSection(experienceText)
    : []
  let education = educationText ? parseEducationSection(educationText) : []
  let skills = skillsText ? parseSkillsSection(skillsText) : []

  if (!experiences.length) {
    const inferred = inferExperiencesFromUnstructured(preamble, text)
    if (inferred.length) experiences = inferred
  }
  if (!education.length) {
    const inferred = inferEducationFromText(
      [preamble, educationText, joinSection(segs, "other")].filter(Boolean).join("\n\n")
    )
    if (inferred.length) education = inferred
  }
  if (skills.length < 2) {
    const fromBlob = inferSkillsFromBlob(
      [joinSection(segs, "preamble"), skillsText].join("\n\n")
    )
    if (fromBlob.length) skills = fromBlob
  }

  const candidate: ParsedResumeFromText = {
    fullName,
    jobTitle,
    email,
    phone,
    location: location.replace(/\s+/g, " ").trim(),
    linkedin,
    bio,
    education,
    skills,
    experiences,
    usedFullTextFallback: false,
  }

  const hasSectionStructure = Boolean(
    experienceText || educationText || skillsText || joinSection(segs, "bio")
  )
  const noExtracted =
    candidate.experiences.length === 0 &&
    candidate.education.length === 0 &&
    candidate.skills.length < 2
  const bioLooksEmpty = candidate.bio.length < 100
  const needsFallback =
    text.length > 200 &&
    noExtracted &&
    bioLooksEmpty &&
    (!hasSectionStructure || scoreParse(candidate) < 3)

  if (needsFallback) {
    const cap = 12_000
    candidate.bio = truncateBio(text.trim(), cap)
    if (!candidate.experiences.length) {
      const lastTry = parseExperiencesFromSection(text)
      if (lastTry.length) candidate.experiences = lastTry
    }
    candidate.usedFullTextFallback = true
  }

  return candidate
}
