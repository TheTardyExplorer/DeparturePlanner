import type { HourCycle, Plan, PlanItem } from './types'

const DAY_MS = 86_400_000
const timeFormatters = new Map<HourCycle, Intl.DateTimeFormat>()

export function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

export function toTimeValue(date: Date): string {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

export function parseTimeValue(value: string): { hours: number; minutes: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value)
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return { hours, minutes }
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function dayDiff(a: Date, b: Date): number {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / DAY_MS)
}

export function totalMinutes(items: PlanItem[]): number {
  return items.reduce((sum, item) => sum + item.minutes, 0)
}

export function clampMinutes(minutes: number): number {
  if (!Number.isFinite(minutes)) return 1
  return Math.min(600, Math.max(1, Math.round(minutes)))
}

/** The absolute moment the user needs to arrive, anchored to today/tomorrow. */
export function getArrivalDate(plan: Pick<Plan, 'arrivalTime' | 'dayOffset'>, base = new Date()): Date {
  const parsed = parseTimeValue(plan.arrivalTime)
  const hours = parsed?.hours ?? 9
  const minutes = parsed?.minutes ?? 0
  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + plan.dayOffset,
    hours,
    minutes,
    0,
    0,
  )
}

export interface TimelineEntry {
  item: PlanItem
  start: Date
  end: Date
}

export interface Timeline {
  start: Date
  arrival: Date
  entries: TimelineEntry[]
}

/**
 * Work backwards from arrival. Entries stay in chronological order, so the
 * first entry is the first thing to do when getting ready.
 */
export function buildTimeline(
  plan: Pick<Plan, 'arrivalTime' | 'dayOffset' | 'items'>,
  base = new Date(),
): Timeline {
  const arrival = getArrivalDate(plan, base)
  let cursor = arrival.getTime()

  const entries: TimelineEntry[] = []
  for (let index = plan.items.length - 1; index >= 0; index -= 1) {
    const item = plan.items[index]
    const end = new Date(cursor)
    cursor -= item.minutes * 60_000
    entries.unshift({ item, start: new Date(cursor), end })
  }

  return { start: new Date(cursor), arrival, entries }
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`
}

export function formatTime(date: Date, hourCycle: HourCycle = '12'): string {
  let formatter = timeFormatters.get(hourCycle)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hourCycle: hourCycle === '12' ? 'h12' : 'h23',
    })
    timeFormatters.set(hourCycle, formatter)
  }
  return formatter.format(date)
}

/** "Today" / "Tomorrow" / "Yesterday" / a weekday label. */
export function formatAbsoluteDay(date: Date, reference = new Date()): string {
  const diff = dayDiff(date, reference)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function isArrivalInPast(
  plan: Pick<Plan, 'arrivalTime' | 'dayOffset'>,
  now = new Date(),
): boolean {
  return getArrivalDate(plan, now).getTime() < now.getTime()
}

/** Rounds up to the next quarter hour, roughly an hour from now. */
export function defaultArrival(now = new Date()): { arrivalTime: string; dayOffset: 0 | 1 } {
  const target = new Date(now.getTime() + 60 * 60_000)
  const minutes = Math.ceil(target.getMinutes() / 15) * 15
  if (minutes >= 60) {
    target.setHours(target.getHours() + 1, 0, 0, 0)
  } else {
    target.setMinutes(minutes, 0, 0)
  }
  return {
    arrivalTime: toTimeValue(target),
    dayOffset: dayDiff(target, now) > 0 ? 1 : 0,
  }
}

/** "in 2h 15m", "in 8m", "started 10m ago", "right now". */
export function formatRelative(target: Date, now = new Date()): string {
  const diff = Math.round((target.getTime() - now.getTime()) / 60_000)
  if (diff === 0) return 'right now'
  if (diff > 0) return `in ${formatDuration(diff)}`
  return `${formatDuration(-diff)} ago`
}
