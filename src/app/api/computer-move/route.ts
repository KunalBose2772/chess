import { NextRequest, NextResponse } from "next/server";
import { Chess } from "chess.js";

export async function POST(req: NextRequest) {
  try {
    const { fen, level = 10 } = await req.json();

    if (!fen) {
      return NextResponse.json({ error: "FEN string is required" }, { status: 400 });
    }

    try {
      // 1. Try free public stockfish API
      const depth = level * 2; // Map level 1-10 to depth 2-20
      const apiUrl = `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(fen)}&depth=${Math.min(depth, 15)}`;
      
      const response = await fetch(apiUrl, { timeout: 3000 } as any);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.bestmove) {
          const moveParts = data.bestmove.split(" ");
          if (moveParts.length >= 2) {
            return NextResponse.json({ bestMove: moveParts[1] });
          }
        }
      }
    } catch (e) {
      console.warn("Stockfish API failed, falling back to random move", e);
    }

    // 2. Fallback to random valid move
    const game = new Chess(fen);
    const moves = game.moves({ verbose: true });
    if (moves.length > 0) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return NextResponse.json({ bestMove: randomMove.from + randomMove.to + (randomMove.promotion || "") });
    }

    return NextResponse.json({ error: "Failed to compute best move" }, { status: 500 });
  } catch (error) {
    console.error("Computer Move API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
