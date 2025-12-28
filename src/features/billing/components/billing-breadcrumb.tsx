'use client'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePathname } from 'next/navigation'

export function BillingBreadcrumb() {
  const fullPathname = usePathname()
    .split('/')
    .filter((s) => s)
  const pathname = fullPathname.slice(2)
  const url = usePathname().split('/').slice(0, 3).join('/')
  console.log(url)

  const breadcrumbs = pathname.map((segment, index) => {
    const title = segment
    const prev = pathname.slice(0, index).join('/')
    const href = `${url}/${prev}/${segment}`.replace(/\/+/g, '/')
    const lastItem = index === pathname.length - 1

    return {
      title,
      href,
      lastItem,
    }
  })
  // const allSegments = pathname.split('/').filter((segment) => segment)
  // const settingsIndex = allSegments.indexOf('settings')
  // const pathSegments =
  //   settingsIndex !== -1 ? allSegments.slice(settingsIndex) : allSegments

  // const breadcrumbs = pathSegments.map((segment, index) => {
  //   const actualFullIndex = settingsIndex !== -1 ? settingsIndex + index : index
  //   const href = `/${allSegments.slice(0, actualFullIndex + 1).join('/')}`

  //   const isLast = index === pathSegments.length - 1

  //   return {
  //     title:
  //       segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
  //     href,
  //     isLast,
  //   }
  // })

  return (
    <Breadcrumb className="mb-3">
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <BreadcrumbItem key={index}>
            <BreadcrumbLink asChild>
              <Link
                href={item.href}
                className={
                  item.lastItem
                    ? 'text-secondary font-semibold'
                    : 'font-semibold'
                }
              >
                {item.title}
              </Link>
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
