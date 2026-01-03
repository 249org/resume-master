import ProgressUpload from '@/components/file-upload/progress-upload'
import { Status, StatusIndicator } from '@/components/hero-badge'
import Pricing from '@/components/mvpblocks/pricing'

export default async function page() {
  return (
    <div>
      {/* Pattern background */}
      <div className="fixed inset-0 -z-10 h-screen opacity-10">
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
      {/* hero */}
      <section className="z-10 my-16 flex flex-col items-center justify-center">
        <Status status="online" className="bg-secondary-foreground">
          <StatusIndicator />
          UPDATED FOR 2026 HIRING TRENDS
        </Status>
        <h1 className="mt-4 text-center text-6xl font-bold">
          Beat the Bots <br />{' '}
          <span className="bg-primary text-secondary-foreground block p-2">
            Land the Interview
          </span>
        </h1>
        <p className="text-foreground mt-4 max-w-2xl text-center text-lg font-semibold">
          Instantly check if your resume passes the Application Tracking Systems
          (ATS). Upload your resume below for a free score analysis
        </p>
        <ProgressUpload className="bg-secondary-foreground mt-10" />
      </section>
      {/* Pricing */}
      <Pricing />
    </div>
  )
}
