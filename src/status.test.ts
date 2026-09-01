import { describe, expect, it } from 'vitest'
import { getStatus, startOfWeek } from './status'

describe('status thresholds', () => {
  it.each([[0, 10, 'Suspiciously Pure'], [4, 10, 'Halo Intact'], [5, 10, 'A Little Corrupt'], [8, 10, 'Morally Flexible'], [9, 10, 'Dangerously Horny'], [10, 10, 'At the Line'], [11, 10, 'Horns Detected'], [13, 10, 'Demon Mode']])('%s of %s is %s', (count, limit, expected) => expect(getStatus(count as number, limit as number).name).toBe(expected))
  it('starts Monday by default', () => expect(startOfWeek(new Date(2026, 7, 26), 1).getDay()).toBe(1))
})
