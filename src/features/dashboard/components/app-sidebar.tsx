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

// Menu items.
const items = [
  {
    title: 'Dashbaord',
    url: '/dashboard',
    icon: Home,
  },
  {
    title: 'Resume Builder',
    url: '/resume-builder',
    icon: Hammer,
  },
  {
    title: 'Analyzer History',
    url: '/analyzer-history',
    icon: History,
  },
  {
    title: 'Job Match',
    url: '/job-match',
    icon: Search,
  },
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem
                  key={item.title}
                  className={
                    pathname == item.url
                      ? `bg-primary text-secondary hover:bg-primary/90 rounded-lg`
                      : 'hover:bg-sidebar-accent rounded-lg'
                  }
                >
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span className="">{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
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
