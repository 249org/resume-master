import { AppSidebar } from '@/features/dashboard/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import NavBar from '@/features/dashboard/components/nav-bar'
import Providers from '../providers'

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Providers>
        <AppSidebar />
        <main className="flex-1 p-5">
          <NavBar />
          {children}
        </main>
      </Providers>
    </SidebarProvider>
  )
}
