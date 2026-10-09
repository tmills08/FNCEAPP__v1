import type { Grade, ReviewState } from '../types/models'

const DAY_MS = 24 * 60 * 60 * 1000
export const MIN_EASE = 1.3
export const DEFAULT_EASE = 2.5

export function newReviewState(now: Date): ReviewState {
  return {
    ease: DEFAULT_EASE,
    interval: 0,
    repetitions: 0,
    dueAt: now.toISOString(),
    lastReviewedAt: now.toISOString(),
    totalReviews: 0,
    lapses: 0,
  }
}

/**
 * SM-2 scheduling (SuperMemo 2, Wozniak 1990), lightly adapted:
 * - Grades below 3 are a lapse: repetitions reset and the card is due again
 *   immediately (interval 0) so the session re-shows it.
 * - The ease update runs on every review and is clamped at 1.3.
 */
export function review(prev: ReviewState | undefined, grade: Grade, now: Date): ReviewState {
  const state = prev ?? newReviewState(now)
  const ease = Math.max(MIN_EASE, state.ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)))

  let repetitions: number
  let interval: number
  if (grade < 3) {
    repetitions = 0
    interval = 0
  } else {
    repetitions = state.repetitions + 1
    if (repetitions === 1) interval = 1
    else if (repetitions === 2) interval = 6
    else interval = Math.round(state.interval * ease)
  }

  return {
    ease: round2(ease),
    interval,
    repetitions,
    dueAt: new Date(now.getTime() + interval * DAY_MS).toISOString(),
    lastReviewedAt: now.toISOString(),
    totalReviews: state.totalReviews + 1,
    lapses: state.lapses + (grade < 3 && state.repetitions > 0 ? 1 : 0),
  }
}

export function isDue(state: ReviewState, now: Date): boolean {
  return new Date(state.dueAt).getTime() <= now.getTime()
}

/** Human-friendly label for an interval, used on the grade buttons. */
export function formatInterval(days: number): string {
  if (days <= 0) return 'now'
  if (days < 30) return `${days}d`
  if (days < 365) return `${Math.round(days / 30)}mo`
  return `${(days / 365).toFixed(1)}y`
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
