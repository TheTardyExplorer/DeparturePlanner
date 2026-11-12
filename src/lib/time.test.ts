import { describe, expect, it } from 'vitest'
import {
  buildTimeline,
  clampMinutes,
  dayDiff,
  defaultArrival,
  formatAbsoluteDay,
  formatDuration,
  formatRelative,
  formatTime,
  getArrivalDate,
  isArrivalInPast,
  parseTimeValue,
  toTimeValue,
  totalMinutes,
} from './time'
import type { PlanItem } from './types'

function makeItem(id: string, minutes: number, defaultMinutes = minutes): PlanItem {
  return { id, emoji: '✅', name: id, defaultMinutes, minutes }
}

const noon = new Date(2026, 4, 20, 12, 0, 0, 0)

describe('parseTimeValue', () => {
  it('parses 24-hour input values', () => {
    expect(parseTimeValue('18:30')).toEqual({ hours: 18, minutes: 30 })
    expect(parseTimeValue('00:05')).toEqual({ hours: 0, minutes: 5 })
    expect(parseTimeValue('9:05')).toEqual({ hours: 9, minutes: 5 })
  })

  it('rejects invalid values', () => {
    expect(parseTimeValue('')).toBeNull()
    expect(parseTimeValue('24:00')).toBeNull()
    expect(parseTimeValue('12:60')).toBeNull()
    expect(parseTimeValue('noon')).toBeNull()
  })
})

describe('totalMinutes / clampMinutes', () => {
  it('sums step durations', () => {
    expect(totalMinutes([makeItem('a', 5), makeItem('b', 20)])).toBe(25)
    expect(totalMinutes([])).toBe(0)
  })

  it('clamps durations to a sane range', () => {
    expect(clampMinutes(0)).toBe(1)
    expect(clampMinutes(-10)).toBe(1)
    expect(clampMinutes(4.6)).toBe(5)
    expect(clampMinutes(9999)).toBe(600)
    expect(clampMinutes(Number.NaN)).toBe(1)
  })
})

describe('getArrivalDate', () => {
  it('anchors today and tomorrow', () => {
    const today = getArrivalDate({ arrivalTime: '18:30', dayOffset: 0 }, noon)
    expect(today.getFullYear()).toBe(2026)
    expect(today.getMonth()).toBe(4)
    expect(today.getDate()).toBe(20)
    expect(today.getHours()).toBe(18)
    expect(today.getMinutes()).toBe(30)

    const tomorrow = getArrivalDate({ arrivalTime: '09:00', dayOffset: 1 }, noon)
    expect(tomorrow.getDate()).toBe(21)
    expect(tomorrow.getHours()).toBe(9)
  })

  it('falls back to 9:00 when the value is invalid', () => {
    const arrival = getArrivalDate({ arrivalTime: 'oops', dayOffset: 0 }, noon)
    expect(arrival.getHours()).toBe(9)
    expect(arrival.getMinutes()).toBe(0)
  })
})

describe('buildTimeline', () => {
  it('works backwards from arrival and keeps chronological order', () => {
    const timeline = buildTimeline(
      {
        arrivalTime: '18:30',
        dayOffset: 0,
        items: [makeItem('snack', 5), makeItem('travel', 20)],
      },
      noon,
    )

    expect(formatTime(timeline.start, '24')).toBe('18:05')
    expect(formatTime(timeline.arrival, '24')).toBe('18:30')
    expect(timeline.entries).toHaveLength(2)
    expect(timeline.entries[0].item.id).toBe('snack')
    expect(formatTime(timeline.entries[0].start, '24')).toBe('18:05')
    expect(formatTime(timeline.entries[0].end, '24')).toBe('18:10')
    expect(timeline.entries[1].item.id).toBe('travel')
    expect(formatTime(timeline.entries[1].start, '24')).toBe('18:10')
    expect(formatTime(timeline.entries[1].end, '24')).toBe('18:30')
  })

  it('handles prep crossing midnight', () => {
    const late = new Date(2026, 4, 20, 23, 0, 0, 0)
    const timeline = buildTimeline(
      {
        arrivalTime: '00:15',
        dayOffset: 0,
        items: [makeItem('travel', 20)],
      },
      late,
    )

    expect(timeline.arrival.getDate()).toBe(20)
    expect(timeline.start.getDate()).toBe(19)
    expect(formatTime(timeline.start, '24')).toBe('23:55')
    expect(dayDiff(timeline.start, timeline.arrival)).toBe(-1)
  })

  it('handles a tomorrow arrival', () => {
    const timeline = buildTimeline(
      {
        arrivalTime: '00:15',
        dayOffset: 1,
        items: [makeItem('travel', 20)],
      },
      new Date(2026, 4, 20, 23, 0, 0, 0),
    )

    expect(timeline.arrival.getDate()).toBe(21)
    expect(timeline.start.getDate()).toBe(20)
    expect(formatTime(timeline.start, '24')).toBe('23:55')
  })

  it('starts at the arrival time with no steps', () => {
    const timeline = buildTimeline(
      { arrivalTime: '18:30', dayOffset: 0, items: [] },
      noon,
    )
    expect(timeline.start.getTime()).toBe(timeline.arrival.getTime())
    expect(timeline.entries).toHaveLength(0)
  })
})

describe('formatting helpers', () => {
  it('formats durations', () => {
    expect(formatDuration(5)).toBe('5m')
    expect(formatDuration(59)).toBe('59m')
    expect(formatDuration(60)).toBe('1h')
    expect(formatDuration(75)).toBe('1h 15m')
    expect(formatDuration(120)).toBe('2h')
  })

  it('formats 24-hour clock times', () => {
    expect(formatTime(new Date(2026, 4, 20, 18, 5), '24')).toBe('18:05')
    expect(formatTime(new Date(2026, 4, 20, 0, 5), '24')).toBe('00:05')
  })

  it('formats relative times', () => {
    const now = new Date(2026, 4, 20, 17, 0)
    expect(formatRelative(new Date(2026, 4, 20, 18, 5), now)).toBe('in 1h 5m')
    expect(formatRelative(new Date(2026, 4, 20, 16, 50), now)).toBe('10m ago')
    expect(formatRelative(now, now)).toBe('right now')
  })

  it('labels days relative to today', () => {
    const now = new Date(2026, 4, 20, 17, 0)
    expect(formatAbsoluteDay(new Date(2026, 4, 20, 8), now)).toBe('Today')
    expect(formatAbsoluteDay(new Date(2026, 4, 21, 8), now)).toBe('Tomorrow')
    expect(formatAbsoluteDay(new Date(2026, 4, 19, 8), now)).toBe('Yesterday')
  })

  it('converts dates to input values', () => {
    expect(toTimeValue(new Date(2026, 4, 20, 6, 5))).toBe('06:05')
  })
})

describe('defaultArrival', () => {
  it('rounds up to the next quarter hour', () => {
    const result = defaultArrival(new Date(2026, 4, 20, 10, 7))
    expect(result).toEqual({ arrivalTime: '11:15', dayOffset: 0 })
  })

  it('rolls over to tomorrow near midnight', () => {
    const result = defaultArrival(new Date(2026, 4, 20, 23, 50))
    expect(result).toEqual({ arrivalTime: '01:00', dayOffset: 1 })
  })
})

describe('isArrivalInPast', () => {
  it('detects a past arrival today', () => {
    expect(isArrivalInPast({ arrivalTime: '09:00', dayOffset: 0 }, noon)).toBe(true)
    expect(isArrivalInPast({ arrivalTime: '18:30', dayOffset: 0 }, noon)).toBe(false)
    expect(isArrivalInPast({ arrivalTime: '09:00', dayOffset: 1 }, noon)).toBe(false)
  })
})
