import { describe, expect, it } from 'vitest'
import { formatInterval, isDue, MIN_EASE, review } from './sm2'

const t0 = new Date('2026-01-01T09:00:00Z')

describe('review (SM-2)', () => {
  it('schedules 1 day, then 6 days, then interval × ease', () => {
    const r1 = review(undefined, 4, t0)
    expect(r1).toMatchObject({ interval: 1, repetitions: 1, ease: 2.5 })
    const r2 = review(r1, 4, t0)
    expect(r2).toMatchObject({ interval: 6, repetitions: 2 })
    const r3 = review(r2, 4, t0)
    expect(r3).toMatchObject({ interval: 15, repetitions: 3 })
  })

  it('raises ease on Easy and lowers it on Hard', () => {
    expect(review(undefined, 5, t0).ease).toBe(2.6)
    expect(review(undefined, 3, t0).ease).toBe(2.36)
  })

  it('treats grades below 3 as a lapse: due now, repetitions reset', () => {
    const learned = review(review(review(undefined, 4, t0), 4, t0), 4, t0)
    const failed = review(learned, 1, t0)
    expect(failed).toMatchObject({ interval: 0, repetitions: 0, lapses: 1 })
    expect(isDue(failed, t0)).toBe(true)
    expect(review(failed, 4, t0).interval).toBe(1)
  })

  it('does not count failing a brand-new card as a lapse', () => {
    expect(review(undefined, 1, t0).lapses).toBe(0)
  })

  it('never drops ease below the minimum', () => {
    let state = review(undefined, 0, t0)
    for (let i = 0; i < 20; i++) state = review(state, 0, t0)
    expect(state.ease).toBe(MIN_EASE)
  })

  it('sets dueAt from the interval', () => {
    const r = review(review(undefined, 4, t0), 4, t0)
    expect(r.dueAt).toBe('2026-01-07T09:00:00.000Z')
    expect(isDue(r, new Date('2026-01-07T08:59:59Z'))).toBe(false)
    expect(isDue(r, new Date('2026-01-07T09:00:00Z'))).toBe(true)
  })
})

describe('formatInterval', () => {
  it('formats days, months and years', () => {
    expect(formatInterval(0)).toBe('now')
    expect(formatInterval(6)).toBe('6d')
    expect(formatInterval(60)).toBe('2mo')
    expect(formatInterval(730)).toBe('2.0y')
  })
})
