'use client'

import Link from "next/link";
import { 
  Swords, Globe, Bot, Lightbulb, BarChart2, Trophy, Dices, History, 
  Zap, Sparkles, User, Shield, Star, ChevronRight, Users, Play
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState } from "react";

export default function PlayDashboardPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const playModes = [
    {
      id: "online",
      title: "Play Online",
      description: "Match with players of your skill level in real-time.",
      badge: "12,451 Active",
      badgeColor: "badge-green",
      icon: Globe,
      iconBg: "bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20",
      href: "/play/online",
      highlight: true
    },
    {
      id: "bots",
      title: "Play Bots",
      description: "Challenge Stockfish-powered bots with diverse personalities.",
      badge: "Stockfish 16",
      badgeColor: "badge",
      icon: Bot,
      iconBg: "bg-blue-500/10 text-blue-500 dark:bg-blue-500/20",
      href: "/play/bots",
      highlight: false
    },
    {
      id: "coach",
      title: "Play Coach",
      description: "Improve your game with a dynamic AI coach offering real-time tips.",
      badge: "AI Powered",
      badgeColor: "badge-amber",
      icon: Lightbulb,
      iconBg: "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20",
      href: "/play/coach",
      highlight: false
    },
    {
      id: "stats",
      title: "Stats & Analytics",
      description: "Analyze your ELO progression and game efficiency metrics.",
      badge: "Detailed",
      badgeColor: "badge",
      icon: BarChart2,
      iconBg: "bg-purple-500/10 text-purple-500 dark:bg-purple-500/20",
      href: "/play/stats",
      highlight: false
    },
    {
      id: "tournaments",
      title: "Tournaments",
      description: "Join daily arenas, Swiss brackets, and elite championships.",
      badge: "Active Arenas",
      badgeColor: "badge-red",
      icon: Trophy,
      iconBg: "bg-red-500/10 text-red-500 dark:bg-red-500/20",
      href: "/play/tournaments",
      highlight: false
    },
    {
      id: "variants",
      title: "Variants",
      description: "Fischer Random (Chess960), King of the Hill, and 3-Check.",
      badge: "3 Game Styles",
      badgeColor: "badge-amber",
      icon: Dices,
      iconBg: "bg-orange-500/10 text-orange-500 dark:bg-orange-500/20",
      href: "/play/variants",
      highlight: false
    },
    {
      id: "history",
      title: "Game History",
      description: "Revisit your past games, download PGNs, and review your moves.",
      badge: "Analysis Ready",
      badgeColor: "badge",
      icon: History,
      iconBg: "bg-teal-500/10 text-teal-500 dark:bg-teal-500/20",
      href: "/play/history",
      highlight: false
    }
  ];

  // Dummy stats
  const stats = {
    gamesPlayed: 142,
    winRate: 54.2,
    peakRating: 1620,
    globalRank: "#45,102"
  };

  return (
    <div className="page-section">
      <div className="page-spot-tl" />
      <div className="page-spot-br" />

      <div className="page-container max-w-[1250px] gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[var(--border-primary)]">
          <div className="flex flex-col gap-2">
            <span className="section-label flex items-center gap-2">
              <Swords className="w-3.5 h-3.5" /> Arena Dashboard
            </span>
            <h1 className="page-heading">ChessOnline Arena</h1>
            <p className="page-subheading max-w-[650px] text-xs">
              Welcome to your digital battleground. Challenge Grandmasters, spar with Stockfish, or analyze your strategic growth in a premium environment.
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-semibold">120,410 Players Online</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Play Options Catalog */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <h2 className="text-lg font-bold font-jost text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <Play className="w-4 h-4 text-[var(--primary)] fill-current" /> Select Game Mode
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playModes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <Link 
                    key={mode.id} 
                    href={mode.href}
                    className={`card-elevated group relative flex flex-col justify-between p-5 min-h-[160px] overflow-hidden transition-all duration-300 ${
                      mode.highlight 
                        ? 'border-[var(--primary)]/20 shadow-[0_10px_30px_rgba(37,99,235,0.06)]' 
                        : ''
                    }`}
                  >
                    {/* Glowing background accent on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/0 to-[var(--primary)]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="flex items-start justify-between relative z-10">
                      <div className={`w-10 h-10 rounded-xl ${mode.iconBg} flex items-center justify-center transition-all group-hover:scale-105 shadow-sm`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`badge text-[9px] ${mode.badgeColor}`}>
                        {mode.badge}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-5 relative z-10">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                          {mode.title}
                        </h3>
                        <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed line-clamp-2">
                        {mode.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User ELO & Sidebar Widgets */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* ELO Card */}
            <div className="card-elevated flex flex-col gap-5 relative overflow-hidden">
              {/* Gold gradient accent line at top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-primary to-indigo-500" />
              
              <div className="flex items-center justify-between">
                <span className="section-label">Your ELO Rank</span>
                <span className="badge badge-green text-[9px]">Ranked Active</span>
              </div>

              {mounted && user ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[var(--primary)] rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-md">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[var(--text-primary)] leading-tight">{user.username}</h3>
                      <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-[var(--primary)]" /> Platinum Division II
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--border-primary)]">
                    <div className="bg-[var(--bg-secondary)]/50 dark:bg-black/20 rounded-xl p-3 flex flex-col">
                      <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Active ELO</span>
                      <span className="text-xl font-bold text-[var(--primary)] mt-1">⚡ {user.rating}</span>
                    </div>
                    <div className="bg-[var(--bg-secondary)]/50 dark:bg-black/20 rounded-xl p-3 flex flex-col">
                      <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-semibold">Peak ELO</span>
                      <span className="text-xl font-bold text-[var(--text-primary)] mt-1">⚡ {stats.peakRating}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 text-[11px] text-[var(--text-secondary)]">
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border-primary)]/5">
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                        <Swords className="w-3.5 h-3.5 text-blue-500" /> Games Played
                      </span>
                      <span className="font-semibold">{stats.gamesPlayed} matches</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[var(--border-primary)]/5">
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                        <Star className="w-3.5 h-3.5 text-amber-500" /> Win Rate
                      </span>
                      <span className="font-semibold text-emerald-500 font-mono">{stats.winRate}%</span>
                    </div>
                    <div className="flex justify-between items-center py-1">
                      <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                        <Globe className="w-3.5 h-3.5 text-purple-500" /> Global Rank
                      </span>
                      <span className="font-semibold font-mono">{stats.globalRank}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-6 gap-3">
                  <div className="w-10 h-10 bg-[var(--bg-secondary)] rounded-xl flex items-center justify-center text-[var(--text-muted)]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[var(--text-primary)]">Guest Account</h3>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1 max-w-[200px] leading-normal">
                      Sign in or create an account to save your ratings, climb the leaderboard, and save games.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Elite Match Stats Tip */}
            <div className="premium-card-gold p-4 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600/10 text-blue-700 dark:text-blue-400 dark:bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-500 animate-pulse" />
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="text-xs font-bold text-blue-900 dark:text-[var(--text-primary)] leading-snug">Elite AI Coaching Included</h4>
                <p className="text-[10px] text-blue-700/80 dark:text-[var(--text-muted)] leading-relaxed">
                  ChessOnline includes a master-level real-time coach. Tap "Play Coach" above to test tactical concepts during active matches!
                </p>
              </div>
            </div>

            {/* Active Players Mock Grid */}
            <div className="card-elevated flex flex-col gap-3.5">
              <span className="section-label">Live Active Players</span>
              
              <div className="flex flex-col gap-2">
                {[
                  { username: "GrandmasterCarlsen", rating: 2842, status: "Playing Bots" },
                  { username: "CheckmateCharly", rating: 1530, status: "In Lobby" },
                  { username: "SofiaPuzzles", rating: 1980, status: "In Lobby" },
                  { username: "TacticalGenius", rating: 2110, status: "Playing Online" }
                ].map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-2 px-2.5 rounded-lg bg-[var(--bg-secondary)]/30 hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <div>
                        <span className="font-semibold text-[var(--text-primary)] truncate block max-w-[130px]">{p.username}</span>
                        <span className="text-[9px] text-[var(--text-muted)]">{p.status}</span>
                      </div>
                    </div>
                    <span className="font-bold text-[var(--primary)] font-mono text-[10px]">⚡ {p.rating}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
