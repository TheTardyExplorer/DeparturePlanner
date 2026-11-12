import { Clock3, Sparkles } from 'lucide-react'
import { cn } from '../lib/cn'
import { useStore } from '../lib/store'
import {
  buildTimeline,
  dayDiff,
  formatAbsoluteDay,
  formatDuration,
  formatRelative,
  formatTime,
  totalMinutes,
} from '../lib/time'

export function StartCard({ now }: { now: Date }) {
  const plan = useStore((state) => state.currentPlan)
  const hourCycle = useStore((state) => state.settings.hourCycle)

  const { start, arrival } = buildTimeline(plan, now)
  const total = totalMinutes(plan.items)
  const startDayTag = dayDiff(start, now) === 0 ? null : formatAbsoluteDay(start, now)
  const startIsPast = start.getTime() < now.getTime() - 59_000
  const relative = formatRelative(start, now)
  const relativeLabel = startIsPast ? `started ${relative}` : relative

  return (
    <section
      className="relative overflow-hidden rounded-[30px] p-5 text-white shadow-[0_24px_60px_-28px_rgba(49,46,129,0.75)] sm:p-6"
      style={{
        backgroundImage: 'linear-gradient(135deg, var(--hero-from), var(--hero-to))',
      }}
    >
      <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-12 size-64 rounded-full bg-cyan-300/10 blur-3xl" />
      <Clock3
        aria-hidden
        className="pointer-events-none absolute -bottom-9 -right-7 size-44 text-white/[0.06]"
        strokeWidth={1}
      />

      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            <Sparkles className="size-3.5" />
            Start getting ready
          </span>
          <span
            className={cn(
              'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur',
              startIsPast ? 'bg-amber-300/20 text-amber-100' : 'bg-white/10 text-white/80',
            )}
          >
            {relativeLabel}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-[clamp(2.9rem,13vw,4.25rem)] font-semibold leading-none tracking-[-0.04em] tabular">
            {formatTime(start, hourCycle)}
          </span>
          {startDayTag ? (
            <span className="text-[13px] font-medium text-white/60">{startDayTag}</span>
          ) : null}
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-white/70">
          {plan.items.length > 0 ? (
            <>
              {formatDuration(total)} of prep · arrive {formatTime(arrival, hourCycle)}
              {plan.dayOffset === 1 ? ' tomorrow' : ''}
            </>
          ) : (
            <>
              Arrive {formatTime(arrival, hourCycle)}
              {plan.dayOffset === 1 ? ' tomorrow' : ''}. Add steps to work backwards.
            </>
          )}
        </p>
      </div>
    </section>
  )
}
