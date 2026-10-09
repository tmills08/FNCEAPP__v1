import { describe, expect, it } from 'vitest'
import { INDICES } from '../data/indices'
import { buildCards, buildSession, deckStats, type ProgressMap } from './deck'
import { review } from './sm2'

const index = INDICES[0]
const cards = buildCards(index)
const now = new Date('2026-03-01T12:00:00Z')
const yesterday = new Date('2026-02-28T12:00:00Z')

describe('buildCards', () => {
  it('creates one card per company per kind with unique ids', () => {
    expect(cards).toHaveLength(index.companies.length * 2)
    expect(new Set(cards.map((c) => c.id)).size).toBe(cards.length)
    expect(cards[0].id).toBe(`${index.id}:${index.companies[0].id}:profile`)
  })
})

describe('buildSession', () => {
  it('puts due cards first, most overdue first, then caps new cards', () => {
    const progress: ProgressMap = {
      [cards[5].id]: review(undefined, 4, yesterday), // due today
      [cards[3].id]: review(undefined, 1, yesterday), // failed yesterday, due since then
      [cards[0].id]: review(review(undefined, 4, now), 4, now), // due in 6 days
    }
    const session = buildSession(cards, progress, now, 3)
    // cards[2k] / cards[2k+1] are company k's profile / brands cards.
    // Companies 1 and 2 already have due cards, so their new cards are buried.
    expect(session.map((c) => c.id)).toEqual([cards[3].id, cards[5].id, cards[1].id, cards[6].id, cards[8].id])
  })

  it('never puts two cards for the same company in one session', () => {
    const session = buildSession(cards, {}, now, 10)
    expect(session).toHaveLength(10)
    expect(new Set(session.map((c) => c.company.id)).size).toBe(10)
    expect(session.every((c) => c.kind === 'profile')).toBe(true)
  })

  it('returns nothing when there is nothing due and no new cards allowed', () => {
    expect(buildSession(cards, {}, now, 0)).toEqual([])
  })
})

describe('deckStats', () => {
  it('splits cards into exclusive buckets', () => {
    let mature = review(undefined, 5, now)
    for (let i = 0; i < 4; i++) mature = review(mature, 5, now)
    const progress: ProgressMap = {
      [cards[0].id]: review(undefined, 1, now), // due
      [cards[1].id]: review(undefined, 4, now), // learning
      [cards[2].id]: mature, // mastered
    }
    const stats = deckStats(cards, progress, now)
    expect(stats).toEqual({ total: cards.length, new: cards.length - 3, due: 1, learning: 1, mastered: 1 })
  })
})
