import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Create account',
  description:
    'Create a Resume Master account to save ATS reports, build resumes, and track job-match analyses.',
  path: '/sign-up',
})

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
