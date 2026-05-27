'use client'

import { useState, useEffect } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, XCircle, Lightbulb, RotateCcw, ChevronRight, 
  Trophy, Zap, Eye, Compass, Volume2, VolumeX, Check, X
} from 'lucide-react'
import { useBoardTheme } from '@/components/BoardThemeProvider'
import { claimTodayStreak, getStreakData } from '@/lib/streak'

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
  Beginner: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Advanced: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const THEMES = ['All', 'Attack', 'Checkmate', 'Fork', 'Back Rank', 'Sacrifice']
const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced']

export default function PuzzlesPage() {
  const { boardTheme } = useBoardTheme()
  const [selectedTheme, setSelectedTheme] = useState('All')
  const [selectedDifficulty, setSelectedDifficulty] = useState('All')
  const [puzzleIndex, setPuzzleIndex] = useState(0)

  // Filter puzzles based on selected tabs
  const filteredPuzzles = PUZZLES.filter(p => {
    const matchTheme = selectedTheme === 'All' || p.theme === selectedTheme
    const matchDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty
    return matchTheme && matchDiff
  })

  // Get active puzzle
  const puzzle = filteredPuzzles[puzzleIndex] || filteredPuzzles[0] || PUZZLES[0]

  const [game, setGame] = useState(new Chess(puzzle.fen))
  const [solved, setSolved] = useState(false)
  const [failed, setFailed] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [movesMade, setMovesMade] = useState(0)
  const [score, setScore] = useState(0)

  // Onboarding & TTS states
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Streak Toast states
  const [showStreakToast, setShowStreakToast] = useState(false)
  const [toastStreakVal, setToastStreakVal] = useState(0)

  const triggerStreakToast = () => {
    const data = getStreakData()
    setToastStreakVal(data.currentStreak)
    setShowStreakToast(true)
  }

  const turnLabel = game.turn() === 'w' ? 'White' : 'Black'

  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    if (!speechEnabled) return

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha')))
    if (preferredVoice) utterance.voice = preferredVoice
    utterance.rate = 1.02
    
    window.speechSynthesis.speak(utterance)
  }

  // Load onboarding and triggers initial speech synthesis
  useEffect(() => {
    const onboarded = localStorage.getItem('chess_puzzles_onboarded')
    if (!onboarded) {
      setShowOnboarding(true)
    }
  }, [])

  useEffect(() => {
    if (filteredPuzzles.length > 0 && !showOnboarding) {
      speakText(`In this puzzle, it's your turn as ${turnLabel}. ELO rating is ${puzzle.rating}. ${puzzle.description}`)
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [puzzle.id, filteredPuzzles, showOnboarding, speechEnabled])

  // Speak solved / failed states
  useEffect(() => {
    if (solved) {
      speakText("Excellent calculation! The tactics puzzle is successfully solved.")
    } else if (failed) {
      speakText("Not quite the right move. Keep looking for a winning combination.")
    }
  }, [solved, failed])

  const playTap = () => {
    try {
      const a = new (window.AudioContext || (window as any).webkitAudioContext)()
      const o = a.createOscillator(), g = a.createGain()
      o.type = 'sine'; o.frequency.setValueAtTime(320, a.currentTime)
      o.frequency.exponentialRampToValueAtTime(130, a.currentTime + 0.08)
      g.gain.setValueAtTime(0.08, a.currentTime); g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.08)
      o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + 0.08)
    } catch {}
  }

  const playSuccess = () => {
    try {
      const a = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = a.currentTime
      const playNote = (freq: number, start: number, duration: number) => {
        const o = a.createOscillator(), g = a.createGain()
        o.type = 'sine'; o.frequency.setValueAtTime(freq, start)
        g.gain.setValueAtTime(0.08, start); g.gain.exponentialRampToValueAtTime(0.001, start + duration)
        o.connect(g); g.connect(a.destination); o.start(start); o.stop(start + duration)
      }
      playNote(523.25, now, 0.15) // C5
      playNote(659.25, now + 0.1, 0.3) // E5
    } catch {}
  }

  const playFail = () => {
    try {
      const a = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = a.currentTime
      const o = a.createOscillator(), g = a.createGain()
      o.type = 'sawtooth'; o.frequency.setValueAtTime(120, now)
      o.frequency.linearRampToValueAtTime(80, now + 0.28)
      g.gain.setValueAtTime(0.05, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.28)
      o.connect(g); g.connect(a.destination); o.start(); o.stop(now + 0.28)
    } catch {}
  }

  const resetPuzzle = () => {
    playTap()
    setGame(new Chess(puzzle.fen))
    setSolved(false); setFailed(false); setShowHint(false); setMovesMade(0)
  }

  const nextPuzzle = () => {
    playTap()
    if (filteredPuzzles.length === 0) return
    const next = (puzzleIndex + 1) % filteredPuzzles.length
    setPuzzleIndex(next)
    const nextPuzzleObj = filteredPuzzles[next]
    setGame(new Chess(nextPuzzleObj.fen))
    setSolved(false); setFailed(false); setShowHint(false); setMovesMade(0)
  }

  const handleFilterTheme = (theme: string) => {
    playTap()
    setSelectedTheme(theme)
    setPuzzleIndex(0)
    const newFiltered = PUZZLES.filter(p => {
      const matchTheme = theme === 'All' || p.theme === theme
      const matchDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty
      return matchTheme && matchDiff
    })
    const firstPuzzle = newFiltered[0] || PUZZLES[0]
    setGame(new Chess(firstPuzzle.fen))
    setSolved(false); setFailed(false); setShowHint(false); setMovesMade(0)
  }

  const handleFilterDifficulty = (diff: string) => {
    playTap()
    setSelectedDifficulty(diff)
    setPuzzleIndex(0)
    const newFiltered = PUZZLES.filter(p => {
      const matchTheme = selectedTheme === 'All' || p.theme === selectedTheme
      const matchDiff = diff === 'All' || p.difficulty === diff
      return matchTheme && matchDiff
    })
    const firstPuzzle = newFiltered[0] || PUZZLES[0]
    setGame(new Chess(firstPuzzle.fen))
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
          setSolved(true)
          setScore(s => s + 1)
          playSuccess()
          claimTodayStreak()
          triggerStreakToast()
        } else {
          setMovesMade(m => m + 1)
          playTap()
        }
      } else {
        setFailed(true)
        playFail()
      }
      return true
    } catch { return false }
  }

  return (
    <div className="w-full flex-1 flex flex-col bg-transparent font-montserrat min-h-screen">
      <div className="max-w-[1160px] w-full mx-auto px-6 py-8 flex flex-col gap-6 flex-1">

        {/* ── Header ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 bg-cyan-400/8 border border-cyan-400/20 px-3 py-1 rounded-full self-start flex items-center gap-1.5">
              <Zap className="w-3 h-3 fill-current" /> Training Mode
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-jost tracking-tight mt-1">Chess Tactics</h1>
            <p className="text-[12px] text-slate-500 max-w-xl">Sharpen your pattern recognition, calculate aggressive lines, and expand your strategic chess game.</p>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] w-fit shadow-md self-start md:self-auto">
            <Trophy className="w-4.5 h-4.5 text-amber-400" />
            <div>
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold leading-none">Solved Today</p>
              <p className="text-[14px] font-bold text-slate-200 mt-1">{score} Puzzles</p>
            </div>
          </div>
        </div>

        {/* ── Filters Bar ───────────────────────────────── */}
        <div className="flex flex-col gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <div>
            <p className="text-[9.5px] font-black uppercase tracking-[0.18em] text-slate-600 mb-2">Tactical Category</p>
            <div className="flex flex-wrap gap-2">
              {THEMES.map(theme => (
                <button
                  key={theme}
                  onClick={() => handleFilterTheme(theme)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedTheme === theme
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[9.5px] font-black uppercase tracking-[0.18em] text-slate-600 mb-2">Difficulty Rating</p>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map(diff => (
                <button
                  key={diff}
                  onClick={() => handleFilterDifficulty(diff)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main Layout ────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Board + Alert Banners */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Chessboard Card */}
            <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.05] shadow-lg flex items-center justify-center">
              <div className="w-full max-w-[540px] aspect-square rounded-2xl overflow-hidden shadow-2xl relative">
                {filteredPuzzles.length > 0 ? (
                  <Chessboard
                    options={{
                      position: game.fen(),
                      onPieceDrop: onPieceDrop,
                      darkSquareStyle: { backgroundColor: boardTheme.dark },
                      lightSquareStyle: { backgroundColor: boardTheme.light },
                      animationDurationInMs: 180,
                      allowDragging: !solved && !failed,
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 p-6 text-center border border-white/[0.05]">
                    <Compass className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
                    <p className="text-sm font-bold text-slate-300">No matching puzzles found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">Try selecting a different theme or difficulty combination.</p>
                  </div>
                )}

                {/* Level Completion overlay */}
                <AnimatePresence>
                  {solved && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[#0f0f12]/92 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center font-montserrat"
                    >
                      {/* Confetti / Sparks animation background */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_70%)] pointer-events-none" />

                      {/* Wiggling Puzzle Piece Icon */}
                      <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
                        className="relative w-24 h-24 bg-gradient-to-br from-amber-600 to-amber-800 rounded-2xl flex items-center justify-center shadow-lg border border-amber-500/20 mb-4 select-none"
                      >
                        {/* Puzzle piece knobs using absolute circles */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-600 border border-amber-500/20" />
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-amber-700" />
                        
                        <span className="text-3xl font-black text-white font-jost">
                          {puzzle.id}
                        </span>
                        
                        {/* Shimmer reflection */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
                      </motion.div>

                      {/* Victory Headers */}
                      <motion.h4
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg sm:text-xl font-black text-white tracking-tight font-jost"
                      >
                        You Completed Level {puzzle.id}!
                      </motion.h4>
                      
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-[11px] text-emerald-400 font-bold mt-1 tracking-wide uppercase font-jost"
                      >
                        Tactical Target Unlocked 🎉
                      </motion.p>

                      {/* Next button */}
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        onClick={nextPuzzle}
                        className="mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5 border border-blue-500/20"
                      >
                        Next Puzzle <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Status alerts */}
            <AnimatePresence mode="wait">
              {solved && (
                <motion.div
                  key="solved"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4 shadow-lg backdrop-blur-md"
                >
                  <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-emerald-300">Tactics Solved! 🎉</p>
                    <p className="text-[11px] text-emerald-400/60 mt-0.5 font-medium">Excellent calculation and pattern recognition.</p>
                  </div>
                  <button onClick={nextPuzzle} className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1">
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
              {failed && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-4 shadow-lg backdrop-blur-md"
                >
                  <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-[13px] font-bold text-red-300">Incorrect Move</p>
                    <p className="text-[11px] text-red-400/60 mt-0.5 font-medium">You lost material or missed checkmate. Try again or check the hint.</p>
                  </div>
                  <button onClick={resetPuzzle} className="bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 text-slate-300 font-bold px-4 py-2 rounded-xl text-[11px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Retry
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Active Puzzle Widgets */}
          {filteredPuzzles.length > 0 && (
            <div className="lg:col-span-4 flex flex-col gap-5">
              
              {/* Premium AI Chess Coach & TTS Chamber */}
              <div className="rounded-3xl bg-gradient-to-b from-[#18181b] to-[#111113] border border-white/[0.06] p-5 shadow-xl flex flex-col gap-4 relative overflow-hidden">
                {/* Ambient glow in background */}
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#3b82f6]/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${DIFFICULTY_COLORS[puzzle.difficulty]}`}>
                    {puzzle.difficulty}
                  </span>
                  
                  {/* Speaker TTS Trigger with wave animations */}
                  <button 
                    onClick={() => {
                      playTap();
                      const nextState = !speechEnabled;
                      setSpeechEnabled(nextState);
                      if (nextState) {
                        speakText(`In this puzzle, it's your turn as ${turnLabel}. ELO rating is ${puzzle.rating}. ${puzzle.description}`);
                      } else {
                        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                        }
                        setIsSpeaking(false);
                      }
                    }}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      speechEnabled 
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' 
                        : 'bg-white/5 border-white/10 text-slate-500 hover:bg-white/10'
                    }`}
                    title={speechEnabled ? "Mute Coach TTS" : "Enable Coach TTS"}
                  >
                    {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    {isSpeaking && (
                      <span className="flex items-center gap-0.5 h-2.5">
                        <span className="w-0.5 h-full bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-0.5 h-2/3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-0.5 h-full bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex gap-3 items-start mt-1">
                  {/* Coach Avatar vector silhouette */}
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#3b82f6]/20 to-[#60a5fa]/20 border border-[#3b82f6]/30 flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden">
                    <svg className="w-6 h-6 text-[#60a5fa]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 21a6 6 0 0 0-12 0" />
                      <circle cx="12" cy="10" r="4" />
                      <path d="M12 2v2" />
                    </svg>
                  </div>

                  <div className="relative flex-1 bg-white/[0.03] border border-white/[0.05] p-3 rounded-2xl rounded-tl-none text-[11.5px] text-slate-300 leading-relaxed font-montserrat shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
                    {/* Small speech bubble pointer */}
                    <div className="absolute top-0 -left-1.5 w-0 h-0 border-t-[8px] border-t-white/[0.03] border-l-[8px] border-l-transparent" />
                    
                    {/* Speech context text based on game outcome */}
                    {solved ? (
                      <span className="text-emerald-400 font-bold">Excellent work! That is the correct move sequence. Puzzle completed successfully!</span>
                    ) : failed ? (
                      <span className="text-red-400 font-bold">Not quite. Try resetting the board or analyzing different attack structures.</span>
                    ) : movesMade > 0 ? (
                      <span>Good job, that's correct so far! Keep calculating the remaining moves.</span>
                    ) : (
                      <span>In this puzzle, it's your turn as <strong className="text-slate-100">{turnLabel}</strong>. ELO rating is <strong className="text-slate-100">{puzzle.rating}</strong>. {puzzle.description}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-white/[0.04] text-[10px] text-slate-500 font-semibold font-jost">
                  <div className={`w-2 h-2 rounded-full ${turnLabel === 'White' ? 'bg-slate-100 border border-slate-300 shadow animate-pulse' : 'bg-slate-800 border border-white/10'}`} />
                  <span>{turnLabel.toUpperCase()} TO PLAY</span>
                </div>
              </div>

              {/* Show Hint card */}
              <button
                onClick={() => { playTap(); setShowHint(true); }}
                className="w-full text-left rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] p-4 flex items-center gap-3.5 transition-all shadow cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-500/8 border border-amber-500/15 flex items-center justify-center flex-shrink-0 group-hover:brightness-110 transition-all">
                  <Lightbulb className={`w-4.5 h-4.5 ${showHint ? 'text-amber-400 fill-current' : 'text-slate-500'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  {showHint ? (
                    <p className="text-[12px] text-slate-300 leading-snug">
                      Move <strong className="text-amber-400">{puzzle.solution[0].slice(0, 2).toUpperCase()}</strong> to{' '}
                      <strong className="text-amber-400">{puzzle.solution[0].slice(2, 4).toUpperCase()}</strong>
                    </p>
                  ) : (
                    <>
                      <p className="text-[12px] font-bold text-slate-200 leading-none">Stuck?</p>
                      <p className="text-[10px] text-slate-500 mt-1">Reveal target coordinate hint</p>
                    </>
                  )}
                </div>
                {!showHint && <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 ml-auto group-hover:translate-x-0.5 transition-all" />}
              </button>

              {/* Gorgeous Winding Progression Path */}
              <div className="rounded-3xl bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-secondary)] border border-[var(--border-primary)] p-5 shadow-lg relative overflow-hidden flex flex-col gap-4 font-montserrat">
                <p className="text-[9.5px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">Progression Path</p>
                
                <div className="relative py-4 flex flex-col items-center gap-6 min-h-[220px] justify-center z-10">
                  {/* Vertical connecting pathway path */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-0.5 h-[80%] border-l-2 border-dashed border-white/10 -z-10" />
 
                  {filteredPuzzles.map((p, i) => {
                    const isCompleted = i < puzzleIndex;
                    const isActive = i === puzzleIndex;
                    
                    // Oscillating stagger coordinates to winding trail
                    const offsets = ['translate-x-[-30px]', 'translate-x-[15px]', 'translate-x-[-15px]', 'translate-x-[30px]', 'translate-x-[0px]'];
                    const staggerClass = offsets[i % offsets.length];
 
                    return (
                      <button
                        key={p.id}
                        onClick={() => {
                          playTap()
                          setPuzzleIndex(i)
                          setGame(new Chess(p.fen))
                          setSolved(false); setFailed(false); setShowHint(false); setMovesMade(0)
                        }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer font-jost text-[13px] font-black relative ${staggerClass} ${
                          isCompleted
                            ? 'bg-gradient-to-br from-[#81b64c] to-[#68993c] text-white shadow-md shadow-emerald-500/10 border border-emerald-400/20 hover:scale-105'
                            : isActive
                            ? 'bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] text-white shadow-[0_0_15px_rgba(129,182,76,0.6)] border border-[var(--primary)]/20 scale-110 hover:scale-115'
                            : 'bg-white/[0.02] border border-white/[0.05] text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] hover:scale-105'
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <span>{p.id}</span>
                        )}
                        
                        {/* Glow halo for the active stepping stone */}
                        {isActive && (
                          <span className="absolute inset-0 rounded-full border border-[var(--primary)] animate-ping opacity-30" />
                        )}
                      </button>
                    );
                  })}
                </div>
 
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-3 border-t border-white/[0.04]">
                  <span>Category completion</span>
                  <span className="font-bold text-[var(--primary)]">{Math.round(((puzzleIndex) / filteredPuzzles.length) * 100)}%</span>
                </div>
              </div>
 
              {/* Quick Controls */}
              <div className="flex gap-3">
                <button onClick={resetPuzzle} className="flex-1 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] active:scale-95 text-slate-300 font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md">
                  <RotateCcw className="w-4 h-4" /> Reset
                </button>
                <button onClick={nextPuzzle} className="flex-1 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] active:scale-95 text-slate-300 font-bold text-[11px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md">
                  Skip <ChevronRight className="w-4 h-4" />
                </button>
              </div>
 
            </div>
          )}
 
        </div>
 
      </div>
 
      {/* Onboarding rated chess puzzles modal */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                localStorage.setItem('chess_puzzles_onboarded', 'true');
                setShowOnboarding(false);
                playTap();
              }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />
 
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="relative w-full max-w-[340px] rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-primary)] shadow-[0_20px_50px_rgba(0,0,0,0.85)] p-5 text-center z-10 overflow-hidden font-montserrat"
            >
              {/* Radial ambient glow core reflection */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 bg-[var(--primary)]/10 rounded-full blur-2xl -z-10 animate-pulse" />
 
              {/* Close Button */}
              <button
                onClick={() => {
                  localStorage.setItem('chess_puzzles_onboarded', 'true');
                  setShowOnboarding(false);
                  playTap();
                }}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 hover:bg-white/5 active:scale-90 p-1.5 rounded-full transition-all cursor-pointer border border-white/0 hover:border-white/5"
              >
                <X className="w-4 h-4" />
              </button>
 
              {/* Header Titles */}
              <h3 className="text-xl font-black text-white tracking-tight font-jost mt-3">
                Chess Puzzles
              </h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                Train with chess puzzles and improve your game.
              </p>
 
              {/* Hardware-accelerated SVG rising bar chart animation */}
              <div className="flex justify-center my-4">
                <div className="relative w-36 h-28 bg-white/[0.01] border border-white/[0.04] rounded-2xl flex items-end justify-center gap-2.5 p-4 overflow-hidden">
                  <div className="absolute inset-0 bg-[var(--primary)]/[0.03] rounded-2xl blur-xl" />
                  <div className="w-6 h-10 bg-[var(--bg-elevated)] rounded-md border border-white/[0.03]" />
                  <div className="w-6 h-14 bg-[var(--bg-elevated)] rounded-md border border-white/[0.03]" />
                  <div className="w-6 h-18 bg-[var(--bg-elevated)] rounded-md border border-white/[0.03]" />
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 144 112" fill="none">
                    <motion.path
                      d="M16 90 L52 64 L88 38 L122 18"
                      stroke="url(#arrowGlow)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                    />
                    <motion.path
                      d="M106 18 H122 V34"
                      stroke="url(#arrowGlow)"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.9 }}
                    />
                    <defs>
                      <linearGradient id="arrowGlow" x1="16" y1="90" x2="122" y2="18" gradientUnits="userSpaceOnUse">
                        <stop stopColor="var(--primary)" />
                        <stop offset="1" stopColor="var(--accent)" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
 
              {/* Three Bullet Points (High-Quality Emojis & Spacing) */}
              <div className="flex flex-col gap-3.5 text-left my-4 px-2 font-montserrat">
                <div className="flex items-start gap-2.5">
                  <span className="text-sm mt-0.5 select-none">🧩</span>
                  <div className="leading-snug">
                    <p className="text-[11px] font-bold text-slate-200">Increase your ELO rating</p>
                    <p className="text-[9.5px] text-slate-500">Solve puzzles incrementally to unlock higher ratings.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-sm mt-0.5 select-none">📈</span>
                  <div className="leading-snug">
                    <p className="text-[11px] font-bold text-slate-200">Adaptive difficulty matching</p>
                    <p className="text-[9.5px] text-slate-500">Puzzles automatically get more challenging as you improve.</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="text-sm mt-0.5 select-none">⚡</span>
                  <div className="leading-snug">
                    <p className="text-[11px] font-bold text-slate-200">Solve quickly for time bonus</p>
                    <p className="text-[9.5px] text-slate-500">Maximize your rating points by finding key moves fast.</p>
                  </div>
                </div>
              </div>
 
              {/* Start Training Button */}
              <div className="mt-5">
                <button
                  onClick={() => {
                    localStorage.setItem('chess_puzzles_onboarded', 'true');
                    setShowOnboarding(false);
                    playTap();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-hover)] hover:from-[var(--primary-hover)] active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[var(--primary)]/20 cursor-pointer flex items-center justify-center border border-[var(--primary)]/20 font-montserrat"
                >
                  Start training
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
 
      {/* Dynamic Streak Secured Bottom-Right Toast */}
      <AnimatePresence>
        {showStreakToast && (
          <motion.div
            initial={{ opacity: 0, x: 50, y: 0, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="fixed bottom-5 right-5 z-50 w-64 rounded-2xl bg-[var(--bg-surface)] border border-orange-500/30 shadow-[0_10px_35px_rgba(0,0,0,0.6)] p-3.5 flex items-center gap-3 backdrop-blur-md font-montserrat"
          >
            {/* Ambient orange glow container */}
            <div className="absolute inset-0 rounded-2xl bg-orange-500/[0.02] -z-10" />
 
            {/* Glowing Pawn Flame Badge */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500/10 to-amber-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              <span className="text-xl select-none animate-bounce" style={{ animationDuration: '2s' }}>🔥</span>
            </div>
 
            <div className="flex-1 min-w-0">
              <h5 className="text-[12px] font-black text-white font-jost tracking-tight leading-tight">
                {toastStreakVal} Day Streak!
              </h5>
              <p className="text-[9.5px] text-slate-500 leading-normal mt-0.5 font-medium">
                Your daily training drill is secured.
              </p>
            </div>
            
            {/* Compact close trigger */}
            <button
              onClick={() => setShowStreakToast(false)}
              className="text-slate-600 hover:text-slate-400 p-0.5 rounded transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
