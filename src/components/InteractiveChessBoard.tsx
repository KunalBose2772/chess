"use client";

import { Chessboard } from "react-chessboard";
import { Chess, Move, Square } from "chess.js";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Monitor, User } from "lucide-react";

export default function InteractiveChessBoard() {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [status, setStatus] = useState("White to move");
  
  // New state for features
  const [playVsComputer, setPlayVsComputer] = useState(false);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});

  const makeMove = useCallback((move: any) => {
    try {
      const result = game.move(move);
      if (result) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setMoveHistory(prev => [...prev, result.san]);
        
        if (newGame.isGameOver()) {
          if (newGame.isCheckmate()) {
            setStatus(`Checkmate! ${newGame.turn() === "w" ? "Black" : "White"} wins.`);
          } else if (newGame.isDraw()) {
            setStatus("Draw!");
          } else {
            setStatus("Game Over");
          }
        } else {
          setStatus(`${newGame.turn() === "w" ? "White" : "Black"} to move${newGame.isCheck() ? " (Check)" : ""}`);
        }
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [game]);

  // Handle Computer Move
  useEffect(() => {
    if (playVsComputer && game.turn() === "b" && !game.isGameOver()) {
      setIsComputerThinking(true);
      fetch("/api/computer-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen: game.fen(), level: 5 })
      })
      .then(res => res.json())
      .then(data => {
        if (data.bestMove) {
          const from = data.bestMove.substring(0, 2);
          const to = data.bestMove.substring(2, 4);
          const promotion = data.bestMove.length > 4 ? data.bestMove.substring(4, 5) : "q";
          makeMove({ from, to, promotion });
        }
      })
      .catch(console.error)
      .finally(() => setIsComputerThinking(false));
    }
  }, [game, playVsComputer, makeMove]);

  function getMoveOptions(square: Square) {
    const moves = game.moves({ square, verbose: true }) as Move[];
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: Record<string, React.CSSProperties> = {};
    moves.forEach((move) => {
      // Highlight red if it's a capture (tackle)
      const isCapture = move.flags.includes("c") || move.flags.includes("e");
      
      newSquares[move.to] = {
        background: isCapture
          ? "rgba(239, 68, 68, 0.8)" // Bright Red for capture
          : "radial-gradient(circle, rgba(0, 0, 0, 0.3) 25%, transparent 30%)", // Dot for normal move
        borderRadius: isCapture ? "12px" : "50%",
      };
    });
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)", // Yellow highlight for selected piece
    };
    setOptionSquares(newSquares);
    return true;
  }

  function handleSquareClick({ square }: { piece: any, square: string }) {
    const sq = square as Square;
    // If playing against computer and it's computer's turn, ignore clicks
    if (playVsComputer && game.turn() === "b") return;

    // Reset options when clicking a new piece initially
    if (!moveFrom) {
      setOptionSquares({});
    }

    // If we click a valid destination square from our previous selection
    if (moveFrom) {
      const moves = game.moves({ square: moveFrom, verbose: true }) as Move[];
      const foundMove = moves.find(m => m.to === sq);
      
      if (foundMove) {
        // Make the move
        makeMove({
          from: moveFrom,
          to: sq,
          promotion: "q", // always promote to queen for simplicity here
        });
        setMoveFrom(null);
        setOptionSquares({});
        return;
      }
    }

    // Try to select a piece
    const piece = game.get(sq);
    if (piece && piece.color === game.turn()) {
      setMoveFrom(sq);
      getMoveOptions(sq);
    } else {
      setMoveFrom(null);
      setOptionSquares({});
    }
  }

  const onDrop = (sourceSquare: string, targetSquare: string | null, piece: any) => {
    if (playVsComputer && game.turn() === "b") return false;
    if (!targetSquare) return false;
    
    const success = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece.pieceType ? piece.pieceType[1].toLowerCase() : "q",
    });

    if (success) {
      setMoveFrom(null);
      setOptionSquares({});
    }
    return success;
  };

  const resetGame = () => {
    setGame(new Chess());
    setMoveHistory([]);
    setStatus("White to move");
    setMoveFrom(null);
    setOptionSquares({});
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 w-full relative p-4 glass-panel rounded-2xl shadow-2xl shadow-indigo-500/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl pointer-events-none" />
        <div className="relative rounded-xl overflow-hidden shadow-inner w-full">
          <Chessboard 
            options={{
              position: game.fen(),
              onPieceDrop: ({ sourceSquare, targetSquare, piece }) => onDrop(sourceSquare, targetSquare, piece),
              onSquareClick: handleSquareClick as any,
              squareStyles: optionSquares,
              darkSquareStyle: { backgroundColor: "#4f46e5" },
              lightSquareStyle: { backgroundColor: "#e0e7ff" },
              animationDurationInMs: 200,
            }}
          />
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full lg:w-80 flex flex-col gap-4"
      >
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold font-outfit text-white">Mode</h2>
            <button
              onClick={() => {
                setPlayVsComputer(!playVsComputer);
                resetGame();
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                playVsComputer 
                  ? 'bg-indigo-500 text-white' 
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              {playVsComputer ? <Monitor className="w-4 h-4" /> : <User className="w-4 h-4" />}
              {playVsComputer ? 'vs Computer' : 'Pass & Play'}
            </button>
          </div>
          <h2 className="text-xl font-bold font-outfit text-white mb-2">Game Status</h2>
          <div className="px-4 py-3 bg-slate-900/50 rounded-xl border border-white/10 text-indigo-300 font-medium flex items-center justify-between">
            {status}
            {isComputerThinking && <span className="text-xs text-indigo-400 animate-pulse font-bold">Thinking...</span>}
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex-1 min-h-[300px] flex flex-col">
          <h2 className="text-xl font-bold font-outfit text-white mb-4">Move History</h2>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
            {moveHistory.length === 0 ? (
              <p className="text-slate-500 text-sm">No moves yet. Make a move to start.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {moveHistory.reduce<string[][]>((result, value, index, array) => {
                  if (index % 2 === 0) result.push(array.slice(index, index + 2));
                  return result;
                }, []).map((pair, i) => (
                  <div key={i} className="col-span-2 flex items-center bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-slate-500 w-8">{i + 1}.</span>
                    <span className="flex-1 text-white font-medium">{pair[0]}</span>
                    <span className="flex-1 text-white font-medium">{pair[1] || ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button 
            onClick={resetGame}
            className="mt-6 w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors border border-white/10"
          >
            Restart Game
          </button>
        </div>
      </motion.div>
    </div>
  );
}
