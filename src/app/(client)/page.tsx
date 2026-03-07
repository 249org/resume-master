import ProgressUpload from '@/components/file-upload/progress-upload'
import { Status, StatusIndicator } from '@/components/hero-badge'
import Pricing from '@/components/mvpblocks/pricing'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { BrainCircuit, FileChartPie, FileCode } from '@/components/icons'

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
      <section className="z-10 my-16 flex w-full flex-col items-center justify-center">
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

      {/* Toolkit */}
      <section className="bg-background container my-16">
        <h2 className="text-4xl font-semibold">Your Career Toolkit</h2>
        <p className="text-foreground my-6">
          Everything you need to stand out in a crowded job market, powered by
          advanced AI
        </p>
        <div className="flex flex-col items-center justify-between gap-3 lg:flex-row">
          <Card>
            <CardHeader className="flex flex-col items-start">
              <FileChartPie
                className="text-secondary mb-7 rounded-full bg-[#fddccc] p-2"
                size={35}
              />
              <p className="text-2xl font-semibold">ATS Analysis</p>
            </CardHeader>
            <CardContent className="text-foreground">
              Ensure your resume isn&apos;t automatically rejected. We scan your
              document just like the hiring bots do.
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-col items-start">
              <BrainCircuit
                className="text-secondary mb-7 rounded-full bg-green-100 p-2"
                size={35}
              />

              <p className="text-2xl font-semibold">AI-Powered Resume Review</p>
            </CardHeader>
            <CardContent className="text-foreground">
              Get instant, professional feedback on your content, impact, and
              tone--without waiting for a recruiter
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-col items-start">
              <FileCode
                className="text-secondary mb-7 rounded-full bg-blue-200 p-2"
                size={35}
              />
              <p className="text-2xl font-semibold">
                AI-Supported Resume Builder
              </p>
            </CardHeader>
            <CardContent>
              Create a perfectly formatted, professional resume from scratch
              with AI writing assistance at every step
            </CardContent>
          </Card>
        </div>
      </section>
      {/* Pricing */}
      <Pricing />
    </div>
  )
}
