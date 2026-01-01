import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import DashNavBar from '@/components/dash-navbar'

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-5">
        <DashNavBar />
        {children}
      </main>
    </SidebarProvider>
  )
}
