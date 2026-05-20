import MatchmakingLobby from "@/components/MatchmakingLobby";

export const metadata = {
  title: "Play Chess Online - ChessOnline",
  description: "Find opponents by rating and play real-time chess. Bullet, Blitz, Rapid, and Classical.",
};

export default function PlayPage() {
  return (
    <div className="flex flex-col flex-1 w-full px-6 py-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold font-outfit text-white">
            Play <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Online</span>
          </h1>
          <p className="text-slate-400 mt-3 text-lg">Matched by rating. Real-time moves. Live ELO updates.</p>
        </div>
        <MatchmakingLobby />
      </div>
    </div>
  );
}
