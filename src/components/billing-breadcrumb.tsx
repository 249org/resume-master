'use client'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'

export function BillingBreadcrumb() {
  const fullPathname = usePathname()
    .split('/')
    .filter((s) => s)
  const pathname = fullPathname.slice(2)
  const url = usePathname().split('/').slice(0, 3).join('/')

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

  return (
    <Breadcrumb className="mb-3">
      <BreadcrumbList>
        {breadcrumbs.map((item, index) => (
          <BreadcrumbItem key={index}>
            {index === 0 ? null : <BreadcrumbSeparator />}

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
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
