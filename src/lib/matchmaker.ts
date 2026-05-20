/**
 * In-memory matchmaking queue (production: replace with Redis sorted sets).
 * Rating-based pairing as described in the documentation.
 * Score = player rating, time control keyed.
 */

export type TimeControl = 'bullet' | 'blitz' | 'rapid' | 'classical'

interface QueueEntry {
  userId: string
  username: string
  rating: number
  timeControl: TimeControl
  enqueuedAt: number
}

// In-memory store – in production use Redis ZADD/ZPOPMIN
const queues = new Map<TimeControl, QueueEntry[]>()

export function enqueue(entry: QueueEntry): QueueEntry | null {
  const queue = queues.get(entry.timeControl) ?? []

  // Find opponent: rating within ±200 points
  const index = queue.findIndex(
    (e) =>
      e.userId !== entry.userId &&
      Math.abs(e.rating - entry.rating) <= 200
  )

  if (index !== -1) {
    const [opponent] = queue.splice(index, 1)
    queues.set(entry.timeControl, queue)
    return opponent // matched!
  }

  // No match yet – add to queue
  queue.push(entry)
  // Sort by rating (ascending) — mirrors Redis sorted set
  queue.sort((a, b) => a.rating - b.rating)
  queues.set(entry.timeControl, queue)
  return null
}

export function dequeue(userId: string, timeControl: TimeControl): void {
  const queue = queues.get(timeControl) ?? []
  queues.set(
    timeControl,
    queue.filter((e) => e.userId !== userId)
  )
}

export function getQueueLength(timeControl: TimeControl): number {
  return queues.get(timeControl)?.length ?? 0
}
