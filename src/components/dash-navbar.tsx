import { SidebarTrigger } from '@/components/ui/sidebar'
import { UserMenu } from './user-menu'
import ThemeSwitch from '@/components/theme-switch'

export default async function DashNavBar() {
  return (
    <section>
      <div className="flex justify-between gap-4 p-4 pl-0">
        <div>
          <SidebarTrigger />
        </div>
        <div className="flex items-center gap-5">
          <ThemeSwitch />
          <UserMenu />
        </div>
      </div>
    </section>
  )
}
