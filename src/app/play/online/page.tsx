import MatchmakingLobby from "@/components/MatchmakingLobby";
import { Swords } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Play Chess Online — ChessOnline",
  description: "Find opponents by rating and play real-time chess. Bullet, Blitz, Rapid, and Classical.",
};

export default function PlayOnlinePage() {
  return (
    <div className="w-full flex-1 flex flex-col bg-salon font-montserrat min-h-screen py-10 px-6">
      <div className="max-w-[860px] w-full mx-auto flex flex-col gap-8 flex-1">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="section-label flex items-center gap-2">
            <Swords className="w-3.5 h-3.5 text-[var(--primary)]" /> Matchmaking
          </span>
          <h1 className="text-3xl lg:text-4xl font-black text-[var(--text-primary)] font-jost uppercase tracking-tight">Play Online</h1>
          <p className="text-sm font-bold text-[var(--text-muted)] text-center max-w-lg leading-relaxed">
            Matched by rating. Real-time moves. Live ELO updates after every game.
          </p>
        </div>

        <MatchmakingLobby />
      </div>
    </div>
  );
}
