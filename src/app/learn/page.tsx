import { BookOpen, Target, Brain, Crown, ChevronRight, PlayCircle } from 'lucide-react'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Learn Chess - ChessOnline',
  description: 'Learn chess from beginner to master with structured lessons, openings, tactics, and endgames.',
}

const LESSONS = [
  {
    category: 'Beginner',
    color: 'from-emerald-500 to-teal-500',
    icon: <BookOpen className="w-6 h-6" />,
    modules: [
      { title: 'How the pieces move', time: '10 min', description: 'Master the movement rules for all 6 piece types.' },
      { title: 'Check, checkmate & stalemate', time: '15 min', description: 'Understand the three key endgame concepts.' },
      { title: 'Basic pawn structure', time: '12 min', description: 'Learn doubled, isolated, and passed pawns.' },
    ]
  },
  {
    category: 'Tactics',
    color: 'from-indigo-500 to-purple-500',
    icon: <Target className="w-6 h-6" />,
    modules: [
      { title: 'Forks & skewers', time: '20 min', description: 'Attack two pieces at once to win material.' },
      { title: 'Pins & discovered attacks', time: '20 min', description: 'Immobilise pieces and reveal hidden attacks.' },
      { title: 'Back rank tactics', time: '15 min', description: 'Exploit the vulnerable back rank weakness.' },
    ]
  },
  {
    category: 'Openings',
    color: 'from-amber-500 to-orange-500',
    icon: <PlayCircle className="w-6 h-6" />,
    modules: [
      { title: "Italian Game", time: '25 min', description: 'The classical 1.e4 e5 2.Nf3 Nc6 3.Bc4 system.' },
      { title: "Sicilian Defense", time: '30 min', description: "Black's most popular reply to 1.e4." },
      { title: "Queen's Gambit", time: '25 min', description: '1.d4 d5 2.c4 – controlling the center.' },
    ]
  },
  {
    category: 'Endgames',
    color: 'from-rose-500 to-pink-500',
    icon: <Crown className="w-6 h-6" />,
    modules: [
      { title: 'King & pawn endgames', time: '30 min', description: 'Master opposition, the square rule, and promotion.' },
      { title: 'Rook endgames', time: '35 min', description: 'Lucena and Philidor positions every player must know.' },
      { title: 'Queen vs Rook', time: '25 min', description: 'Converting a queen advantage to a win.' },
    ]
  },
  {
    category: 'Strategy',
    color: 'from-cyan-500 to-blue-500',
    icon: <Brain className="w-6 h-6" />,
    modules: [
      { title: 'Pawn majorities & minorities', time: '20 min', description: 'Plan based on pawn structure imbalances.' },
      { title: 'Open files & outposts', time: '25 min', description: 'Dominate open files and strong squares.' },
      { title: 'Weak squares & colour complexes', time: '20 min', description: 'Identify and exploit colour weaknesses.' },
    ]
  },
]

export default function LearnPage() {
  return (
    <div className="flex flex-col flex-1 w-full px-6 py-12 relative">
      <div className="absolute top-0 right-1/4 w-[700px] h-[400px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col gap-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold font-outfit text-white">
            Learn <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Chess</span>
          </h1>
          <p className="text-slate-400 mt-3 text-lg max-w-2xl mx-auto">
            Structured lessons from beginner to master. Study openings, tactics, and endgames with interactive examples.
          </p>
        </div>

        <div className="space-y-8">
          {LESSONS.map((section) => (
            <div key={section.category}>
              <div className="flex items-center gap-3 mb-5">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${section.color} text-white`}>
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold font-outfit text-white">{section.category}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {section.modules.map((mod, i) => (
                  <div
                    key={i}
                    className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.06] transition-all group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs text-slate-500 font-semibold">{mod.time}</span>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="font-bold text-white font-outfit mb-2">{mod.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{mod.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="glass-panel p-10 rounded-3xl border border-indigo-500/20 text-center bg-indigo-500/5">
          <h2 className="text-3xl font-bold font-outfit text-white mb-3">Ready to test your skills?</h2>
          <p className="text-slate-400 mb-6">Practice what you've learned against real opponents.</p>
          <Link
            href="/play"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.15)]"
          >
            Play Now <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
