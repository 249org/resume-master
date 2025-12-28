import { AppSidebar } from '@/features/dashboard/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import NavBar from '@/features/dashboard/components/nav-bar'

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 p-5">
        <NavBar />
        {children}
      </main>
    </SidebarProvider>
  )
}
