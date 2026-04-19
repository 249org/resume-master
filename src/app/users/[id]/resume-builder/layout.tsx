import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  return pageMetadata({
    title: 'Resume builder',
    description:
      'Build and edit your resume manually in Resume Master—sections, themes, and export to PDF.',
    path: `/users/${id}/resume-builder`,
    noIndex: true,
  })
}

/**
 * Fills the dashboard main region; horizontal inset comes from parent `main` (`p-5`)
 * like other user pages.
 */
export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100dvh-5.5rem)] w-full min-w-0 max-w-full flex-1 flex-col">
      {children}
    </div>
  )
}
