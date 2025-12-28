import { auth } from '@/lib/auth'
import { UserMenu } from './user-menu'
import ThemeSwitch from '@/components/theme-switch'
import { headers } from 'next/headers'

export default async function NavBar() {
  const session = await auth.api?.getSession({
    headers: await headers(),
  })
  return (
    <section>
      <div className="flex items-center justify-between gap-4 p-4">
        <div className="flex gap-5">
          <h1 className="text-secondary text-4xl font-bold">
            Welcome back, {session?.user.name.split(' ')[0]}
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
