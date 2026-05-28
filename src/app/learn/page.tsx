import { BookOpen, Target, Brain, Crown, ChevronRight, PlayCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn Chess — ChessOnline',
  description: 'Learn chess from beginner to master with structured lessons, openings, tactics, and endgames.',
}

const LESSONS = [
  {
    category: 'Beginner',
    label: 'Foundation',
    icon: BookOpen,
    accentClass: 'text-emerald-700 border-emerald-700',
    modules: [
      { title: 'How the pieces move', time: '10 min', description: 'Master the movement rules for all 6 piece types.' },
      { title: 'Check, checkmate & stalemate', time: '15 min', description: 'Understand the three key endgame concepts.' },
      { title: 'Basic pawn structure', time: '12 min', description: 'Learn doubled, isolated, and passed pawns.' },
    ]
  },
  {
    category: 'Tactics',
    label: 'Combat',
    icon: Target,
    accentClass: 'text-[var(--primary)] border-[var(--primary)]',
    modules: [
      { title: 'Forks & skewers', time: '20 min', description: 'Attack two pieces at once to win material.' },
      { title: 'Pins & discovered attacks', time: '20 min', description: 'Immobilise pieces and reveal hidden attacks.' },
      { title: 'Back rank tactics', time: '15 min', description: 'Exploit the vulnerable back rank weakness.' },
    ]
  },
  {
    category: 'Openings',
    label: 'Opening Theory',
    icon: PlayCircle,
    accentClass: 'text-amber-700 border-amber-700',
    modules: [
      { title: 'Italian Game', time: '25 min', description: 'The classical 1.e4 e5 2.Nf3 Nc6 3.Bc4 system.' },
      { title: 'Sicilian Defense', time: '30 min', description: "Black's most popular reply to 1.e4." },
      { title: "Queen's Gambit", time: '25 min', description: '1.d4 d5 2.c4 – controlling the center.' },
    ]
  },
  {
    category: 'Endgames',
    label: 'Endgame Mastery',
    icon: Crown,
    accentClass: 'text-red-700 border-red-700',
    modules: [
      { title: 'King & pawn endgames', time: '30 min', description: 'Master opposition, the square rule, and promotion.' },
      { title: 'Rook endgames', time: '35 min', description: 'Lucena and Philidor positions every player must know.' },
      { title: 'Queen vs Rook', time: '25 min', description: 'Converting a queen advantage to a win.' },
    ]
  },
  {
    category: 'Strategy',
    label: 'Positional Play',
    icon: Brain,
    accentClass: 'text-[var(--text-primary)] border-[var(--text-primary)]',
    modules: [
      { title: 'Pawn majorities & minorities', time: '20 min', description: 'Plan based on pawn structure imbalances.' },
      { title: 'Open files & outposts', time: '25 min', description: 'Dominate open files and strong squares.' },
      { title: 'Weak squares & colour complexes', time: '20 min', description: 'Identify and exploit colour weaknesses.' },
    ]
  },
]

export default function LearnPage() {
  return (
    <div className="w-full flex-1 flex flex-col bg-salon font-montserrat min-h-screen">
      <div className="max-w-[1160px] w-full mx-auto px-6 py-8 flex flex-col gap-6 flex-1">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <span className="section-label">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Curriculum
          </span>
          <h1 className="text-[28px] sm:text-[32px] font-black text-[var(--text-primary)] font-jost tracking-tight mt-1">Learn Chess</h1>
          <p className="text-[12px] text-[var(--text-muted)] font-medium max-w-xl">
            Structured lessons from beginner to master level. Study openings, tactics, and endgames with interactive examples.
          </p>
        </div>

        {/* Lessons */}
        <div className="flex flex-col gap-10 mt-4">
          {LESSONS.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.category}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-sm bg-[var(--bg-surface)] border-2 border-[var(--text-primary)] shadow-[3px_3px_0px_var(--text-primary)] flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-[var(--text-primary)]" />
                  </div>
                  <div>
                    <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-widest font-black leading-none">{section.label}</p>
                    <h2 className="text-lg font-black text-[var(--text-primary)] font-jost mt-1">{section.category}</h2>
                  </div>
                </div>

                {/* Module cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {section.modules.map((mod, i) => (
                    <div
                      key={i}
                      className="card-elevated cursor-pointer group hover:bg-[var(--bg-secondary)]"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className={`text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-sm border-2 ${section.accentClass}`}>{section.category}</span>
                        <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <h3 className="font-black text-[var(--text-primary)] mb-1.5 font-jost text-base">{mod.title}</h3>
                      <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed mb-4">{mod.description}</p>
                      <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                        <Clock className="w-3 h-3" />
                        <span className="text-[11px] font-bold">{mod.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Banner */}
        <div className="card-surface text-center flex flex-col items-center justify-center py-10 mt-6">
          <div className="section-label mb-4">Ready to apply?</div>
          <h2 className="text-[22px] font-black text-[var(--text-primary)] font-jost mb-2">Test your skills in real games</h2>
          <p className="text-[12px] text-[var(--text-muted)] font-medium max-w-md text-center mb-6">
            Practice what you&apos;ve learned against real opponents or train against our AI engine.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/play" className="btn-primary px-6 py-3">
              Play Now <ChevronRight className="w-4 h-4 ml-1.5" />
            </Link>
            <Link href="/puzzles" className="btn-secondary px-6 py-3">
              Solve Puzzles
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
