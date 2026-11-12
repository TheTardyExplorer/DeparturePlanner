import { cn } from '../../lib/cn'

export interface SegmentOption<T extends string | number> {
  value: T
  label: string
}

interface SegmentedProps<T extends string | number> {
  value: T
  options: SegmentOption<T>[]
  onChange: (value: T) => void
  className?: string
  ariaLabel?: string
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  className,
  ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn('inline-flex shrink-0 rounded-xl bg-muted p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'h-9 flex-1 rounded-[10px] px-3 text-[13px] font-medium transition-all',
              active
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
