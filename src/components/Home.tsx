import type { DeckStats } from '../lib/deck'
import type { StockIndex } from '../types/models'

const NEW_CARD_OPTIONS = [5, 10, 20, 50]

interface Props {
  indices: StockIndex[]
  index: StockIndex
  stats: DeckStats
  newLimit: number
  sessionSize: number
  onSelectIndex: (id: string) => void
  onNewLimitChange: (n: number) => void
  onStart: () => void
  onReset: () => void
}

export function Home({
  indices,
  index,
  stats,
  newLimit,
  sessionSize,
  onSelectIndex,
  onNewLimitChange,
  onStart,
  onReset,
}: Props) {
  return (
    <section className="home">
      <div className="deck-picker">
        <label htmlFor="index-select">Index</label>
        <select id="index-select" value={index.id} onChange={(e) => onSelectIndex(e.target.value)}>
          {indices.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
        <p className="muted">
          {index.companies.length} companies · {index.exchange} · data reviewed {index.lastReviewed}
        </p>
      </div>

      <div className="stats">
        <Stat label="Due" value={stats.due} highlight />
        <Stat label="New" value={stats.new} />
        <Stat label="Learning" value={stats.learning} />
        <Stat label="Mastered" value={stats.mastered} />
      </div>

      <div className="study-panel">
        <h2>Flashcards</h2>
        <label className="inline-field">
          New cards per session
          <select value={newLimit} onChange={(e) => onNewLimitChange(Number(e.target.value))}>
            {NEW_CARD_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="primary" onClick={onStart} disabled={sessionSize === 0}>
          {sessionSize === 0 ? 'All caught up' : `Study ${sessionSize} card${sessionSize === 1 ? '' : 's'}`}
        </button>
      </div>

      <div className="study-panel disabled">
        <h2>Quiz</h2>
        <p className="muted">Multiple-choice mode — coming next.</p>
      </div>

      <button
        type="button"
        className="link danger"
        onClick={() => {
          if (confirm('Reset all flashcard progress? This cannot be undone.')) onReset()
        }}
      >
        Reset progress
      </button>
    </section>
  )
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`stat ${highlight && value > 0 ? 'highlight' : ''}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}
