'use client'
import { Hammer, Home, Search, Settings, History } from 'lucide-react'
import { usePathname } from 'next/navigation'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import Credit from './credit'
import { useSession } from '@/lib/auth-client'
import Link from 'next/link'

export function AppSidebar() {
  const userId = useSession().data?.user?.id
  // Menu items.
  const items = [
    {
      title: 'Dashbaord',
      url: `/users/${userId}`,
      icon: Home,
    },
    {
      title: 'Resume Builder',
      url: `/users/${userId}/resume-builder`,
      icon: Hammer,
    },
    {
      title: 'Analyzer History',
      url: `/users/${userId}/analyzer-history`,
      icon: History,
    },
    {
      title: 'Job Match',
      url: `/users/${userId}/job-match`,
      icon: Search,
    },
    {
      title: 'Settings',
      url: `/users/${userId}/settings`,
      icon: Settings,
    },
  ]
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                return (
                  <SidebarMenuItem
                    key={item.title}
                    className={
                      pathname == item.url
                        ? `bg-primary text-secondary hover:bg-primary/90 rounded-lg`
                        : 'hover:bg-sidebar-accent rounded-lg'
                    }
                  >
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span className="">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Credit />
      </SidebarFooter>
    </Sidebar>
  )
}
