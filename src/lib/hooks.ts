import { useEffect, useState } from 'react'
import { useStore } from './store'

/** Applies the theme setting to <html> and keeps the iOS status bar color in sync. */
export function useApplyTheme(): void {
  const theme = useStore((state) => state.settings.theme)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
      const meta = document.querySelector('meta[name="theme-color"]')
      meta?.setAttribute('content', dark ? '#0b1020' : '#f4f6fb')
    }
    apply()
    if (theme === 'system') {
      media.addEventListener('change', apply)
      return () => media.removeEventListener('change', apply)
    }
  }, [theme])
}

/** A clock that ticks slowly, used for the live "starts in…" label. */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}
