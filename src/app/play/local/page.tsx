import InteractiveChessBoard from "@/components/InteractiveChessBoard";

export const metadata = {
  title: "Local Game - ChessOnline",
  description: "Play a local pass-and-play chess game with a friend.",
};

export default function LocalPlayPage() {
  return (
    <div className="flex flex-col flex-1 w-full p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-bold font-outfit text-white">
            Local <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Game</span>
          </h1>
          <p className="text-slate-400 mt-2">Pass-and-play with a friend on the same device.</p>
        </div>
        <InteractiveChessBoard />
      </div>
    </div>
  );
}
