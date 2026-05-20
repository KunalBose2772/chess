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
    accentClass: 'badge-green',
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
    accentClass: 'badge',
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
    accentClass: 'badge-amber',
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
    accentClass: 'badge-red',
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
    accentClass: 'badge',
    modules: [
      { title: 'Pawn majorities & minorities', time: '20 min', description: 'Plan based on pawn structure imbalances.' },
      { title: 'Open files & outposts', time: '25 min', description: 'Dominate open files and strong squares.' },
      { title: 'Weak squares & colour complexes', time: '20 min', description: 'Identify and exploit colour weaknesses.' },
    ]
  },
]

export default function LearnPage() {
  return (
    <div className="page-section">
      <div className="page-spot-tl" />
      <div className="page-spot-br" />

      <div className="page-container" style={{ maxWidth: 1100 }}>
        {/* Header */}
        <div className="flex flex-col gap-3">
          <span className="section-label flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> Curriculum
          </span>
          <h1 className="page-heading">Learn Chess</h1>
          <p className="page-subheading">
            Structured lessons from beginner to master level. Study openings, tactics, and endgames with interactive examples.
          </p>
        </div>

        {/* Lessons */}
        <div className="flex flex-col gap-10">
          {LESSONS.map((section) => {
            const Icon = section.icon
            return (
              <div key={section.category}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-[var(--primary)]/10 dark:bg-[var(--primary)]/15 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="section-label">{section.label}</p>
                    <h2 className="text-lg font-semibold text-[var(--text-primary)] font-jost -mt-0.5">{section.category}</h2>
                  </div>
                </div>

                {/* Module cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {section.modules.map((mod, i) => (
                    <div
                      key={i}
                      className="card-elevated cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className={`badge ${section.accentClass}`}>{section.category}</span>
                        <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <h3 className="font-semibold text-[var(--text-primary)] mb-1.5 font-jost text-base">{mod.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{mod.description}</p>
                      <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{mod.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Banner */}
        <div className="card-elevated text-center !py-12 !border-[var(--primary)]/15">
          <div className="badge mx-auto mb-4">Ready to apply?</div>
          <h2 className="page-heading !text-2xl mb-3">Test your skills in real games</h2>
          <p className="page-subheading mx-auto text-center mb-8">
            Practice what you&apos;ve learned against real opponents or train against our AI engine.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/play" className="btn-primary">
              Play Now <ChevronRight className="w-4 h-4" />
            </Link>
            <Link href="/puzzles" className="btn-secondary">
              Solve Puzzles
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
