'use client'

import { Trophy, Users, Shield, Calendar, UsersIcon, Check, Swords, ChevronRight, Play } from "lucide-react";
import { useState } from "react";

export default function PlayTournamentsPage() {
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const tournaments = [
    {
      id: "blitz_arena",
      name: "Grandmaster Blitz Arena",
      time: "Starts in 24 mins",
      type: "Arena (Speed Chess)",
      players: 1530,
      timeControl: "3 min Blitz",
      ratingLimit: "All Ratings",
      status: "Registering",
      color: "border-purple-500/30",
      avatar: "⚡"
    },
    {
      id: "weekly_swiss",
      name: "Championship Weekly Swiss",
      time: "Today, 6:00 PM",
      type: "Swiss (5 Rounds)",
      players: 320,
      timeControl: "10 min + 5s Rapid",
      ratingLimit: "ELO > 1400",
      status: "Registering",
      color: "border-blue-500/30",
      avatar: "🏆"
    },
    {
      id: "bullet_rush",
      name: "Bullet Rush Ladder",
      time: "In Progress",
      type: "Arena (Ultralight)",
      players: 2840,
      timeControl: "1 min Bullet",
      ratingLimit: "All Ratings",
      status: "Running",
      color: "border-emerald-500/30",
      avatar: "🔥"
    }
  ];

  const handleRegister = (id: string, name: string) => {
    if (registeredIds.includes(id)) {
      setRegisteredIds(prev => prev.filter(x => x !== id));
      setToastMsg(`Successfully unregistered from ${name}.`);
    } else {
      setRegisteredIds(prev => [...prev, id]);
      setToastMsg(`Successfully registered for ${name}! Prepare your opening lines.`);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Bracket matches for the active Arena
  const bracketRounds = {
    semis: [
      { id: 1, p1: "MagnusC", p1Rating: 2840, p2: "NakamuraH", p2Rating: 2810, score: "1 - 0", status: "Completed" },
      { id: 2, p1: "CaruanaF", p1Rating: 2790, p2: "NepomniachtchiI", p2Rating: 2785, score: "0.5 - 0.5", status: "Tiebreaks" }
    ],
    finals: [
      { id: 3, p1: "MagnusC", p1Rating: 2840, p2: "NepomniachtchiI", p2Rating: 2785, score: "Waiting", status: "Upcoming" }
    ]
  };

  return (
    <div className="page-section">
      <div className="page-spot-tl" />
      <div className="page-spot-br" />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel !border-emerald-500/30 bg-emerald-500/[0.04] p-4.5 rounded-xl shadow-[var(--soft-shadow)] flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Check className="w-4.5 h-4.5" />
          </div>
          <span className="text-xs font-semibold text-[var(--text-primary)]">{toastMsg}</span>
        </div>
      )}

      <div className="page-container max-w-[1200px] gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[var(--border-primary)]">
          <div className="flex flex-col gap-2">
            <span className="section-label flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5" /> Championship Arena
            </span>
            <h1 className="page-heading">Tournaments Center</h1>
            <p className="page-subheading max-w-[650px] text-xs">
              Compete in official Swiss ladders and Arena tournaments. Test your ELO against large pools and win premium tactical badges.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl px-4 py-2 text-xs text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
              <UsersIcon className="w-3.5 h-3.5" />
              <span className="font-semibold">4,690 Active Competitors</span>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Tournament Registry List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <h2 className="text-base font-bold font-jost text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <Swords className="w-4 h-4 text-[var(--primary)]" /> Active Registry
            </h2>

            <div className="flex flex-col gap-4">
              {tournaments.map((t) => {
                const isReg = registeredIds.includes(t.id);
                return (
                  <div 
                    key={t.id}
                    className={`card-elevated flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 border-t-2 relative overflow-hidden transition-all duration-300 ${t.color}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)]/50 dark:bg-black/20 flex items-center justify-center text-lg flex-shrink-0">
                        {t.avatar}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-xs font-bold text-[var(--text-primary)]">{t.name}</h3>
                          <span className={`text-[8.5px] font-semibold px-2 py-0.5 rounded-lg ${
                            t.status === 'Running' 
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 animate-pulse' 
                              : 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/10'
                          }`}>
                            {t.status === 'Running' ? '● In Progress' : 'Registering'}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] leading-relaxed flex items-center gap-1.5 flex-wrap">
                          <span>{t.type}</span>
                          <span>•</span>
                          <span>🕒 {t.timeControl}</span>
                          <span>•</span>
                          <span>🎯 {t.ratingLimit}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-[var(--border-primary)]/5 pt-3 sm:pt-0">
                      <div className="flex flex-col sm:text-right">
                        <span className="text-[10px] font-bold text-[var(--text-primary)] font-mono">{t.players} entered</span>
                        <span className="text-[9px] text-[var(--text-muted)] italic leading-snug">{t.time}</span>
                      </div>
                      
                      <button
                        onClick={() => handleRegister(t.id, t.name)}
                        className={`text-xs font-semibold px-4.5 py-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 flex items-center gap-1.5 ${
                          isReg
                            ? 'bg-emerald-500 text-white shadow-[0_4px_16px_rgba(16,185,129,0.25)] border border-emerald-600'
                            : 'btn-secondary text-[11px] !py-2.5'
                        }`}
                      >
                        {isReg ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Registered
                          </>
                        ) : (
                          "Join Tournament"
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tournament Live Bracket Visualizer */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <h2 className="text-base font-bold font-jost text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" /> Live Championship Bracket
            </h2>

            <div className="card-elevated p-5 flex flex-col gap-5 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-[var(--border-primary)] pb-3">
                <span className="section-label">Super Blitz Bracket</span>
                <span className="badge badge-amber text-[9.5px]">Match 3 Active</span>
              </div>

              {/* Bracket Tree Layout */}
              <div className="flex items-center gap-4 py-2 overflow-x-auto min-w-full">
                
                {/* Semis Column */}
                <div className="flex flex-col gap-6 flex-1 min-w-[170px]">
                  <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider text-center border-b border-[var(--border-primary)] pb-1 mb-1">Semi-Finals</span>
                  
                  {bracketRounds.semis.map((match) => (
                    <div key={match.id} className="flex flex-col rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]/10 overflow-hidden text-[10px] shadow-sm">
                      <div className="flex items-center justify-between p-2 border-b border-[var(--border-primary)]/5 hover:bg-[var(--bg-secondary)]/30 transition-colors">
                        <span className="font-semibold text-[var(--text-primary)] truncate max-w-[90px]">{match.p1}</span>
                        <span className="text-[9px] font-mono text-[var(--text-muted)] font-light">⚡{match.p1Rating}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 hover:bg-[var(--bg-secondary)]/30 transition-colors">
                        <span className="font-semibold text-[var(--text-primary)] truncate max-w-[90px]">{match.p2}</span>
                        <span className="text-[9px] font-mono text-[var(--text-muted)] font-light">⚡{match.p2Rating}</span>
                      </div>
                      <div className="bg-[var(--bg-secondary)]/20 p-1 px-2 border-t border-[var(--border-primary)]/5 flex justify-between items-center text-[9px] font-mono font-semibold text-[var(--primary)]">
                        <span>Score: {match.score}</span>
                        <span className="text-[8.5px] italic text-[var(--text-muted)] font-light">{match.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Arrow connectors */}
                <div className="flex flex-col justify-around h-full py-16 select-none opacity-40">
                  <div className="text-[var(--text-muted)]">➔</div>
                  <div className="text-[var(--text-muted)]">➔</div>
                </div>

                {/* Finals Column */}
                <div className="flex flex-col gap-6 flex-1 min-w-[170px] justify-center pt-8">
                  <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider text-center border-b border-[var(--border-primary)] pb-1 mb-1">Grand Finals</span>

                  {bracketRounds.finals.map((match) => (
                    <div key={match.id} className="flex flex-col rounded-xl border-2 border-amber-500/25 bg-[var(--bg-secondary)]/20 overflow-hidden text-[10px] shadow-sm">
                      <div className="flex items-center justify-between p-2.5 border-b border-[var(--border-primary)]/5 hover:bg-[var(--bg-secondary)]/30 transition-colors">
                        <span className="font-bold text-[var(--text-primary)] truncate max-w-[90px]">{match.p1}</span>
                        <span className="text-[9px] font-mono text-[var(--text-muted)] font-light">⚡{match.p1Rating}</span>
                      </div>
                      <div className="flex items-center justify-between p-2.5 hover:bg-[var(--bg-secondary)]/30 transition-colors">
                        <span className="font-bold text-[var(--text-primary)] truncate max-w-[90px]">{match.p2}</span>
                        <span className="text-[9px] font-mono text-[var(--text-muted)] font-light">⚡{match.p2Rating}</span>
                      </div>
                      <div className="bg-amber-500/10 p-1.5 px-2.5 border-t border-[var(--border-primary)]/5 flex justify-between items-center text-[9px] font-mono font-bold text-amber-600 dark:text-amber-400">
                        <span>Score: {match.score}</span>
                        <span className="text-[8.5px] uppercase tracking-wider text-amber-500 font-semibold">{match.status}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              <div className="p-4.5 bg-black/[0.02] dark:bg-white/[0.01] rounded-2xl border border-[var(--border-primary)] flex items-start gap-3 mt-2">
                <Shield className="w-4 h-4 text-[var(--primary)] flex-shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">Anti-Cheat System Guarded</span>
                  <p className="text-[9px] text-[var(--text-muted)] leading-relaxed font-light">
                    Every move analyzed by server-side Stockfish checks. ELO adjustment calculations are performed immediately following final round completion.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
