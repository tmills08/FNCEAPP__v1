import type { ProgressMap } from './deck'

// All progress lives in one localStorage entry. Keeping access behind these
// two functions means a mobile wrapper (e.g. Capacitor Preferences) or a
// future backend only has to replace this file.

const STORAGE_KEY = 'index-flashcards:progress'
const SCHEMA_VERSION = 1

interface StoredProgress {
  version: number
  cards: ProgressMap
}

export function loadProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as StoredProgress
    if (parsed.version !== SCHEMA_VERSION || typeof parsed.cards !== 'object' || parsed.cards === null) return {}
    return parsed.cards
  } catch {
    return {}
  }
}

export function saveProgress(cards: ProgressMap): void {
  const data: StoredProgress = { version: SCHEMA_VERSION, cards }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage full or disabled (e.g. some private browsing modes): progress
    // still works for this session, it just won't persist.
  }
}

export function clearProgress(): void {
  localStorage.removeItem(STORAGE_KEY)
}
