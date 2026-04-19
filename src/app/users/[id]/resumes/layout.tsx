import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  return pageMetadata({
    title: 'My resumes',
    description:
      'View, search, download, and manage your saved resumes in Resume Master.',
    path: `/users/${id}/resumes`,
    noIndex: true,
  })
}

export default function ResumesSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
