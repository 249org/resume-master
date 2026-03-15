'use client'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_TEXT_LENGTH = 50_000
const PDFJS_VERSION = '5.5.207'
const PDFJS_CDN = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}`

export type ExtractResult = { ok: true; text: string } | { ok: false; error: string }

export function checkFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `File is too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`
  }
  const ext = file.name.split('.').pop()?.toLowerCase()
  const type = file.type?.toLowerCase()
  const isPdf = ext === 'pdf' || type === 'application/pdf'
  const isDocx =
    ext === 'docx' ||
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  if (!isPdf && !isDocx) {
    return 'Please upload a PDF or DOCX file.'
  }
  return null
}

function truncateText(text: string): string {
  const t = text.trim()
  if (t.length <= MAX_TEXT_LENGTH) return t
  return t.slice(0, MAX_TEXT_LENGTH) + '\n\n[Text truncated for analysis.]'
}

export async function extractTextFromFile(file: File): Promise<ExtractResult> {
  const err = checkFile(file)
  if (err) return { ok: false, error: err }

  const ext = file.name.split('.').pop()?.toLowerCase()
  const type = file.type?.toLowerCase()
  const isPdf = ext === 'pdf' || type === 'application/pdf'

  if (isPdf) {
    return extractFromPdf(file)
  }
  return extractFromDocx(file)
}

// ---------------------------------------------------------------------------
// PDF – load pdfjs-dist from CDN at runtime, bypassing the bundler entirely.
// This avoids Turbopack/webpack chunking issues with the large pdfjs bundle.
// ---------------------------------------------------------------------------

interface PdfjsLib {
  getDocument(params: { data: ArrayBuffer }): { promise: Promise<PdfDoc> }
  GlobalWorkerOptions: { workerSrc: string }
}

interface PdfDoc {
  numPages: number
  getPage(n: number): Promise<PdfPage>
}

interface PdfPage {
  getTextContent(): Promise<{ items: Array<{ str?: string }> }>
}

let pdfjsCached: PdfjsLib | null = null

async function loadPdfJs(): Promise<PdfjsLib> {
  if (pdfjsCached) return pdfjsCached

  // Dynamic import from CDN – the /* webpackIgnore */ comment prevents
  // webpack/Turbopack from trying to bundle this URL.
  const mod = await import(
    /* webpackIgnore: true */
    `${PDFJS_CDN}/build/pdf.min.mjs`
  )

  const lib = mod as unknown as PdfjsLib
  lib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/build/pdf.worker.min.mjs`
  pdfjsCached = lib
  return lib
}

async function extractFromPdf(file: File): Promise<ExtractResult> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const pdfjsLib = await loadPdfJs()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    const numPages = pdf.numPages
    const parts: string[] = []
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item) => (typeof item.str === 'string' ? item.str : ''))
        .join(' ')
      parts.push(pageText)
    }
    const text = truncateText(parts.join('\n\n'))
    if (!text || text.length < 50) {
      return {
        ok: false,
        error: 'Could not extract enough text from the PDF. It may be scanned or image-based.',
      }
    }
    return { ok: true, text }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to read PDF'
    return { ok: false, error: message }
  }
}

// ---------------------------------------------------------------------------
// DOCX – mammoth is much smaller and bundles fine
// ---------------------------------------------------------------------------

async function extractFromDocx(file: File): Promise<ExtractResult> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ arrayBuffer })
    const text = truncateText(result.value.trim())
    if (!text || text.length < 50) {
      return { ok: false, error: 'Could not extract enough text from the DOCX.' }
    }
    return { ok: true, text }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to read DOCX'
    return { ok: false, error: message }
  }
}
