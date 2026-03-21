import Navbar from '@/components/mvpblocks/navbar'
import SiteFooter from '@/components/mvpblocks/site-footer'

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </main>
  )
}
