import { validateIndex } from '../../lib/validateIndex'
import type { StockIndex } from '../../types/models'
import ftse100 from './ftse100.json'

// To add an index: drop a new JSON file in this folder (same shape as
// ftse100.json) and add it to this list.
export const INDICES: StockIndex[] = [ftse100].map(validateIndex)

export function getIndex(id: string): StockIndex | undefined {
  return INDICES.find((index) => index.id === id)
}
