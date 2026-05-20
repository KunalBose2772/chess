"use client";

import { Chessboard } from "react-chessboard";
import { Chess, Move, Square } from "chess.js";
import { useState, useEffect, useCallback, useRef } from "react";
import { Monitor, User, RotateCcw, Zap } from "lucide-react";

export default function InteractiveChessBoard() {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [status, setStatus] = useState("White to move");
  const [playVsComputer, setPlayVsComputer] = useState(false);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
  const movesRef = useRef<HTMLDivElement>(null);

  const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    try {
      const result = game.move(move);
      if (result) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setMoveHistory(prev => [...prev, result.san]);
        setTimeout(() => {
          movesRef.current?.scrollTo({ top: movesRef.current.scrollHeight, behavior: 'smooth' });
        }, 50);

        if (newGame.isGameOver()) {
          if (newGame.isCheckmate()) {
            setStatus(`Checkmate! ${newGame.turn() === "w" ? "Black" : "White"} wins.`);
          } else if (newGame.isDraw()) {
            setStatus("Draw!");
          } else {
            setStatus("Game over");
          }
        } else {
          setStatus(`${newGame.turn() === "w" ? "White" : "Black"} to move${newGame.isCheck() ? " · Check!" : ""}`);
        }
        return true;
      }
    } catch { return false; }
    return false;
  }, [game]);

  // Computer move
  useEffect(() => {
    if (playVsComputer && game.turn() === "b" && !game.isGameOver()) {
      setIsComputerThinking(true);
      fetch("/api/computer-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen: game.fen(), level: 5 }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.bestMove) {
            makeMove({
              from: data.bestMove.substring(0, 2),
              to: data.bestMove.substring(2, 4),
              promotion: data.bestMove.length > 4 ? data.bestMove.substring(4, 5) : "q",
            });
          }
        })
        .catch(console.error)
        .finally(() => setIsComputerThinking(false));
    }
  }, [game, playVsComputer, makeMove]);

  function getMoveOptions(square: Square) {
    const moves = game.moves({ square, verbose: true }) as Move[];
    if (moves.length === 0) { setOptionSquares({}); return false; }
    const newSquares: Record<string, React.CSSProperties> = {};
    moves.forEach((move) => {
      const isCapture = move.flags.includes("c") || move.flags.includes("e");
      newSquares[move.to] = {
        background: isCapture
          ? "rgba(239, 68, 68, 0.75)"
          : "radial-gradient(circle, rgba(37,99,235,0.5) 25%, transparent 30%)",
        borderRadius: isCapture ? "10px" : "50%",
      };
    });
    newSquares[square] = { background: "rgba(37,99,235,0.25)" };
    setOptionSquares(newSquares);
    return true;
  }

  function handleSquareClick({ square }: { piece: unknown; square: string }) {
    const sq = square as Square;
    if (playVsComputer && game.turn() === "b") return;
    if (!moveFrom) setOptionSquares({});

    if (moveFrom) {
      const moves = game.moves({ square: moveFrom, verbose: true }) as Move[];
      const foundMove = moves.find(m => m.to === sq);
      if (foundMove) {
        makeMove({ from: moveFrom, to: sq, promotion: "q" });
        setMoveFrom(null);
        setOptionSquares({});
        return;
      }
    }

    const piece = game.get(sq);
    if (piece && piece.color === game.turn()) {
      setMoveFrom(sq);
      getMoveOptions(sq);
    } else {
      setMoveFrom(null);
      setOptionSquares({});
    }
  }

  const onDrop = (sourceSquare: string, targetSquare: string | null, piece: { pieceType: string }) => {
    if (playVsComputer && game.turn() === "b") return false;
    if (!targetSquare) return false;
    const success = makeMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: piece.pieceType ? piece.pieceType[1].toLowerCase() : "q",
    });
    if (success) { setMoveFrom(null); setOptionSquares({}); }
    return Boolean(success);
  };

  const resetGame = () => {
    setGame(new Chess());
    setMoveHistory([]);
    setStatus("White to move");
    setMoveFrom(null);
    setOptionSquares({});
  };

  // Move pairs
  const movePairs: string[][] = moveHistory.reduce<string[][]>((acc, san, i) => {
    if (i % 2 === 0) acc.push([san]);
    else acc[acc.length - 1].push(san);
    return acc;
  }, []);

  const isGameOver = game.isGameOver();
  const turnColor = game.turn() === "w" ? "White" : "Black";

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">

      {/* ── BOARD COLUMN ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-2 p-3 sm:p-4 min-h-0 overflow-hidden">

        {/* Opponent label */}
        <div className="card-surface !py-2.5 !px-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-800 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-[var(--text-primary)] flex-shrink-0">
            ♟
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {playVsComputer ? "Stockfish Engine" : "Player 2 (Black)"}
            </p>
            {isComputerThinking && (
              <p className="text-xs text-[var(--primary)] animate-pulse">Thinking…</p>
            )}
          </div>
          {!isGameOver && (
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${
              game.turn() === 'b'
                ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
            }`}>
              {game.turn() === 'b' ? '⏳ To move' : ''}
            </span>
          )}
        </div>

        {/* Board — height-first: never taller than available space */}
        <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden p-1">
          <div
            className="card-elevated !p-2 sm:!p-3"
            style={{ height: '100%', aspectRatio: '1 / 1', maxWidth: '100%' }}
          >
            <div className="w-full h-full rounded-xl overflow-hidden">
              <Chessboard
                options={{
                  position: game.fen(),
                  onPieceDrop: ({ sourceSquare, targetSquare, piece }) =>
                    onDrop(sourceSquare, targetSquare, piece),
                  onSquareClick: handleSquareClick as never,
                  squareStyles: optionSquares,
                  darkSquareStyle: { backgroundColor: "#2563EB" },
                  lightSquareStyle: { backgroundColor: "#EFF6FF" },
                  animationDurationInMs: 150,
                }}
              />
            </div>
          </div>
        </div>

        {/* My label */}
        <div className="card-surface !py-2.5 !px-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary)] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            ♙
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              {playVsComputer ? "You (White)" : "Player 1 (White)"}
            </p>
          </div>
          {!isGameOver && (
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${
              game.turn() === 'w'
                ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
            }`}>
              {game.turn() === 'w' ? '✓ Your turn' : ''}
            </span>
          )}
        </div>
      </div>

      {/* ── SIDE PANEL ───────────────────────────────────────────────────── */}
      <div className="w-full lg:w-72 xl:w-80 flex flex-col border-t lg:border-t-0 lg:border-l border-[var(--border-primary)] min-h-0">

        {/* Mode selector */}
        <div className="p-4 border-b border-[var(--border-primary)] flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="section-label">Mode</span>
            <button
              onClick={() => { setPlayVsComputer(!playVsComputer); resetGame(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                playVsComputer
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]'
              }`}
            >
              {playVsComputer ? <Monitor className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              {playVsComputer ? 'vs Computer' : 'Pass & Play'}
            </button>
          </div>

          {/* Status */}
          <div className={`rounded-xl px-3 py-2.5 text-xs font-semibold flex items-center justify-between ${
            isGameOver
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/25'
              : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
          }`}>
            <span>{status}</span>
            {!isGameOver && <Zap className="w-3 h-3 text-[var(--primary)]" />}
          </div>
        </div>

        {/* Move history */}
        <div ref={movesRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-1 min-h-0">
          {movePairs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-[var(--text-muted)] text-center">No moves yet.<br />Make a move to start.</p>
            </div>
          ) : (
            movePairs.map((pair, i) => (
              <div key={i} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                <span className="text-[var(--text-muted)] w-6 flex-shrink-0 tabular-nums">{i + 1}.</span>
                <span className="flex-1 font-mono font-semibold text-[var(--text-primary)]">{pair[0]}</span>
                <span className="flex-1 font-mono text-[var(--text-secondary)]">{pair[1] ?? ''}</span>
              </div>
            ))
          )}
        </div>

        {/* Restart */}
        <div className="p-3 border-t border-[var(--border-primary)] flex-shrink-0">
          <button
            onClick={resetGame}
            className="btn-secondary w-full gap-2 !justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart Game
          </button>
        </div>
      </div>
    </div>
  );
}
