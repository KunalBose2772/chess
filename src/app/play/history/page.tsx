'use client'

import { History, Calendar, Play, RotateCcw, Swords, Search, Star, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { useBoardTheme } from "@/components/BoardThemeProvider";

interface GameHistoryItem {
  id: number;
  opponent: string;
  opponentRating: number;
  playerColor: "White" | "Black";
  result: "Win" | "Loss" | "Draw";
  eloChange: string;
  totalMoves: number;
  date: string;
  timeControl: string;
  moves: string[]; // List of SAN moves for interactive review
}

const MOCK_HISTORY: GameHistoryItem[] = [
  {
    id: 1045,
    opponent: "GrandmasterCarlsen",
    opponentRating: 2842,
    playerColor: "White",
    result: "Win",
    eloChange: "+32 ELO",
    totalMoves: 42,
    date: "May 18, 2026",
    timeControl: "3 min Blitz",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7", "Re1", "b5", "Bb3", "d6", "c3", "O-O", "h3", "Nb8", "d4", "Nbd7", "Nbd2", "Bb7", "Bc2", "Re8", "Nf1", "Bf8", "Ng3", "g6", "Bg5", "h6", "Bd2", "Bg7", "a4", "c5", "d5", "c4", "b4", "cxb3", "Bxb3", "Nc5", "Bc2", "Qc7"]
  },
  {
    id: 1022,
    opponent: "CheckmateCharly",
    opponentRating: 1530,
    playerColor: "Black",
    result: "Win",
    eloChange: "+15 ELO",
    totalMoves: 28,
    date: "May 15, 2026",
    timeControl: "10 min Rapid",
    moves: ["e4", "c5", "Nf3", "e6", "d4", "cxd4", "Nxd4", "a6", "Bd3", "Nf6", "O-O", "Qc7", "Qe2", "d6", "c4", "g6", "Nc3", "Bg7", "Nf3", "O-O", "Bf4", "Nc6", "Rac1", "e5", "Bg5", "Bg4", "Qe3", "Bxf3"]
  },
  {
    id: 994,
    opponent: "SofiaPuzzles",
    opponentRating: 1980,
    playerColor: "White",
    result: "Loss",
    eloChange: "-12 ELO",
    totalMoves: 35,
    date: "May 12, 2026",
    timeControl: "5 min Blitz",
    moves: ["d4", "Nf6", "c4", "e6", "Nf3", "b6", "g3", "Ba6", "b3", "Bb4+", "Bd2", "Be7", "Bg2", "c6", "Bc3", "d5", "Ne5", "Nfd7", "Nxd7", "Nxd7", "Nd2", "O-O", "O-O", "Rc8", "e4", "c5", "exd5", "exd5", "Bxd5", "Nf6", "dxc5", "Nxd5", "cxd5", "Bxf1", "Qxf1"]
  },
  {
    id: 980,
    opponent: "TacticalGenius",
    opponentRating: 2110,
    playerColor: "Black",
    result: "Draw",
    eloChange: "+0 ELO",
    totalMoves: 51,
    date: "May 09, 2026",
    timeControl: "10 min Rapid",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6", "d3", "d6", "O-O", "a6", "a4", "Ba7", "Re1", "O-O", "h3", "Ne7", "d4", "Ng6", "Nbd2", "Re8", "Bd3", "Nf4", "Bc2", "c6", "Nf1", "Ng6", "Ng3", "Qc7", "Bg5"]
  }
];

export default function PlayHistoryPage() {
  const { boardTheme } = useBoardTheme();
  const { user } = useAuthStore();
  const [history, setHistory] = useState<GameHistoryItem[]>(MOCK_HISTORY);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Selected game for interactive review
  const [activeReviewGame, setActiveReviewGame] = useState<GameHistoryItem | null>(null);
  const [reviewChess, setReviewChess] = useState<Chess>(new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1); // -1 = start position

  useEffect(() => {
    ;(async () => {
      setLoading(true);
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();

      if (supabaseUser) {
        // Attempt to fetch games played by this user
        const { data: gamesData } = await supabase
          .from('games')
          .select(`
            id, white_id, black_id, status, fen, created_at,
            white_profile:profiles!games_white_id_fkey(username, rating),
            black_profile:profiles!games_black_id_fkey(username, rating),
            moves_rel:moves(san, move_number)
          `)
          .or(`white_id.eq.${supabaseUser.id},black_id.eq.${supabaseUser.id}`)
          .order('created_at', { ascending: false });

        if (gamesData && gamesData.length > 0) {
          const parsedHistory: GameHistoryItem[] = gamesData.map((g: any) => {
            const isWhite = g.white_id === supabaseUser.id;
            const myProfile = isWhite ? g.white_profile : g.black_profile;
            const oppProfile = isWhite ? g.black_profile : g.white_profile;
            
            // Format moves
            const movesArr = g.moves_rel 
              ? g.moves_rel.sort((a: any, b: any) => a.move_number - b.move_number).map((m: any) => m.san)
              : [];
            
            // Format result
            let gameResult: "Win" | "Loss" | "Draw" = "Draw";
            if (g.status === "1-0" && isWhite) gameResult = "Win";
            else if (g.status === "0-1" && !isWhite) gameResult = "Win";
            else if (g.status === "1-0" && !isWhite) gameResult = "Loss";
            else if (g.status === "0-1" && isWhite) gameResult = "Loss";

            return {
              id: g.id,
              opponent: oppProfile?.username ?? "Anonymous",
              opponentRating: oppProfile?.rating ?? 1500,
              playerColor: isWhite ? "White" : "Black",
              result: gameResult,
              eloChange: gameResult === "Win" ? "+15 ELO" : gameResult === "Loss" ? "-12 ELO" : "+0 ELO",
              totalMoves: movesArr.length,
              date: new Date(g.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              timeControl: "10 min Rapid",
              moves: movesArr
            };
          });

          setHistory(parsedHistory);
        }
      }
      setLoading(false);
    })();
  }, [supabase]);

  // Handle active game review updates
  const startReview = (gameItem: GameHistoryItem) => {
    setActiveReviewGame(gameItem);
    const newBoard = new Chess();
    setReviewChess(newBoard);
    setCurrentMoveIndex(-1); // Starting position
  };

  const handleNextMove = () => {
    if (!activeReviewGame || currentMoveIndex >= activeReviewGame.moves.length - 1) return;
    
    const nextIdx = currentMoveIndex + 1;
    const nextMove = activeReviewGame.moves[nextIdx];
    
    try {
      const copy = new Chess(reviewChess.fen());
      copy.move(nextMove);
      setReviewChess(copy);
      setCurrentMoveIndex(nextIdx);
    } catch (e) {
      console.error("Invalid move inside history replay", e);
    }
  };

  const handlePrevMove = () => {
    if (!activeReviewGame || currentMoveIndex < 0) return;
    
    const prevIdx = currentMoveIndex - 1;
    const freshGame = new Chess();
    
    // Replay moves up to the previous index
    for (let i = 0; i <= prevIdx; i++) {
      try {
        freshGame.move(activeReviewGame.moves[i]);
      } catch (e) {
        console.error("Invalid replay history step", e);
      }
    }
    
    setReviewChess(freshGame);
    setCurrentMoveIndex(prevIdx);
  };

  const handleResetReplay = () => {
    if (!activeReviewGame) return;
    setReviewChess(new Chess());
    setCurrentMoveIndex(-1);
  };

  const filteredHistory = history.filter((h) => 
    h.opponent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.result.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-section">
      <div className="page-spot-tl" />
      <div className="page-spot-br" />

      <div className="page-container max-w-[1200px] gap-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[var(--border-primary)]">
          <div className="flex flex-col gap-2">
            <span className="section-label flex items-center gap-2">
              <History className="w-3.5 h-3.5" /> Ledger Terminal
            </span>
            <h1 className="page-heading">Game History</h1>
            <p className="page-subheading max-w-[650px] text-xs">
              Review details of your completed matches. Click on any record to open the interactive sandbox review board.
            </p>
          </div>
          
          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by opponent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-secondary)]/50 border border-[var(--border-primary)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
        </div>

        {/* 2-Column Ledger & Live analysis board */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* History Matches Table */}
          <div className={`flex flex-col gap-4 transition-all duration-300 ${activeReviewGame ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
            <h2 className="text-base font-bold font-jost text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <Swords className="w-4 h-4 text-[var(--primary)]" /> Past Matches Table
            </h2>

            {loading ? (
              <div className="card-elevated p-8 text-center text-xs text-[var(--text-muted)] animate-pulse">
                Syncing ledger entries from Supabase database…
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="card-elevated p-8 text-center text-xs text-[var(--text-muted)]">
                No past matches found. Jump into Play Online to start your ledger record!
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredHistory.map((gameItem) => (
                  <button
                    key={gameItem.id}
                    onClick={() => startReview(gameItem)}
                    className={`card-elevated flex items-center justify-between p-4 text-left transition-all border cursor-pointer hover:border-[var(--border-hover)] ${
                      activeReviewGame?.id === gameItem.id 
                        ? 'border-[var(--primary)] bg-[var(--primary)]/[0.02]' 
                        : 'border-[var(--border-primary)] bg-[var(--bg-surface)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm flex-shrink-0 ${
                        gameItem.result === 'Win' 
                          ? 'bg-emerald-500' 
                          : gameItem.result === 'Loss' 
                          ? 'bg-red-500' 
                          : 'bg-slate-400 dark:bg-slate-700'
                      }`}>
                        {gameItem.result[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-[var(--text-primary)]">vs {gameItem.opponent}</span>
                          <span className="text-[9px] bg-[var(--bg-secondary)] text-[var(--text-muted)] font-semibold px-1.5 py-0.5 rounded-lg border border-[var(--border-primary)]">⚡ {gameItem.opponentRating}</span>
                        </div>
                        <p className="text-[9.5px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1">
                          <span>{gameItem.timeControl}</span>
                          <span>•</span>
                          <span className={`${gameItem.playerColor === 'White' ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]'}`}>{gameItem.playerColor}</span>
                          <span>•</span>
                          <span>{gameItem.totalMoves} moves</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <span className={`text-xs font-bold block ${
                          gameItem.result === 'Win' ? 'text-emerald-500' : gameItem.result === 'Loss' ? 'text-red-500' : 'text-[var(--text-muted)]'
                        }`}>{gameItem.result}</span>
                        <span className="text-[9px] font-mono font-semibold text-emerald-500">{gameItem.eloChange}</span>
                      </div>
                      
                      <div className="text-[10px] text-[var(--text-muted)] italic font-light font-mono text-right hidden sm:block">
                        {gameItem.date}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Replay Sandbox (Only displays when a game is selected!) */}
          {activeReviewGame && (
            <div className="lg:col-span-6 flex flex-col gap-4 animate-slide-in">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold font-jost text-[var(--text-primary)] flex items-center gap-2">
                  <Play className="w-4 h-4 text-amber-500 fill-current" /> Interactive Sandbox Replay
                </h2>
                <button
                  onClick={() => setActiveReviewGame(null)}
                  className="text-xs text-[var(--primary)] hover:underline font-semibold cursor-pointer"
                >
                  Close Replay
                </button>
              </div>

              <div className="card-elevated p-5 flex flex-col sm:flex-row gap-5 relative overflow-hidden">
                {/* Chessboard */}
                <div className="w-full sm:w-[220px] aspect-square flex-shrink-0 rounded-xl overflow-hidden shadow-inner border border-[var(--border-primary)] bg-[var(--bg-secondary)]/10">
                  <Chessboard
                    options={{
                      position: reviewChess.fen(),
                      boardOrientation: activeReviewGame.playerColor.toLowerCase() as any,
                      darkSquareStyle: { backgroundColor: boardTheme.dark },
                      lightSquareStyle: { backgroundColor: boardTheme.light },
                      animationDurationInMs: 150,
                      allowDragging: false,
                    }}
                  />
                </div>

                {/* Replay Controls & Moves list */}
                <div className="flex-1 flex flex-col justify-between min-h-[220px]">
                  
                  {/* Ledger Header */}
                  <div className="pb-2 border-b border-[var(--border-primary)]">
                    <span className="section-label">Analysis Board</span>
                    <h3 className="text-xs font-bold text-[var(--text-primary)] leading-snug mt-1">Match #{activeReviewGame.id} Replay</h3>
                    <p className="text-[9px] text-[var(--text-muted)] mt-0.5">
                      Playing moves: <span className="font-semibold text-[var(--text-primary)] font-mono">{currentMoveIndex + 1} / {activeReviewGame.moves.length}</span>
                    </p>
                  </div>

                  {/* Move Step Slider Button controls */}
                  <div className="flex items-center justify-center gap-3.5 my-3 select-none">
                    <button
                      onClick={handleResetReplay}
                      disabled={currentMoveIndex === -1}
                      className="w-8 h-8 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)]/30 flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handlePrevMove}
                      disabled={currentMoveIndex === -1}
                      className="w-8 h-8 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)]/30 flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextMove}
                      disabled={currentMoveIndex === activeReviewGame.moves.length - 1}
                      className="w-8 h-8 rounded-full border border-[var(--border-primary)] bg-[var(--bg-secondary)]/30 flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Mini scrolling list of moves */}
                  <div className="h-20 overflow-y-auto bg-black/[0.02] dark:bg-white/[0.01] rounded-xl border border-[var(--border-primary)] p-2">
                    <div className="flex flex-wrap gap-1.5">
                      {activeReviewGame.moves.map((mv, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            // Replay up to this index
                            const boardCopy = new Chess();
                            for (let i = 0; i <= idx; i++) {
                              try { boardCopy.move(activeReviewGame.moves[i]); } catch {}
                            }
                            setReviewChess(boardCopy);
                            setCurrentMoveIndex(idx);
                          }}
                          className={`text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded transition-all cursor-pointer ${
                            currentMoveIndex === idx
                              ? 'bg-[var(--primary)] text-white'
                              : 'bg-[var(--bg-secondary)]/50 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]'
                          }`}
                        >
                          {idx % 2 === 0 ? `${(idx/2)+1}.` : ''}{mv}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
