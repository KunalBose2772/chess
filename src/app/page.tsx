'use client'

import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { Bot, Swords, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { useBoardTheme, BOARD_THEMES } from "@/components/BoardThemeProvider";

export default function Home() {
  const { boardTheme, setBoardThemeById } = useBoardTheme();
  const [mounted, setMounted] = useState(false);
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  const [whiteTime, setWhiteTime] = useState(573);
  const [blackTime, setBlackTime] = useState(595);
  const [activeClock, setActiveClock] = useState<'w' | 'b'>('w');
  const audioCtxRef = useRef<AudioContext | null>(null);

  const operaGameMoves = [
    "e4", "e5", "Nf3", "d6", "d4", "Bg4", "dxe5", "Bxf3", "Qxf3", "dxe5",
    "Bc4", "Nf6", "Qb3", "Qe7", "Nc3", "c6", "Bg5", "b5", "Nxb5", "cxb5",
    "Bxb5+", "Nbd7", "O-O-O", "Rd8", "Rxd7", "Rxd7", "Rd1", "Qe6",
    "Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#",
  ];

  const playSound = useCallback((type: 'move' | 'capture' | 'check' | 'clock') => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
      if (type === 'check') {
        [450, 550].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.type = "sine"; o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
          g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.06);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.12);
          o.connect(g); g.connect(ctx.destination);
          o.start(ctx.currentTime + i * 0.06); o.stop(ctx.currentTime + i * 0.06 + 0.12);
        });
        return;
      }
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      if (type === 'move') {
        osc.type = "sine"; osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.18, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'capture') {
        osc.type = "triangle"; osc.frequency.setValueAtTime(280, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.08);
      } else {
        const osc2 = ctx.createOscillator(); const gain2 = ctx.createGain();
        osc.type = "sine"; osc.frequency.setValueAtTime(1400, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02);
        osc2.type = "triangle"; osc2.frequency.setValueAtTime(180, ctx.currentTime);
        gain2.gain.setValueAtTime(0.12, ctx.currentTime); gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain); gain.connect(ctx.destination);
        osc2.connect(gain2); gain2.connect(ctx.destination);
        osc.start(); osc.stop(ctx.currentTime + 0.02);
        osc2.start(); osc2.stop(ctx.currentTime + 0.08);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const t = setInterval(() => {
      if (activeClock === 'w') setWhiteTime(p => p > 0 ? p - 1 : 600);
      else setBlackTime(p => p > 0 ? p - 1 : 600);
    }, 1000);
    return () => clearInterval(t);
  }, [activeClock, mounted]);

  useEffect(() => {
    setMounted(true);
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;
      const unlock = () => { if (ctx.state === "suspended") ctx.resume(); window.removeEventListener("click", unlock); };
      window.addEventListener("click", unlock);
    }
    const game = new Chess(); let index = 0;
    const interval = setInterval(() => {
      if (index >= operaGameMoves.length) {
        game.reset(); index = 0; setActiveClock('w'); playSound('clock');
      } else {
        try {
          const move = operaGameMoves[index]; game.move(move); index++;
          setActiveClock(game.turn()); playSound('clock');
          if (move.includes("#") || move.includes("+")) playSound('check');
          else if (move.includes("x")) playSound('capture');
          else playSound('move');
        } catch { game.reset(); index = 0; setActiveClock('w'); playSound('clock'); }
      }
      setFen(game.fen());
    }, 2200);
    return () => clearInterval(interval);
  }, [playSound]);

  const fmt = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="w-full min-h-full lg:h-full bg-salon font-montserrat flex flex-col lg:flex-row items-center justify-start lg:justify-center gap-6 px-4 py-4 lg:px-8 lg:overflow-hidden">

        {/* ── LEFT: BOARD CARD ─────────────────────────────────────────── */}
        <div className="w-full max-w-[480px] lg:max-w-[560px] flex-shrink-0">
          <div className="card-elevated !m-0 !p-3 w-full flex flex-col gap-2">

            {/* Black player (top) */}
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[var(--text-primary)] flex items-center justify-center text-[var(--bg-main)] font-black text-[10px] shrink-0">
                  ♞
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-[var(--text-primary)] leading-none">Duke of Brunswick</span>
                    <span className="text-[7px] px-1 py-0.5 rounded-sm bg-[var(--text-muted)]/15 text-[var(--text-muted)] font-black uppercase">1200</span>
                  </div>
                  <span className="text-[8px] text-[var(--text-muted)] font-light">🇩🇪 Paris Opera House, 1858</span>
                </div>
              </div>
              <div className={`px-2 py-0.5 rounded-sm border-2 font-mono text-[10px] font-black tracking-tight transition-all ${
                activeClock === 'b' ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--bg-surface)]' : 'border-[var(--border-primary)]/40 text-[var(--text-secondary)] opacity-50'
              }`}>{fmt(blackTime)}</div>
            </div>

            {/* Board — Aspect square ensures it maintains a 1:1 ratio based on width */}
            <div className="w-full aspect-square rounded-sm overflow-hidden border-2 border-[var(--text-primary)]">
              {mounted ? (
                <Chessboard options={{
                  position: fen,
                  darkSquareStyle: { backgroundColor: boardTheme.dark },
                  lightSquareStyle: { backgroundColor: boardTheme.light },
                  allowDragging: false,
                  animationDurationInMs: 250,
                  showNotation: false,
                }} />
              ) : (
                <div className="w-full aspect-square bg-[var(--bg-secondary)] animate-pulse" />
              )}
            </div>

            {/* White player (bottom) */}
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[var(--bg-surface)] border-2 border-[var(--text-primary)] flex items-center justify-center text-[var(--text-primary)] font-black text-[10px] shrink-0">
                  ♙
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-[var(--text-primary)] leading-none">Paul Morphy</span>
                    <span className="text-[7px] px-1 py-0.5 rounded-sm bg-[var(--primary)]/10 text-[var(--primary)] font-black uppercase">~2756</span>
                  </div>
                  <span className="text-[8px] text-[var(--text-muted)] font-light">🇺🇸 The Immortal Genius</span>
                </div>
              </div>
              <div className={`px-2 py-0.5 rounded-sm border-2 font-mono text-[10px] font-black tracking-tight transition-all ${
                activeClock === 'w' ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--bg-surface)]' : 'border-[var(--border-primary)]/40 text-[var(--text-secondary)] opacity-50'
              }`}>{fmt(whiteTime)}</div>
            </div>

            {/* Game label */}
            <div className="flex items-center justify-between pt-1 border-t border-[var(--border-primary)]/30">
              <span className="text-[8px] text-[var(--text-muted)] font-bold uppercase tracking-[0.12em]">♟ Morphy's Opera Game · Live Demo</span>
              <span className="flex items-center gap-1 text-[7px] text-[var(--primary)] font-bold">
                <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-ping inline-block" />
                Autoplay
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: PLAY CONSOLE CARD ──────────────────────────────────── */}
        <div className="w-full max-w-[360px] flex-shrink-0">
          <div className="card-surface !m-0 w-full flex flex-col gap-4">

            {/* Header */}
            <div className="flex flex-col gap-2">
              <span className="section-label">🏆 The Ultimate Chess</span>
              <h1 className="text-[28px] lg:text-[32px] font-black font-jost leading-[1.1] tracking-tight text-[var(--text-primary)]">
                Play Chess Online<br />
                with <span className="text-[var(--primary)]">Championship<br />Style.</span>
              </h1>
            </div>

            {/* Mechanical Clock */}
            <div className="w-full select-none">
              {/* Plungers */}
              <div className="flex justify-between px-8 relative z-10">
                <div className={`w-7 h-3.5 bg-gradient-to-b from-amber-600 to-amber-900 border-2 border-[var(--text-primary)] rounded-t-sm transition-all duration-150 ${activeClock === 'w' ? '-translate-y-1.5 shadow-[0_2px_0_var(--text-primary)]' : 'shadow-none'}`} />
                <div className={`w-7 h-3.5 bg-gradient-to-b from-amber-600 to-amber-900 border-2 border-[var(--text-primary)] rounded-t-sm transition-all duration-150 ${activeClock === 'b' ? '-translate-y-1.5 shadow-[0_2px_0_var(--text-primary)]' : 'shadow-none'}`} />
              </div>
              {/* Clock housing */}
              <div className="border-2 border-[var(--text-primary)] rounded-[var(--radius-sm)] bg-[var(--bg-main)] shadow-[4px_4px_0px_var(--text-primary)] p-2.5 flex items-stretch gap-1.5">
                <div className={`flex-1 flex flex-col items-center justify-center py-2 rounded-sm border-2 transition-all duration-200 ${activeClock === 'w' ? 'border-[var(--primary)] bg-[var(--bg-surface)]' : 'border-[var(--border-primary)]/30 bg-[var(--bg-surface)] opacity-50'}`}>
                  <span className="text-[6px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-0.5">White</span>
                  <span className={`text-lg font-mono font-black leading-none ${activeClock === 'w' ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>{fmt(whiteTime)}</span>
                </div>
                <div className="flex items-center justify-center w-8 shrink-0">
                  <div className="w-6 h-6 rounded-full border-2 border-[var(--text-primary)] bg-[var(--bg-secondary)] flex items-center justify-center overflow-hidden">
                    <div className="w-[2.5px] h-3.5 bg-amber-700 rounded-full pendulum-swing" style={{ marginTop: '-3px' }}>
                      <div className="w-1.5 h-1.5 bg-amber-500 rounded-full border border-[var(--text-primary)] mx-auto mt-auto" />
                    </div>
                  </div>
                </div>
                <div className={`flex-1 flex flex-col items-center justify-center py-2 rounded-sm border-2 transition-all duration-200 ${activeClock === 'b' ? 'border-[var(--primary)] bg-[var(--bg-surface)]' : 'border-[var(--border-primary)]/30 bg-[var(--bg-surface)] opacity-50'}`}>
                  <span className="text-[6px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-0.5">Black</span>
                  <span className={`text-lg font-mono font-black leading-none ${activeClock === 'b' ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'}`}>{fmt(blackTime)}</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-2">
              <Link href="/play" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                <Swords className="w-4 h-4" />
                <span>Play Now</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-70" />
              </Link>
              <Link href="/play/bots" className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2">
                <Bot className="w-4 h-4" />
                <span>Challenge Bots</span>
              </Link>
            </div>

            {/* Board Theme */}
            <div className="flex flex-col gap-1.5 pt-3 border-t border-[var(--border-primary)]">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-[0.14em]">Board Theme</span>
                <span className="text-[7px] text-[var(--primary)] font-bold animate-pulse">● Live</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 border-2 border-[var(--text-primary)] rounded-[var(--radius-sm)] bg-[var(--bg-surface)]">
                {BOARD_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setBoardThemeById(t.id); playSound('clock'); }}
                    title={t.name}
                    className={`relative group w-5 h-5 rounded-full border-2 cursor-pointer transition-all duration-200 flex-shrink-0 ${
                      boardTheme.id === t.id
                        ? 'border-[var(--text-primary)] scale-110 ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--bg-surface)]'
                        : 'border-[var(--text-primary)]/40 hover:scale-105 hover:border-[var(--text-primary)]'
                    }`}
                    style={{ background: `linear-gradient(135deg, ${t.light} 50%, ${t.dark} 50%)` }}
                  >
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-1.5 py-0.5 bg-[var(--text-primary)] text-[var(--bg-surface)] text-[8px] font-bold rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                      {t.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Stats */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-primary)] text-[10px] text-[var(--text-muted)] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-ping inline-block" />
                <span>120,490 Online</span>
              </div>
              <span>12M Games Played</span>
            </div>

          </div>
        </div>

    </div>
  );
}
