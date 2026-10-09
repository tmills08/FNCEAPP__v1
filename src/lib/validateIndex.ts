import { SECTORS, type Company, type Sector, type StockIndex } from '../types/models'

/**
 * Checks raw JSON against the StockIndex shape and returns it typed.
 * Throws one error listing every problem, so a bad edit to a data file
 * fails loudly (in tests and at app start) instead of rendering broken cards.
 */
export function validateIndex(raw: unknown): StockIndex {
  const errors: string[] = []
  const isObj = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
  const isStr = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0
  const isStrList = (v: unknown): v is string[] => Array.isArray(v) && v.every(isStr)

  if (!isObj(raw)) throw new Error('Index data must be a JSON object')

  for (const key of ['id', 'name', 'country', 'exchange', 'lastReviewed'] as const) {
    if (!isStr(raw[key])) errors.push(`index.${key} must be a non-empty string`)
  }
  if (!Array.isArray(raw.companies) || raw.companies.length === 0) {
    errors.push('index.companies must be a non-empty array')
  }

  const ids = new Set<string>()
  const tickers = new Set<string>()
  const companies = Array.isArray(raw.companies) ? raw.companies : []

  companies.forEach((c: unknown, i: number) => {
    const where = isObj(c) && isStr(c.id) ? `company "${c.id}"` : `companies[${i}]`
    if (!isObj(c)) {
      errors.push(`${where} must be an object`)
      return
    }
    for (const key of ['id', 'name', 'ticker', 'description'] as const) {
      if (!isStr(c[key])) errors.push(`${where}.${key} must be a non-empty string`)
    }
    if (c.industry !== undefined && !isStr(c.industry)) {
      errors.push(`${where}.industry must be a non-empty string if present`)
    }
    if (!SECTORS.includes(c.sector as Sector)) {
      errors.push(`${where}.sector "${String(c.sector)}" must be one of: ${SECTORS.join(', ')}`)
    }
    const hq = c.headquarters
    if (!isObj(hq) || !isStr(hq.city) || !isStr(hq.country)) {
      errors.push(`${where}.headquarters must have non-empty city and country`)
    }
    for (const key of ['brands', 'competitors'] as const) {
      if (!isStrList(c[key]) || (c[key] as string[]).length === 0) {
        errors.push(`${where}.${key} must be a non-empty array of strings`)
      }
    }
    if (isStr(c.id)) {
      if (!/^[a-z0-9-]+$/.test(c.id)) errors.push(`${where}.id must be lowercase letters, digits and hyphens`)
      if (ids.has(c.id)) errors.push(`duplicate company id "${c.id}"`)
      ids.add(c.id)
    }
    if (isStr(c.ticker)) {
      if (tickers.has(c.ticker)) errors.push(`duplicate ticker "${c.ticker}"`)
      tickers.add(c.ticker)
    }
  })

  if (errors.length > 0) {
    const label = isStr(raw.id) ? raw.id : 'index'
    throw new Error(`Invalid data for ${label}:\n- ${errors.join('\n- ')}`)
  }
  return { ...(raw as unknown as StockIndex), companies: companies as Company[] }
}
