'use client'
/**
 * Central icon exports — animated icons (lucide-animated, hover to animate)
 * with static lucide-react fallbacks for icons not in the animated library.
 *
 * Each animated icon:
 *  1. Auto-detects its nearest interactive parent (button, a, [role="button"])
 *     and animates when THAT element is hovered — not just the icon itself.
 *  2. Falls back to self-hover when no interactive parent is found.
 *  3. Derives its pixel size from h-X Tailwind classes when no explicit `size`
 *     prop is given, so h-4 w-4 / h-5 w-5 etc. keep working as expected.
 */

import React, { useEffect, useRef } from 'react'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// ── Animated icon imports ──────────────────────────────────────────────────
import { ArrowRightIcon } from '@/components/ui/arrow-right'
import { BellIcon } from '@/components/ui/bell'
import { BotIcon } from '@/components/ui/bot'
import { CheckIcon } from '@/components/ui/check'
import { CircleCheckIcon } from '@/components/ui/circle-check'
import { ChevronDownIcon } from '@/components/ui/chevron-down'
import { ChevronLeftIcon } from '@/components/ui/chevron-left'
import { ChevronRightIcon } from '@/components/ui/chevron-right'
import { ChevronUpIcon } from '@/components/ui/chevron-up'
import { CloudUploadIcon } from '@/components/ui/cloud-upload'
import { CopyIcon } from '@/components/ui/copy'
import { DownloadIcon as DownloadAnimatedIcon } from '@/components/ui/download'
import { EyeIcon } from '@/components/ui/eye'
import { EyeOffIcon } from '@/components/ui/eye-off'
import { FileTextIcon as FileTextAnimatedIcon } from '@/components/ui/file-text'
import { HistoryIcon } from '@/components/ui/history'
import { HomeIcon } from '@/components/ui/home'
import { MapPinIcon } from '@/components/ui/map-pin'
import { Maximize2Icon } from '@/components/ui/maximize-2'
import { MenuIcon } from '@/components/ui/menu'
import { MoonIcon } from '@/components/ui/moon'
import { PlusIcon } from '@/components/ui/plus'
import { RefreshCWIcon } from '@/components/ui/refresh-cw'
import { SearchIcon } from '@/components/ui/search'
import { SendIcon } from '@/components/ui/send'
import { SettingsIcon } from '@/components/ui/settings'
import { ShieldCheckIcon } from '@/components/ui/shield-check'
import { SparklesIcon } from '@/components/ui/sparkles'
import { SunIcon } from '@/components/ui/sun'
import { TerminalIcon } from '@/components/ui/terminal'
import { TrendingUpIcon } from '@/components/ui/trending-up'
import { UploadIcon as UploadAnimatedIcon } from '@/components/ui/upload'
import { UserIcon } from '@/components/ui/user'
import { XIcon as XAnimatedIcon } from '@/components/ui/x'
import { ZapIcon } from '@/components/ui/zap'
import { LogoutIcon } from '@/components/ui/logout'
import { PanelLeftOpenIcon } from '@/components/ui/panel-left-open'
import { WrenchIcon } from '@/components/ui/wrench'

// ── Static icon fallbacks (no animated equivalent yet) ────────────────────
export {
  AlertTriangle,
  BadgeCheck,
  BarChart2,
  BrainCircuit,
  Calendar,
  CalendarDays,
  CreditCard,
  FileArchive,
  FileArchive as FileArchiveIcon,
  FileChartPie,
  FileCode,
  FileDown,
  FileSpreadsheet,
  FileSpreadsheet as FileSpreadsheetIcon,
  Filter,
  Folder,
  Headphones,
  Headphones as HeadphonesIcon,
  ImageIcon,
  Lightbulb,
  Mail,
  MoreHorizontal,
  Palette,
  Pencil,
  Save,
  Shield,
  ShieldAlert,
  Trash2,
  TriangleAlert,
  Video,
  Video as VideoIcon,
  Wand2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────────────────

/** Convert Tailwind h-X class to pixel size (h-4 → 16, h-5 → 20, etc.) */
function sizeFromClass(className?: string, fallback = 16): number {
  if (!className) return fallback
  const m = className.match(/\bh-(\d+(?:\.\d+)?)\b/)
  return m ? Math.round(parseFloat(m[1]) * 4) : fallback
}

type AnimHandle = { startAnimation: () => void; stopAnimation: () => void }
type IconProps = HTMLAttributes<HTMLDivElement> & { size?: number }

const INTERACTIVE_SELECTOR =
  'button, a, [role="button"], [role="menuitem"], [role="option"], [data-sidebar-menu-button]'

/**
 * Wraps an animated icon component so that:
 * - It is `inline-flex` for proper alignment inside flex containers.
 * - Animation triggers when the nearest interactive ancestor is hovered,
 *   not just when the cursor is exactly over the icon's own pixels.
 * - Falls back to self-hover when no interactive parent is found.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const wrap = (Icon: React.ForwardRefExoticComponent<any>) => {
  const Wrapped = ({ size, className, ...props }: IconProps) => {
    const iconRef = useRef<AnimHandle>(null)
    const sentinelRef = useRef<HTMLSpanElement>(null)
    const resolvedSize = size ?? sizeFromClass(className)

    useEffect(() => {
      const sentinel = sentinelRef.current
      if (!sentinel) return

      // The icon's wrapper div is the next DOM sibling of the sentinel span
      const iconDiv = sentinel.nextElementSibling as HTMLElement | null

      // Walk up from the sentinel's parent to find the nearest interactive element.
      // If none, fall back to animating on the icon's own div (self-hover).
      const trigger =
        sentinel.parentElement?.closest<HTMLElement>(INTERACTIVE_SELECTOR) ??
        iconDiv

      if (!trigger) return

      const start = () => iconRef.current?.startAnimation()
      const stop = () => iconRef.current?.stopAnimation()

      trigger.addEventListener('mouseenter', start)
      trigger.addEventListener('mouseleave', stop)
      return () => {
        trigger.removeEventListener('mouseenter', start)
        trigger.removeEventListener('mouseleave', stop)
      }
    }, [])

    return (
      <>
        {/* Invisible sentinel used as a DOM anchor to locate the interactive parent */}
        <span ref={sentinelRef} aria-hidden style={{ display: 'none' }} />
        <Icon
          ref={iconRef}
          size={resolvedSize}
          className={cn('inline-flex items-center justify-center', className)}
          {...props}
        />
      </>
    )
  }

  Wrapped.displayName = Icon.displayName ?? Icon.name
  return Wrapped
}

// ── Animated icon exports ─────────────────────────────────────────────────
export const ArrowRight = wrap(ArrowRightIcon)
export const Bell = wrap(BellIcon)
export const Bot = wrap(BotIcon)
export const Check = wrap(CheckIcon)
export const CheckCircle = wrap(CircleCheckIcon)
export const CheckCircle2 = wrap(CircleCheckIcon)
export const CircleCheck = wrap(CircleCheckIcon)
export const ChevronDown = wrap(ChevronDownIcon)
export const ChevronLeft = wrap(ChevronLeftIcon)
export const ChevronRight = wrap(ChevronRightIcon)
export const ChevronUp = wrap(ChevronUpIcon)
export const CloudUpload = wrap(CloudUploadIcon)
export const Copy = wrap(CopyIcon)
export const Download = wrap(DownloadAnimatedIcon)
export const DownloadIcon = wrap(DownloadAnimatedIcon)
export const Eye = wrap(EyeIcon)
export const EyeOff = wrap(EyeOffIcon)
export const FileText = wrap(FileTextAnimatedIcon)
export const FileTextIcon = wrap(FileTextAnimatedIcon)
export const History = wrap(HistoryIcon)
export const Home = wrap(HomeIcon)
export const MapPin = wrap(MapPinIcon)
export const Maximize2 = wrap(Maximize2Icon)
export const Menu = wrap(MenuIcon)
export const Moon = wrap(MoonIcon)
export const Plus = wrap(PlusIcon)
export const RefreshCw = wrap(RefreshCWIcon)
export const RefreshCwIcon = wrap(RefreshCWIcon)
export const Search = wrap(SearchIcon)
export const Send = wrap(SendIcon)
export const Settings = wrap(SettingsIcon)
export const ShieldCheck = wrap(ShieldCheckIcon)
export const Sparkles = wrap(SparklesIcon)
export const Sun = wrap(SunIcon)
export const Terminal = wrap(TerminalIcon)
export const TrendingUp = wrap(TrendingUpIcon)
export const Upload = wrap(UploadAnimatedIcon)
export const UploadIcon = wrap(UploadAnimatedIcon)
export const User = wrap(UserIcon)
export const X = wrap(XAnimatedIcon)
export const XIcon = wrap(XAnimatedIcon)
export const Zap = wrap(ZapIcon)
export const LogOut = wrap(LogoutIcon)
export const PanelLeft = wrap(PanelLeftOpenIcon)
export const PanelLeftIcon = wrap(PanelLeftOpenIcon)
export const Wrench = wrap(WrenchIcon)
export const Hammer = wrap(WrenchIcon)
