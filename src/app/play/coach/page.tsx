'use client'

import { Chessboard } from "react-chessboard";
import { Chess, Move, Square } from "chess.js";
import { useState, useEffect, useCallback, useRef } from "react";
import { Lightbulb, RotateCcw, Swords, MessageSquare, AlertCircle, HelpCircle, Check, Sparkles } from "lucide-react";

export default function PlayCoachPage() {
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [coachFeed, setCoachFeed] = useState<string[]>([
    "Welcome to the Training Chamber! 🎓 I am Master Gideon, your AI Chess Coach. Make your moves, and I will analyze them in real-time, explaining opening structures, blunders, and master hints. Let's begin!"
  ]);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
  const [gameResult, setGameResult] = useState<string | null>(null);
  
  // Coach Hints State
  const [bestMoveHint, setBestMoveHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [threatenedPieces, setThreatenedPieces] = useState<string[]>([]);

  const movesRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  const addCoachFeed = useCallback((feed: string) => {
    setCoachFeed(prev => [...prev, feed]);
    setTimeout(() => {
      feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, []);

  // Update threatened pieces alert dynamically after each board update
  const updateThreatAlerts = useCallback((chessGame: Chess) => {
    const threats: string[] = [];
    const turn = chessGame.turn();
    
    // Check if any active player pieces are attacked by the opponent
    chessGame.board().forEach((row) => {
      row.forEach((square) => {
        if (square && square.color === turn) {
          // If square is occupied by turn player, let's see if opponent attacks it
          // chess.js checks if a square is attacked
          const squareName = square.square;
          const opponentColor = turn === 'w' ? 'b' : 'w';
          
          // In chess.js, check if square is attacked by opponent
          // We can cast standard checks
          try {
            // Check if square is attacked by opponent
            // chess.js v1 has isAttacked(square, color)
            // Wait, let's just make a secure check or check for attacks on major pieces
            const isAttacked = (chessGame as any).isAttacked ? (chessGame as any).isAttacked(squareName, opponentColor) : false;
            if (isAttacked) {
              const pieceName = square.type.toUpperCase() === 'P' ? 'Pawn' : 
                                square.type.toUpperCase() === 'N' ? 'Knight' :
                                square.type.toUpperCase() === 'B' ? 'Bishop' :
                                square.type.toUpperCase() === 'R' ? 'Rook' :
                                square.type.toUpperCase() === 'Q' ? 'Queen' : 'King';
              threats.push(`${pieceName} on ${squareName}`);
            }
          } catch {}
        }
      });
    });

    setThreatenedPieces(threats.slice(0, 3)); // Max 3 threats listed for clarity
  }, []);

  const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    try {
      const fenBefore = game.fen();
      const result = game.move(move);
      if (result) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setMoveHistory(prev => [...prev, result.san]);
        setBestMoveHint(null); // Clear hint on move
        setTimeout(() => {
          movesRef.current?.scrollTo({ top: movesRef.current.scrollHeight, behavior: 'smooth' });
        }, 50);

        // Run threat checking
        updateThreatAlerts(newGame);

        // Check if game is over
        if (newGame.isGameOver()) {
          if (newGame.isCheckmate()) {
            if (newGame.turn() === "w") {
              setGameResult("Black Wins");
              addCoachFeed("Checkmate! A beautiful victory by the opponent. Don't worry! Let's analyze your opening choices next time.");
            } else {
              setGameResult("White Wins");
              addCoachFeed("Outstanding victory! Checkmate achieved. You executed your lines flawlessly. Grandmaster standard!");
            }
          } else {
            setGameResult("Draw");
            addCoachFeed("Game terminated: Draw. A high-accuracy defensive performance from both sides.");
          }
          return true;
        }

        // Live Coach feedback for White's move
        if (newGame.turn() === "b") {
          // Player just moved. Let's evaluate if it was the engine's favorite or a good development line
          setIsHintLoading(true);
          fetch("/api/computer-move", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fen: fenBefore, level: 10 }), // Reference position before user's move
          })
            .then(res => res.json())
            .then(data => {
              if (data.bestMove) {
                const bestFrom = data.bestMove.substring(0, 2);
                const bestTo = data.bestMove.substring(2, 4);
                
                // Compare player move with best move
                const playerMoveStr = result.from + result.to;
                if (playerMoveStr === (bestFrom + bestTo)) {
                  addCoachFeed(`✨ Excellent! You played the engine's absolute best move: ${result.san}. This controls the board and forces the opponent's pieces into passive squares.`);
                } else {
                  // Standard positive encouragement or opening check
                  if (result.san.startsWith("e4") || result.san.startsWith("d4")) {
                    addCoachFeed(`✓ Solid Choice: ${result.san}. An classic central opening. This stakes your claim in the center and frees up your bishop diagonals.`);
                  } else if (result.san.startsWith("N") || result.san.startsWith("B")) {
                    addCoachFeed(`✓ Developing move: ${result.san}. Bringing your minor pieces into play. This is essential for controlling lanes and protecting your castle squares.`);
                  } else if (result.san.startsWith("O-O")) {
                    addCoachFeed(`✓ Castling: ${result.san}. Magnificent security. Protecting your king and bringing your rook to the center files. Essential strategy!`);
                  } else {
                    addCoachFeed(`✓ Move made: ${result.san}. A tactical choice. Let's see how the computer opponent recalculates their lines.`);
                  }
                }
              }
            })
            .catch(() => {
              addCoachFeed(`✓ Move made: ${result.san}. Keep maintaining your central pressure!`);
            })
            .finally(() => setIsHintLoading(false));
        }

        return true;
      }
    } catch {
      return false;
    }
    return false;
  }, [game, addCoachFeed, updateThreatAlerts]);

  // Bot makes move
  useEffect(() => {
    if (game.turn() === "b" && !game.isGameOver()) {
      setIsBotThinking(true);
      
      const timer = setTimeout(() => {
        fetch("/api/computer-move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fen: game.fen(), level: 5 }), // Opponent is Sofia-level AI coach spar
        })
          .then(res => res.json())
          .then(data => {
            if (data.bestMove) {
              const from = data.bestMove.substring(0, 2);
              const to = data.bestMove.substring(2, 4);
              const promotion = data.bestMove.length > 4 ? data.bestMove.substring(4, 5) : "q";
              
              const moveSan = game.get(from as Square)?.type.toUpperCase() === 'P' ? '' : game.get(from as Square)?.type.toUpperCase();
              const isCapture = game.get(to as Square) !== null;
              
              const success = makeMove({ from, to, promotion });
              
              if (success) {
                const updatedGame = new Chess(game.fen());
                if (!updatedGame.isGameOver()) {
                  if (updatedGame.isCheck()) {
                    addCoachFeed(`⚠️ Watch out! The opponent put you in check with ${moveSan ?? ''}${isCapture ? 'x' : ''}${to}. Block the diagonal or move your king to a safe corner!`);
                  } else if (isCapture) {
                    addCoachFeed(`⚔️ Opponent captured your piece with ${moveSan ?? ''}x${to}. Review your lines to maintain equal material index!`);
                  } else {
                    addCoachFeed(`✏️ Master Coach: Opponent played ${moveSan ?? ''}${isCapture ? 'x' : ''}${to}. It's your turn. Scan the board and formulate your strategic counter-punch.`);
                  }
                }
              }
            }
          })
          .catch(console.error)
          .finally(() => setIsBotThinking(false));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [game, makeMove, addCoachFeed]);

  // Fetch best move hint from AI Stockfish
  const handleShowHint = () => {
    if (game.turn() === "b" || gameResult) return;
    setIsHintLoading(true);
    
    fetch("/api/computer-move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen: game.fen(), level: 10 }), // Depth ELO 2800 analysis
    })
      .then(res => res.json())
      .then(data => {
        if (data.bestMove) {
          const from = data.bestMove.substring(0, 2);
          const to = data.bestMove.substring(2, 4);
          
          setBestMoveHint(data.bestMove);
          
          // Draw highlight options on board
          const newSquares: Record<string, React.CSSProperties> = {};
          newSquares[from] = { background: "rgba(245, 158, 11, 0.4)", borderRadius: "10px" };
          newSquares[to] = { background: "rgba(245, 158, 11, 0.6)", borderRadius: "10px" };
          setOptionSquares(newSquares);

          // Get San
          try {
            const reconstructed = new Chess(game.fen());
            const parsedMove = reconstructed.move({ from, to, promotion: 'q' });
            if (parsedMove) {
              addCoachFeed(`💡 Master Hint: I suggest you play ${parsedMove.san} (${from} ➔ ${to}). This is Stockfish's highest-evaluation path here.`);
            }
          } catch {}
        }
      })
      .catch(console.error)
      .finally(() => setIsHintLoading(false));
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
    if (game.turn() === "b" || gameResult) return;
    
    // Clear hint styling on click
    if (bestMoveHint) {
      setBestMoveHint(null);
      setOptionSquares({});
    }

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
    if (game.turn() === "b" || gameResult) return false;
    if (!targetSquare) return false;
    
    // Clear hint
    if (bestMoveHint) {
      setBestMoveHint(null);
      setOptionSquares({});
    }

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
    setGame(new Chess());
    setMoveHistory([]);
    setGameResult(null);
    setMoveFrom(null);
    setOptionSquares({});
    setBestMoveHint(null);
    setThreatenedPieces([]);
    setCoachFeed([
      "Game restarted! Master Gideon is ready to evaluate your new positions. Make your opening move and let's go!"
    ]);
  };

  // Move pairs
  const movePairs: string[][] = moveHistory.reduce<string[][]>((acc, san, i) => {
    if (i % 2 === 0) acc.push([san]);
    else acc[acc.length - 1].push(san);
    return acc;
  }, []);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden bg-[var(--bg-main)]">
      
      {/* ── CHESSBOARD COLUMN ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-2 p-3 sm:p-4 min-h-0 overflow-hidden">
        
        {/* Active Coach Banner */}
        <div className="card-surface !py-2.5 !px-4 flex items-center justify-between border-t-2 border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg font-bold flex-shrink-0 shadow-sm border border-white/5">
              🎓
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                Training Chamber
                <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-lg border border-amber-500/10 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> AI Coach Mode
                </span>
              </p>
              <p className="text-[10px] text-[var(--text-muted)] italic font-light truncate">
                Spar against computer with real-time feedback & master tips.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isBotThinking && (
              <span className="text-[10px] font-semibold text-[var(--primary)] animate-pulse">
                ⏳ Opponent Thinking…
              </span>
            )}
          </div>
        </div>

        {/* Board Result Banner */}
        {gameResult && (
          <div className="card-elevated !py-3 text-center !border-amber-500/25 bg-amber-500/[0.03]">
            <p className="font-semibold text-[var(--text-primary)] text-sm">
              🏁 Coaching Session Complete! Result: <span className="text-[var(--primary)] font-bold">{gameResult}</span>
            </p>
            <button
              onClick={resetGame}
              className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Train again
            </button>
          </div>
        )}

        {/* Chessboard container */}
        <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden p-1">
          <div
            className="card-elevated !p-2 sm:!p-3"
            style={{ height: '100%', aspectRatio: '1 / 1', maxWidth: '100%' }}
          >
            <div className="w-full h-full rounded-xl overflow-hidden shadow-inner relative">
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
                  allowDragging: !gameResult && game.turn() === "w",
                }}
              />
            </div>
          </div>
        </div>

        {/* Player Bar */}
        <div className="card-surface !py-2.5 !px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-md">
              👤
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">You</p>
              <p className="text-[10px] text-[var(--text-muted)]">White Player</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShowHint}
              disabled={isHintLoading || game.turn() === "b" || gameResult !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all flex-shrink-0 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              <Lightbulb className="w-3.5 h-3.5" /> Show Best Move Hint
            </button>
            <button
              onClick={resetGame}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all flex-shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── SIDE PANEL (COACH FEED & ATOMICS) ────────────────────────────── */}
      <div className="w-full lg:w-80 xl:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-[var(--border-primary)] min-h-0">
        
        {/* Coach Character Header */}
        <div className="p-4 border-b border-[var(--border-primary)] flex-shrink-0 flex items-center gap-3 bg-[var(--bg-secondary)]/10">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-lg font-bold shadow-sm border border-amber-500/20">
            👴
          </div>
          <div>
            <span className="text-xs font-bold text-[var(--text-primary)] block leading-snug">Master Gideon</span>
            <span className="text-[9px] text-[var(--accent)] font-semibold uppercase tracking-wider">Senior Chess Coach ELO 2600</span>
          </div>
        </div>

        {/* At-Risk Warning Widget */}
        <div className="p-3 border-b border-[var(--border-primary)] flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" /> Threatened Pieces
            </span>
            <span className="text-[9px] font-mono text-[var(--text-muted)]">{threatenedPieces.length} active threats</span>
          </div>
          {threatenedPieces.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {threatenedPieces.map((threat, idx) => (
                <span key={idx} className="badge badge-red text-[8.5px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1 border border-red-500/10">
                  ⚠️ {threat}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1 py-0.5">
              <Check className="w-3 h-3 text-emerald-500" /> Your positions are fully secure. No blunders under attack!
            </div>
          )}
        </div>

        {/* Coach Commentary Feed */}
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-secondary)]/[0.15]">
          <div className="px-4 py-2 border-b border-[var(--border-primary)] flex items-center gap-2 bg-[var(--bg-secondary)]/30">
            <MessageSquare className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Master Gideon's Commentary</span>
          </div>

          <div ref={feedRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {coachFeed.map((feed, idx) => (
              <div key={idx} className="flex items-start gap-2.5 max-w-[90%] self-start animate-fade-in">
                <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center text-xs flex-shrink-0 border border-amber-500/20">
                  👴
                </div>
                <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-r-xl rounded-bl-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <span className="block text-[8px] font-bold text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wider">Coach Gideon</span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light">
                    {feed}
                  </p>
                </div>
              </div>
            ))}
            {isHintLoading && (
              <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] pl-8 italic animate-pulse">
                🎓 Master Gideon is calculating lines…
              </div>
            )}
          </div>
        </div>

        {/* Training Progress Moves List */}
        <div className="h-32 border-t border-[var(--border-primary)] flex flex-col min-h-0 flex-shrink-0">
          <div className="px-4 py-1.5 border-b border-[var(--border-primary)] flex items-center justify-between bg-[var(--bg-secondary)]/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Strategic Moves</span>
            <span className="text-[9px] text-[var(--text-muted)] font-mono">{moveHistory.length} moves</span>
          </div>

          <div ref={movesRef} className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-0.5">
            {movePairs.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-[9.5px] text-[var(--text-muted)] font-light">No moves made. Make your opening moves as White!</p>
              </div>
            ) : (
              movePairs.map((pair, i) => (
                <div key={i} className="flex items-center gap-2 text-xs py-0.5 px-2 rounded-lg hover:bg-[var(--bg-secondary)] transition-colors">
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
  );
}
