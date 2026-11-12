import { Minus, Plus } from 'lucide-react'
import { cn } from '../lib/cn'
import { DURATION_PRESETS } from '../lib/defaults'
import { clampMinutes } from '../lib/time'
import { Button } from './ui/button'

interface DurationFieldProps {
  minutes: number
  onChange: (minutes: number) => void
}

export function DurationField({ minutes, onChange }: DurationFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-1.5 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          aria-label="Decrease duration"
          onClick={() => onChange(clampMinutes(minutes - 1))}
        >
          <Minus className="size-5" />
        </Button>
        <div className="flex items-baseline justify-center">
          <span className="text-3xl font-semibold tracking-tight tabular">{minutes}</span>
          <span className="ml-1.5 text-sm font-medium text-muted-foreground">min</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl"
          aria-label="Increase duration"
          onClick={() => onChange(clampMinutes(minutes + 1))}
        >
          <Plus className="size-5" />
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {DURATION_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={cn(
              'h-9 rounded-full border px-3 text-xs font-medium transition-colors',
              minutes === preset
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {preset}m
          </button>
        ))}
      </div>
    </div>
  )
}
