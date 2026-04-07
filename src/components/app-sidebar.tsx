'use client'

import { Hammer, Search, Settings, FileText } from '@/components/icons'
import { useParams, usePathname } from 'next/navigation'
import { FileText as FileTextLogo } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import Link from 'next/link'

const navMain = [
  { title: 'My Resumes', path: 'resumes', icon: FileText },
  { title: 'Resume Builder', path: 'resume-builder', icon: Hammer },
  { title: 'Analyze resume', path: 'job-match', icon: Search },
  { title: 'Settings', path: 'settings', icon: Settings },
] as const

export function AppSidebar() {
  const params = useParams<{ id: string }>()
  const userId = typeof params?.id === 'string' ? params.id : ''
  const pathname = usePathname()

  const activePrimary =
    'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:[&_svg]:text-primary-foreground'

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href={userId ? `/users/${userId}/resumes` : '/'}
          className="bg-primary/15 text-sidebar-foreground ring-sidebar-ring hover:bg-primary/25 flex items-center gap-3 rounded-lg px-3 py-2.5 outline-hidden transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2.5 focus-visible:ring-2"
        >
          <span className="bg-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg [&_svg]:block [&_svg]:size-5">
            <FileTextLogo className="text-primary-foreground" />
          </span>
          <span className="truncate text-sm font-semibold group-data-[collapsible=icon]:hidden">
            Resume
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navMain.map((item) => {
                const url = `/users/${userId}/${item.path}`
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={
                        pathname === url || pathname.startsWith(`${url}/`)
                      }
                      className={activePrimary}
                    >
                      <Link href={url}>
                        <item.icon className="size-4 shrink-0" />
                        <span className="truncate whitespace-nowrap group-data-[collapsible=icon]:hidden">
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
