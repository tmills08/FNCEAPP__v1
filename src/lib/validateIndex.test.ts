import { describe, expect, it } from 'vitest'
import ftse100 from '../data/indices/ftse100.json'
import { validateIndex } from './validateIndex'

describe('validateIndex', () => {
  it('accepts the bundled FTSE 100 data', () => {
    expect(() => validateIndex(ftse100)).not.toThrow()
  })

  it('reports every problem with the offending company named', () => {
    const bad = structuredClone(ftse100) as { companies: Record<string, unknown>[] }
    bad.companies[0].sector = 'Pharma'
    bad.companies[1].brands = []
    bad.companies[2].id = bad.companies[3].id
    expect(() => validateIndex(bad)).toThrowError(
      new RegExp(
        [
          `company "${ftse100.companies[0].id}".sector "Pharma"`,
          `company "${ftse100.companies[1].id}".brands`,
          `duplicate company id "${ftse100.companies[3].id}"`,
        ]
          .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('[\\s\\S]*'),
      ),
    )
  })
})
