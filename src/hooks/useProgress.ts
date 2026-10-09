import { useCallback, useState } from 'react'
import type { ProgressMap } from '../lib/deck'
import { review } from '../lib/sm2'
import { clearProgress, loadProgress, saveProgress } from '../lib/storage'
import type { Grade } from '../types/models'

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>(loadProgress)

  const recordReview = useCallback((cardId: string, grade: Grade) => {
    setProgress((prev) => {
      const next = { ...prev, [cardId]: review(prev[cardId], grade, new Date()) }
      saveProgress(next)
      return next
    })
  }, [])

  const resetProgress = useCallback(() => {
    clearProgress()
    setProgress({})
  }, [])

  return { progress, recordReview, resetProgress }
}
