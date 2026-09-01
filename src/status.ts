import type { LogEvent, Sin, WeekStart } from './types'

export const STATUS_LEVELS = [
  { min: 0, max: 0, name: 'Suspiciously Pure', rank: 0 },
  { min: 0.00001, max: 40, name: 'Halo Intact', rank: 1 },
  { min: 40, max: 65, name: 'A Little Corrupt', rank: 2 },
  { min: 65, max: 84, name: 'Morally Flexible', rank: 3 },
  { min: 84, max: 100, name: 'Dangerously Horny', rank: 4 },
  { min: 100, max: 100, name: 'At the Line', rank: 5 },
  { min: 100, max: 125, name: 'Horns Detected', rank: 6 },
  { min: 125, max: Infinity, name: 'Demon Mode', rank: 7 },
] as const

export type Status = (typeof STATUS_LEVELS)[number]
export function getStatus(count: number, limit: number): Status {
  if (count === 0) return STATUS_LEVELS[0]
  const percent = count / limit * 100
  if (percent <= 40) return STATUS_LEVELS[1]
  if (percent <= 65) return STATUS_LEVELS[2]
  if (percent < 85) return STATUS_LEVELS[3]
  if (percent < 100) return STATUS_LEVELS[4]
  if (percent === 100) return STATUS_LEVELS[5]
  if (percent <= 125) return STATUS_LEVELS[6]
  return STATUS_LEVELS[7]
}

export function startOfWeek(date: Date, weekStart: WeekStart, offset = 0) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  const diff = (result.getDay() - weekStart + 7) % 7
  result.setDate(result.getDate() - diff + offset * 7)
  return result
}
export const isSameDay = (iso: string, date = new Date()) => {
  const then = new Date(iso)
  return then.getFullYear() === date.getFullYear() && then.getMonth() === date.getMonth() && then.getDate() === date.getDate()
}
export function weeklyEvents(events: LogEvent[], weekStart: WeekStart, offset = 0, now = new Date()) {
  const from = startOfWeek(now, weekStart, offset)
  const to = startOfWeek(now, weekStart, offset + 1)
  return events.filter(event => { const d = new Date(event.occurredAt); return d >= from && d < to })
}
export const sinStats = (sin: Sin, events: LogEvent[], weekStart: WeekStart) => {
  const own = events.filter(event => event.sinId === sin.id)
  const weekly = weeklyEvents(own, weekStart).length
  return { today: own.filter(event => isSameDay(event.occurredAt)).length, weekly, remaining: Math.max(0, sin.weeklyLimit - weekly), percent: weekly / sin.weeklyLimit * 100, status: getStatus(weekly, sin.weeklyLimit) }
}

export const statusCopy = (rank: number) => [
  'Nothing logged. Suspicious.', 'The halo remains under warranty.', 'A tasteful amount of corruption.', 'Technically under the limit. Spiritually? Unclear.', 'The halo is experiencing structural issues.', 'The entire moral budget has been consumed.', 'Further activities are between you and God.', 'Demon Mode. Naturally.',
][rank]

export function paceCopy(percent: number, weekStart: WeekStart) {
  const day = (new Date().getDay() - weekStart + 7) % 7
  if (percent >= 75 && day <= 1) return `Aggressive pace for a ${new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(new Date())}.`
  if (percent > 100) return 'The limit has become a work of fiction.'
  if (percent >= 66) return 'You are operating within acceptable levels of depravity. For now.'
  return statusCopy(percent === 0 ? 0 : percent <= 40 ? 1 : percent <= 65 ? 2 : 3)
}
