"use client";

import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useState, useEffect } from "react";
import { useBoardTheme } from "./BoardThemeProvider";

// Note: This component is available but not currently used on the home page.
// The home page (page.tsx) manages its own board + clock widget directly.
export default function HeroChessBoard() {
  const [game, setGame] = useState(new Chess());
  const { boardTheme } = useBoardTheme();

  useEffect(() => {
    const makeRandomMove = () => {
      const possibleMoves = game.moves();
      if (game.isGameOver() || game.isDraw() || possibleMoves.length === 0) {
        setGame(new Chess());
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

  return (
    <div className="relative w-full max-w-[460px]">
      {/* Floating shadow reflection */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-11/12 h-8 bg-black/20 blur-2xl rounded-full pointer-events-none scale-y-50 z-0" />

      <div className="relative p-5 border-2 border-[var(--text-primary)] rounded-[var(--radius-md)] w-full shadow-[6px_6px_0px_var(--text-primary)] z-10 flex flex-col gap-3.5 bg-[var(--bg-secondary)] font-montserrat">
        {/* Top player */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <img
              src="https://i.pravatar.cc/100?img=33"
              alt="Daniel Kovac"
              className="w-8 h-8 rounded-full border border-[var(--border-primary)] object-cover"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[var(--text-primary)]">Daniel Kovac</span>
                <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-[var(--primary)]/15 text-[var(--primary)]">GM</span>
              </div>
              <span className="text-[9px] text-[var(--text-muted)] font-light">🇭🇷 2498</span>
            </div>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-primary)] font-mono text-[10px] text-[var(--text-primary)] tracking-wider">
            04:32
          </div>
        </div>

        {/* Chessboard */}
        <div className="relative rounded-sm overflow-hidden w-full aspect-square border-2 border-[var(--text-primary)]">
          <Chessboard
            options={{
              position: game.fen(),
              darkSquareStyle: { backgroundColor: boardTheme.dark },
              lightSquareStyle: { backgroundColor: boardTheme.light },
              animationDurationInMs: 300,
              allowDragging: false,
              showNotation: false,
            }}
          />
        </div>

        {/* Bottom player */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <img
              src="https://i.pravatar.cc/100?img=68"
              alt="Arjun Mehta"
              className="w-8 h-8 rounded-full border border-[var(--border-primary)] object-cover"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-[var(--text-primary)]">Arjun Mehta</span>
                <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-[var(--primary)]/15 text-[var(--primary)]">GM</span>
              </div>
              <span className="text-[9px] text-[var(--text-muted)] font-light">🇮🇳 2150</span>
            </div>
          </div>
          <div className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border-2 border-[var(--text-primary)] border-b-[var(--primary)] font-mono text-[10px] text-[var(--text-primary)] tracking-wider">
            05:18
          </div>
        </div>
      </div>
    </div>
  );
}
