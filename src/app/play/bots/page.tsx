'use client'

import { Chessboard } from "react-chessboard";
import { Chess, Move, Square } from "chess.js";
import { useState, useEffect, useCallback, useRef } from "react";
import { Bot, RotateCcw, Swords, MessageSquare, Zap, Cpu, ChevronRight } from "lucide-react";

interface BotPersonality {
  id: string;
  name: string;
  rating: number;
  avatar: string;
  colorClass: string;
  borderColor: string;
  level: number;
  intro: string;
  checkComment: string;
  beCheckComment: string;
  captureComment: string;
  loseComment: string;
  winComment: string;
  description: string;
}

const BOTS: BotPersonality[] = [
  {
    id: "sparky",
    name: "Sparky",
    rating: 800,
    avatar: "♟️",
    colorClass: "bg-emerald-500/10 text-emerald-500",
    borderColor: "border-emerald-500/30",
    level: 2,
    intro: "Hi! I'm Sparky! ♟️ I love pawns and diagonal bishops! Let's have a super fun game!",
    checkComment: "Wow! I put you in check! That's so cool!",
    beCheckComment: "Oh no! A check! Quick, hide the king under the board!",
    captureComment: "Nom nom nom! Captured your piece!",
    loseComment: "Aww, you won! GG! You're really good at this chess stuff!",
    winComment: "Hooray! I won! Can we play another one, please?",
    description: "A friendly novice bot who loves chess and diagonal attacks. Perfect for beginners."
  },
  {
    id: "sofia",
    name: "Sofia",
    rating: 1500,
    avatar: "🧠",
    colorClass: "bg-blue-500/10 text-blue-500",
    borderColor: "border-blue-500/30",
    level: 5,
    intro: "Greetings. 🧠 I specialize in classical openings and pawn structures. Let's see how you control the center files.",
    checkComment: "Check. Keep an eye on your king's escape squares.",
    beCheckComment: "An interesting check. I will adjust my minor piece placement.",
    captureComment: "A standard tactical trade. The exchange favors my development.",
    loseComment: "Brilliant game. Your tactical foresight was superior to mine. Well played!",
    winComment: "Checkmate. A solid attempt, but your pawn structure left weak holes in the endgame.",
    description: "Strategic and academic. Focuses on opening lines and positioning. Great intermediate test."
  },
  {
    id: "carlsen",
    name: "GM Carlsen",
    rating: 2200,
    avatar: "👑",
    colorClass: "bg-purple-500/10 text-purple-500",
    borderColor: "border-purple-500/30",
    level: 8,
    intro: "Ready? 👑 Let's skip the small talk. Show me how you handle pressure in deep endgames.",
    checkComment: "Check. You're entering a very defensive, losing position.",
    beCheckComment: "A temporary check. My king is perfectly secure.",
    captureComment: "Blunder? Or a sacrifice? Either way, I'm taking it.",
    loseComment: "Unbelievable. You found the exact winning line. I resign. Excellent play.",
    winComment: "And that's checkmate. You played well, but I saw the mates 7 moves ago.",
    description: "Sharp, competitive, and highly tactical. Plays aggressive championship chess."
  },
  {
    id: "deepblue",
    name: "Deep Blue",
    rating: 2800,
    avatar: "🌌",
    colorClass: "bg-amber-500/10 text-amber-500",
    borderColor: "border-amber-500/30",
    level: 10,
    intro: "SYSTEM INITIALIZED. 🌌 Stockfish online API connected. Evaluation matrices loaded. Victory is mathematically highly probable.",
    checkComment: "Check status: Active. Defensive probability: 14.2%.",
    beCheckComment: "Alert: King check detected. Recalculating path branches... Safe square secured.",
    captureComment: "Piece deleted. Material balance optimized.",
    loseComment: "EXCEPTIONAL PATHFINDING. Critical error in my evaluation loop. Game terminated. You win.",
    winComment: "PROCESS COMPLETE. Checkmate achieved. Zero error margins in final matrix. Play again?",
    description: "Cold, calculating, and flawless. Backed by Stockfish 16 running depth calculations."
  }
];

export default function PlayBotsPage() {
  const [selectedBot, setSelectedBot] = useState<BotPersonality>(BOTS[0]);
  const [game, setGame] = useState(new Chess());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [botChat, setBotChat] = useState<string[]>([]);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
  const [gameResult, setGameResult] = useState<string | null>(null);
  
  const movesRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  // Stateful Web Audio Engine for zero-latency tactile sound
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize and bind active AudioContext on page load
  useEffect(() => {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      const ctx = new AudioCtxClass();
      setAudioCtx(ctx);
      audioCtxRef.current = ctx;

      // Unblock browser sound policy on first gesture
      const unlockAudio = () => {
        if (ctx.state === "suspended") {
          ctx.resume().then(() => {
            console.log("Bots Arena Audio engaged.");
          });
        }
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("mouseenter", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
      };

      window.addEventListener("click", unlockAudio);
      window.addEventListener("mouseenter", unlockAudio);
      window.addEventListener("touchstart", unlockAudio);

      return () => {
        window.removeEventListener("click", unlockAudio);
        window.removeEventListener("mouseenter", unlockAudio);
        window.removeEventListener("touchstart", unlockAudio);
      };
    }
  }, []);

  // ── SOUND SYNTHESIS METHODS ─────────────────────────────────────────
  
  // Standard resonant wood click/tap
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
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.12);
      
      gainNode.gain.setValueAtTime(0.35, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch (e) {
      console.log("Audio tap error", e);
    }
  };

  // Tactical sharper slide/capture sound
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
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.16);
      
      gainNode.gain.setValueAtTime(0.38, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (e) {
      console.log("Audio capture error", e);
    }
  };

  // Crystalline chime for checks/checkmates
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
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + dur);
      };
      
      playTone(450, 0.2);
      playTone(550, 0.2);
    } catch (e) {
      console.log("Audio check error", e);
    }
  };

  // Initialize bot chat
  useEffect(() => {
    setBotChat([selectedBot.intro]);
  }, [selectedBot]);

  const addBotComment = useCallback((comment: string) => {
    setBotChat(prev => [...prev, comment]);
    setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, []);

  const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    try {
      const isCaptureMove = game.get(move.to as Square) !== null;
      const result = game.move(move);
      if (result) {
        const newGame = new Chess(game.fen());
        setGame(newGame);
        setMoveHistory(prev => [...prev, result.san]);

        // Synthesize dynamic live audio
        if (newGame.isCheck() || newGame.isGameOver()) {
          playChessCheckSound();
        } else if (isCaptureMove) {
          playChessCaptureSound();
        } else {
          playChessMoveSound();
        }

        setTimeout(() => {
          movesRef.current?.scrollTo({ top: movesRef.current.scrollHeight, behavior: 'smooth' });
        }, 50);

        // Check if game is over
        if (newGame.isGameOver()) {
          if (newGame.isCheckmate()) {
            if (newGame.turn() === "w") {
              setGameResult("Black Wins");
              addBotComment(selectedBot.winComment);
            } else {
              setGameResult("White Wins");
              addBotComment(selectedBot.loseComment);
            }
          } else {
            setGameResult("Draw");
            addBotComment("A hard fought battle! It's a draw!");
          }
        } else {
          // If player just made a move
          if (newGame.turn() === "b") {
            if (newGame.isCheck()) {
              addBotComment(selectedBot.beCheckComment);
            } else if (isCaptureMove) {
              addBotComment("Impressive capture. You are fighting well.");
            }
          }
        }
        return true;
      }
    } catch (e) {
      return false;
    }
    return false;
  }, [game, selectedBot, addBotComment]);

  // Bot makes move
  useEffect(() => {
    if (game.turn() === "b" && !game.isGameOver()) {
      setIsBotThinking(true);
      
      const timer = setTimeout(() => {
        fetch("/api/computer-move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fen: game.fen(), level: selectedBot.level }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.bestMove) {
              const from = data.bestMove.substring(0, 2);
              const to = data.bestMove.substring(2, 4);
              const promotion = data.bestMove.length > 4 ? data.bestMove.substring(4, 5) : "q";
              
              const isCapture = game.get(to as Square) !== null;
              
              const success = makeMove({ from, to, promotion });
              
              if (success) {
                const updatedGame = new Chess(game.fen()); // Refetched after makeMove
                if (updatedGame.isGameOver()) {
                  // Handled inside makeMove
                } else if (updatedGame.isCheck()) {
                  addBotComment(selectedBot.checkComment);
                } else if (isCapture) {
                  addBotComment(selectedBot.captureComment);
                }
              }
            }
          })
          .catch(console.error)
          .finally(() => setIsBotThinking(false));
      }, 800 + Math.random() * 800); // Realistic bot thinking time

      return () => clearTimeout(timer);
    }
  }, [game, selectedBot, makeMove, addBotComment]);

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
    if (game.turn() === "b" || gameResult) return false;
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
    playChessMoveSound();
    setGame(new Chess());
    setMoveHistory([]);
    setGameResult(null);
    setMoveFrom(null);
    setOptionSquares({});
    setBotChat([selectedBot.intro]);
  };

  const selectBot = (bot: BotPersonality) => {
    playChessMoveSound();
    setSelectedBot(bot);
    setGame(new Chess());
    setMoveHistory([]);
    setGameResult(null);
    setMoveFrom(null);
    setOptionSquares({});
  };

  // Move pairs
  const movePairs: string[][] = moveHistory.reduce<string[][]>((acc, san, i) => {
    if (i % 2 === 0) acc.push([san]);
    else acc[acc.length - 1].push(san);
    return acc;
  }, []);

  return (
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden bg-[var(--bg-main)]">
      
      {/* ── GIANT, CENTERED CHESSBOARD COLUMN (Maximized space matching Home Screen) ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 min-h-0 overflow-hidden relative">
        
        {/* Ambient custom radial glow behind the board */}
        <div className="absolute inset-0 bg-[var(--primary)]/[0.02] blur-[100px] rounded-3xl pointer-events-none -z-10 animate-pulse" />

        {/* Dynamic Board Result Banner Overlay */}
        {gameResult && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-6 py-2.5 rounded-2xl border border-emerald-500/30 bg-[#090D16]/95 backdrop-blur-md shadow-2xl flex items-center gap-4">
            <span className="font-semibold text-[var(--text-primary)] text-xs">
              🏁 Game Over: <span className="text-[var(--primary)] font-bold">{gameResult}</span>
            </span>
            <button
              onClick={resetGame}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Play Again
            </button>
          </div>
        )}

        {/* Board Aspect-Ratio Restricting Wrapper */}
        <div className="w-full h-full max-w-[620px] max-h-[620px] aspect-square flex justify-center items-center">
          <div className="card-elevated !p-3.5 sm:!p-5 w-full h-full shadow-2xl relative border-white/5 bg-[#090D16]/65 backdrop-blur-md">
            
            <div className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-white/5">
              <Chessboard
                options={{
                  position: game.fen(),
                  onPieceDrop: ({ sourceSquare, targetSquare, piece }) =>
                    onDrop(sourceSquare, targetSquare, piece),
                  onSquareClick: handleSquareClick as never,
                  squareStyles: optionSquares,
                  darkSquareStyle: { backgroundColor: "#2563EB" }, // Premium sapphire blue
                  lightSquareStyle: { backgroundColor: "#EFF6FF" }, // Premium ivory light squares
                  animationDurationInMs: 150,
                  allowDragging: !gameResult && game.turn() === "w",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── CONSOLIDATED CONTROL DECK (RIGHT SIDEBAR) ─────────────────── */}
      <div className="w-full lg:w-85 xl:w-96 flex flex-col border-t lg:border-t-0 lg:border-l border-[var(--border-primary)] min-h-0 bg-[#090D16]/50 backdrop-blur-sm flex-shrink-0">
        
        {/* ── MATCH DASHBOARD PANEL (Repositioned Players Console) ──────── */}
        <div className="p-4 border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]/25 flex flex-col gap-3">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-mono">Current Match</span>
          
          <div className="flex flex-col gap-2">
            {/* Opponent Bot Profile block */}
            <div className={`flex items-center justify-between p-2.5 rounded-xl border bg-[#080C16]/90 ${selectedBot.borderColor}`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg ${selectedBot.colorClass} flex items-center justify-center text-sm font-semibold`}>
                  {selectedBot.avatar}
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block leading-snug">{selectedBot.name}</span>
                  <span className="text-[9px] text-[var(--text-muted)]">Opponent • ELO {selectedBot.rating}</span>
                </div>
              </div>
              <div>
                {isBotThinking ? (
                  <span className="text-[9px] bg-blue-500/10 text-blue-400 font-semibold px-2 py-0.5 rounded-lg border border-blue-500/20 animate-pulse flex items-center gap-1">
                    <Cpu className="w-2.5 h-2.5 animate-spin" /> thinking...
                  </span>
                ) : game.turn() === 'b' && !gameResult ? (
                  <span className="text-[9px] bg-[var(--primary)]/10 text-[var(--primary)] font-semibold px-2 py-0.5 rounded-lg border border-[var(--primary)]/20 animate-pulse">Their Turn</span>
                ) : (
                  <span className="text-[9px] text-slate-500 font-medium">Waiting</span>
                )}
              </div>
            </div>

            {/* White Player Profile block */}
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-[#080C16]/90">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-xs font-bold text-white">
                  👤
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block leading-snug">You</span>
                  <span className="text-[9px] text-[var(--text-muted)]">White Player</span>
                </div>
              </div>
              <div>
                {game.turn() === 'w' && !gameResult && !isBotThinking ? (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded-lg border border-emerald-500/20 animate-pulse">Your Turn</span>
                ) : (
                  <span className="text-[9px] text-slate-500 font-medium">Waiting</span>
                )}
              </div>
            </div>
          </div>

          {/* Quick console action reset */}
          <button
            onClick={resetGame}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold border border-[var(--border-primary)] bg-[var(--bg-secondary)]/50 text-[var(--text-primary)] hover:border-[var(--border-hover)] transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Board
          </button>
        </div>

        {/* ── BOT SELECTOR LIST ── */}
        <div className="p-4 border-b border-[var(--border-primary)] flex-shrink-0 flex items-center gap-2">
          <Bot className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-jost">Select AI Opponent</span>
        </div>
 
        <div className="p-4 flex flex-col gap-2 border-b border-[var(--border-primary)] overflow-y-auto max-h-[180px] lg:max-h-[220px] flex-shrink-0">
          {BOTS.map((bot) => (
            <button
              key={bot.id}
              onClick={() => selectBot(bot)}
              className={`flex items-center justify-between p-2 rounded-xl text-left border transition-all cursor-pointer ${
                selectedBot.id === bot.id
                  ? 'bg-[var(--primary)]/5 border-[var(--primary)] shadow-sm'
                  : 'border-[var(--border-primary)] bg-[var(--bg-secondary)]/10 hover:border-[var(--border-hover)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${bot.colorClass} flex items-center justify-center text-sm font-semibold`}>
                  {bot.avatar}
                </div>
                <div>
                  <span className="text-xs font-bold text-[var(--text-primary)] block leading-snug">{bot.name}</span>
                  <span className="text-[9px] text-[var(--text-muted)] font-mono">Rating: {bot.rating}</span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${selectedBot.id === bot.id ? 'translate-x-0.5 text-[var(--primary)]' : ''}`} />
            </button>
          ))}
        </div>

        {/* ── BOT CHAT & MOVES SPLIT PANEL ── */}
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-secondary)]/[0.15]">
          
          {/* Bot commentary */}
          <div className="flex-1 flex flex-col min-h-0 border-b border-[var(--border-primary)]">
            <div className="px-4 py-2 border-b border-[var(--border-primary)] flex items-center gap-2 bg-[var(--bg-secondary)]/30">
              <MessageSquare className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Bot Commentary</span>
            </div>

            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {botChat.map((chat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 max-w-[85%] self-start animate-fade-in">
                  <div className={`w-6 h-6 rounded-md ${selectedBot.colorClass} flex items-center justify-center text-xs flex-shrink-0 border border-white/5`}>
                    {selectedBot.avatar}
                  </div>
                  <div className="bg-[var(--bg-surface)] border border-[var(--border-primary)] rounded-r-xl rounded-bl-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <span className="block text-[9px] font-bold text-[var(--text-muted)] mb-1 uppercase tracking-wider">{selectedBot.name}</span>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-light italic">
                      "{chat}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Move History */}
          <div className="h-44 flex flex-col min-h-0 flex-shrink-0">
            <div className="px-4 py-2 border-b border-[var(--border-primary)] flex items-center gap-2 bg-[var(--bg-secondary)]/30">
              <Zap className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">Move History</span>
            </div>

            <div ref={movesRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
              {movePairs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center py-4">
                  <p className="text-[10px] text-[var(--text-muted)] font-light">No moves recorded yet.<br />Make a move as White!</p>
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
