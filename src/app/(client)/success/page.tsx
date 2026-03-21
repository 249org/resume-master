import PageTitle from '@/components/page-title'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Props = {
  searchParams: Promise<{
    checkout_id?: string
    customer_session_token?: string
  }>
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const params = await searchParams
  const checkoutId = params.checkout_id

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <div className="bg-background flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <Card className="bg-accent w-full max-w-lg">
        <CardContent className="pt-8 pb-8">
          <PageTitle
            title="Payment successful"
            subtitle="Your subscription is being activated. It may take a moment to show on your billing page."
          />
          {checkoutId ? (
            <p className="text-muted-foreground mt-4 font-mono text-xs">
              Checkout ID: {checkoutId}
            </p>
          ) : null}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {session ? (
              <Button asChild>
                <Link href={`/users/${session.user.id}/settings/billing`}>
                  Go to billing
                </Link>
              </Button>
            ) : null}
            <Button variant={session ? 'outline' : 'default'} asChild>
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
