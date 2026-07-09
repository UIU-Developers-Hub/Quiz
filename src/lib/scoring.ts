// src/lib/scoring.ts

/**
 * Calculate points earned for a correct answer.
 * Speed bonus: answering faster earns up to 50% extra.
 */
export function calcPoints(basePoints: number, timeLimit: number, timeSpent: number): number {
  const ratio = Math.max(0, (timeLimit - timeSpent) / timeLimit)
  const speedBonus = Math.floor(basePoints * 0.5 * ratio)
  return basePoints + speedBonus
}

/** Format seconds into mm:ss */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Get letter grade from accuracy */
export function getGrade(accuracy: number): { grade: string; color: string } {
  if (accuracy >= 90) return { grade: 'S', color: '#f59e0b' }
  if (accuracy >= 80) return { grade: 'A', color: '#22c55e' }
  if (accuracy >= 70) return { grade: 'B', color: '#3b82f6' }
  if (accuracy >= 60) return { grade: 'C', color: '#a855f7' }
  if (accuracy >= 40) return { grade: 'D', color: '#f97316' }
  return { grade: 'F', color: '#ef4444' }
}
