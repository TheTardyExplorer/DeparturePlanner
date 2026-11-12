import { Clock3, Flag } from 'lucide-react'
import { useRef } from 'react'
import { useStore } from '../lib/store'
import { formatTime, getArrivalDate, isArrivalInPast } from '../lib/time'
import { Button } from './ui/button'
import { Segmented } from './ui/segmented'

export function ArrivalCard({ now }: { now: Date }) {
  const plan = useStore((state) => state.currentPlan)
  const hourCycle = useStore((state) => state.settings.hourCycle)
  const setArrivalTime = useStore((state) => state.setArrivalTime)
  const setDayOffset = useStore((state) => state.setDayOffset)

  const inputRef = useRef<HTMLInputElement>(null)
  const arrivalPassed = plan.dayOffset === 0 && isArrivalInPast(plan, now)
  const displayTime = formatTime(getArrivalDate(plan, now), hourCycle)

  const openPicker = () => {
    const input = inputRef.current
    if (!input) return
    try {
      input.showPicker()
    } catch {
      input.focus()
      input.click()
    }
  }

  return (
    <section className="rounded-[26px] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[13px] font-medium text-muted-foreground">
          <Flag className="size-4" />
          I need to arrive by
        </div>
        <Segmented
          ariaLabel="Arrival day"
          value={plan.dayOffset}
          onChange={setDayOffset}
          options={[
            { value: 0, label: 'Today' },
            { value: 1, label: 'Tomorrow' },
          ]}
        />
      </div>

      <div className="relative mt-1">
        <button
          type="button"
          onClick={openPicker}
          aria-label={`Arrival time ${displayTime}. Tap to change.`}
          className="flex w-full items-center justify-between gap-3 rounded-2xl py-0.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <span className="min-w-0 truncate text-[2.9rem] font-semibold leading-tight tracking-[-0.03em] tabular text-foreground">
            {displayTime}
          </span>
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
            <Clock3 className="size-5" />
          </span>
        </button>
        <input
          ref={inputRef}
          type="time"
          value={plan.arrivalTime}
          onChange={(event) => setArrivalTime(event.target.value)}
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none absolute inset-0 size-full opacity-0"
        />
      </div>

      {arrivalPassed ? (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-xl bg-amber-500/10 px-3 py-2 text-[13px] text-amber-700 dark:text-amber-300">
          <span>That time already passed today.</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 shrink-0 px-2 text-amber-800 hover:bg-amber-500/15 dark:text-amber-200"
            onClick={() => setDayOffset(1)}
          >
            Use tomorrow
          </Button>
        </div>
      ) : (
        <p className="mt-2 text-[13px] text-muted-foreground">
          {plan.dayOffset === 1
            ? 'Arriving tomorrow. Preparation may start tonight.'
            : 'Pick a time, then stack the steps that get you out the door.'}
        </p>
      )}
    </section>
  )
}
