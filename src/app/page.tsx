'use client'

import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { Bot, Swords, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [fen, setFen] = useState("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  
  // Single, shared stateful AudioContext to prevent thread exhaustion
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  // Refs to allow the interval loop to access the hot AudioContext state
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Paul Morphy's legendary 1858 Opera Game - a fast, dramatic miniature ending in a brilliant rook mate!
  const operaGameMoves = [
    "e4", "e5", "Nf3", "d6", "d4", "Bg4", "dxe5", "Bxf3", "Qxf3", "dxe5", 
    "Bc4", "Nf6", "Qb3", "Qe7", "Nc3", "c6", "Bg5", "b5", "Nxb5", "cxb5", 
    "Bxb5+", "Nbd7", "O-O-O", "Rd8", "Rxd7", "Rxd7", "Rd1", "Qe6", 
    "Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#"
  ];

  // ── BOARD SYNTHESIZER ENGINE (Stateful Web Audio API) ─────────────────
  
  // Standard wood click/tap for regular moves
  const playChessMoveSound = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.05);
      
      gainNode.gain.setValueAtTime(0.18, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.log("Audio move tap blocked", e);
    }
  };

  // Sharper capture sound with slight friction
  const playChessCaptureSound = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.08);
      
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.log("Audio capture slide blocked", e);
    }
  };

  // Double-tone chime for checks and checkmates
  const playChessCheckSound = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const playTone = (freq: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      };
      
      playTone(450, 0.12);
      playTone(550, 0.12);
    } catch (e) {
      console.log("Audio check sound blocked", e);
    }
  };

  // Initialize and bind active AudioContext on page load
  useEffect(() => {
    setMounted(true);

    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      const ctx = new AudioCtxClass();
      setAudioCtx(ctx);
      audioCtxRef.current = ctx;

      // Click or Hover listener to unlock browser audio autoplay blocks
      const unlockAudio = () => {
        if (ctx.state === "suspended") {
          ctx.resume().then(() => {
            console.log("Web Audio Engine engaged successfully.");
          });
        }
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("mouseenter", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
      };

      window.addEventListener("click", unlockAudio);
      window.addEventListener("mouseenter", unlockAudio);
      window.addEventListener("touchstart", unlockAudio);
    }

    const activeGame = new Chess();
    let index = 0;

    const interval = setInterval(() => {
      if (index >= operaGameMoves.length) {
        activeGame.reset();
        index = 0;
        playChessMoveSound();
      } else {
        try {
          const moveStr = operaGameMoves[index];
          activeGame.move(moveStr);
          index++;
          
          if (moveStr.includes("#") || moveStr.includes("+")) {
            playChessCheckSound();
          } else if (moveStr.includes("x")) {
            playChessCaptureSound();
          } else {
            playChessMoveSound();
          }
        } catch {
          activeGame.reset();
          index = 0;
          playChessMoveSound();
        }
      }
      setFen(activeGame.fen());
    }, 2200); // Grandmaster pacing

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] lg:h-full lg:min-h-screen flex items-center justify-center overflow-hidden py-4 lg:py-0 bg-[#04060A]">
      
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
      <div className="relative z-10 w-full max-w-[1300px] mx-auto px-4 sm:px-12 flex flex-col lg:flex-row items-center justify-evenly lg:justify-between gap-4 lg:gap-20 h-full">
        
        {/* ── LEFT: DYNAMIC AUTOPLAYING CHESSBOARD ─────────────────────── */}
        <div className="w-[85vw] sm:w-[75vw] lg:w-full max-w-[320px] lg:max-w-[560px] aspect-square flex justify-center flex-shrink-0">
          <div className="card-elevated !p-1.5 sm:!p-5 w-full h-full shadow-2xl relative border-white/5 bg-[#090D16]/65 backdrop-blur-md">
            
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
        <div className="w-[85vw] sm:w-[75vw] lg:w-full max-w-[320px] lg:max-w-[480px] bg-[#090D16]/95 border border-white/[0.05] rounded-3xl p-4 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.85)] flex flex-col items-center lg:items-start gap-4 lg:gap-6.5 relative overflow-hidden backdrop-blur-xl flex-shrink-0">
          
          {/* Subtle top edge indigo light leak for premium touch */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0" />

          {/* Header Title */}
          <div className="flex flex-col gap-2 lg:gap-3 text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-medium font-jost leading-[1.08] tracking-tight text-[var(--text-primary)] text-center lg:text-left">
              Play Chess Online<br />
              in <span className="text-[var(--primary)] font-extrabold bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Absolute Luxury.</span>
            </h1>

            <p className="hidden lg:block text-[12.5px] text-[var(--text-secondary)] leading-relaxed font-light mt-1">
              Step into an elite digital chess salon. Optimized for strategic focus, ChessOnline hosts ELO matchmaking, advanced Stockfish sandbox play, and grandmaster analytical tools inside a pristine, distraction-free environment.
            </p>
          </div>

          {/* Premium Play CTAs */}
          <div className="flex flex-col gap-3.5 w-full">
            
            {/* Main Action Get Started Button (Original premium blue steel theme) */}
            <Link 
              href="/play"
              className="group w-full py-3 lg:py-4 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 hover:scale-[1.01] transition-all shadow-[0_6px_28px_rgba(37,99,235,0.35)] border border-blue-500/30 cursor-pointer flex items-center justify-center gap-3 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <Swords className="w-4.5 h-4.5 text-white animate-pulse" />
              <span className="text-sm font-bold text-white tracking-wider font-jost">Get Started</span>
              <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            {/* Play Computer Translucent Card */}
            <Link 
              href="/play/bots"
              className="group w-full py-2.5 lg:py-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] hover:scale-[1.01] transition-all border border-white/5 hover:border-[var(--primary)]/20 cursor-pointer flex items-center justify-center gap-2.5 text-xs font-semibold text-[var(--text-primary)] shadow-sm"
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
