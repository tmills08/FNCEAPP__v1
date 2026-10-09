import type { Card, CardKind, ReviewState, StockIndex } from '../types/models'
import { isDue } from './sm2'

export const CARD_KINDS: CardKind[] = ['profile', 'brands']

export type ProgressMap = Record<string, ReviewState>

export function cardId(indexId: string, companyId: string, kind: CardKind): string {
  return `${indexId}:${companyId}:${kind}`
}

/** Every company yields one card per kind, ordered company-first so related cards stay together. */
export function buildCards(index: StockIndex): Card[] {
  return index.companies.flatMap((company) =>
    CARD_KINDS.map((kind) => ({
      id: cardId(index.id, company.id, kind),
      kind,
      indexId: index.id,
      company,
    })),
  )
}

export interface DeckStats {
  total: number
  new: number
  due: number
  /** Seen, not due yet, interval under 21 days. */
  learning: number
  /** Not due, interval of 21+ days (a common "mature" threshold). */
  mastered: number
}

/** Buckets are exclusive, so new + due + learning + mastered === total. */
export function deckStats(cards: Card[], progress: ProgressMap, now: Date): DeckStats {
  const stats: DeckStats = { total: cards.length, new: 0, due: 0, learning: 0, mastered: 0 }
  for (const card of cards) {
    const state = progress[card.id]
    if (!state) stats.new++
    else if (isDue(state, now)) stats.due++
    else if (state.interval >= 21) stats.mastered++
    else stats.learning++
  }
  return stats
}

/**
 * Picks cards for a study session: every due card (most overdue first),
 * followed by up to `newLimit` unseen cards in deck order.
 *
 * New cards are skipped if another card for the same company is already in
 * the session ("sibling burying"), because seeing a company's profile makes
 * its brands card trivial straight afterwards. Skipped cards come up in a
 * later session.
 */
export function buildSession(cards: Card[], progress: ProgressMap, now: Date, newLimit: number): Card[] {
  const due = cards
    .filter((c) => progress[c.id] && isDue(progress[c.id], now))
    .sort((a, b) => progress[a.id].dueAt.localeCompare(progress[b.id].dueAt))
  const companiesInSession = new Set(due.map((c) => c.company.id))
  const fresh: Card[] = []
  for (const card of cards) {
    if (fresh.length >= newLimit) break
    if (progress[card.id] || companiesInSession.has(card.company.id)) continue
    fresh.push(card)
    companiesInSession.add(card.company.id)
  }
  return [...due, ...fresh]
}
