import { Suspense } from 'react'
import GameClient from '@/components/GameClient'
import { Loader2 } from 'lucide-react'

export const metadata = { title: 'Live Game - ChessOnline' }

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const gameId = parseInt(id, 10)

  return (
    <div className="flex flex-col flex-1 w-full p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="max-w-7xl mx-auto w-full relative z-10">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
          </div>
        }>
          <GameClient gameId={gameId} />
        </Suspense>
      </div>
    </div>
  )
}
