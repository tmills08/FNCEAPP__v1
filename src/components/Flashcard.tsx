import { maskCompanyName } from '../lib/maskName'
import type { Card, Company } from '../types/models'

interface Props {
  card: Card
  indexName: string
  flipped: boolean
  onFlip: () => void
}

export function Flashcard({ card, indexName, flipped, onFlip }: Props) {
  return (
    // Clicking the card is a shortcut; the session also renders a real
    // "Show answer" button and handles Space/Enter for keyboard users.
    <div className={`flashcard ${flipped ? 'is-flipped' : ''}`} onClick={flipped ? undefined : onFlip}>
      {flipped ? <Back card={card} /> : <Front card={card} indexName={indexName} />}
    </div>
  )
}

function Front({ card, indexName }: { card: Card; indexName: string }) {
  const { company } = card
  if (card.kind === 'brands') {
    return (
      <div className="card-face">
        <p className="card-prompt">Which {indexName} company owns these?</p>
        <ul className="chip-list">
          {company.brands.map((b) => (
            <li key={b} className="chip">
              {maskCompanyName(b, company.name)}
            </li>
          ))}
        </ul>
        <p className="card-hint">Sector: {company.sector}</p>
      </div>
    )
  }
  return (
    <div className="card-face">
      <p className="card-prompt">What do you know about…</p>
      <h2 className="card-title">{company.name}</h2>
      <p className="ticker">{company.ticker}</p>
      <p className="card-hint">Sector · HQ · what it does · brands · competitors</p>
    </div>
  )
}

function Back({ card }: { card: Card }) {
  return (
    <div className="card-face card-back">
      <CompanyDetails company={card.company} />
    </div>
  )
}

export function CompanyDetails({ company }: { company: Company }) {
  return (
    <div className="company-details">
      <h2 className="card-title">
        {company.name} <span className="ticker">{company.ticker}</span>
      </h2>
      <dl>
        <dt>Sector</dt>
        <dd>
          {company.sector}
          {company.industry && <span className="muted"> · {company.industry}</span>}
        </dd>
        <dt>HQ</dt>
        <dd>
          {company.headquarters.city}, {company.headquarters.country}
        </dd>
        <dt>What it does</dt>
        <dd>{company.description}</dd>
        <dt>Brands &amp; products</dt>
        <dd>{company.brands.join(', ')}</dd>
        <dt>Competitors</dt>
        <dd>{company.competitors.join(', ')}</dd>
      </dl>
    </div>
  )
}
