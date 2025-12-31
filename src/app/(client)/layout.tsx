import Navbar from '@/components/mvpblocks/navbar'

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Navbar />
      {children}
    </main>
  )
}
