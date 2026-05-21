'use client'

import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { Bot, Swords, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

  // Paul Morphy's legendary 1858 Opera Game - a fast, dramatic miniature ending in a brilliant rook mate!
  const operaGameMoves = [
    "e4", "e5", "Nf3", "d6", "d4", "Bg4", "dxe5", "Bxf3", "Qxf3", "dxe5", 
    "Bc4", "Nf6", "Qb3", "Qe7", "Nc3", "c6", "Bg5", "b5", "Nxb5", "cxb5", 
    "Bxb5+", "Nbd7", "O-O-O", "Rd8", "Rxd7", "Rxd7", "Rd1", "Qe6", 
    "Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#"
  ];

  useEffect(() => {
    setMounted(true);

    const activeGame = new Chess();
    let index = 0;

    const interval = setInterval(() => {
      if (index >= operaGameMoves.length) {
        activeGame.reset();
        index = 0;
      } else {
        try {
          activeGame.move(operaGameMoves[index]);
          index++;
        } catch {
          activeGame.reset();
          index = 0;
        }
      }
      setFen(activeGame.fen());
    }, 2200); // Smooth grandmaster pacing

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full min-h-screen flex items-center justify-center overflow-x-hidden overflow-y-auto py-10 lg:py-0 bg-[#04060A]">
      
      {/* ── SUBTLY VISIBLE HERO DARK BACKGROUND IMAGE ─────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#04060A]">
        {/* Cinematic dark image at low opacity so text readability remains 100% */}
        <img 
          src="/images/hero-dark.png" 
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-[0.20] mix-blend-screen"
        />
        
        {/* Soft, deep-blue and indigo ambient spotlights to blend image boundaries */}
        <div className="absolute top-[15%] left-[15%] w-[600px] h-[600px] rounded-full bg-blue-600/[0.04] blur-[140px] animate-pulse" />
        <div className="absolute bottom-[15%] right-[15%] w-[600px] h-[600px] rounded-full bg-indigo-600/[0.04] blur-[140px]" />
      </div>

      {/* Side-by-Side Flex Layout Container - responsive spacing */}
      <div className="relative z-10 w-full max-w-[1300px] mx-auto px-4 sm:px-12 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-12 lg:gap-20">
        
        {/* ── LEFT: DYNAMIC AUTOPLAYING CHESSBOARD ─────────────────────── */}
        <div className="w-[90vw] sm:w-[80vw] lg:w-full max-w-[500px] lg:max-w-[560px] aspect-square flex justify-center flex-shrink-0">
          <div className="card-elevated !p-3 sm:!p-5 w-full h-full shadow-2xl relative border-white/5 bg-[#090D16]/65 backdrop-blur-md">
            
            {/* Ambient behind-board custom radial glow */}
            <div className="absolute inset-0 bg-[var(--primary)]/[0.03] blur-3xl rounded-3xl pointer-events-none -z-10 animate-pulse" />

            <div className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-white/5">
              {mounted && (
                <Chessboard
                  options={{
                    position: fen,
                    darkSquareStyle: { backgroundColor: "#2563EB" }, // Premium sapphire brand blue
                    lightSquareStyle: { backgroundColor: "#EFF6FF" }, // Premium ivory light squares
                    allowDragging: false,
                    animationDurationInMs: 250,
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: LUXURY PLAY CONSOLE CARD ───────────────────────────── */}
        <div className="w-full max-w-[480px] bg-[#090D16]/95 border border-white/[0.05] rounded-3xl p-6 sm:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.85)] flex flex-col gap-6.5 relative overflow-hidden backdrop-blur-xl flex-shrink-0">
          
          {/* Subtle top edge indigo light leak for premium touch */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0" />

          {/* Header Title */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold tracking-[0.25em] text-[var(--primary)] uppercase flex items-center gap-2 bg-[var(--primary)]/10 px-3 py-1 rounded-full border border-[var(--primary)]/10">
                <Sparkles className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" /> Distraction-Free Arena
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[40px] font-medium font-jost leading-[1.08] tracking-tight text-[var(--text-primary)]">
              Play Chess Online<br />
              in <span className="text-[var(--primary)] font-extrabold bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Absolute Luxury.</span>
            </h1>

            <p className="text-[12.5px] text-[var(--text-secondary)] leading-relaxed font-light mt-1">
              Step into an elite digital chess salon. Optimized for strategic focus, ChessOnline hosts ELO matchmaking, advanced Stockfish sandbox play, and grandmaster analytical tools inside a pristine, distraction-free environment.
            </p>
          </div>

          {/* Premium Play CTAs */}
          <div className="flex flex-col gap-3.5">
            
            {/* Main Action Blue Steel Button */}
            <Link 
              href="/play"
              className="group w-full py-4 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 hover:scale-[1.01] transition-all shadow-[0_6px_28px_rgba(37,99,235,0.35)] border border-blue-500/30 cursor-pointer flex items-center justify-center gap-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <Swords className="w-4.5 h-4.5 text-white animate-pulse" />
              <span className="text-sm font-bold text-white tracking-wider font-jost">Enter Play Arena</span>
              <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Play Computer Translucent Card */}
            <Link 
              href="/play/bots"
              className="group w-full py-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] hover:scale-[1.01] transition-all border border-white/5 hover:border-[var(--primary)]/20 cursor-pointer flex items-center justify-center gap-2.5 text-xs font-semibold text-[var(--text-primary)] shadow-sm"
            >
              <Bot className="w-4 h-4 text-[var(--primary)]" />
              <span>Offline Practice vs Bots</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
