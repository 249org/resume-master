import Pricing from '@/components/mvpblocks/pricing'

export default async function page() {
  return (
    <div>
      {/* Pattern background */}
      <div className="inset-0 -z-10 h-screen opacity-5">
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
      {/* Pricing */}
      <Pricing />
    </div>
  )
}
