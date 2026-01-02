import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut, Settings, User, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { auth, signOutAction } from '@/lib/auth'
import { headers } from 'next/headers'
import Link from 'next/link'

export async function UserMenu() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const items = [
    {
      title: 'Profile',
      url: `/users/${session?.user.id}/profile`,
      icon: <User className="mr-2 h-4 w-4" />,
    },

    {
      title: 'Setting',
      url: `/users/${session?.user.id}/settings`,
      icon: <Settings className="mr-2 h-4 w-4" />,
    },
    {
      title: 'Billing',
      url: `/users/${session?.user.id}/billing`,
      icon: <CreditCard className="mr-2 h-4 w-4" />,
    },
  ]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-8 w-8 cursor-pointer rounded-full outline-none">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={session?.user.image || ''}
              alt={session?.user.name}
            />
            <AvatarFallback>{session?.user.name.slice()[0]}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">
              {session?.user.name}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {session?.user.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        {items.map((item, index) => (
          <DropdownMenuItem key={index}>
            <Link href={item.url} className="flex">
              {item.icon}
              <span>{item.title}</span>
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-red-600 hover:bg-none focus:text-red-600">
          <form action={signOutAction} className="w-full">
            <Button type="submit" className="w-full cursor-pointer">
              <LogOut className="dark:text-secondary text-secondary-foreground mr-2 h-4 w-4" />

              <span>Log out</span>
            </Button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
