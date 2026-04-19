import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  title: 'Sign in',
  description:
    'Sign in to Resume Master to run ATS resume scans, manage resumes, and use the manual resume builder.',
  path: '/sign-in',
})

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
