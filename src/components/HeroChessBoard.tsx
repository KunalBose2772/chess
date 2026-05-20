"use client";

import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "./ThemeProvider";

export default function HeroChessBoard() {
  const [game, setGame] = useState(new Chess());
  const { theme } = useTheme();

  // Make random moves to simulate an active game
  useEffect(() => {
    const makeRandomMove = () => {
      const possibleMoves = game.moves();
      if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) {
        setGame(new Chess()); // reset if game over
        return;
      }
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      const newGame = new Chess(game.fen());
      newGame.move(possibleMoves[randomIndex]);
      setGame(newGame);
    };

    const interval = setInterval(makeRandomMove, 2500);
    return () => clearInterval(interval);
  }, [game]);

  // Luxury Board Colors:
  // Dark: Deep charcoal steel blue `#2a3240` / `#7b8c9d`
  // Light: Pristine Royal Blue & Slate Ivory `#2563EB` / `#F8FAFC`
  const lightSquareColor = theme === 'dark' ? '#7b8c9d' : '#F8FAFC';
  const darkSquareColor = theme === 'dark' ? '#2a3240' : '#2563EB';

  return (
    <div className="relative w-full max-w-[460px] hero-board-perspective">
      {/* Subtle glowing Knight watermark behind the board */}
      <div className="absolute -top-12 -left-12 w-64 h-64 opacity-[0.02] dark:opacity-[0.03] pointer-events-none select-none z-0 text-blue-500 dark:text-blue-400 rotate-6">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M19 22H5V20H19V22M17 12H13.6C12.5 12 11.5 11.5 10.9 10.7L9 8C8.5 7.2 8.3 6.3 8.3 5.4C8.3 4.2 8.9 3 9.9 2.3C10.7 1.7 11.7 1.5 12.7 1.7C14.7 2.1 16.1 3.9 16.1 6V8.9C16.8 9.3 17.5 10.1 17.8 11L18.7 10.7C19.1 10.6 19.5 10.8 19.6 11.2L20.6 14.2C20.7 14.6 20.5 15 20.1 15.1L19.2 15.4C19.2 15.6 19.1 15.8 19.1 16C19.1 16.8 18.8 17.6 18.2 18.2C17.6 18.8 16.8 19.1 16 19.1H14C12.9 19.1 11.9 18.6 11.3 17.8L9.5 15.3C8.9 14.5 8.7 13.6 8.7 12.7V11H17V12M12 6.5C12 5.7 11.3 5 10.5 5C9.7 5 9 5.7 9 6.5C9 7.3 9.7 8 10.5 8C11.3 8 12 7.3 12 6.5Z"/>
        </svg>
      </div>

      {/* Floating shadow reflection */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-11/12 h-8 bg-black/15 dark:bg-black/45 blur-2xl rounded-full pointer-events-none scale-y-50 z-0"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative p-5 backdrop-blur-[20px] dark:backdrop-blur-[20px] border border-[var(--border-primary)] dark:border-white/5 rounded-[36px] w-full shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:shadow-[0_40px_100px_rgba(0,0,0,0.45)] z-10 flex flex-col gap-3.5 font-montserrat"
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.45)'
        }}
      >
        {/* Top Header: Daniel Kovac GM */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <img 
              src="https://i.pravatar.cc/100?img=33" 
              alt="Daniel Kovac" 
              className="w-8 h-8 rounded-full border border-white/10 object-cover" 
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[var(--text-primary)]">Daniel Kovac</span>
                <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-blue-500/20 text-blue-500 dark:text-blue-400">GM</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-[var(--text-muted)] font-light">🇭🇷 2498</span>
              </div>
            </div>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-black/25 border border-slate-200/50 dark:border-white/5 font-mono text-[10px] text-[var(--text-primary)] tracking-wider">
            04:32
          </div>
        </div>

        {/* The Chessboard Grid with strictly forced aspect-square */}
        <div className="relative rounded-xl overflow-hidden w-full aspect-square border border-slate-100 dark:border-white/5 shadow-2xl">
          <Chessboard 
            options={{
              position: game.fen(),
              darkSquareStyle: { backgroundColor: darkSquareColor },
              lightSquareStyle: { backgroundColor: lightSquareColor },
              animationDurationInMs: 300,
              allowDragging: false
            }}
          />
        </div>

        {/* Bottom Footer: Arjun Mehta GM */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <img 
              src="https://i.pravatar.cc/100?img=68" 
              alt="Arjun Mehta" 
              className="w-8 h-8 rounded-full border border-white/10 object-cover" 
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[var(--text-primary)]">Arjun Mehta</span>
                <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-blue-500/20 text-blue-500 dark:text-blue-400">GM</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[9px] text-[var(--text-muted)] font-light">🇮🇳 2150</span>
              </div>
            </div>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-black/25 border border-slate-200/50 dark:border-white/5 font-mono text-[10px] text-[var(--text-primary)] tracking-wider border-b-2 border-b-blue-500">
            05:18
          </div>
        </div>

      </motion.div>
    </div>
  );
}
