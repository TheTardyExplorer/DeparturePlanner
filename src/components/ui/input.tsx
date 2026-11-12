import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

export function Input({ className, type = 'text', ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      className={cn(
        'h-11 w-full rounded-xl border border-border bg-card px-3.5 text-[16px] text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground/70 focus-visible:border-ring/60 focus-visible:ring-2 focus-visible:ring-ring/25 disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
