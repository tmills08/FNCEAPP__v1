// Core domain types. Company data lives in JSON files under src/data/indices/
// and is validated against these shapes at load time (see lib/validateIndex.ts).

/** ICB (Industry Classification Benchmark) industries, as used by FTSE Russell. */
export const SECTORS = [
  'Basic Materials',
  'Consumer Discretionary',
  'Consumer Staples',
  'Energy',
  'Financials',
  'Health Care',
  'Industrials',
  'Real Estate',
  'Technology',
  'Telecommunications',
  'Utilities',
] as const

export type Sector = (typeof SECTORS)[number]

export interface Headquarters {
  city: string
  country: string
}

export interface Company {
  /** Stable slug, unique within an index. Used in card ids, so don't rename it once learners have progress. */
  id: string
  name: string
  ticker: string
  sector: Sector
  /** Finer-grained label, e.g. "Pharmaceuticals". Optional. */
  industry?: string
  headquarters: Headquarters
  /** One or two plain-English sentences on what the company does. */
  description: string
  /** Well-known brands, products or business units. */
  brands: string[]
  competitors: string[]
}

export interface StockIndex {
  /** Stable slug, e.g. "ftse100". */
  id: string
  name: string
  country: string
  exchange: string
  /** ISO date the constituent list was last checked against the official list. */
  lastReviewed: string
  companies: Company[]
}

/** Different "questions" generated from the same company. */
export type CardKind = 'profile' | 'brands'

export interface Card {
  /** `${indexId}:${companyId}:${kind}` */
  id: string
  kind: CardKind
  indexId: string
  company: Company
}

/**
 * SM-2 recall grade. The UI exposes four buttons that map to:
 * Again = 1, Hard = 3, Good = 4, Easy = 5.
 */
export type Grade = 0 | 1 | 2 | 3 | 4 | 5

/** Per-card spaced-repetition state, persisted locally. */
export interface ReviewState {
  /** SM-2 easiness factor, >= 1.3. */
  ease: number
  /** Current interval in days (0 = relearning, show again soon). */
  interval: number
  /** Consecutive successful reviews. */
  repetitions: number
  /** ISO timestamp when the card is next due. */
  dueAt: string
  lastReviewedAt: string
  totalReviews: number
  lapses: number
}
