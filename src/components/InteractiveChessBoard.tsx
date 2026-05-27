"use client";

import { Chessboard } from "react-chessboard";
import { Chess, Move, Square } from "chess.js";
import { useState, useEffect, useCallback, useRef } from "react";
import { Monitor, User, RotateCcw, Zap, Cpu } from "lucide-react";
import { useBoardTheme } from "@/components/BoardThemeProvider";
import { claimTodayStreak } from "@/lib/streak";

export default function InteractiveChessBoard() {
  const { boardTheme } = useBoardTheme();
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [status, setStatus] = useState("White to move");
  const [playVsComputer, setPlayVsComputer] = useState(false);
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
  const movesRef = useRef<HTMLDivElement>(null);

  // Sound Engine
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      const ctx = new AudioCtxClass();
      setAudioCtx(ctx);
      audioCtxRef.current = ctx;
    }
  }, []);

  const playSound = (freq: number, dur: number, type: OscillatorType = "sine") => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {}
  };

  const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    try {
      const isCapture = game.get(move.to as Square) !== null;
      const result = game.move(move);
      if (result) {
        claimTodayStreak(); // Secure streak point on active gameplay!
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setMoveHistory(prev => [...prev, result.san]);

        if (newGame.isCheck() || newGame.isGameOver()) {
          playSound(440, 0.2);
        } else if (isCapture) {
          playSound(280, 0.15, "triangle");
        } else {
          playSound(320, 0.1);
        }

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
    playSound(320, 0.1);
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

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden bg-salon font-montserrat">

      {/* ── BOARD COLUMN ── */}
      <div className="flex-1 h-full flex flex-col gap-3 p-4 sm:p-6 min-h-0 overflow-hidden items-center justify-center">

        {/* Opponent Label */}
        <div className="w-full max-w-[540px] flex items-center justify-between p-2.5 rounded-sm border-2 border-[var(--text-primary)] bg-white shadow-[2px_2px_0px_var(--text-primary)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[var(--bg-secondary)] border-2 border-[var(--text-primary)] flex items-center justify-center text-sm font-black shadow-sm">
              ♟
            </div>
            <div>
              <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight">
                {playVsComputer ? "Stockfish Engine" : "Player 2 (Black)"}
              </p>
              {isComputerThinking && (
                <p className="text-[10px] text-[var(--primary)] font-bold animate-pulse">Thinking…</p>
              )}
            </div>
          </div>
          {!isGameOver && game.turn() === 'b' && (
            <span className="text-[9px] bg-[var(--primary)] border-2 border-[var(--text-primary)] text-white font-bold px-2 py-0.5 rounded-sm animate-pulse uppercase tracking-wider">
              Their Turn
            </span>
          )}
        </div>

        {/* Board Aspect-Ratio Restricting Wrapper */}
        <div className="w-full max-w-[540px] aspect-square flex justify-center items-center">
          <div className="w-full h-full bg-[var(--bg-elevated)] border-2 border-[var(--text-primary)] outline-1 outline-[var(--text-primary)] outline-offset-4 shadow-[6px_6px_0px_var(--text-primary)] rounded-sm p-4 sm:p-5 relative">
            <div className="w-full h-full rounded-sm overflow-hidden border-2 border-[var(--text-primary)] bg-white">
              <Chessboard
                options={{
                  position: game.fen(),
                  onPieceDrop: ({ sourceSquare, targetSquare, piece }) =>
                    onDrop(sourceSquare, targetSquare, piece),
                  onSquareClick: handleSquareClick as never,
                  squareStyles: optionSquares,
                  darkSquareStyle: { backgroundColor: boardTheme.dark },
                  lightSquareStyle: { backgroundColor: boardTheme.light },
                  animationDurationInMs: 150,
                  allowDragging: !isGameOver && game.turn() === "w",
                }}
              />
            </div>
          </div>
        </div>

        {/* My Label */}
        <div className="w-full max-w-[540px] flex items-center justify-between p-2.5 rounded-sm border-2 border-[var(--text-primary)] bg-white shadow-[2px_2px_0px_var(--text-primary)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[var(--primary)] border-2 border-[var(--text-primary)] flex items-center justify-center text-xs font-bold text-white shadow-sm">
              ♙
            </div>
            <div>
              <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight">
                {playVsComputer ? "You (White)" : "Player 1 (White)"}
              </p>
            </div>
          </div>
          {!isGameOver && game.turn() === 'w' && (
            <span className="text-[9px] bg-emerald-50 border-2 border-emerald-800 text-emerald-800 font-bold px-2 py-0.5 rounded-sm animate-pulse uppercase tracking-wider">
              Your Turn
            </span>
          )}
        </div>
      </div>

      {/* ── SIDE PANEL ── */}
      <div className="w-full lg:w-72 xl:w-80 flex flex-col border-t lg:border-t-0 lg:border-l-2 border-[var(--text-primary)] min-h-0 bg-[var(--bg-elevated)] flex-shrink-0">

        {/* Mode Selector */}
        <div className="p-4 border-b-2 border-[var(--text-primary)] flex-shrink-0 bg-[var(--bg-secondary)]/25 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider font-mono">Game Mode</span>
            <button
              onClick={() => { playSound(320, 0.1); setPlayVsComputer(!playVsComputer); resetGame(); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border-2 border-[var(--text-primary)] text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-[2px_2px_0px_var(--text-primary)] hover:-translate-y-0.5 active:translate-y-0.5 ${
                playVsComputer
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-white text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50'
              }`}
            >
              {playVsComputer ? <Monitor className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              {playVsComputer ? 'vs Computer' : 'Pass & Play'}
            </button>
          </div>

          {/* Status Bar */}
          <div className={`rounded-sm px-3.5 py-3 text-xs font-black uppercase tracking-wide border-2 border-[var(--text-primary)] flex items-center justify-between shadow-[2px_2px_0px_var(--text-primary)] ${
            isGameOver
              ? 'bg-emerald-50 text-emerald-800'
              : 'bg-white text-[var(--text-primary)]'
          }`}>
            <span className="truncate">{status}</span>
            {!isGameOver && <Zap className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" />}
          </div>
        </div>

        {/* Move History Panel Header */}
        <div className="px-4 py-2.5 border-b-2 border-[var(--text-primary)] bg-[var(--bg-secondary)]/25 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)] font-jost">Move History</span>
        </div>

        {/* Move History List */}
        <div ref={movesRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 bg-white select-none min-h-0">
          {movePairs.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center py-8">
              <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider leading-relaxed">No moves yet.<br />Make a move to start.</p>
            </div>
          ) : (
            movePairs.map((pair, i) => (
              <div key={i} className="flex items-center gap-2 text-xs py-1 px-2.5 rounded-sm hover:bg-[var(--bg-secondary)]/40 border-b border-[var(--text-primary)]/10 font-montserrat">
                <span className="text-[var(--text-muted)] w-6 flex-shrink-0 tabular-nums font-bold">{i + 1}.</span>
                <span className="flex-1 font-mono font-black text-[var(--text-primary)]">{pair[0]}</span>
                <span className="flex-1 font-mono text-[var(--text-secondary)] font-bold">{pair[1] ?? ''}</span>
              </div>
            ))
          )}
        </div>

        {/* Restart Action Bar */}
        <div className="p-4 border-t-2 border-[var(--text-primary)] bg-[var(--bg-secondary)]/25 flex-shrink-0">
          <button
            onClick={resetGame}
            className="btn-secondary w-full py-2.5 text-xs font-black uppercase flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart Game
          </button>
        </div>
      </div>
    </div>
  );
}
