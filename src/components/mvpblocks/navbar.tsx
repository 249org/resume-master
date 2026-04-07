'use client'

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, Sparkles, ArrowRight } from '@/components/icons'
import Link from 'next/link'
import ThemeSwitch from '../theme-switch'

const navItems = [
  { name: 'Features', href: '/#features' },
  { name: 'How it works', href: '/#services' },
  { name: 'Pricing', href: '/#pricing' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-background/75 shadow-sm ring-1 ring-black/[0.06] backdrop-blur-xl dark:ring-white/[0.06]'
          : 'bg-background'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
            <Sparkles className="size-4 text-white" />
          </div>
          <span className="text-foreground text-lg font-semibold tracking-tight">
            Resume Master
          </span>
        </Link>

        {/* Desktop nav — pill */}
        <nav
          aria-label="Main"
          className="border-border bg-muted/60 hidden items-center gap-1 rounded-full border px-2 py-1.5 lg:flex"
        >
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-muted-foreground hover:text-foreground hover:bg-background rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/sign-in"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors"
          >
            Get started
            <ArrowRight className="size-3.5" />
          </Link>
          <ThemeSwitch />
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeSwitch />
          <button
            className="hover:bg-muted text-foreground rounded-lg p-2 transition-colors"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="border-border bg-background border-t lg:hidden"
          >
            <div className="mx-auto max-w-6xl space-y-1 px-4 py-4 sm:px-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-foreground hover:bg-muted block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="border-border mt-3 flex flex-col gap-2 border-t pt-4">
                <Link
                  href="/sign-in"
                  className="text-foreground hover:bg-muted block rounded-lg px-3 py-2.5 text-center text-sm font-medium transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="bg-primary text-primary-foreground block rounded-full py-2.5 text-center text-sm font-medium"
                  onClick={() => setMenuOpen(false)}
                >
                  Get started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
