'use client'

import { BarChart2, Calendar, Trophy, Swords, Zap, Star, Shield, TrendingUp, Sparkles, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

export default function PlayStatsPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'rapid' | 'blitz' | 'puzzles'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = {
    username: user?.username ?? "Grandmaster Player",
    rating: user?.rating ?? 1600,
    gamesPlayed: 142,
    winRate: 54.2,
    wins: 77,
    losses: 58,
    draws: 7,
    avgAccuracy: 78.4,
    puzzleELO: 1845,
    streak: 4,
    peakRating: 1620,
    globalRank: "#45,102",
    blitzRating: 1540,
    rapidRating: user?.rating ?? 1600,
    bulletRating: 1420
  };

  const achievements = [
    { id: "slayer", name: "Grandmaster Slayer", desc: "Defeat an AI bot rated above ELO 2000.", unlocked: true, icon: "⚔️", date: "May 12, 2026" },
    { id: "tactical", name: "Tactical Genius", desc: "Solve 5 tactical puzzles in a row with >90% accuracy.", unlocked: true, icon: "🧠", date: "May 18, 2026" },
    { id: "wizard", name: "Time Wizard", desc: "Win an online bullet game with less than 2 seconds remaining.", unlocked: true, icon: "⏳", date: "May 09, 2026" },
    { id: "unlocked", name: "Unstoppable Force", desc: "Achieve a 5-game winning streak in ranked matches.", unlocked: false, icon: "🔥", date: "In Progress (4/5)" }
  ];

  return (
    <div className="page-section">
      <div className="page-spot-tl" />
      <div className="page-spot-br" />

      <div className="page-container max-w-[1100px] gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[var(--border-primary)]">
          <div className="flex flex-col gap-2">
            <span className="section-label flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5" /> Performance Analytics
            </span>
            <h1 className="page-heading">Stats & Analytics</h1>
            <p className="page-subheading max-w-[650px] text-xs">
              Review your tactical accuracy, ELO growth, win-loss splits, and unlocked master achievements.
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)]/30 border border-[var(--border-primary)] rounded-xl px-4 py-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>Updated live · Current Season</span>
          </div>
        </div>

        {/* ELO Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="card-elevated p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500" />
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Rapid ELO</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-[var(--text-primary)]">⚡ {stats.rapidRating}</span>
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">▲ +42 ELO</span>
            </div>
          </div>

          <div className="card-elevated p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-purple-500" />
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Blitz ELO</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-[var(--text-primary)]">⚡ {stats.blitzRating}</span>
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">▲ +15 ELO</span>
            </div>
          </div>

          <div className="card-elevated p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500" />
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Bullet ELO</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-[var(--text-primary)]">⚡ {stats.bulletRating}</span>
              <span className="text-[10px] text-red-500 font-semibold flex items-center gap-0.5">▼ -12 ELO</span>
            </div>
          </div>

          <div className="card-elevated p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-500" />
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Puzzle ELO</span>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-[var(--text-primary)]">⚡ {stats.puzzleELO}</span>
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">▲ +85 ELO</span>
            </div>
          </div>

        </div>

        {/* 2-Column Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ELO Progress Curve Graphic */}
          <div className="lg:col-span-8 card-elevated p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--border-primary)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--primary)]" /> ELO Progression
              </h3>

              <div className="flex gap-1">
                {(['all', 'rapid', 'blitz', 'puzzles'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[9px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      activeCategory === cat 
                        ? 'bg-[var(--primary)] text-white' 
                        : 'bg-[var(--bg-secondary)]/50 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Interactive SVG Chart */}
            <div className="relative w-full h-[220px] bg-black/[0.02] dark:bg-white/[0.01] rounded-2xl border border-[var(--border-primary)] p-4 flex items-center justify-center">
              
              {/* Overlay Grid lines */}
              <div className="absolute inset-x-4 inset-y-8 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-t border-[var(--text-muted)] w-full text-[8px] font-mono text-[var(--text-muted)] pt-0.5">1800 ELO</div>
                <div className="border-t border-[var(--text-muted)] w-full text-[8px] font-mono text-[var(--text-muted)] pt-0.5">1600 ELO</div>
                <div className="border-t border-[var(--text-muted)] w-full text-[8px] font-mono text-[var(--text-muted)] pt-0.5">1400 ELO</div>
                <div className="border-t border-[var(--text-muted)] w-full text-[8px] font-mono text-[var(--text-muted)] pt-0.5">1200 ELO</div>
              </div>

              {/* The SVG Line chart */}
              <svg className="w-full h-full relative z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Puzzle rating line */}
                {(activeCategory === 'all' || activeCategory === 'puzzles') && (
                  <>
                    <path
                      d="M 5,80 Q 25,65 50,55 T 95,28"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="1.5"
                      className="drop-shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
                    />
                    <circle cx="5" cy="80" r="1.5" fill="#10B981" />
                    <circle cx="95" cy="28" r="1.5" fill="#10B981" />
                  </>
                )}

                {/* Rapid rating line */}
                {(activeCategory === 'all' || activeCategory === 'rapid') && (
                  <>
                    <path
                      d="M 5,70 Q 25,62 50,50 T 95,48"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      className="drop-shadow-[0_2px_12px_rgba(37,99,235,0.4)]"
                    />
                    <circle cx="5" cy="70" r="2" fill="#2563EB" />
                    <circle cx="50" cy="50" r="2" fill="#2563EB" />
                    <circle cx="95" cy="48" r="2.5" fill="#FFFFFF" stroke="#2563EB" strokeWidth="1.5" />
                  </>
                )}

                {/* Blitz rating line */}
                {(activeCategory === 'all' || activeCategory === 'blitz') && (
                  <>
                    <path
                      d="M 5,75 Q 25,72 50,65 T 95,54"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="1.5"
                      className="drop-shadow-[0_2px_8px_rgba(139,92,246,0.3)]"
                    />
                    <circle cx="5" cy="75" r="1.5" fill="#8B5CF6" />
                    <circle cx="95" cy="54" r="1.5" fill="#8B5CF6" />
                  </>
                )}
              </svg>

              {/* Bottom dates indicator */}
              <div className="absolute bottom-2 inset-x-4 flex justify-between text-[8px] font-semibold text-[var(--text-muted)] font-mono uppercase tracking-wider">
                <span>Jan 2026</span>
                <span>Mar 2026</span>
                <span>Apr 2026</span>
                <span>May 2026 (Now)</span>
              </div>
            </div>
            
            <p className="text-[10px] text-[var(--text-muted)] font-light text-center">
              * Click categories above to toggle line highlights. Current rapid graph shows consistent upward trajectory (+82 ELO since season start).
            </p>
          </div>

          {/* Win Split & Accuracy Details */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Win/Loss Split Card */}
            <div className="card-elevated p-5 flex flex-col gap-4">
              <span className="section-label">Win / Loss Breakdown</span>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-bold text-[var(--text-primary)]">
                  <span>Win Ratio</span>
                  <span className="text-emerald-500 font-mono">{stats.winRate}%</span>
                </div>
                
                {/* Highly elegant multi-segment horizontal bar */}
                <div className="h-3.5 w-full bg-[var(--bg-secondary)] rounded-full overflow-hidden flex mt-1.5 shadow-inner">
                  <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(stats.wins / stats.gamesPlayed) * 100}%` }} title="Wins" />
                  <div className="bg-slate-400 dark:bg-slate-700 h-full transition-all" style={{ width: `${(stats.draws / stats.gamesPlayed) * 100}%` }} title="Draws" />
                  <div className="bg-red-500 h-full transition-all" style={{ width: `${(stats.losses / stats.gamesPlayed) * 100}%` }} title="Losses" />
                </div>

                <div className="flex justify-between text-[9px] font-semibold text-[var(--text-muted)] mt-2 font-mono uppercase tracking-wider">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {stats.wins} W</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-700" /> {stats.draws} D</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {stats.losses} L</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-primary)]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Average Accuracy</span>
                  <span className="text-base font-bold text-[var(--text-primary)] font-mono">{stats.avgAccuracy}%</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Win Streak</span>
                  <span className="text-base font-bold text-emerald-500 font-mono">{stats.streak} matches</span>
                </div>
              </div>
            </div>

            {/* Tactical accuracy indicator banner */}
            <div className="premium-card-gold p-4.5 rounded-xl flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-700 dark:text-blue-400 dark:bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Sparkles className="w-4.5 h-4.5 text-blue-600 dark:text-blue-500" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-bold text-blue-900 dark:text-[var(--text-primary)] leading-snug">Elite Tactical Tier</h4>
                <p className="text-[10px] text-blue-700/80 dark:text-[var(--text-muted)] leading-relaxed">
                  Your puzzle ELO of 1845 places you in the <strong>Top 4.2%</strong> of active tactical players in the division.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Unlocked Master Achievements */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-bold font-jost text-[var(--text-primary)] flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" /> Arena Achievements
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`card-elevated p-4 flex gap-3 relative overflow-hidden transition-all duration-300 ${
                  ach.unlocked ? '' : 'opacity-65 border-dashed'
                }`}
              >
                <div className="text-2xl flex-shrink-0 mt-0.5 select-none">
                  {ach.icon}
                </div>
                <div className="flex flex-col gap-0.5">
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{ach.name}</h4>
                  <p className="text-[10px] text-[var(--text-muted)] leading-relaxed font-light">{ach.desc}</p>
                  <span className={`text-[8.5px] font-semibold mt-1.5 ${ach.unlocked ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`}>
                    {ach.unlocked ? `Unlocked · ${ach.date}` : ach.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
