'use client'

import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Lightbulb, RotateCcw, ChevronRight, Trophy, Zap } from 'lucide-react'

const PUZZLES = [
  {
    id: 1,
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    solution: ['f3g5'],
    theme: 'Attack',
    difficulty: 'Intermediate',
    rating: 1100,
    description: 'White to move – find the aggressive knight move that pressures the f7 pawn.',
  },
  {
    id: 2,
    fen: '7k/5Rpp/8/8/8/8/8/K7 w - - 0 1',
    solution: ['f7f8'],
    theme: 'Checkmate',
    difficulty: 'Beginner',
    rating: 900,
    description: 'White to move – deliver checkmate in one decisive move.',
  },
  {
    id: 3,
    fen: 'r3k2r/ppq2ppp/2p1pn2/2b5/2B5/2N1PN2/PPP2PPP/R2QK2R w KQkq - 0 8',
    solution: ['c3d5'],
    theme: 'Fork',
    difficulty: 'Intermediate',
    rating: 1300,
    description: 'White to move – find the knight fork winning material.',
  },
  {
    id: 4,
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    solution: ['e1e8'],
    theme: 'Back Rank',
    difficulty: 'Beginner',
    rating: 1000,
    description: 'White to move – exploit the weak back rank for an immediate win.',
  },
  {
    id: 5,
    fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQ - 0 7',
    solution: ['c4f7'],
    theme: 'Sacrifice',
    difficulty: 'Advanced',
    rating: 1400,
    description: 'White to move – find the shocking bishop sacrifice that launches a winning attack.',
  },
]

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'badge-green',
  Intermediate: 'badge-amber',
  Advanced: 'badge-red',
}

export default function PuzzlesPage() {
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [game, setGame] = useState(new Chess(PUZZLES[0].fen))
  const [solved, setSolved] = useState(false)
  const [failed, setFailed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [movesMade, setMovesMade] = useState(0)
  const [score, setScore] = useState(0)

  const puzzle = PUZZLES[puzzleIndex]
  const turnLabel = game.turn() === 'w' ? 'White' : 'Black'

  const resetPuzzle = () => {
    setGame(new Chess(puzzle.fen))
    setSolved(false); setFailed(false); setShowHint(false); setMovesMade(0)
  }

  const nextPuzzle = () => {
    const next = (puzzleIndex + 1) % PUZZLES.length
    setPuzzleIndex(next)
    setGame(new Chess(PUZZLES[next].fen))
    setSolved(false); setFailed(false); setShowHint(false); setMovesMade(0)
  }

  const onPieceDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null; piece: { pieceType: string } }) => {
    if (solved || failed || !targetSquare) return false
    try {
      const move = game.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
      if (!move) return false
      setGame(new Chess(game.fen()))
      const expectedUci = puzzle.solution[movesMade]
      const madeUci = sourceSquare + targetSquare
      if (madeUci === expectedUci) {
        if (movesMade + 1 === puzzle.solution.length) {
          setSolved(true); setScore(s => s + 1)
        }
        setMovesMade(m => m + 1)
      } else {
        setFailed(true)
      }
      return true
    } catch { return false }
  }

  return (
    <div className="page-section">
      <div className="page-spot-tl" />
      <div className="page-spot-br" />

      <div className="page-container" style={{ maxWidth: 1200 }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="section-label flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" /> Training
            </span>
            <h1 className="page-heading">Chess Puzzles</h1>
            <p className="page-subheading">Train your pattern recognition and sharpen your tactical vision.</p>
          </div>
          <div className="flex items-center gap-2 card-surface !py-3 !px-5 w-fit">
            <Trophy className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-sm font-semibold text-[var(--text-primary)]">{score}</span>
            <span className="text-xs text-[var(--text-muted)]">solved today</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* Board */}
          <div className="flex flex-col gap-4">
            <div className="card-elevated !p-4">
              <div className="rounded-2xl overflow-hidden w-full aspect-square">
                <Chessboard
                  options={{
                    position: game.fen(),
                    onPieceDrop: onPieceDrop,
                    darkSquareStyle: { backgroundColor: '#2563EB' },
                    lightSquareStyle: { backgroundColor: '#EFF6FF' },
                    animationDurationInMs: 200,
                    allowDragging: !solved && !failed,
                  }}
                />
              </div>
            </div>

            {/* Status banners */}
            <AnimatePresence mode="wait">
              {solved && (
                <motion.div
                  key="solved"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="card-elevated flex items-center gap-4 !border-emerald-200 dark:!border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-500/[0.06]"
                >
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">Puzzle Solved! 🎉</p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60 mt-0.5">Excellent tactical vision</p>
                  </div>
                  <button onClick={nextPuzzle} className="btn-primary !py-2 !px-4 !text-xs">
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
              {failed && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="card-elevated flex items-center gap-4 !border-red-200 dark:!border-red-500/25 bg-red-50/50 dark:bg-red-500/[0.06]"
                >
                  <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-red-700 dark:text-red-300">Incorrect move</p>
                    <p className="text-xs text-red-600/70 dark:text-red-400/60 mt-0.5">Try again or use the hint</p>
                  </div>
                  <button onClick={resetPuzzle} className="btn-secondary !py-2 !px-4 !text-xs">
                    <RotateCcw className="w-3.5 h-3.5" /> Retry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Info card */}
            <div className="card-elevated">
              <div className="flex items-center justify-between mb-4">
                <span className={`badge ${DIFFICULTY_COLORS[puzzle.difficulty]}`}>
                  {puzzle.difficulty}
                </span>
                <span className="badge">
                  <Zap className="w-3 h-3" /> {puzzle.rating}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-1">
                <span className="section-label">{puzzle.theme}</span>
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2 font-jost">
                Puzzle #{puzzle.id}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{puzzle.description}</p>

              <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-primary)]">
                <div className={`w-2 h-2 rounded-full ${turnLabel === 'White' ? 'bg-slate-200 border border-slate-400' : 'bg-slate-800'}`} />
                <span className="text-xs font-semibold text-[var(--primary)]">{turnLabel} to move</span>
              </div>
            </div>

            {/* Hint */}
            <button
              onClick={() => setShowHint(true)}
              className="card-surface flex items-center gap-3 text-left w-full hover:!border-amber-300 dark:hover:!border-amber-500/30 transition-colors"
            >
              <Lightbulb className={`w-5 h-5 flex-shrink-0 ${showHint ? 'text-amber-500' : 'text-[var(--text-muted)]'}`} />
              {showHint ? (
                <span className="text-sm text-[var(--text-primary)]">
                  Hint: Move <strong className="text-[var(--primary)]">{puzzle.solution[0].slice(0, 2).toUpperCase()}</strong>
                  {' → '}
                  <strong className="text-[var(--primary)]">{puzzle.solution[0].slice(2, 4).toUpperCase()}</strong>
                </span>
              ) : (
                <span className="text-sm font-medium text-[var(--text-secondary)]">Show Hint</span>
              )}
            </button>

            {/* Progress */}
            <div className="card-elevated">
              <p className="section-label mb-3">Progress</p>
              <div className="flex gap-1.5 mb-2">
                {PUZZLES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPuzzleIndex(i)
                      setGame(new Chess(PUZZLES[i].fen))
                      setSolved(false); setFailed(false); setShowHint(false); setMovesMade(0)
                    }}
                    className={`flex-1 h-1.5 rounded-full transition-all ${
                      i === puzzleIndex
                        ? 'bg-[var(--primary)]'
                        : i < puzzleIndex
                        ? 'bg-emerald-400 dark:bg-emerald-500'
                        : 'bg-[var(--border-primary)] hover:bg-[var(--text-muted)]'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-[var(--text-muted)]">{puzzleIndex + 1} of {PUZZLES.length}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={resetPuzzle} className="btn-secondary flex-1 gap-2">
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
              <button onClick={nextPuzzle} className="btn-secondary flex-1 gap-2">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
