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

const SECTION_MATCHERS: {
  key: "bio" | "experiences" | "education" | "skills"
  test: (s: string) => boolean
}[] = [
    {
      key: "bio",
      test: (s) =>
        /^(?:professional\s+)?summary$|^profile$|^about$|^objective$|^career\s+objective$|^qualifications?\s+summary$/i.test(
          s
        ),
    },
    {
      key: "experiences",
      test: (s) =>
        /^(?:work|professional|employment|career)\s+experience$|^employment$|^experience$|^relevant\s+experience$/i.test(
          s
        ),
    },
    {
      key: "education",
      test: (s) =>
        /^education$|^academic(\s+background|s)?$|^university$|^academic(\s+qualifications)?$|^qualifications$|^educational\s+background$/i.test(
          s
        ),
    },
    {
      key: "skills",
      test: (s) =>
        /^(?:technical|core|key|relevant|professional|computer)?\s*skills$|^expertise$|^competenc(?:y|ies)$|^core\s+competencies$|^tools?\s+(&|and|\/)\s*technologies$|^technical\s+proficiencies$|^key\s+skills$/i.test(
          s
        ),
    },
  ]

let idCounter = 0
function nextId() {
  idCounter += 1
  return Date.now() + idCounter
}

function stripUrlLike(line: string): string {
  return line.replace(EMAIL_RE, " ").replace(LINKEDIN_RE, " ").replace(PHONE_RE, " ").trim()
}

function extractContacts(text: string) {
  const email =
    (text.match(EMAIL_RE)?.[0] ?? "").toLowerCase() || ""
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

function isSectionHeaderLine(line: string): boolean {
  const s = line.trim()
  if (s.length < 3 || s.length > 65) return false
  if (s.includes(".") && s.length > 40) return false
  for (const { test } of SECTION_MATCHERS) {
    if (test(s)) return true
  }
  if (/^[A-Z][A-Z\s&/\-]{2,50}$/.test(s) && s.length < 50) {
    if (/^SKILLS$|^EDUCATION$|^EXPERIENCE$/i.test(s)) return true
  }
  return false
}

type Section = "preamble" | "bio" | "experiences" | "education" | "skills" | "other"
function classifySectionLine(line: string): Section {
  const s = line.trim()
  for (const m of SECTION_MATCHERS) {
    if (m.test(s)) {
      if (m.key === "bio") return "bio"
      if (m.key === "experiences") return "experiences"
      if (m.key === "education") return "education"
      if (m.key === "skills") return "skills"
    }
  }
  return "other"
}

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
    const kind = classifySectionLine(l)
    if (kind !== "other") {
      flush()
      cur = kind
      continue
    }
    if (isSectionHeaderLine(l)) {
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
        !/^\W*email/i.test(l) &&
        !/^\W*e-mail/i.test(l)
    )
  let fullName = ""
  let jobTitle = ""
  let i = 0
  for (; i < lineArr.length; i++) {
    const line = lineArr[i]!
    if (EMAIL_RE.test(line) || /^\d[\d\s\-()]+$/.test(line)) continue
    const wc = line.split(/\s+/).length
    if (wc >= 2 && wc <= 6 && !/@/.test(line) && !DATE_RANGE_LINE.test(line)) {
      if (!/^\d+[\s%]/.test(line)) {
        fullName = line
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
      !/^[A-Z\s]{4,50}$/.test(candidate)
    ) {
      jobTitle = candidate
    }
  }
  return { fullName, jobTitle }
}

function pickLocation(preamble: string, name: string) {
  const lines = preamble.split("\n").map((l) => l.trim())
  for (const line of lines) {
    if (line.length > 3 && line.length < 100 && /,/.test(line)) {
      if (line === name) continue
      if (/[A-Z][a-zA-Z]/.test(line) && !EMAIL_RE.test(line) && !LINKEDIN_RE.test(line)) {
        if (!DATE_RANGE_LINE.test(line)) {
          if (/[A-Z]{2}\s+\d{5}|[A-Z]{2},?\s*[A-Z][a-z]+/.test(line) || /,\s*[A-Z][a-z]/.test(line)) {
            return line
          }
        }
      }
    }
  }
  return ""
}

function parseDateRangeInText(block: string): { start: string; end: string; rest: string } {
  const m = block.match(
    /((?:\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*\s+)?\d{4}|\b20\d{2})\s*[–—\-]\s*(Present|Current|Now|Today|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z.]*\s+)?\d{4})/i
  )
  if (m) {
    const i = m.index ?? 0
    const start = m[1]!.trim()
    const end = m[2]!.trim()
    const rest = (block.slice(0, i) + block.slice(i + m[0]!.length)).replace(/\n{3,}/g, "\n\n")
    return { start, end, rest: rest.trim() }
  }
  return { start: "", end: "", rest: block }
}

function parseExperienceBlock(text: string): Experience | null {
  const t = text.trim()
  if (t.length < 8) return null
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
    if (DATE_RANGE_LINE.test(second) || RANGE_DASH.test(second)) {
      // date line, third might be company
    } else {
      company = second.split(/\s*[|–—]\s*/)[0]!.split(/\s+\(/)[0]!.trim()
    }
  }
  const bodyLines: string[] = []
  for (const ln of lines) {
    if (ln === head || (company && ln === second)) continue
    if (DATE_RANGE_LINE.test(ln) && RANGE_DASH.test(ln) && !bodyLines.length) continue
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
        !(DATE_RANGE_LINE.test(l) && l.length < 40 && RANGE_DASH.test(l))
    )
    .join("\n")
  return {
    id: nextId(),
    title: title || head.slice(0, 200),
    company: company || "—",
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
        DATE_RANGE_LINE.test(line) &&
        RANGE_DASH.test(line) &&
        chunk.length >= 1 &&
        /.{10,}/.test(chunk[0]!)
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

function parseEducationSection(section: string): Education[] {
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
    out.push({ id: nextId(), degree: degree.replace(/\s+/g, " ").trim() || "Education", school: (school || "—").replace(/\s+/g, " ").trim(), year: year || "" })
  }
  return out
}

function parseSkillsSection(section: string): string[] {
  const t = section.replace(/\n/g, ",")
  const parts = t.split(/[,;|/]|(?:\s{2,})/)
  const skills = new Set<string>()
  for (const p of parts) {
    const s = p.replace(/^[–•*\-·]\s*/, "").trim()
    if (s.length > 1 && s.length < 60 && /[A-Za-z]/.test(s)) {
      if (!/^\d+(\.\d+)?$/.test(s)) skills.add(s)
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

export function parseResumeTextToForm(raw: string): ParsedResumeFromText {
  idCounter = 0
  const text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\t/g, " ")
  const { email, phone, linkedin } = extractContacts(text)

  const lines = text.split("\n")
  const segs = refineSegments(lines)
  const preambleSeg = segs.find((s) => s.section === "preamble")
  const experienceText = joinSection(segs, "experiences")
  const educationText = joinSection(segs, "education")
  const skillsText = joinSection(segs, "skills")

  const preamble = (preambleSeg?.text ?? text.slice(0, 4000)).trim()
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
      if (tail && tail.length < 1200 && !/^\s*(experience|work history)\b/i.test(tail)) {
        bio = tail
      }
    }
  }
  bio = truncateBio(
    stripUrlLike(
      bio
        .split("\n")
        .filter((l) => !isSectionHeaderLine(l))
        .join("\n")
    ),
    1800
  )

  if (!bio && !experienceText) {
    const preOnly = preambleSeg?.text
    if (preOnly) {
      const p = preOnly
      if (p.length < 2000) {
        const cut = p.split("\n\n")[0] ?? p
        if (cut && cut.length < 1500) bio = truncateBio(cut, 800)
      }
    }
  }

  if (!bio) bio = ""
  if (bio && experienceText && bio.length > 1500) {
    const firstBlock = bio.split(/\n{2,}/)[0] ?? bio
    bio = truncateBio(firstBlock, 1200) || ""
  }

  return {
    fullName,
    jobTitle,
    email,
    phone,
    location: location.replace(/\s+/g, " ").trim(),
    linkedin,
    bio,
    education: educationText ? parseEducationSection(educationText) : [],
    skills: skillsText ? parseSkillsSection(skillsText) : [],
    experiences: experienceText ? parseExperiencesFromSection(experienceText) : [],
  }
}
