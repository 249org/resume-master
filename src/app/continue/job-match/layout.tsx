import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Continue to job match',
  description:
    'Resume Master is opening your job match workspace with any pending ATS analysis.',
  path: '/continue/job-match',
  noIndex: true,
})

export default function ContinueJobMatchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
