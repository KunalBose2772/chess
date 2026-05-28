'use client'

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Flame, BookOpen, ChevronRight, X, Clock, Bot, Handshake, 
  BarChart2, AlignJustify, LayoutGrid, Zap, Trophy, Check, Swords
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedStreakFlame from "@/components/AnimatedStreakFlame";
import { 
  claimTodayStreak, 
  checkStreakIntegrity, 
  StreakState 
} from "@/lib/streak";
import { useBoardTheme } from "@/components/BoardThemeProvider";

/* ─── Mini Board (Consistent theme styling) ───────────────────── */
function MiniBoard({ pieces, boardTheme }: { pieces: Record<string, string>; boardTheme: any }) {
  const rows = [8,7,6,5,4,3,2,1];
  const cols = ['a','b','c','d','e','f','g','h'];
  const G: Record<string,string> = {k:'♚',K:'♔',q:'♛',Q:'♕',r:'♜',R:'♖',b:'♝',B:'♗',n:'♞',N:'♘',p:'♟',P:'♙'};
  return (
    <div className="grid grid-cols-8 w-full aspect-square rounded-sm overflow-hidden border border-[var(--text-primary)]">
      {rows.map((row,ri) => cols.map((col,ci) => {
        const sq=`${col}${row}`, dark=(ri+ci)%2===1, p=pieces[sq];
        return (
          <div 
            key={sq} 
            className="aspect-square flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: dark ? boardTheme.dark : boardTheme.light }}
          >
            {p && (
              <span className={`text-[clamp(10px,2.5vw,22px)] select-none drop-shadow-[0_1.5px_1px_rgba(0,0,0,0.25)] font-bold leading-none ${
                p === p.toLowerCase() ? 'text-[var(--text-primary)]' : 'text-[#FFFDF9]'
              }`}>
                {G[p]}
              </span>
            )}
          </div>
        );
      }))}
    </div>
  );
}

const PUZZLE_B  = {e8:'k',f7:'p',g7:'p',h7:'r',e1:'R',g1:'K'};
const LESSON_B  = {a8:'r',b8:'n',c8:'b',d8:'q',e8:'k',f8:'b',g8:'n',h8:'r',a7:'p',b7:'p',c7:'p',d7:'p',e7:'p',f7:'p',g7:'p',h7:'p',a2:'P',b2:'P',c2:'P',d2:'P',e2:'P',f2:'P',g2:'P',h2:'P',a1:'R',b1:'N',c1:'B',d1:'Q',e1:'K',f1:'B',g1:'N',h1:'R'};
const REVIEW_B  = {g8:'k',h7:'p',g7:'p',f6:'n',e4:'P',d1:'Q',g1:'K'};
const DAILY_B   = {e7:'N',f7:'p',g7:'p',h7:'r',d5:'p',e5:'p',f5:'n',d2:'B',f2:'p',g2:'k',b1:'R',c1:'Q',a1:'p'};

function tap() {
  try {
    const a = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = a.createOscillator(), g = a.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(300, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(120, a.currentTime + 0.1);
    g.gain.setValueAtTime(0.08, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.1);
    o.connect(g);
    g.connect(a.destination);
    o.start();
    o.stop(a.currentTime + 0.1);
  } catch {}
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const { boardTheme } = useBoardTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [banner, setBanner] = useState(true);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [streakState, setStreakState] = useState<StreakState>({
    currentStreak: 0,
    bestStreak: 0,
    lastActiveDate: "",
    weeklyProgress: [false, false, false, false, false, false, false],
    weekStartDate: "",
  });

  useEffect(() => {
    setMounted(true);
    const currentStreakData = checkStreakIntegrity();
    setStreakState(currentStreakData);
  }, []);

  const username = mounted && user?.username ? user.username : "KunalBose2772";
  const rating   = mounted && user?.rating   ? user.rating   : 800;

  const getWeeklyStatus = () => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    let todayIndex = today.getDay() - 1;
    if (todayIndex === -1) todayIndex = 6;

    return daysOfWeek.map((label, idx) => {
      const isToday = idx === todayIndex;
      const isCompleted = streakState.weeklyProgress[idx];
      const isPast = idx < todayIndex;
      return { label, isToday, isCompleted, isPast };
    });
  };

  const weeklyStatus = getWeeklyStatus();
  const completedCount = streakState.weeklyProgress.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 7) * 100);

  return (
    <div className="w-full flex-1 flex flex-col bg-transparent font-montserrat min-h-screen">
      <div className="max-w-[1160px] w-full mx-auto px-6 py-8 flex flex-col gap-8 flex-1">

        {/* ── Header (Aligned with luxury aesthetic) ────────────────────── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[var(--radius-sm)] bg-[var(--primary)] border-2 border-[var(--text-primary)] flex items-center justify-center font-black text-white text-lg shadow-[2px_2px_0px_var(--text-primary)]">
              {username[0]?.toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[18px] font-black text-[var(--text-primary)] tracking-tight font-jost leading-tight">{username}</h2>
                <span className="text-base select-none">🇮🇳</span>
              </div>
              <p className="text-[12px] font-bold text-[var(--text-muted)] mt-0.5">⚡ {rating} Rapid · Platinum II</p>
            </div>
          </div>
          <div className="hidden sm:flex section-label items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>128,440 players online</span>
          </div>
        </div>

        {/* ── Premium Banner (Revamped to warm walnut/gold gradient) ─────── */}
        {banner && (
          <div className="relative rounded-[var(--radius-sm)] overflow-hidden border-2 border-[var(--text-primary)] bg-[var(--bg-secondary)] shadow-[4px_4px_0px_var(--text-primary)] transition-all">
            {/* Subtle linen textured layer */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_70%_50%,rgba(184,144,71,0.3),transparent_60%)]" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between px-7 py-6 gap-6">
              <div className="flex flex-col gap-2">
                <span className="self-start text-[8px] font-black uppercase tracking-[0.2em] text-[var(--primary)] bg-white border border-[var(--text-primary)] px-3 py-1 rounded-[var(--radius-sm)] shadow-[1.5px_1.5px_0px_var(--text-primary)]">
                  Spring Sale
                </span>
                <h3 className="text-[22px] sm:text-[26px] font-black text-[var(--text-primary)] leading-none font-jost tracking-tight mt-1">
                  Get 50% Off Premium Access
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] font-medium leading-relaxed max-w-xl">
                  Unlock unlimited grandmaster level puzzles, comprehensive AI coaching, and deep game analysis.
                </p>
              </div>
              <div className="flex items-center gap-5 flex-shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-[var(--text-primary)]/10 pt-4 md:pt-0">
                <div className="hidden sm:flex relative w-12 h-12 flex-shrink-0 items-center justify-center rounded-sm bg-white border-2 border-[var(--text-primary)] shadow-[2px_2px_0px_var(--text-primary)]">
                  <Trophy className="w-6 h-6 text-[var(--accent)]" />
                </div>
                <button 
                  onClick={() => { tap(); }}
                  className="btn-primary px-6 py-3 cursor-pointer w-full md:w-auto"
                >
                  Redeem Now
                </button>
              </div>
              <button 
                onClick={() => { tap(); setBanner(false); }} 
                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer p-1 rounded-sm hover:bg-white/40"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Stats Row (Solid Neobrutalist design system) ──────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon:<Flame className="w-4 h-4 text-amber-600 fill-current"/>, label:'Daily Streak', value: streakState.currentStreak === 1 ? '1 Day' : `${streakState.currentStreak} Days`, action: () => { tap(); setShowStreakModal(true); } },
            { icon:<Zap   className="w-4 h-4 text-[var(--primary)]"/>,         label:'Puzzles',      value:'0 Solved', href: '/puzzles' },
            { icon:<BookOpen className="w-4 h-4 text-amber-700"/>,             label:'Next Lesson',  value:'Capture Pieces', href: '/learn' },
            { icon:<BarChart2 className="w-4 h-4 text-emerald-800"/>,         label:'Last Review',  value:'vs polly-BOT', href: '/play/history' },
          ].map(s => (
            <div
              key={s.label}
              onClick={s.action ? s.action : () => { tap(); if (s.href) router.push(s.href); }}
              className={`flex items-center gap-3.5 p-4 rounded-[var(--radius-sm)] border-2 border-[var(--text-primary)] bg-[var(--bg-surface)] shadow-[3px_3px_0px_var(--text-primary)] transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_var(--text-primary)] active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--text-primary)]`}
            >
              <div className="w-8 h-8 rounded-sm bg-[var(--bg-secondary)] border-2 border-[var(--text-primary)] flex items-center justify-center flex-shrink-0">
                {s.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[9.5px] text-[var(--text-muted)] uppercase tracking-widest font-black truncate">{s.label}</p>
                <p className="text-[12px] font-black text-[var(--text-primary)] mt-0.5 truncate">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid Row 1 (Play CTAs + Challenges) ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* Left Column: Play CTAs (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)] px-1 mb-1">Play Arena</p>

            {/* Primary Match Finder */}
            <Link 
              href="/play/online?tc=rapid" 
              onClick={tap} 
              className="group w-full flex items-center gap-4 px-5 py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] border-2 border-[var(--text-primary)] rounded-[var(--radius-sm)] shadow-[3px_3px_0px_var(--text-primary)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_var(--text-primary)] active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--text-primary)] transition-all duration-200 cursor-pointer"
            >
              <div className="w-9 h-9 rounded-sm bg-white border-2 border-[var(--text-primary)] flex items-center justify-center flex-shrink-0 text-[var(--primary)]">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-left flex-1">
                <p className="text-[14px] font-black text-white leading-tight">Play 10 min</p>
                <p className="text-[11px] text-[var(--bg-secondary)] mt-0.5 font-bold">Rapid · Find match</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Secondary CTAs */}
            {[
              { label:'New Game',      sub:'Choose time & rules', icon:<span className="text-[16px] font-black leading-none">♟</span>,   href:'/play/online' },
              { label:'Play vs Bot',   sub:'AI difficulty levels', icon:<Bot className="w-[18px] h-[18px]"/>,                  href:'/play/bots'   },
              { label:'Play a Friend', sub:'Share invite link',    icon:<Handshake className="w-[18px] h-[18px]"/>,             href:'/play/friend' },
            ].map(c => (
              <Link 
                key={c.label} 
                href={c.href} 
                onClick={tap}
                className="group flex items-center gap-4 px-5 py-4 bg-[var(--bg-surface)] border-2 border-[var(--text-primary)] rounded-[var(--radius-sm)] shadow-[3px_3px_0px_var(--text-primary)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_var(--text-primary)] active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--text-primary)] transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-sm bg-[var(--bg-secondary)] border-2 border-[var(--text-primary)] flex items-center justify-center text-[var(--text-primary)] flex-shrink-0">
                  {c.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-black text-[var(--text-primary)]">{c.label}</p>
                  <p className="text-[11px] text-[var(--text-muted)] font-semibold mt-0.5">{c.sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0 group-hover:text-[var(--text-primary)] group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>

          {/* Right Column: Board previews (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)] px-1 mb-1">Today's Challenges</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              {[
                { label:'Solve Puzzle',    pieces:PUZZLE_B,  href:'/puzzles' },
                { label:'Start Lesson',    pieces:LESSON_B,  href:'/learn' },
                { label:'Review Last Game',pieces:REVIEW_B,  href:'/play/history' },
              ].map(b => (
                <Link 
                  key={b.label} 
                  href={b.href} 
                  onClick={tap}
                  className="group flex flex-col gap-3 p-3.5 bg-[var(--bg-surface)] border-2 border-[var(--text-primary)] rounded-[var(--radius-sm)] shadow-[3px_3px_0px_var(--text-primary)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_var(--text-primary)] active:translate-y-0 active:shadow-[1px_1px_0px_var(--text-primary)] transition-all duration-300 h-full justify-between"
                >
                  <div className="rounded-sm overflow-hidden border-2 border-[var(--text-primary)] shadow-sm">
                    <MiniBoard pieces={b.pieces} boardTheme={boardTheme} />
                  </div>
                  <p className="text-[10px] font-black text-[var(--text-muted)] text-center uppercase tracking-wider group-hover:text-[var(--primary)] transition-colors leading-tight">{b.label}</p>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* ── Main Grid Row 2 (Recent Games + Widgets) ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Game History + Daily Games (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Daily Games */}
            <div className="flex items-center justify-between px-5 py-4 bg-[var(--bg-surface)] border-2 border-[var(--text-primary)] rounded-[var(--radius-sm)] shadow-[3px_3px_0px_var(--text-primary)]">
              <p className="text-[12px] font-bold text-[var(--text-primary)]">Daily Games</p>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-[var(--text-muted)]">0 active</span>
                <div className="flex items-center gap-1.5 text-[var(--text-muted)] border-l border-[var(--text-primary)]/10 pl-3">
                  <AlignJustify className="w-4 h-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors" />
                  <LayoutGrid className="w-4 h-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors" />
                </div>
              </div>
            </div>

            {/* Game History */}
            <div>
              <div className="flex items-center justify-between px-1 mb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">Recent Games</p>
                <Link href="/play/history" className="text-[11px] font-black text-[var(--primary)] hover:underline transition-colors">View all history</Link>
              </div>
              
              <div className="rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border-2 border-[var(--text-primary)] shadow-[4px_4px_0px_var(--text-primary)] overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-[40px_1fr_60px_60px_80px] items-center gap-4 px-5 py-3 border-b-2 border-[var(--text-primary)] bg-[var(--bg-secondary)]">
                  <div className="w-8 flex-shrink-0" />
                  <div className="text-[9.5px] font-black uppercase tracking-widest text-[var(--text-primary)]">Players</div>
                  <div className="text-[9.5px] font-black uppercase tracking-widest text-[var(--text-primary)] text-center">Result</div>
                  <div className="text-[9.5px] font-black uppercase tracking-widest text-[var(--text-primary)] text-center">Moves</div>
                  <div className="text-[9.5px] font-black uppercase tracking-widest text-[var(--text-primary)] text-right">Date</div>
                </div>
                {/* Game row */}
                <div className="grid grid-cols-[40px_1fr_60px_60px_80px] items-center gap-4 px-5 py-4 border-b border-[var(--text-primary)]/10 last:border-b-0 hover:bg-[var(--bg-secondary)]/20 transition-colors">
                  <div className="w-8 h-8 rounded-sm bg-[var(--bg-secondary)] border-2 border-[var(--text-primary)] flex items-center justify-center text-base flex-shrink-0">♟</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-[2px] bg-white border border-[var(--text-primary)] flex-shrink-0" />
                      <span className="text-[12px] font-bold text-[var(--text-primary)] truncate">{username}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-bold flex-shrink-0">({rating})</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="w-2.5 h-2.5 rounded-[2px] bg-[var(--text-primary)] flex-shrink-0" />
                      <span className="text-[12px] font-bold text-[var(--text-primary)] truncate">polly-BOT</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-bold flex-shrink-0">(199)</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[11px] px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">WIN</span>
                  </div>
                  <div className="text-center">
                    <span className="text-[12px] font-bold font-mono text-[var(--text-secondary)]">54</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-[var(--text-muted)]">May 21</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Widgets (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Daily Puzzle */}
            <div>
              <div className="flex items-center justify-between px-1 mb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">Daily Puzzle</p>
                <span className="text-[9px] font-black uppercase tracking-wider text-[var(--primary)] bg-emerald-50 border border-[var(--primary)]/35 px-2 py-0.5 rounded-sm font-mono">White to move</span>
              </div>
              <div className="rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border-2 border-[var(--text-primary)] shadow-[4px_4px_0px_var(--text-primary)] p-4 flex flex-col gap-4">
                <div className="rounded-sm overflow-hidden border-2 border-[var(--text-primary)] shadow-sm">
                  <MiniBoard pieces={DAILY_B} boardTheme={boardTheme} />
                </div>
                <Link 
                  href="/puzzles" 
                  onClick={tap} 
                  className="btn-primary w-full py-3 text-center transition-all"
                >
                  Solve Today's Puzzle
                </Link>
              </div>
            </div>

            {/* Top Players */}
            <div>
              <div className="flex items-center justify-between px-1 mb-3">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">Top Players</p>
                <Link href="/leaderboard" className="text-[11px] font-black text-[var(--primary)] hover:underline transition-colors">Full board</Link>
              </div>
              
              <div className="rounded-[var(--radius-sm)] bg-[var(--bg-surface)] border-2 border-[var(--text-primary)] shadow-[4px_4px_0px_var(--text-primary)] overflow-hidden flex flex-col divide-y divide-[var(--text-primary)]/10">
                {[
                  { rank:1, name:'GrandmasterAlex', rating:2840, delta:'+12', country:'RUS', rankColor:'bg-amber-400 border-amber-600 text-amber-950' },
                  { rank:2, name:'QueenGambitPro',  rating:2711, delta:'+5',  country:'CHN', rankColor:'bg-slate-300 border-slate-400 text-slate-800' },
                  { rank:3, name:'TacticalNinja',   rating:2654, delta:'-3',  country:'IND', rankColor:'bg-amber-600 border-amber-800 text-white' },
                ].map(p => (
                  <div key={p.rank} className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-[var(--bg-secondary)]/20 transition-colors">
                    <span className={`text-[11px] font-black w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 ${p.rankColor}`}>
                      {p.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black text-[var(--text-muted)] bg-[var(--bg-secondary)] border border-[var(--text-primary)]/15 px-1.5 py-0.5 rounded font-mono tracking-wider">{p.country}</span>
                        <p className="text-[12px] font-bold text-[var(--text-primary)] truncate">{p.name}</p>
                      </div>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] mt-0.5">⚡ {p.rating} ELO</p>
                    </div>
                    <span className={`text-[11px] font-black flex-shrink-0 ${p.delta.startsWith('+') ? 'text-emerald-700' : 'text-red-700'}`}>{p.delta}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="border-t-2 border-[var(--text-primary)]/10 pt-6 pb-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {['Support','About','Privacy','Terms','Developers','© ChessOnline 2026'].map((l,i,arr) => (
            <span key={l} className={`text-[10px] font-bold ${i === arr.length - 1 ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer transition-colors'}`}>{l}</span>
          ))}
        </div>

      </div>

      {/* ── Streak Claim Modal (Luxury Tournament Salon theme) ───────── */}
      <AnimatePresence>
        {showStreakModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay with sleek dark blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStreakModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Popover Card Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="relative w-full max-w-[350px] rounded-[var(--radius-sm)] bg-[var(--bg-elevated)] border-2 border-[var(--text-primary)] outline-1 outline-[var(--text-primary)] outline-offset-4 shadow-[6px_6px_0px_var(--text-primary)] p-6 text-center z-10 overflow-hidden font-montserrat"
            >
              {/* Top ambient highlight */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[var(--primary-start)] via-[var(--accent)] to-[var(--primary-start)]" />

              {/* Close Button */}
              <button
                onClick={() => { tap(); setShowStreakModal(false); }}
                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50 p-1.5 rounded-sm border-2 border-transparent hover:border-[var(--text-primary)] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Animated Flame Icon */}
              <div className="flex justify-center mb-1 mt-2">
                <AnimatedStreakFlame size={90} />
              </div>

              {/* Streak Title */}
              <h3 className="text-xl font-black text-[var(--text-primary)] tracking-tight font-jost mt-2">
                {streakState.currentStreak} Day{streakState.currentStreak === 1 ? '' : 's'} Streak
              </h3>
              <p className="text-[9px] text-[var(--accent)] font-black uppercase tracking-[0.2em] font-jost mt-1">
                Daily Championship Drill
              </p>

              {/* Minimal Stats Row */}
              <div className="flex items-center justify-between my-3 px-4 py-2.5 rounded-sm bg-[var(--bg-secondary)]/50 border-2 border-[var(--text-primary)] text-[11px] font-bold">
                <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
                  <span className="text-sm select-none">🔥</span>
                  <span>Current:</span>
                  <span>{streakState.currentStreak}</span>
                </div>
                <div className="w-[2px] h-3 bg-[var(--text-primary)]/20" />
                <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
                  <span className="text-sm select-none">🏆</span>
                  <span>Record:</span>
                  <span>{streakState.bestStreak}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex flex-col gap-1 mb-4 text-left">
                <div className="flex items-center justify-between text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-black">
                  <span>Weekly progress</span>
                  <span className="text-[var(--primary)] font-black">{completedCount} / 7 days</span>
                </div>
                <div className="w-full h-2.5 rounded-sm border-2 border-[var(--text-primary)] bg-white overflow-hidden p-[1px]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-sm bg-[var(--primary)]"
                  />
                </div>
              </div>

              {/* 7-Day Ribbon Layout */}
              <div className="mb-4">
                <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-wider text-left mb-2 px-0.5 font-jost">
                  Training Calendar
                </p>
                <div className="grid grid-cols-7 gap-1.5">
                  {weeklyStatus.map((day, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-1.5 font-montserrat">
                      <span className={`text-[9px] font-black uppercase ${
                        day.isToday 
                          ? 'text-[var(--accent)] font-black scale-110 drop-shadow-[0_0_6px_rgba(184,144,71,0.25)]' 
                          : 'text-[var(--text-muted)]'
                      }`}>
                        {day.label[0]}
                      </span>

                      {/* Day Pill Render States */}
                      {day.isCompleted ? (
                        /* Completed State - Glowing green disk */
                        <motion.div
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 18 }}
                          className="w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center border-2 border-[var(--text-primary)] shadow-sm"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </motion.div>
                      ) : day.isToday ? (
                        /* Today Active State */
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--accent)] bg-[var(--accent)]/10 flex items-center justify-center relative shadow-[0_0_12px_rgba(184,144,71,0.4)]">
                          <span className="absolute inset-0 rounded-full border border-[var(--accent)] animate-ping opacity-40" />
                          <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                        </div>
                      ) : day.isPast ? (
                        /* Past Uncompleted State */
                        <div className="w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center border-2 border-[var(--text-primary)] shadow-sm">
                          <X className="w-4 h-4 stroke-[3.5] text-white" />
                        </div>
                      ) : (
                        /* Future State */
                        <div className="w-8 h-8 rounded-full border border-[var(--text-primary)]/10 bg-[var(--bg-secondary)]/30 flex items-center justify-center">
                          <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]/20" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5">
                {streakState.lastActiveDate !== new Date().getFullYear() + "-" + String(new Date().getMonth() + 1).padStart(2, "0") + "-" + String(new Date().getDate()).padStart(2, "0") ? (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        tap();
                        const result = claimTodayStreak();
                        if (result.newlyClaimed) {
                          setStreakState({ ...result.data });
                        }
                      }}
                      className="btn-primary w-full py-3 cursor-pointer"
                    >
                      Complete today's training
                    </button>
                    <p className="text-[9.5px] text-[var(--text-muted)] font-bold max-w-[270px] mx-auto leading-normal">
                      Puzzles and matchmaking games secure your streak automatically.
                    </p>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-sm bg-emerald-50 border-2 border-[var(--primary)] flex flex-col items-center gap-0.5 text-center"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-emerald-800 text-xs mb-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <h4 className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Training Secured</h4>
                    <p className="text-[9px] text-emerald-700 font-medium leading-normal mt-0.5 max-w-[280px]">
                      Your daily streak point is secured! Return tomorrow to keep the flame active.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
