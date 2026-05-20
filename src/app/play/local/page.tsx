import InteractiveChessBoard from "@/components/InteractiveChessBoard";
import { Swords } from "lucide-react";

export const metadata = {
  title: "Local Game — ChessOnline",
  description: "Play a local pass-and-play chess game with a friend.",
};

export default function LocalPlayPage() {
  return (
    /* No padding — InteractiveChessBoard fills the full viewport */
    <div className="w-full h-full flex flex-col overflow-hidden bg-[var(--bg-main)]">
      <InteractiveChessBoard />
    </div>
  );
}
