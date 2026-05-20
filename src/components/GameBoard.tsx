'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { Crown, MessageSquare, RotateCcw, Flag, Clock, Send } from 'lucide-react'
import Link from 'next/link'

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

export default function GameBoard({
  gameId,
  playerColor,
  whitePlayer,
  blackPlayer,
  initialFen,
}: GameBoardProps) {
  const { user } = useAuthStore()
  const [game, setGame] = useState(new Chess(initialFen))
  const [moveHistory, setMoveHistory] = useState<Move[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [gameResult, setGameResult] = useState<string | null>(null)
  const [resultMsg, setResultMsg] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'moves' | 'chat'>('moves')
  const chatRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // ── Supabase Realtime subscriptions ──────────────────────────────────────
  // Move channel: broadcast pattern (doc: game events via Supabase Realtime)
  useEffect(() => {
    const moveChannel = supabase
      .channel(`game:${gameId}:moves`)
      .on('broadcast', { event: 'move' }, ({ payload }: { payload: { san: string; fen: string; moveNumber: number } }) => {
        setGame(new Chess(payload.fen))
        setMoveHistory((prev) => [
          ...prev,
          { san: payload.san, from: '', to: '', moveNumber: payload.moveNumber },
        ])
      })
      .on('broadcast', { event: 'game_over' }, ({ payload }: { payload: { result: string; message: string } }) => {
        setGameResult(payload.result)
        setResultMsg(payload.message)
      })
      .subscribe()

    // Chat: listen to DB changes (Realtime DB changes for game_chat table)
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

  // ── Load existing moves from DB ──────────────────────────────────────────
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

  // ── Make a move ──────────────────────────────────────────────────────────
  const onPieceDrop = useCallback(
    ({ sourceSquare, targetSquare, piece }: { sourceSquare: string; targetSquare: string | null; piece: { pieceType: string } }) => {
      if (!targetSquare) return false
      if (!user) return false
      // Only allow moves on your turn
      const myTurn =
        (game.turn() === 'w' && playerColor === 'white') ||
        (game.turn() === 'b' && playerColor === 'black')
      if (!myTurn) return false
      if (gameResult) return false

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

        // Persist move to DB
        fetch(`/api/games/${gameId}/move`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            san: move.san,
            fromSq: sourceSquare,
            toSq: targetSquare,
            fenAfter: newGame.fen(),
            moveNumber: moveNum,
            promotion: move.promotion ?? null,
          }),
        })

        // Broadcast move to opponent via Supabase Realtime
        supabase.channel(`game:${gameId}:moves`).send({
          type: 'broadcast',
          event: 'move',
          payload: { san: move.san, fen: newGame.fen(), moveNumber: moveNum },
        })

        // Check game over
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

          // Notify opponent via broadcast
          supabase.channel(`game:${gameId}:moves`).send({
            type: 'broadcast',
            event: 'game_over',
            payload: { result, message: msg },
          })

          // Update DB
          fetch(`/api/games/${gameId}/move`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ result }),
          })
        }

        return true
      } catch {
        return false
      }
    },
    [game, gameId, gameResult, moveHistory.length, playerColor, supabase, user]
  )

  // ── Send chat ────────────────────────────────────────────────────────────
  const sendChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || !user) return
    await supabase.from('game_chat').insert({
      game_id: gameId,
      user_id: user.id,
      username: user.username,
      message: chatInput.trim(),
    })
    setChatInput('')
  }

  // ── Resign ───────────────────────────────────────────────────────────────
  const handleResign = async () => {
    if (!user || gameResult) return
    const result: '1-0' | '0-1' = playerColor === 'white' ? '0-1' : '1-0'
    setGameResult(result)
    setResultMsg(`${playerColor === 'white' ? 'White' : 'Black'} resigned. ${result === '1-0' ? 'White' : 'Black'} wins!`)
    supabase.channel(`game:${gameId}:moves`).send({
      type: 'broadcast',
      event: 'game_over',
      payload: { result, message: `${playerColor === 'white' ? 'White' : 'Black'} resigned.` },
    })
    await fetch(`/api/games/${gameId}/move`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result }),
    })
  }

  const turnLabel = game.turn() === 'w' ? 'White' : 'Black'
  const isMyTurn =
    (game.turn() === 'w' && playerColor === 'white') ||
    (game.turn() === 'b' && playerColor === 'black')

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-7xl mx-auto">
      {/* ── Board ── */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Opponent info */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center font-bold text-sm text-white">
            {playerColor === 'white'
              ? blackPlayer.username[0].toUpperCase()
              : whitePlayer.username[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">
              {playerColor === 'white' ? blackPlayer.username : whitePlayer.username}
            </p>
            <p className="text-xs text-slate-400">
              ⚡ {playerColor === 'white' ? blackPlayer.rating : whitePlayer.rating}
            </p>
          </div>
          <div className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold ${
            !isMyTurn && !gameResult
              ? 'bg-indigo-500/20 text-indigo-300 animate-pulse'
              : 'bg-white/5 text-slate-400'
          }`}>
            {gameResult ? '⏸ Game Over' : !isMyTurn ? '⏳ Their turn' : ''}
          </div>
        </div>

        {/* Game result banner */}
        {resultMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-4 glass-panel border border-indigo-500/30 rounded-2xl text-center"
          >
            <p className="text-xl font-bold text-white font-outfit">{resultMsg}</p>
            <Link
              href="/play"
              className="mt-3 inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Play again
            </Link>
          </motion.div>
        )}

        {/* Chessboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative glass-panel p-3 rounded-2xl shadow-2xl shadow-indigo-500/20 border border-white/5"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl pointer-events-none" />
          <div className="relative rounded-xl overflow-hidden">
            <Chessboard
              options={{
                position: game.fen(),
                boardOrientation: playerColor,
                onPieceDrop: onPieceDrop,
                darkSquareStyle: { backgroundColor: '#4f46e5' },
                lightSquareStyle: { backgroundColor: '#e0e7ff' },
                animationDurationInMs: 200,
                allowDragging: !gameResult,
              }}
            />
          </div>
        </motion.div>

        {/* My info + controls */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-sm text-white">
            {user?.username?.[0]?.toUpperCase() ?? 'Y'}
          </div>
          <div>
            <p className="font-semibold text-white">{user?.username ?? 'You'} ({playerColor})</p>
            <p className="text-xs text-slate-400">⚡ {user?.rating}</p>
          </div>
          {!gameResult && (
            <div className="ml-auto flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                isMyTurn ? 'bg-emerald-500/20 text-emerald-300 animate-pulse' : 'bg-white/5 text-slate-400'
              }`}>
                {isMyTurn ? `✓ Your turn (${turnLabel})` : ''}
              </div>
              <button
                onClick={handleResign}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/20 transition-colors"
              >
                <Flag className="w-3.5 h-3.5" /> Resign
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Side panel: moves + chat ── */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full xl:w-80 glass-panel rounded-2xl border border-white/5 flex flex-col overflow-hidden"
      >
        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {(['moves', 'chat'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === t ? 'text-white border-b-2 border-indigo-500' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'moves' ? <Clock className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              {t === 'moves' ? 'Moves' : 'Chat'}
            </button>
          ))}
        </div>

        {/* Move history */}
        {activeTab === 'moves' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            {moveHistory.length === 0 ? (
              <p className="text-slate-500 text-sm text-center mt-8">No moves yet.</p>
            ) : (
              moveHistory.reduce<Move[][]>((rows, m, i) => {
                if (i % 2 === 0) rows.push([m])
                else rows[rows.length - 1].push(m)
                return rows
              }, []).map((pair, i) => (
                <div key={i} className="flex items-center text-sm bg-white/5 rounded-lg px-3 py-1.5">
                  <span className="text-slate-500 w-7">{i + 1}.</span>
                  <span className="flex-1 font-mono text-white font-medium">{pair[0].san}</span>
                  <span className="flex-1 font-mono text-slate-300">{pair[1]?.san ?? ''}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col">
            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-2">
              {chatMessages.length === 0 ? (
                <p className="text-slate-500 text-sm text-center mt-8">No messages yet.</p>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-sm rounded-xl px-3 py-2 ${
                      msg.username === user?.username
                        ? 'bg-indigo-500/20 text-indigo-200 ml-4'
                        : 'bg-white/5 text-slate-300 mr-4'
                    }`}
                  >
                    <span className="font-semibold text-white text-xs">{msg.username}: </span>
                    {msg.message}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={sendChat} className="p-3 border-t border-white/5 flex gap-2">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Say something..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-500 rounded-xl hover:bg-indigo-600 transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  )
}
