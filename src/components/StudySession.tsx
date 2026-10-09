import { useCallback, useEffect, useState } from 'react'
import type { ProgressMap } from '../lib/deck'
import { formatInterval, review } from '../lib/sm2'
import type { Card, Grade } from '../types/models'
import { Flashcard } from './Flashcard'

const GRADE_BUTTONS: { grade: Grade; label: string; key: string; className: string }[] = [
  { grade: 1, label: 'Again', key: '1', className: 'grade-again' },
  { grade: 3, label: 'Hard', key: '2', className: 'grade-hard' },
  { grade: 4, label: 'Good', key: '3', className: 'grade-good' },
  { grade: 5, label: 'Easy', key: '4', className: 'grade-easy' },
]

interface Props {
  initialCards: Card[]
  indexName: string
  progress: ProgressMap
  onGrade: (cardId: string, grade: Grade) => void
  onExit: () => void
}

export function StudySession({ initialCards, indexName, progress, onGrade, onExit }: Props) {
  const [queue, setQueue] = useState(initialCards)
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [correct, setCorrect] = useState(0)

  const card = queue[0]

  const grade = useCallback(
    (g: Grade) => {
      if (!card) return
      onGrade(card.id, g)
      setReviewed((n) => n + 1)
      if (g >= 3) setCorrect((n) => n + 1)
      // Failed cards go to the back of the queue and come round again this session.
      setQueue((q) => (g < 3 ? [...q.slice(1), q[0]] : q.slice(1)))
      setFlipped(false)
    },
    [card, onGrade],
  )

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!card || e.metaKey || e.ctrlKey || e.altKey) return
      if (!flipped && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault()
        setFlipped(true)
        return
      }
      const button = flipped && GRADE_BUTTONS.find((b) => b.key === e.key)
      if (button) grade(button.grade)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [card, flipped, grade])

  if (!card) {
    return (
      <section className="session-done">
        <h2>Session complete</h2>
        <p>
          You reviewed {reviewed} card{reviewed === 1 ? '' : 's'}
          {reviewed > 0 && ` and recalled ${Math.round((correct / reviewed) * 100)}% of them`}.
        </p>
        <button type="button" className="primary" onClick={onExit}>
          Back to deck
        </button>
      </section>
    )
  }

  const now = new Date()
  const remaining = queue.length

  return (
    <section className="session">
      <header className="session-header">
        <button type="button" className="link" onClick={onExit}>
          ← End session
        </button>
        <span className="muted">
          {remaining} left · {reviewed} reviewed
        </span>
      </header>

      <Flashcard card={card} indexName={indexName} flipped={flipped} onFlip={() => setFlipped(true)} />

      <div className="session-actions">
        {flipped ? (
          <div className="grade-buttons">
            {GRADE_BUTTONS.map((b) => (
              <button key={b.grade} type="button" className={`grade ${b.className}`} onClick={() => grade(b.grade)}>
                <span className="grade-label">{b.label}</span>
                <span className="grade-interval">{formatInterval(review(progress[card.id], b.grade, now).interval)}</span>
              </button>
            ))}
          </div>
        ) : (
          <button type="button" className="primary show-answer" onClick={() => setFlipped(true)}>
            Show answer <kbd>Space</kbd>
          </button>
        )}
        {flipped && <p className="muted key-hint">Keys 1–4 to grade</p>}
      </div>
    </section>
  )
}
