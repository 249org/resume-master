import type { Metadata } from 'next'

/** Public-facing site name (titles, Open Graph, JSON-LD). */
export const siteConfig = {
  name: 'Resume Master',
  /** Short tagline for OG / hero-adjacent copy. */
  tagline: 'Beat the ATS. Land the interview.',
  description:
    'Free ATS resume scan and a manual resume builder—see how your resume reads to applicant tracking systems, then refine it without paid APIs.',
  /** Relative path; resolved with metadataBase in root layout. */
  ogImagePath: '/opengraph-image',
  keywords: [
    'ATS resume checker',
    'applicant tracking system',
    'resume optimization',
    'resume builder',
    'job search',
    'ATS score',
  ],
} as const

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    process.env.BASE_URL?.replace(/\/$/, '') ||
    'http://localhost:3000'
  return raw
}

type PageMetaOptions = {
  title: string
  description: string
  /** Path only, e.g. `/pricing` */
  path: string
  /** Use for authenticated or redirect-only routes. */
  noIndex?: boolean
}

export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: PageMetaOptions): Metadata {
  const url = `${getSiteUrl()}${path === '/' ? '' : path}`
  return {
    title,
    description,
    ...(noIndex ? {} : { alternates: { canonical: path } }),
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: 'website',
      url,
      siteName: siteConfig.name,
      title,
      description,
      locale: 'en_US',
      images: [
        {
          url: siteConfig.ogImagePath,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} — ${title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteConfig.ogImagePath],
    },
  }
}
