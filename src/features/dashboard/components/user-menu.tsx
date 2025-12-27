'use client'
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
import { signOut, useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

export function UserMenu() {
  const router = useRouter()
  const session = useSession().data?.user
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative h-8 w-8 cursor-pointer rounded-full outline-none">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="@user" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">{session?.name}</p>
            <p className="text-muted-foreground text-xs leading-none">
              {session?.email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Billing</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-red-600 focus:text-red-600">
          <Button
            onClick={() =>
              signOut({
                fetchOptions: {
                  onSuccess: () => {
                    router.push('/sign-in')
                  },
                },
              })
            }
            className="cursor-pointer"
          >
            <LogOut className="text-secondary mr-2 h-4 w-4" />

            <span>Log out</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
