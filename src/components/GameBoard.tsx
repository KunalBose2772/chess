'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { MessageSquare, RotateCcw, Flag, Clock, Send, Zap } from 'lucide-react'
import Link from 'next/link'
import { useBoardTheme } from '@/components/BoardThemeProvider'

interface Move {
  san: string
  from: string
  to: string
  moveNumber: number
}

interface ChatMessage {
  id: number
  username: string
  message: string
  created_at: string
}

interface GamePlayer {
  id: string
  username: string
  rating: number
}

interface GameBoardProps {
  gameId: number
  playerColor: 'white' | 'black'
  whitePlayer: GamePlayer
  blackPlayer: GamePlayer
  initialFen?: string
}

function PlayerBar({
  player,
  isActive,
  isTop,
  gameResult,
}: {
  player: GamePlayer
  isActive: boolean
  isTop: boolean
  gameResult: string | null
}) {
  const avatarHue = player.username.charCodeAt(0) * 37 % 360
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 card-surface !rounded-2xl">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-white flex-shrink-0"
        style={{ background: `hsl(${avatarHue}, 55%, 48%)` }}
      >
        {player.username[0].toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{player.username}</p>
        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
          <Zap className="w-3 h-3 text-[var(--primary)]" /> {player.rating}
        </p>
      </div>
      {!gameResult && (
        <div className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
          isActive
            ? 'bg-[var(--primary)]/10 text-[var(--primary)] animate-pulse'
            : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
        }`}>
          {isActive ? (isTop ? '⏳ Waiting' : '✓ Your turn') : ''}
        </div>
      )}
    </div>
  )
}

export default function GameBoard({
  gameId,
  playerColor,
  whitePlayer,
  blackPlayer,
  initialFen,
}: GameBoardProps) {
  const { boardTheme } = useBoardTheme()
  const { user } = useAuthStore()
  const [game, setGame] = useState(new Chess(initialFen))
  const [moveHistory, setMoveHistory] = useState<Move[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [gameResult, setGameResult] = useState<string | null>(null)
  const [resultMsg, setResultMsg] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'moves' | 'chat'>('moves')
  const chatRef = useRef<HTMLDivElement>(null)
  const movesRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // ── Realtime subscriptions ────────────────────────────────────────────────
  useEffect(() => {
    const moveChannel = supabase
      .channel(`game:${gameId}:moves`)
      .on('broadcast', { event: 'move' }, ({ payload }: { payload: { san: string; fen: string; moveNumber: number } }) => {
        setGame(new Chess(payload.fen))
        setMoveHistory((prev) => [
          ...prev,
          { san: payload.san, from: '', to: '', moveNumber: payload.moveNumber },
        ])
        setTimeout(() => {
          movesRef.current?.scrollTo({ top: movesRef.current.scrollHeight, behavior: 'smooth' })
        }, 50)
      })
      .on('broadcast', { event: 'game_over' }, ({ payload }: { payload: { result: string; message: string } }) => {
        setGameResult(payload.result)
        setResultMsg(payload.message)
      })
      .subscribe()

    const chatChannel = supabase
      .channel(`game:${gameId}:chat`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_chat', filter: `game_id=eq.${gameId}` },
        (payload) => {
          setChatMessages((prev) => [...prev, payload.new as ChatMessage])
          setTimeout(() => {
            chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' })
          }, 50)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(moveChannel)
      supabase.removeChannel(chatChannel)
    }
  }, [gameId, supabase])

  // ── Load existing state ───────────────────────────────────────────────────
  useEffect(() => {
    ;(async () => {
      const { data: moves } = await supabase
        .from('moves')
        .select('san, from_sq, to_sq, move_number, fen_after')
        .eq('game_id', gameId)
        .order('move_number')

      if (moves && moves.length > 0) {
        const reconstructed = new Chess()
        for (const m of moves) {
          try { reconstructed.move(m.san) } catch {}
        }
        setGame(reconstructed)
        setMoveHistory(
          moves.map((m) => ({ san: m.san, from: m.from_sq, to: m.to_sq, moveNumber: m.move_number }))
        )
      }

      const { data: chats } = await supabase
        .from('game_chat')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at')
      if (chats) setChatMessages(chats)
    })()
  }, [gameId, supabase])

  // ── Move handler ──────────────────────────────────────────────────────────
  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare, piece }: { sourceSquare: string; targetSquare: string | null; piece: { pieceType: string } }) => {
      if (!targetSquare || !user || gameResult) return false
      const myTurn =
        (game.turn() === 'w' && playerColor === 'white') ||
        (game.turn() === 'b' && playerColor === 'black')
      if (!myTurn) return false

      try {
        const move = game.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: piece.pieceType ? piece.pieceType[1].toLowerCase() : 'q',
        })
        if (!move) return false

        const newGame = new Chess(game.fen())
        setGame(newGame)
        const moveNum = moveHistory.length + 1
        setMoveHistory((prev) => [...prev, { san: move.san, from: sourceSquare, to: targetSquare, moveNumber: moveNum }])
        setTimeout(() => {
          movesRef.current?.scrollTo({ top: movesRef.current.scrollHeight, behavior: 'smooth' })
        }, 50)

        fetch(`/api/games/${gameId}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            san: move.san, fromSq: sourceSquare, toSq: targetSquare,
            fenAfter: newGame.fen(), moveNumber: moveNum, promotion: move.promotion ?? null,
          }),
        })

        supabase.channel(`game:${gameId}:moves`).send({
          type: 'broadcast', event: 'move',
          payload: { san: move.san, fen: newGame.fen(), moveNumber: moveNum },
        })

        if (newGame.isGameOver()) {
          let result: '1-0' | '0-1' | '1/2-1/2' = '1/2-1/2'
          let msg = 'Draw!'
          if (newGame.isCheckmate()) {
            result = newGame.turn() === 'b' ? '1-0' : '0-1'
            msg = `Checkmate! ${result === '1-0' ? 'White' : 'Black'} wins!`
          } else if (newGame.isStalemate()) {
            msg = 'Stalemate – Draw!'
          } else if (newGame.isInsufficientMaterial()) {
            msg = 'Insufficient material – Draw!'
          }
          setGameResult(result)
          setResultMsg(msg)
          supabase.channel(`game:${gameId}:moves`).send({
            type: 'broadcast', event: 'game_over', payload: { result, message: msg },
          })
          fetch(`/api/games/${gameId}/move`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result }),
          })
        }
        return true
      } catch { return false }
    },
    [game, gameId, gameResult, moveHistory.length, playerColor, supabase, user]
  )

  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !user) return
    await supabase.from('game_chat').insert({
      game_id: gameId, user_id: user.id, username: user.username, message: chatInput.trim(),
    })
    setChatInput('')
  }

  const handleResign = async () => {
    if (!user || gameResult) return
    const result: '1-0' | '0-1' = playerColor === 'white' ? '0-1' : '1-0'
    setGameResult(result)
    setResultMsg(`${playerColor === 'white' ? 'White' : 'Black'} resigned.`)
    supabase.channel(`game:${gameId}:moves`).send({
      type: 'broadcast', event: 'game_over',
      payload: { result, message: `${playerColor === 'white' ? 'White' : 'Black'} resigned.` },
    })
    await fetch(`/api/games/${gameId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result }),
    })
  }

  const isMyTurn =
    (game.turn() === 'w' && playerColor === 'white') ||
    (game.turn() === 'b' && playerColor === 'black')

  const opponent = playerColor === 'white' ? blackPlayer : whitePlayer
  const me = playerColor === 'white' ? whitePlayer : blackPlayer

  // Move pairs for display
  const movePairs = moveHistory.reduce<Move[][]>((rows, m, i) => {
    if (i % 2 === 0) rows.push([m])
    else rows[rows.length - 1].push(m)
    return rows
  }, [])

  return (
    /*
     * Outer: fills the parent h-screen main container
     * Layout: on desktop → row (board | panel)
     *          on mobile  → column (panel top-mini | board | actions)
     */
    <div className="w-full h-full flex flex-col lg:flex-row gap-0 overflow-hidden">

      {/* ── BOARD COLUMN ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-2 p-3 sm:p-4 min-h-0 overflow-hidden">

        {/* Opponent bar */}
        <PlayerBar
          player={opponent}
          isActive={!isMyTurn && !gameResult}
          isTop
          gameResult={gameResult}
        />

        {/* Game result overlay banner */}
        <AnimatePresence>
          {resultMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated !py-3 text-center !border-[var(--primary)]/20"
            >
              <p className="font-semibold text-[var(--text-primary)] text-sm">{resultMsg}</p>
              <Link
                href="/play"
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline"
              >
                <RotateCcw className="w-3 h-3" /> Play again
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The chessboard — height-first: never taller than available space */}
        <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden p-1">
          <div
            className="card-elevated !p-2 sm:!p-3"
            style={{ height: '100%', aspectRatio: '1 / 1', maxWidth: '100%' }}
          >
            <div className="w-full h-full rounded-xl overflow-hidden">
              <Chessboard
                options={{
                  position: game.fen(),
                  boardOrientation: playerColor,
                  onPieceDrop: onPieceDrop,
                  darkSquareStyle: { backgroundColor: boardTheme.dark },
                  lightSquareStyle: { backgroundColor: boardTheme.light },
                  animationDurationInMs: 150,
                  allowDragging: !gameResult,
                }}
              />
            </div>
          </div>
        </div>

        {/* My bar + resign */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <PlayerBar
              player={{ ...me, username: `${me.username} (you)` }}
              isActive={isMyTurn && !gameResult}
              isTop={false}
              gameResult={gameResult}
            />
          </div>
          {!gameResult && (
            <button
              onClick={handleResign}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-red-500 dark:text-red-400 border border-red-200 dark:border-red-500/25 bg-red-50 dark:bg-red-500/[0.06] hover:bg-red-100 dark:hover:bg-red-500/10 transition-colors flex-shrink-0"
            >
              <Flag className="w-3.5 h-3.5" /> Resign
            </button>
          )}
        </div>
      </div>

      {/* ── SIDE PANEL ───────────────────────────────────────────────────── */}
      <div className="w-full lg:w-72 xl:w-80 flex flex-col border-t lg:border-t-0 lg:border-l border-[var(--border-primary)] min-h-0">

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-primary)] flex-shrink-0">
          {(['moves', 'chat'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === t
                  ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t === 'moves' ? <Clock className="w-3.5 h-3.5" /> : <MessageSquare className="w-3.5 h-3.5" />}
              {t === 'moves' ? 'Moves' : 'Chat'}
            </button>
          ))}
        </div>

        {/* Move history */}
        {activeTab === 'moves' && (
          <div ref={movesRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
            {movePairs.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-[var(--text-muted)]">No moves yet</p>
              </div>
            ) : (
              movePairs.map((pair, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                  <span className="text-[var(--text-muted)] w-6 flex-shrink-0 tabular-nums">{i + 1}.</span>
                  <span className="flex-1 font-mono font-semibold text-[var(--text-primary)]">{pair[0].san}</span>
                  <span className="flex-1 font-mono text-[var(--text-secondary)]">{pair[1]?.san ?? ''}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div ref={chatRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {chatMessages.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-xs text-[var(--text-muted)]">No messages yet</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-xs rounded-xl px-3 py-2 max-w-[85%] ${
                      msg.username === user?.username
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)] self-end'
                        : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] self-start'
                    }`}
                  >
                    <span className="font-semibold block text-[var(--text-muted)] mb-0.5 text-[10px]">{msg.username}</span>
                    {msg.message}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={sendChat} className="p-3 border-t border-[var(--border-primary)] flex gap-2 flex-shrink-0">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Say something..."
                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <button
                type="submit"
                className="w-8 h-8 bg-[var(--primary)] rounded-xl flex items-center justify-center hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5 text-white" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
