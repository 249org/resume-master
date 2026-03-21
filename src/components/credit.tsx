'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useSidebar } from '@/components/ui/sidebar'
import { useSidebarUsage } from '@/components/sidebar-usage-provider'
import { useSession } from '@/lib/auth-client'
import Link from 'next/link'

export default function Credit() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'
  const usage = useSidebarUsage()
  const { data } = useSession()
  const userId = data?.user?.id ?? ''

  const label = usage?.displayLabel ?? '—/—'
  const pct =
    usage && usage.totalUnits > 0
      ? Math.min(100, (usage.consumed / usage.totalUnits) * 100)
      : 0

  const checkoutHref = userId
    ? `/users/${userId}/settings/billing/checkout`
    : '/pricing'

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-1.5 rounded-lg border bg-sidebar-accent/50 p-2">
            <div className="flex items-center gap-1">
              <span className="text-sidebar-foreground text-xs font-medium">
                {label}
              </span>
            </div>
            <Progress value={pct} className="h-1.5 w-full min-w-[2rem]" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          Monthly credits {label} · Upgrade or change plan
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Card className="gap-4">
      <CardHeader className="flex items-center justify-between">
        <span className="text-foreground text-sm">Monthly Credits</span>
        <span className="text-secondary">{label}</span>
      </CardHeader>
      <CardContent>
        <Progress value={pct} />
      </CardContent>
      <CardFooter>
        <Button
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground w-full cursor-pointer font-semibold"
          asChild
        >
          <Link href={checkoutHref}>Upgrade Plan</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
