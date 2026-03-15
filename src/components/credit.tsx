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

export default function Credit() {
  const { state } = useSidebar()
  const isCollapsed = state === 'collapsed'

  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col items-center gap-1.5 rounded-lg border bg-sidebar-accent/50 p-2">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium text-sidebar-foreground">8/10</span>
            </div>
            <Progress value={80} className="h-1.5 w-full min-w-[2rem]" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs">
          Monthly Credits 8/10 · Upgrade Plan
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <Card className="gap-4">
      <CardHeader className="flex items-center justify-between">
        <span className="text-foreground text-sm">Monthly Credits</span>
        <span className="text-secondary">8/10</span>
      </CardHeader>
      <CardContent>
        <Progress value={80} />
      </CardContent>
      <CardFooter>
        <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold w-full cursor-pointer">
          Upgrade Plan
        </Button>
      </CardFooter>
    </Card>
  )
}
