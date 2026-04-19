import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  return pageMetadata({
    title: 'Settings',
    description:
      'Manage your Resume Master profile, notifications, appearance, and account preferences.',
    path: `/users/${id}/settings`,
    noIndex: true,
  })
}

export default function SettingsSectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
