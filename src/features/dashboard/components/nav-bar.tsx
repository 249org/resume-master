'use client'
import { UserMenu } from './user-menu'
import ThemeSwitch from '@/components/theme-switch'
import { useSession } from '@/lib/auth-client'

export default function NavBar() {
  const user = useSession().data?.user.name
  return (
    <section>
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex gap-5">
          <h1 className="text-secondary text-4xl font-bold">
            Welcome back, {user?.split(' ')[0]}
          </h1>
        </div>
        <div className="flex items-center gap-5">
          <ThemeSwitch />
          <UserMenu />
        </div>
      </div>
    </section>
  )
}
