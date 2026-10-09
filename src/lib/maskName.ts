const IGNORED_WORDS = new Set(['group', 'holdings', 'plc', 'and', 'the', 'of'])
export const MASK = '■■■'

/**
 * Hides words from the company's own name inside a clue, so a "which company
 * owns these brands?" card doesn't give itself away ("Shell V-Power" ->
 * "■■■ V-Power", "Barclaycard" -> "■■■card"). Matching is on word prefixes,
 * with a trailing "s" dropped so "Barclays" also catches "Barclaycard".
 */
export function maskCompanyName(text: string, companyName: string): string {
  const stems = companyName
    .split(/[\s&.,()/-]+/)
    .filter((w) => w.length >= 2 && !IGNORED_WORDS.has(w.toLowerCase()))
    .map((w) => (w.length > 4 && /s$/i.test(w) ? `${escapeRegExp(w.slice(0, -1))}s?` : escapeRegExp(w)))
  if (stems.length === 0) return text
  const pattern = new RegExp(`\\b(?:${stems.join('|')})`, 'gi')
  return text.replace(pattern, MASK)
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
