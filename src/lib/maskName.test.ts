import { describe, expect, it } from 'vitest'
import { INDICES } from '../data/indices'
import { MASK, maskCompanyName } from './maskName'

describe('maskCompanyName', () => {
  it.each([
    ['Shell V-Power', 'Shell', `${MASK} V-Power`],
    ['Barclaycard', 'Barclays', `${MASK}card`],
    ['HSBC UK', 'HSBC Holdings', `${MASK} UK`],
    ["Sainsbury's", 'J Sainsbury', `${MASK}'s`],
    ['bp pulse', 'BP', `${MASK} pulse`],
    ['Landsec', 'Land Securities Group', `${MASK}sec`],
    ['Rolls-Royce SMR', 'Rolls-Royce Holdings', `${MASK}-${MASK} SMR`],
    ['Halifax', 'Lloyds Banking Group', 'Halifax'],
  ])('masks %s for %s', (text, name, expected) => {
    expect(maskCompanyName(text, name)).toBe(expected)
  })

  it('leaves no full company name visible on any brands card', () => {
    for (const index of INDICES) {
      for (const company of index.companies) {
        for (const brand of company.brands) {
          expect(maskCompanyName(brand, company.name).toLowerCase()).not.toContain(company.name.toLowerCase())
        }
      }
    }
  })
})
