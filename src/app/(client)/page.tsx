import { Button } from '@/components/ui/button'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import Link from 'next/link'

export default async function page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <div>
      <div className="flex justify-between">
        {session && (
          <div>
            <Button>
              <Link href={`/users/${session.user?.id}`}>Go to Dashbaord</Link>
            </Button>
          </div>
        )}
        <div>
          <Button>
            <Link href={'/sign-in'}>Log in </Link>
          </Button>
        </div>
        <div></div>
      </div>
    </div>
  )
}
