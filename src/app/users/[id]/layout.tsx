import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import DashNavBar from '@/components/dash-navbar'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <DashNavBar />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col px-6 py-5 md:px-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
