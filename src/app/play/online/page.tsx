import MatchmakingLobby from "@/components/MatchmakingLobby";
import { Swords } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play Chess Online — ChessOnline",
  description: "Find opponents by rating and play real-time chess. Bullet, Blitz, Rapid, and Classical.",
};

export default function PlayOnlinePage() {
  return (
    <div className="page-section">
      <div className="page-spot-tl" />
      <div className="page-spot-br" />

      <div className="page-container" style={{ maxWidth: 860 }}>
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="section-label flex items-center gap-2">
            <Swords className="w-3.5 h-3.5" /> Matchmaking
          </span>
          <h1 className="page-heading">Play Online</h1>
          <p className="page-subheading text-center mx-auto">
            Matched by rating. Real-time moves. Live ELO updates after every game.
          </p>
        </div>

        <MatchmakingLobby />
      </div>
    </div>
  );
}
