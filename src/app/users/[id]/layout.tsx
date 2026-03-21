import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import DashNavBar from '@/components/dash-navbar'
import { SidebarUsageProvider } from '@/components/sidebar-usage-provider'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getCustomerStateForUser } from '@/lib/polar/billing-data'
import { mapCustomerStateToUsageSnapshot } from '@/lib/polar/usage-snapshot'

export default async function layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth.api.getSession({ headers: await headers() })

  let usage = null
  if (session?.user.id === id) {
    const stateResult = await getCustomerStateForUser(id)
    if (stateResult.status === 'ok') {
      usage = mapCustomerStateToUsageSnapshot(stateResult.state)
    }
  }

  return (
    <SidebarUsageProvider value={usage}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashNavBar />
          <main className="flex-1 p-5">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SidebarUsageProvider>
  )
}
