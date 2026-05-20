'use client'

import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Lightbulb, RotateCcw, ChevronRight } from 'lucide-react'

// Curated puzzle set - in production these come from the `puzzles` Postgres table
const PUZZLES = [
  {
    id: 1,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    solution: ['f3g5'],
    theme: 'Attack',
    rating: 1100,
    description: 'White to move – find the aggressive knight move.',
  },
  {
    id: 2,
    fen: '7k/5Rpp/8/8/8/8/8/K7 w - - 0 1',
    solution: ['f7f8'],
    theme: 'Checkmate in 1',
    rating: 900,
    description: 'White to move – deliver checkmate in one move.',
  },
  {
    id: 3,
    fen: 'r3k2r/ppq2ppp/2p1pn2/2b5/2B5/2N1PN2/PPP2PPP/R2QK2R w KQkq - 0 8',
    solution: ['c3d5'],
    theme: 'Fork',
    rating: 1300,
    description: 'White to move – find the knight fork.',
  },
  {
    id: 4,
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    solution: ['e1e8'],
    theme: 'Back Rank',
    rating: 1000,
    description: 'White to move – exploit the back rank.',
  },
  {
    id: 5,
    fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 7',
    solution: ['c4f7'],
    theme: 'Sacrifice',
    rating: 1400,
    description: 'White to move – find the shocking bishop sacrifice.',
  },
]

export default function PuzzlesPage() {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [game, setGame] = useState(new Chess(PUZZLES[0].fen))
  const [solved, setSolved] = useState(false)
  const [failed, setFailed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [movesMade, setMovesMade] = useState(0)
  const [score, setScore] = useState(0)

  const puzzle = PUZZLES[puzzleIndex]

  const resetPuzzle = () => {
    setGame(new Chess(puzzle.fen))
    setSolved(false)
    setFailed(false)
    setShowHint(false)
    setMovesMade(0)
  }

  const nextPuzzle = () => {
    const next = (puzzleIndex + 1) % PUZZLES.length
    setPuzzleIndex(next)
    setGame(new Chess(PUZZLES[next].fen))
    setSolved(false)
    setFailed(false)
    setShowHint(false)
    setMovesMade(0)
  }

  const onPieceDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null; piece: { pieceType: string } }) => {
    if (solved || failed || !targetSquare) return false
    try {
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
      if (!move) return false

      const newGame = new Chess(game.fen())
      setGame(newGame)

      // Check solution
      const expectedUci = puzzle.solution[movesMade]
      const madeUci = sourceSquare + targetSquare
      if (madeUci === expectedUci) {
        if (movesMade + 1 === puzzle.solution.length) {
          setSolved(true)
          setScore(s => s + 1)
        }
        setMovesMade(m => m + 1)
      } else {
        setFailed(true)
      }
      return true
    } catch {
      return false
    }
  }

  const turnLabel = game.turn() === 'w' ? 'White' : 'Black'

  return (
    <div className="flex flex-col flex-1 w-full px-6 py-12 relative">
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold font-outfit text-white">
            Chess <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">Puzzles</span>
          </h1>
          <p className="text-slate-400 mt-3">Train your pattern recognition. {score} solved today.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Board */}
          <div className="flex flex-col gap-4">
            <div className="glass-panel p-3 rounded-2xl border border-white/5 shadow-2xl shadow-purple-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-2xl pointer-events-none" />
              <div className="relative rounded-xl overflow-hidden">
                <Chessboard
                  options={{
                    position: game.fen(),
                    onPieceDrop: onPieceDrop,
                    darkSquareStyle: { backgroundColor: '#7c3aed' },
                    lightSquareStyle: { backgroundColor: '#ede9fe' },
                    animationDurationInMs: 200,
                    allowDragging: !solved && !failed,
                  }}
                />
              </div>
            </div>

            {/* Status banners */}
            {solved && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-5 glass-panel rounded-2xl border border-emerald-500/30 bg-emerald-500/10"
              >
                <CheckCircle className="w-7 h-7 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-emerald-300 text-lg">Puzzle Solved! 🎉</p>
                  <p className="text-emerald-400/70 text-sm">Excellent move!</p>
                </div>
                <button
                  onClick={nextPuzzle}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
            {failed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-5 glass-panel rounded-2xl border border-red-500/30 bg-red-500/10"
              >
                <XCircle className="w-7 h-7 text-red-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-red-300 text-lg">Incorrect move</p>
                  <p className="text-red-400/70 text-sm">Try again or see the hint</p>
                </div>
                <button
                  onClick={resetPuzzle}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl font-semibold text-sm hover:bg-white/20 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Retry
                </button>
              </motion.div>
            )}
          </div>

          {/* Puzzle sidebar */}
          <div className="flex flex-col gap-4">
            {/* Info card */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-bold uppercase tracking-wider">
                  {puzzle.theme}
                </span>
                <span className="text-slate-400 text-sm">⚡ {puzzle.rating}</span>
              </div>
              <h2 className="text-xl font-bold font-outfit text-white mb-2">
                Puzzle #{puzzle.id}
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">{puzzle.description}</p>
              <p className="mt-3 text-indigo-300 font-semibold text-sm">{turnLabel} to move</p>
            </div>

            {/* Hint */}
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-3 p-4 glass-panel rounded-2xl border border-amber-500/20 text-amber-300 hover:bg-amber-500/10 transition-colors"
            >
              <Lightbulb className="w-5 h-5 flex-shrink-0" />
              {showHint ? (
                <span className="text-sm">Hint: Move <strong>{puzzle.solution[0].slice(0, 2)}</strong> → <strong>{puzzle.solution[0].slice(2, 4)}</strong></span>
              ) : (
                <span className="text-sm font-semibold">Show Hint</span>
              )}
            </button>

            {/* Puzzle progress */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5">
              <p className="text-slate-400 text-sm font-semibold mb-3">Progress</p>
              <div className="flex gap-2">
                {PUZZLES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPuzzleIndex(i)
                      setGame(new Chess(PUZZLES[i].fen))
                      setSolved(false); setFailed(false); setShowHint(false); setMovesMade(0)
                    }}
                    className={`flex-1 h-2 rounded-full transition-colors ${
                      i === puzzleIndex ? 'bg-purple-500' : 'bg-white/10 hover:bg-white/20'
                    }`}
                  />
                ))}
              </div>
              <p className="text-slate-500 text-xs mt-2">{puzzleIndex + 1} / {PUZZLES.length}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={resetPuzzle}
                className="flex-1 flex items-center justify-center gap-2 py-3 glass-panel border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors text-sm font-semibold"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
              <button
                onClick={nextPuzzle}
                className="flex-1 flex items-center justify-center gap-2 py-3 glass-panel border border-white/10 text-slate-300 rounded-xl hover:bg-white/10 transition-colors text-sm font-semibold"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
