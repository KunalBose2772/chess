import { Suspense } from 'react'
import GameClient from '@/components/GameClient'
import { Loader2 } from 'lucide-react'

export const metadata = { title: 'Live Game — ChessOnline' }

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const gameId = parseInt(id, 10)

  return (
    /* 
     * No padding, no max-width — GameBoard owns all the space
     * h-full inherits from the <main> which is h-screen in layout.tsx
     */
    <div className="w-full h-full flex flex-col overflow-hidden bg-[var(--bg-main)]">
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
              </div>
              <p className="text-sm text-[var(--text-muted)]">Loading game…</p>
            </div>
          </div>
        }
      >
        <GameClient gameId={gameId} />
      </Suspense>
    </div>
  )
}
