import HeroChessBoard from "@/components/HeroChessBoard";
import { ArrowRight, Zap, Shield, Globe, Trophy, BookOpen, Target } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChessOnline - Play Premium Chess Online",
  description: "Real-time chess with matchmaking, Elo ratings, puzzles, and lessons. The next generation of online chess.",
};

export default function Home() {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden px-6 py-24">
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="flex flex-col items-start space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-indigo-500/30 text-indigo-300 font-medium text-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </span>
              100,000+ players online
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-bold font-outfit tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-slate-500 leading-tight">
              Master the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                Board.
              </span>
            </h1>

            <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
              Real-time 1v1 chess with Elo matchmaking, Supabase Realtime moves, in-game chat, puzzles, lessons, and a full leaderboard.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/play"
                id="play-now-cta"
                className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded-xl overflow-hidden transition-transform hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Play Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                href="/puzzles"
                id="puzzles-cta"
                className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white glass-panel rounded-xl hover:bg-white/10 transition-colors border border-white/10"
              >
                Try Puzzles
              </Link>
              <Link
                href="/leaderboard"
                id="leaderboard-cta"
                className="inline-flex items-center justify-center px-8 py-4 font-semibold text-white glass-panel rounded-xl hover:bg-white/10 transition-colors border border-white/10"
              >
                Leaderboard
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end w-full relative">
            <HeroChessBoard />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative z-10 bg-black/40 border-y border-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold font-outfit text-white text-center mb-16">
            Everything you need to <span className="text-indigo-400">play & improve</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={<Zap className="w-8 h-8 text-amber-400" />} title="Real-Time Gameplay" description="Supabase Realtime WebSocket channels broadcast your moves instantly. Sub-100ms latency globally." />
            <FeatureCard icon={<Trophy className="w-8 h-8 text-indigo-400" />} title="Elo Rating System" description="Standard Elo algorithm updates your rating after every game. Matchmaking pairs you within ±200 Elo." />
            <FeatureCard icon={<Shield className="w-8 h-8 text-emerald-400" />} title="Anti-Cheat Engine" description="Stockfish integration validates moves server-side. Post-game accuracy analysis flags suspicious play." />
            <FeatureCard icon={<Target className="w-8 h-8 text-purple-400" />} title="Chess Puzzles" description="Train tactics with rated puzzles. Forks, pins, back rank, sacrifices – from 900 to 1500 rating." />
            <FeatureCard icon={<BookOpen className="w-8 h-8 text-cyan-400" />} title="Structured Lessons" description="5 tracks: Beginner, Tactics, Openings, Endgames, Strategy. Designed for rapid improvement." />
            <FeatureCard icon={<Globe className="w-8 h-8 text-rose-400" />} title="Global Leaderboard" description="Compete for the top 50 worldwide. Rankings update in real-time from Supabase Postgres." />
          </div>
        </div>
      </section>

      {/* Game modes section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold font-outfit text-white mb-4">Choose your time control</h2>
          <p className="text-slate-400 mb-12 text-lg">From 1-minute bullet to 30-minute classical</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { label: 'Bullet', time: '1+0', color: 'from-red-500 to-orange-500', icon: '⚡' },
              { label: 'Blitz', time: '5+0', color: 'from-indigo-500 to-purple-500', icon: '🔥' },
              { label: 'Rapid', time: '10+0', color: 'from-emerald-500 to-teal-500', icon: '♟️' },
              { label: 'Classical', time: '30+0', color: 'from-amber-500 to-yellow-500', icon: '👑' },
            ].map((tc) => (
              <Link
                key={tc.label}
                href="/play"
                className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-white/20 hover:scale-105 transition-all text-center"
              >
                <div className={`text-3xl mb-3`}>{tc.icon}</div>
                <p className="font-bold text-white font-outfit">{tc.label}</p>
                <p className="text-slate-400 text-sm">{tc.time}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass-panel p-8 rounded-2xl hover:bg-white/[0.08] transition-colors border border-white/5">
      <div className="bg-white/5 w-16 h-16 rounded-xl flex items-center justify-center mb-6">{icon}</div>
      <h3 className="text-2xl font-bold font-outfit text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
