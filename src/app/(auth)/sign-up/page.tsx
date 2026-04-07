import { SocialAuthForm } from '@/components/social-auth-form'
import { Suspense } from 'react'

export default function SignUp() {
  return (
    <>
      <div className="fixed inset-0 top-0 -z-10 h-screen opacity-5">
        <svg
          className="text-foreground h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="about-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#about-grid)" />
        </svg>
      </div>
      <div className="z-10 flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md md:max-w-3xl">
          <Suspense
            fallback={
              <div className="text-muted-foreground text-center text-sm">
                Loading…
              </div>
            }
          >
            <SocialAuthForm variant="sign-up" />
          </Suspense>
        </div>
      </div>
    </>
  )
}
