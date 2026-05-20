"use client";

import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function HeroChessBoard() {
  const [game, setGame] = useState(new Chess());

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

    const interval = setInterval(makeRandomMove, 2000);
    return () => clearInterval(interval);
  }, [game]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative p-4 glass-panel rounded-2xl shadow-2xl shadow-indigo-500/20"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl pointer-events-none" />
      <div className="relative rounded-xl overflow-hidden shadow-inner w-full max-w-[400px] md:max-w-[500px]">
        <Chessboard 
          options={{
            position: game.fen(),
            darkSquareStyle: { backgroundColor: "#4f46e5" },
            lightSquareStyle: { backgroundColor: "#e0e7ff" },
            animationDurationInMs: 300,
            allowDragging: false
          }}
        />
      </div>
      <div className="absolute -bottom-6 -right-6 bg-slate-900 glass-panel px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4">
        <div className="flex -space-x-3">
          {[1,2,3].map(i => (
            <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-500 flex items-center justify-center text-xs font-bold shadow-lg">
              {i}
            </div>
          ))}
        </div>
        <div className="text-sm">
          <p className="font-bold text-white">100k+ Players</p>
          <p className="text-indigo-300">Online right now</p>
        </div>
      </div>
    </motion.div>
  );
}
