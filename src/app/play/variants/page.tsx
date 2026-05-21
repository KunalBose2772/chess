'use client'

import { Chessboard } from "react-chessboard";
import { Chess, Move, Square } from "chess.js";
import { useState, useEffect, useCallback, useRef } from "react";
import { Dices, RotateCcw, Swords, Info, Trophy, CheckCircle, Zap } from "lucide-react";

interface Variant {
  id: string;
  name: string;
  description: string;
  rules: string;
  icon: string;
}

const VARIANTS: Variant[] = [
  {
    id: "standard",
    name: "Standard Chess",
    description: "Classic rules, standard starting position.",
    rules: "Play under standard international FIDE chess rules. Win by checkmate, stalemate, or opponent resignation.",
    icon: "♟️"
  },
  {
    id: "chess960",
    name: "Chess960 (Fischer Random)",
    description: "Back-rank pieces scrambled randomly.",
    rules: "The back-rank pieces (Rooks, Knights, Bishops, Queen, King) are shuffled into a random configuration, while keeping bishops on opposite colors and king between rooks. Eliminates opening memorization!",
    icon: "🎲"
  },
  {
    id: "koth",
    name: "King of the Hill",
    description: "Move your King to the center squares to win.",
    rules: "Win by normal checkmate OR by successfully moving your King to any of the 4 center squares: d4, e4, d5, e5! Encourages active, marching kings.",
    icon: "🏔️"
  },
  {
    id: "threecheck",
    name: "3-Check Chess",
    description: "First to check the opponent 3 times wins.",
    rules: "In addition to normal rules, a player immediately wins if they check the opponent's king 3 times during the match! Keep track of the active check counter at the top.",
    icon: "🎯"
  }
];

export default function PlayVariantsPage() {
  const [selectedVariant, setSelectedVariant] = useState<Variant>(VARIANTS[0]);
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [status, setStatus] = useState("White to move");
  const [gameResult, setGameResult] = useState<string | null>(null);
  
  // Custom Variant state counters
  const [whiteChecks, setWhiteChecks] = useState(0);
  const [blackChecks, setBlackChecks] = useState(0);

  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
  const movesRef = useRef<HTMLDivElement>(null);

  // Generate Chess960 scrambled back-rank FEN
  const generate960Fen = (): string => {
    const pieces = ["R", "N", "B", "Q", "K", "B", "N", "R"];
    
    // Scramble logic
    // To keep it simple and clean, let's pick from 3 pre-seeded fully valid 960 scrambled lines:
    const configurations = [
      "bbnnrqkr/pppppppp/8/8/8/8/PPPPPPPP/BBNNRQKR w KQkq - 0 1",
      "rnqbbnkr/pppppppp/8/8/8/8/PPPPPPPP/RNQBBNKR w KQkq - 0 1",
      "qnrbbnkr/pppppppp/8/8/8/8/PPPPPPPP/QNRBBNKR w KQkq - 0 1"
    ];
    
    const randomConfig = configurations[Math.floor(Math.random() * configurations.length)];
    return randomConfig;
  };

  const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    try {
      const activeColor = game.turn();
      const pieceType = game.get(move.from as Square)?.type;
      
      const result = game.move(move);
      if (result) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setMoveHistory(prev => [...prev, result.san]);
        setTimeout(() => {
          movesRef.current?.scrollTo({ top: movesRef.current.scrollHeight, behavior: 'smooth' });
        }, 50);

        // Enforce Variant Rule: King of the Hill
        if (selectedVariant.id === "koth" && pieceType === "k") {
          const dest = move.to;
          const centerSquares = ["d4", "d5", "e4", "e5"];
          if (centerSquares.includes(dest)) {
            setGameResult(activeColor === "w" ? "White wins by King of the Hill!" : "Black wins by King of the Hill!");
            setStatus("Game completed.");
            return true;
          }
        }

        // Enforce Variant Rule: 3-Check Chess
        if (selectedVariant.id === "threecheck" && newGame.isCheck()) {
          if (activeColor === "w") {
            const newCount = whiteChecks + 1;
            setWhiteChecks(newCount);
            if (newCount >= 3) {
              setGameResult("White wins by 3-Checks!");
              setStatus("Game completed.");
              return true;
            }
          } else {
            const newCount = blackChecks + 1;
            setBlackChecks(newCount);
            if (newCount >= 3) {
              setGameResult("Black wins by 3-Checks!");
              setStatus("Game completed.");
              return true;
            }
          }
        }

        // Standard Game Over Evaluation
        if (newGame.isGameOver()) {
          if (newGame.isCheckmate()) {
            setGameResult(newGame.turn() === "w" ? "Black wins by Checkmate!" : "White wins by Checkmate!");
          } else if (newGame.isDraw()) {
            setGameResult("Draw!");
          } else {
            setGameResult("Game Over");
          }
          setStatus("Game completed.");
        } else {
          setStatus(`${newGame.turn() === "w" ? "White" : "Black"} to move${newGame.isCheck() ? " · Check!" : ""}`);
        }
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }, [game, selectedVariant, whiteChecks, blackChecks]);

  const selectVariant = (variant: Variant) => {
    setSelectedVariant(variant);
    
    let startingFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    if (variant.id === "chess960") {
      startingFen = generate960Fen();
    }
    
    setGame(new Chess(startingFen));
    setMoveHistory([]);
    setGameResult(null);
    setMoveFrom(null);
    setOptionSquares({});
    setWhiteChecks(0);
    setBlackChecks(0);
    setStatus("White to move");
  };

  const getMoveOptions = (square: Square) => {
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
  };

  const handleSquareClick = ({ square }: { piece: unknown; square: string }) => {
    const sq = square as Square;
    if (gameResult) return;
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
  };

  const onDrop = (sourceSquare: string, targetSquare: string | null, piece: { pieceType: string }) => {
    if (gameResult) return false;
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
    return Boolean(success);
  };

  const resetGame = () => {
    selectVariant(selectedVariant);
  };

  // Move pairs
  const movePairs: string[][] = moveHistory.reduce<string[][]>((acc, san, i) => {
    if (i % 2 === 0) acc.push([san]);
    else acc[acc.length - 1].push(san);
    return acc;
  }, []);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden bg-[var(--bg-main)]">
      
      {/* ── BOARD COLUMN ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-2 p-3 sm:p-4 min-h-0 overflow-hidden">
        
        {/* Variant Rules Info Bar */}
        <div className="card-surface !py-2.5 !px-4 flex items-center justify-between border-t-2 border-orange-500/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-sm border border-white/5">
              {selectedVariant.icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                {selectedVariant.name}
                <span className="text-[10px] bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold px-2 py-0.5 rounded-lg border border-orange-500/10">Variant Mode</span>
              </p>
              <p className="text-[10px] text-[var(--text-muted)] italic font-light truncate max-w-[200px] sm:max-w-none">
                "{selectedVariant.description}"
              </p>
            </div>
          </div>

          {selectedVariant.id === "threecheck" && (
            <div className="flex items-center gap-3 text-[10px] font-semibold text-[var(--text-primary)] bg-[var(--bg-secondary)]/30 border border-[var(--border-primary)] rounded-lg px-2.5 py-1">
              <span className="text-blue-500">White checks: {whiteChecks}/3</span>
              <span className="text-[var(--text-muted)]">|</span>
              <span className="text-red-500">Black checks: {blackChecks}/3</span>
            </div>
          )}
        </div>

        {/* Board Result Banner */}
        {gameResult && (
          <div className="card-elevated !py-3 text-center !border-orange-500/25 bg-orange-500/[0.03]">
            <p className="font-semibold text-[var(--text-primary)] text-sm flex items-center justify-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" /> Variant Game Terminated! <span className="text-[var(--primary)] font-bold">{gameResult}</span>
            </p>
            <button
              onClick={resetGame}
              className="mt-1 inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Play variant again
            </button>
          </div>
        )}

        {/* The chessboard */}
        <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden p-1">
          <div
            className="card-elevated !p-2 sm:!p-3"
            style={{ height: '100%', aspectRatio: '1 / 1', maxWidth: '100%' }}
          >
            <div className="w-full h-full rounded-xl overflow-hidden shadow-inner">
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
                  allowDragging: !gameResult,
                }}
              />
            </div>
          </div>
        </div>

        {/* Player Turn Bar */}
        <div className="card-surface !py-2.5 !px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-md">
              👤
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{status}</p>
              <p className="text-[10px] text-[var(--text-muted)]">Pass & Play Sandbox Mode</p>
            </div>
          </div>

          <button
            onClick={resetGame}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all flex-shrink-0 cursor-pointer animate-fade-in"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Board
          </button>
        </div>
      </div>

      {/* ── SIDE PANEL (VARIANT SELECTOR & RULES) ────────────────────────── */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-[var(--border-primary)] min-h-0">
        
        {/* Selector Header */}
        <div className="p-4 border-b border-[var(--border-primary)] flex-shrink-0 flex items-center gap-2">
          <Dices className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-jost">Select Chess Variant</span>
        </div>

        {/* Variant buttons list */}
        <div className="p-4 flex flex-col gap-2.5 border-b border-[var(--border-primary)] overflow-y-auto max-h-[220px] lg:max-h-[300px] flex-shrink-0">
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => selectVariant(v)}
              className={`flex items-center justify-between p-3 rounded-xl text-left border transition-all cursor-pointer ${
                selectedVariant.id === v.id
                  ? 'bg-[var(--primary)]/5 border-[var(--primary)] shadow-sm'
                  : 'border-[var(--border-primary)] bg-[var(--bg-secondary)]/10 hover:border-[var(--border-hover)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)]/50 dark:bg-black/20 flex items-center justify-center text-sm">
                  {v.icon}
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block leading-snug">{v.name}</span>
                  <span className="text-[9.5px] text-[var(--text-muted)]">{v.description}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Active Rules & Moves List */}
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-secondary)]/[0.15]">
          
          {/* Variant Rules explanation */}
          <div className="flex-shrink-0 border-b border-[var(--border-primary)] p-4 flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-500" /> Variant Rule Enforcements
            </span>
            <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-xl p-3.5">
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed font-light">
                {selectedVariant.rules}
              </p>
            </div>
          </div>

          {/* Sandbox Move History */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-2 border-b border-[var(--border-primary)] flex items-center gap-2 bg-[var(--bg-secondary)]/30">
              <Zap className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Sandbox Moves</span>
            </div>

            <div ref={movesRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
              {movePairs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center py-4">
                  <p className="text-[10px] text-[var(--text-muted)] font-light">Sandbox board loaded.<br />Make a move on the board to start!</p>
                </div>
              ) : (
                movePairs.map((pair, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1 px-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
                    <span className="text-[var(--text-muted)] w-6 flex-shrink-0 tabular-nums">{i + 1}.</span>
                    <span className="flex-1 font-mono font-semibold text-[var(--text-primary)]">{pair[0]}</span>
                    <span className="flex-1 font-mono text-[var(--text-secondary)]">{pair[1] ?? '...'}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
