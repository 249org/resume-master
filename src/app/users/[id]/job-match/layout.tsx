import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  return pageMetadata({
    title: 'Job match & ATS analysis',
    description:
      'Upload a job description, match your resume to the role, and get an ATS-style report with actionable fixes.',
    path: `/users/${id}/job-match`,
    noIndex: true,
  })
}

export default function JobMatchSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
