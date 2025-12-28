import ThemeSwitch from '@/components/theme-switch'

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <ThemeSwitch />
      {children}
    </main>
  )
}
