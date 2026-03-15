import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import DashNavBar from '@/components/dash-navbar'

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashNavBar />
        <main className="flex-1 p-5">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
