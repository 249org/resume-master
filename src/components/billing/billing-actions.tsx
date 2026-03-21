'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export function OpenPolarPortalButton({
  variant = 'outline',
  className,
  children,
}: {
  variant?: React.ComponentProps<typeof Button>['variant']
  className?: string
  children?: React.ReactNode
}) {
  const [loading, setLoading] = useState(false)

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={loading}
      onClick={async () => {
        setLoading(true)
        try {
          await authClient.customer.portal()
        } catch (e) {
          console.error(e)
        } finally {
          setLoading(false)
        }
      }}
    >
      {loading ? 'Opening…' : (children ?? 'Manage billing & payment')}
    </Button>
  )
}
