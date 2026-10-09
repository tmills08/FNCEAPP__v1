import { useMemo, useState } from 'react'
import { Home } from './components/Home'
import { StudySession } from './components/StudySession'
import { INDICES, getIndex } from './data/indices'
import { useProgress } from './hooks/useProgress'
import { buildCards, buildSession, deckStats } from './lib/deck'
import type { Card } from './types/models'

export default function App() {
  const [indexId, setIndexId] = useState(INDICES[0].id)
  const [newLimit, setNewLimit] = useState(10)
  // Snapshot of the cards for the running session; null on the home screen.
  const [session, setSession] = useState<Card[] | null>(null)
  const { progress, recordReview, resetProgress } = useProgress()

  const index = getIndex(indexId) ?? INDICES[0]
  const cards = useMemo(() => buildCards(index), [index])
  const now = new Date()
  const stats = deckStats(cards, progress, now)
  const nextSession = buildSession(cards, progress, now, newLimit)

  return (
    <div className="app">
      <header className="app-header">
        <h1>Index Flashcards</h1>
        <p className="muted">Learn the companies behind the {index.name}</p>
      </header>
      <main>
        {session ? (
          <StudySession
            initialCards={session}
            indexName={index.name}
            progress={progress}
            onGrade={recordReview}
            onExit={() => setSession(null)}
          />
        ) : (
          <Home
            indices={INDICES}
            index={index}
            stats={stats}
            newLimit={newLimit}
            sessionSize={nextSession.length}
            onSelectIndex={setIndexId}
            onNewLimitChange={setNewLimit}
            onStart={() => setSession(nextSession)}
            onReset={resetProgress}
          />
        )}
      </main>
    </div>
  )
}
