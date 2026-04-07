'use client'

import { createContext, useContext } from 'react'
import type { UsageSnapshot } from '@/lib/polar/usage-snapshot'

const SidebarUsageContext = createContext<UsageSnapshot>(null)

export function SidebarUsageProvider({
  value,
  children,
}: {
  value: UsageSnapshot
  children: React.ReactNode
}) {
  return (
    <SidebarUsageContext.Provider value={value}>
      {children}
    </SidebarUsageContext.Provider>
  )
}

export function useSidebarUsage(): UsageSnapshot {
  return useContext(SidebarUsageContext)
}
