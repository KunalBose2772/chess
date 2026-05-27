'use client'

import { Chessboard } from "react-chessboard";
import { Chess, Move, Square } from "chess.js";
import { useState, useEffect, useCallback, useRef } from "react";
import { Bot, RotateCcw, Swords, MessageSquare, Zap, Cpu, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { useBoardTheme } from "@/components/BoardThemeProvider";

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
    colorClass: "bg-emerald-500/10 text-emerald-700",
    borderColor: "border-[var(--text-primary)]",
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
    colorClass: "bg-blue-500/10 text-blue-750",
    borderColor: "border-[var(--text-primary)]",
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
    colorClass: "bg-amber-500/10 text-amber-750",
    borderColor: "border-[var(--text-primary)]",
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
    colorClass: "bg-purple-500/10 text-purple-750",
    borderColor: "border-[var(--text-primary)]",
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

// Custom SVG Icons for Bot Personalities
const SparkyIcon = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="sparkyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
    <circle cx="50" cy="30" r="14" fill="url(#sparkyGrad)" stroke="var(--text-primary)" strokeWidth="3" />
    <path d="M42,22 C48,18 56,22 58,28" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    <path d="M36,48 L64,48 L60,54 L40,54 Z" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M38,54 C38,68 30,76 26,82 L74,82 C70,76 62,68 62,54 Z" fill="url(#sparkyGrad)" stroke="var(--text-primary)" strokeWidth="3" strokeLinejoin="round" />
    <path d="M46,58 C46,68 40,74 34,80" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    <path d="M18,82 L82,82 L77,90 L23,90 Z" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="2.5" />
  </svg>
);

const SofiaIcon = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="sofiaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
    <circle cx="50" cy="14" r="3.5" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="1.5" />
    <path d="M50,18 C38,24 35,46 50,54 C65,46 62,24 50,18 Z" fill="url(#sofiaGrad)" stroke="var(--text-primary)" strokeWidth="3" strokeLinejoin="round" />
    <path d="M45,28 L55,38" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
    <path d="M36,54 L64,54 L60,60 L40,60 Z" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M38,60 C38,72 30,76 26,82 L74,82 C70,76 62,72 62,60 Z" fill="url(#sofiaGrad)" stroke="var(--text-primary)" strokeWidth="3" strokeLinejoin="round" />
    <path d="M46,64 C46,72 40,78 34,80" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    <path d="M18,82 L82,82 L77,90 L23,90 Z" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="2.5" />
  </svg>
);

const CarlsenIcon = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="carlsenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
    <path d="M50,10 L50,18 M46,14 L54,14" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M22,46 L32,24 L44,38 L50,18 L56,38 L68,24 L78,46 Z" fill="url(#carlsenGrad)" stroke="var(--text-primary)" strokeWidth="3" strokeLinejoin="round" />
    <rect x="22" y="46" width="56" height="8" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="2.5" />
    <circle cx="32" cy="50" r="2.5" fill="#fff" stroke="var(--text-primary)" strokeWidth="1" />
    <circle cx="50" cy="50" r="2.5" fill="#fff" stroke="var(--text-primary)" strokeWidth="1" />
    <circle cx="68" cy="50" r="2.5" fill="#fff" stroke="var(--text-primary)" strokeWidth="1" />
    <path d="M30,54 C30,66 28,74 24,80 L76,80 C72,74 70,66 70,54 Z" fill="url(#carlsenGrad)" stroke="var(--text-primary)" strokeWidth="3" strokeLinejoin="round" />
    <path d="M40,58 L40,74" fill="none" stroke="var(--accent)" strokeWidth="2" />
    <path d="M60,58 L60,74" fill="none" stroke="var(--accent)" strokeWidth="2" />
    <path d="M16,80 L84,80 L79,88 L21,88 Z" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="2.5" />
  </svg>
);

const DeepBlueIcon = ({ className = "w-full h-full" }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <defs>
      <linearGradient id="deepblueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#5B21B6" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
    <g stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="35" x2="22" y2="35" />
      <line x1="12" y1="50" x2="22" y2="50" />
      <line x1="12" y1="65" x2="22" y2="65" />
      <line x1="78" y1="35" x2="88" y2="35" />
      <line x1="78" y1="50" x2="88" y2="50" />
      <line x1="78" y1="65" x2="88" y2="65" />
      <line x1="35" y1="12" x2="35" y2="22" />
      <line x1="50" y1="12" x2="50" y2="22" />
      <line x1="65" y1="12" x2="65" y2="22" />
      <line x1="35" y1="78" x2="35" y2="88" />
      <line x1="50" y1="78" x2="50" y2="88" />
      <line x1="65" y1="78" x2="65" y2="88" />
    </g>
    <rect x="22" y="22" width="56" height="56" rx="8" fill="url(#deepblueGrad)" stroke="var(--text-primary)" strokeWidth="3" />
    <rect x="34" y="34" width="32" height="32" rx="4" fill="var(--bg-elevated)" stroke="var(--accent)" strokeWidth="2" />
    <circle cx="50" cy="50" r="5" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="1.5" />
    <line x1="50" y1="38" x2="50" y2="45" stroke="var(--accent)" strokeWidth="1.5" />
    <line x1="50" y1="55" x2="50" y2="62" stroke="var(--accent)" strokeWidth="1.5" />
    <line x1="38" y1="50" x2="45" y2="50" stroke="var(--accent)" strokeWidth="1.5" />
    <line x1="55" y1="50" x2="62" y2="50" stroke="var(--accent)" strokeWidth="1.5" />
  </svg>
);

function renderBotAvatar(botId: string, className: string = "w-full h-full") {
  switch (botId) {
    case "sparky":
      return <SparkyIcon className={className} />;
    case "sofia":
      return <SofiaIcon className={className} />;
    case "carlsen":
      return <CarlsenIcon className={className} />;
    case "deepblue":
      return <DeepBlueIcon className={className} />;
    default:
      return <span className="text-sm">♟</span>;
  }
}

export default function PlayBotsPage() {
  const { boardTheme } = useBoardTheme();
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

  const [speechEnabled, setSpeechEnabled] = useState(true);

  const speakText = useCallback((text: string, botId: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !speechEnabled) return;
    
    // Clean emojis & extra brackets
    const cleanText = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "");
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    
    if (botId === "sparky") {
      utterance.pitch = 1.35;
      utterance.rate = 1.12;
      const v = voices.find(voice => voice.name.includes("Zira") || voice.name.includes("Samantha") || voice.name.includes("Google US"));
      if (v) utterance.voice = v;
    } else if (botId === "sofia") {
      utterance.pitch = 1.05;
      utterance.rate = 0.98;
      const v = voices.find(voice => voice.name.includes("Hazel") || voice.name.includes("Google UK") || voice.name.includes("Susan"));
      if (v) utterance.voice = v;
    } else if (botId === "carlsen") {
      utterance.pitch = 0.9;
      utterance.rate = 1.05;
      const v = voices.find(voice => voice.name.includes("David") || voice.name.includes("Google US Male") || voice.name.includes("Microsoft David"));
      if (v) utterance.voice = v;
    } else if (botId === "deepblue") {
      utterance.pitch = 0.55;
      utterance.rate = 0.92;
      const v = voices.find(voice => voice.name.includes("Ravi") || voice.name.includes("Zira") || voice.name.includes("Microsoft Zira"));
      if (v) utterance.voice = v;
    }
    
    window.speechSynthesis.speak(utterance);
  }, [speechEnabled]);

  // Dynamic Google SEO optimization & JSON-LD Game schema injection
  useEffect(() => {
    document.title = "Play Chess vs Computer - Free Luxury Stockfish Bots | ChessOnline";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Play premium chess online against advanced computer bots from beginner to GM. Powered by Stockfish 16, featuring real-time interactive AI voice coach commentary, tactile audio synthesis, and glassmorphic designs.');

    const schemaId = 'chess-bots-jsonld-schema';
    let scriptTag = document.getElementById(schemaId);
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.setAttribute('type', 'application/ld+json');
      scriptTag.innerHTML = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Game",
        "name": "Play Chess vs Computer Bots - ChessOnline",
        "description": "Play premium chess vs adaptive Stockfish bot personalities. Beginner to GM grandmaster difficulty options with live TTS speech.",
        "author": {
          "@type": "Organization",
          "name": "ChessOnline"
        },
        "genre": "Strategy Board Game",
        "playMode": "SinglePlayer",
        "gamePlatform": "Web Browser",
        "difficulty": ["Easy", "Medium", "Hard", "Grandmaster"]
      });
      document.head.appendChild(scriptTag);
    }

    return () => {
      const existing = document.getElementById(schemaId);
      if (existing) existing.remove();
    };
  }, []);

  // Initialize bot chat & speak intro
  useEffect(() => {
    setBotChat([selectedBot.intro]);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    const timer = setTimeout(() => {
      speakText(selectedBot.intro, selectedBot.id);
    }, 450);
    return () => {
      clearTimeout(timer);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedBot, speakText]);

  const addBotComment = useCallback((comment: string) => {
    setBotChat(prev => [...prev, comment]);
    speakText(comment, selectedBot.id);
    setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, [selectedBot.id, speakText]);

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
    <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden bg-salon font-montserrat">
      
      {/* ── GIANT, CENTERED CHESSBOARD COLUMN ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 min-h-0 overflow-hidden relative">
        
        {/* Ambient custom radial glow behind the board */}
        <div className="absolute inset-0 bg-[var(--primary)]/[0.02] blur-[100px] rounded-3xl pointer-events-none -z-10 animate-pulse" />

        {/* Dynamic Board Result Banner Overlay */}
        {gameResult && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 px-6 py-3 rounded-sm border-2 border-[var(--text-primary)] bg-[var(--bg-elevated)] shadow-[3px_3px_0px_var(--text-primary)] flex items-center gap-4 animate-bounce">
            <span className="font-black text-[var(--text-primary)] text-xs uppercase tracking-wider">
              🏁 Game Over: <span className="text-[var(--primary)]">{gameResult}</span>
            </span>
            <button
              onClick={resetGame}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline font-black uppercase tracking-wider cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Play Again
            </button>
          </div>
        )}

        {/* Board Aspect-Ratio Restricting Wrapper */}
        <div className="w-full h-full max-w-[580px] max-h-[580px] aspect-square flex justify-center items-center">
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
                  allowDragging: !gameResult && game.turn() === "w",
                }}
              />
            </div>
          </div>
        </div>
      </div>
 
      {/* ── CONSOLIDATED CONTROL DECK (RIGHT SIDEBAR) ── */}
      <div className="w-full lg:w-85 xl:w-96 flex flex-col border-t lg:border-t-0 lg:border-l-2 border-[var(--text-primary)] min-h-0 bg-[var(--bg-elevated)] flex-shrink-0">
        
        {/* ── MATCH DASHBOARD PANEL ── */}
        <div className="p-4 border-b-2 border-[var(--text-primary)] bg-[var(--bg-secondary)]/25 flex flex-col gap-3.5">
          <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider font-mono">Current Match</span>
          
          <div className="flex flex-col gap-2.5">
            {/* Opponent Bot Profile block */}
            <div className="flex items-center justify-between p-2.5 rounded-sm border-2 border-[var(--text-primary)] bg-white shadow-[2px_2px_0px_var(--text-primary)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-[var(--bg-secondary)] border-2 border-[var(--text-primary)] flex items-center justify-center p-0.5 shadow-sm">
                  {renderBotAvatar(selectedBot.id, "w-full h-full")}
                </div>
                <div>
                  <span className="text-xs font-black text-[var(--text-primary)] block leading-snug uppercase tracking-tight">{selectedBot.name}</span>
                  <span className="text-[9px] text-[var(--text-muted)] font-bold">Opponent • ELO {selectedBot.rating}</span>
                </div>
              </div>
              <div>
                {isBotThinking ? (
                  <span className="text-[9px] bg-amber-50 border-2 border-amber-800 text-amber-800 font-bold px-2 py-0.5 rounded-sm animate-pulse flex items-center gap-1">
                    <Cpu className="w-2.5 h-2.5 animate-spin" /> thinking...
                  </span>
                ) : game.turn() === 'b' && !gameResult ? (
                  <span className="text-[9px] bg-[var(--primary)] border-2 border-[var(--text-primary)] text-white font-bold px-2 py-0.5 rounded-sm animate-pulse uppercase tracking-wider">Their Turn</span>
                ) : (
                  <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase">Waiting</span>
                )}
              </div>
            </div>

            {/* White Player Profile block */}
            <div className="flex items-center justify-between p-2.5 rounded-sm border-2 border-[var(--text-primary)] bg-white shadow-[2px_2px_0px_var(--text-primary)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-[var(--primary)] border-2 border-[var(--text-primary)] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  👤
                </div>
                <div>
                  <span className="text-xs font-black text-[var(--text-primary)] block leading-snug uppercase tracking-tight">You</span>
                  <span className="text-[9px] text-[var(--text-muted)] font-bold">White Player</span>
                </div>
              </div>
              <div>
                {game.turn() === 'w' && !gameResult && !isBotThinking ? (
                  <span className="text-[9px] bg-emerald-50 border-2 border-emerald-800 text-emerald-800 font-bold px-2 py-0.5 rounded-sm animate-pulse uppercase tracking-wider">Your Turn</span>
                ) : (
                  <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase">Waiting</span>
                )}
              </div>
            </div>
          </div>

          {/* Reset Board Action */}
          <button
            onClick={resetGame}
            className="btn-secondary w-full py-2.5 text-xs font-black uppercase flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Board
          </button>
        </div>

        {/* ── BOT SELECTOR LIST ── */}
        <div className="p-4 border-b-2 border-[var(--text-primary)] bg-[var(--bg-secondary)]/25 flex-shrink-0 flex items-center gap-2">
          <Bot className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider font-jost">Select AI Opponent</span>
        </div>
 
        <div className="p-4 flex flex-col gap-3 border-b-2 border-[var(--text-primary)] overflow-y-auto max-h-[180px] lg:max-h-[220px] flex-shrink-0 select-none">
          {BOTS.map((bot) => {
            const isSel = selectedBot.id === bot.id
            return (
              <button
                key={bot.id}
                onClick={() => selectBot(bot)}
                className={`flex items-center justify-between p-2 rounded-sm text-left border-2 border-[var(--text-primary)] transition-all cursor-pointer ${
                  isSel
                    ? 'bg-[var(--primary)] text-white shadow-[2px_2px_0px_var(--text-primary)] -translate-y-0.5'
                    : 'border-[var(--text-primary)] bg-white hover:bg-[var(--bg-secondary)]/30 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--text-primary)] shadow-[2px_2px_0px_var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-sm border-2 border-[var(--text-primary)] flex items-center justify-center p-0.5 ${
                    isSel ? 'bg-white' : bot.colorClass
                  }`}>
                    {renderBotAvatar(bot.id, "w-full h-full")}
                  </div>
                  <div>
                    <span className={`text-xs font-black block leading-snug uppercase tracking-tight ${isSel ? 'text-white' : 'text-[var(--text-primary)]'}`}>{bot.name}</span>
                    <span className={`text-[9px] font-bold ${isSel ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>Rating: {bot.rating}</span>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isSel ? 'translate-x-0.5 text-white' : 'text-[var(--text-muted)]'}`} />
              </button>
            )
          })}
        </div>

        {/* ── BOT CHAT & MOVES SPLIT PANEL ── */}
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--bg-secondary)]/10">
          
          {/* Bot commentary */}
          <div className="flex-1 flex flex-col min-h-0 border-b-2 border-[var(--text-primary)]">
            <div className="px-4 py-2.5 border-b-2 border-[var(--text-primary)] flex items-center justify-between bg-[var(--bg-secondary)]/25">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)] font-jost">Bot Commentary</span>
              </div>
              
              {/* Voice controls */}
              <div className="flex items-center gap-2.5">
                {speechEnabled && (
                  <div className="flex items-center gap-0.5 h-2 px-1">
                    <span className="w-[1.5px] h-full bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0.1s', animationDuration: '0.5s' }} />
                    <span className="w-[1.5px] h-full bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0.3s', animationDuration: '0.7s' }} />
                    <span className="w-[1.5px] h-full bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '0.6s' }} />
                  </div>
                )}
                
                <button
                  onClick={() => {
                    const nextVal = !speechEnabled;
                    setSpeechEnabled(nextVal);
                    if (!nextVal) {
                      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                      }
                    }
                  }}
                  className={`p-1.5 rounded-sm border-2 transition-all active:scale-95 cursor-pointer ${
                    speechEnabled
                      ? 'border-[var(--text-primary)] bg-[var(--primary)] text-white shadow-[1px_1px_0px_var(--text-primary)]'
                      : 'border-[var(--text-primary)] bg-white text-[var(--text-muted)] shadow-[1px_1px_0px_var(--text-primary)] hover:bg-[var(--bg-secondary)]/50'
                  }`}
                  title={speechEnabled ? "Mute Voice" : "Unmute Voice"}
                >
                  {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5">
              {botChat.map((chat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 max-w-[85%] self-start animate-fade-in">
                  <div className="w-6 h-6 rounded-sm bg-white border-2 border-[var(--text-primary)] flex items-center justify-center p-0.5 flex-shrink-0 shadow-[1px_1px_0px_var(--text-primary)]">
                    {renderBotAvatar(selectedBot.id, "w-full h-full")}
                  </div>
                  <div className="bg-white border-2 border-[var(--text-primary)] rounded-sm p-3 shadow-[2px_2px_0px_var(--text-primary)]">
                    <span className="block text-[9px] font-black text-[var(--primary)] mb-1 uppercase tracking-wider">{selectedBot.name}</span>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-bold italic">
                      "{chat}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Move History */}
          <div className="h-44 flex flex-col min-h-0 flex-shrink-0">
            <div className="px-4 py-2.5 border-b-2 border-[var(--text-primary)] flex items-center gap-2 bg-[var(--bg-secondary)]/25">
              <Zap className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)] font-jost">Move History</span>
            </div>

            <div ref={movesRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5 bg-white select-none">
              {movePairs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center py-4">
                  <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider">No moves recorded yet.<br />Make a move as White!</p>
                </div>
              ) : (
                movePairs.map((pair, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1 px-2.5 rounded-sm hover:bg-[var(--bg-secondary)]/40 border-b border-[var(--text-primary)]/10 font-montserrat">
                    <span className="text-[var(--text-muted)] w-6 flex-shrink-0 tabular-nums font-bold">{i + 1}.</span>
                    <span className="flex-1 font-mono font-black text-[var(--text-primary)]">{pair[0]}</span>
                    <span className="flex-1 font-mono text-[var(--text-secondary)] font-bold">{pair[1] ?? '...'}</span>
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
