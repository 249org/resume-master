'use client'

import { Hammer, Search, Settings, FileText } from '@/components/icons'
import { usePathname } from 'next/navigation'
import { ChevronRight, FileText as FileTextLogo } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Credit from './credit'
import { useSession } from '@/lib/auth-client'
import Link from 'next/link'

type SubItem =
  | { title: string; url: string }
  | { title: string; url: string; items: { title: string; url: string }[] }

type NavItem =
  | { title: string; url: string; icon: React.ComponentType<{ className?: string }> }
  | {
      title: string
      url: string
      icon: React.ComponentType<{ className?: string }>
      items: SubItem[]
    }

export function AppSidebar() {
  const userId = useSession().data?.user?.id ?? ''
  const pathname = usePathname()
  const { state: sidebarState } = useSidebar()

  const navMain: NavItem[] = [
    { title: 'My Resumes', url: `/users/${userId}/resumes`, icon: FileText },
    { title: 'Resume Builder', url: `/users/${userId}/resume-builder`, icon: Hammer },
    { title: 'Analyze resume', url: `/users/${userId}/job-match`, icon: Search },
    {
      title: 'Settings',
      url: `/users/${userId}/settings`,
      icon: Settings,
      items: [
        { title: 'Account', url: `/users/${userId}/settings` },
        { title: 'Billing', url: `/users/${userId}/settings/billing` },
        { title: 'Update payment', url: `/users/${userId}/settings/billing/update` },
        {
          title: 'Manage subscription',
          url: `/users/${userId}/settings/billing/manage`,
          items: [
            { title: 'Upgrade plan', url: `/users/${userId}/settings/billing/manage/upgrade` },
            { title: 'Cancel subscription', url: `/users/${userId}/settings/billing/manage/cancel` },
          ],
        },
      ],
    },
  ]

  const isSettingsOpen = pathname.includes('settings')

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href={userId ? `/users/${userId}/resume-builder` : '/'}
          className="flex items-center gap-3 rounded-lg bg-primary/15 px-3 py-2.5 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-colors hover:bg-primary/25 focus-visible:ring-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2.5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary [&_svg]:block [&_svg]:size-5">
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
                const activePrimary =
                  'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:[&_svg]:text-primary-foreground'

                if ('items' in item && item.items.length > 0) {
                  const isCollapsed = sidebarState === 'collapsed'
                  if (isCollapsed) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <SidebarMenuButton tooltip={item.title}>
                              <item.icon className="size-4 shrink-0" />
                              <span className="truncate whitespace-nowrap group-data-[collapsible=icon]:hidden">
                                {item.title}
                              </span>
                              <ChevronRight className="ml-auto shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                            </SidebarMenuButton>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            side="right"
                            align="start"
                            sideOffset={8}
                            className="min-w-[11rem]"
                          >
                            {item.items.map((subItem) => {
                              if ('items' in subItem && subItem.items?.length) {
                                return (
                                  <DropdownMenuSub key={subItem.title}>
                                    <DropdownMenuSubTrigger>
                                      {subItem.title}
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                      {subItem.items.map((nested) => (
                                        <DropdownMenuItem key={nested.title} asChild>
                                          <Link
                                            href={nested.url}
                                            className={pathname === nested.url ? 'bg-accent' : undefined}
                                          >
                                            {nested.title}
                                          </Link>
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                )
                              }
                              return (
                                <DropdownMenuItem key={subItem.title} asChild>
                                  <Link
                                    href={subItem.url}
                                    className={pathname === subItem.url ? 'bg-accent' : undefined}
                                  >
                                    {subItem.title}
                                  </Link>
                                </DropdownMenuItem>
                              )
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    )
                  }
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={isSettingsOpen}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip={item.title}>
                            <item.icon className="size-4 shrink-0" />
                            <span className="truncate whitespace-nowrap group-data-[collapsible=icon]:hidden">
                              {item.title}
                            </span>
                            <ChevronRight className="ml-auto shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => {
                              if ('items' in subItem && subItem.items?.length) {
                                const isManageOpen = pathname.includes(subItem.url)
                                return (
                                  <SidebarMenuSubItem key={subItem.title}>
                                    <Collapsible
                                      defaultOpen={isManageOpen}
                                      className="group/manage"
                                    >
                                      <CollapsibleTrigger asChild>
                                        <SidebarMenuSubButton
                                          className="flex w-full cursor-pointer items-center gap-2"
                                          isActive={pathname === subItem.url}
                                        >
                                          <span>{subItem.title}</span>
                                          <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]/manage:rotate-90" />
                                        </SidebarMenuSubButton>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <SidebarMenuSub>
                                          {subItem.items.map((nested) => (
                                            <SidebarMenuSubItem key={nested.title}>
                                              <SidebarMenuSubButton
                                                asChild
                                                isActive={pathname === nested.url}
                                                className={activePrimary}
                                              >
                                                <Link href={nested.url}>
                                                  <span>{nested.title}</span>
                                                </Link>
                                              </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                          ))}
                                        </SidebarMenuSub>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  </SidebarMenuSubItem>
                                )
                              }
                              return (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={pathname === subItem.url}
                                    className={activePrimary}
                                  >
                                    <Link href={subItem.url}>
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  )
                }
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      isActive={pathname === item.url}
                      className={activePrimary}
                    >
                      <Link href={item.url}>
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
      <SidebarFooter>
        <Credit />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
