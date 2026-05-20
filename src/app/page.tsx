import HeroChessBoard from "@/components/HeroChessBoard";
import HeroBg from "@/components/HeroBg";
import { Play, ChevronDown, Users } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "ChessOnline - Competitive Chess, Reimagined",
  description: "Experience modern chess without distractions. Real-time gameplay, AI analysis, and a luxury digital interface.",
};

export default function Home() {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-main)]">
      
      {/* Client-side background image — swaps correctly based on theme */}
      <HeroBg />

      {/* Controlled Asymmetry: 12-Column Grid */}
      <div className="max-w-[1350px] mx-auto w-full px-6 md:px-12 py-10 lg:py-0 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        
        {/* Left Side: Hero Text & Buttons */}
        <div className="lg:col-span-5 flex flex-col items-start space-y-4 order-first max-w-md lg:pr-4">
          {/* Subtitle / Tag */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-[1.5px] bg-[#2563EB]/40"></div>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-[#2563EB] dark:text-blue-400">REAL-TIME CHESS</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-jost font-medium tracking-tight text-[var(--text-primary)] leading-[1.08]">
            Play chess online<br />
            <span className="text-[#2563EB] font-semibold">without distractions.</span>
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] font-normal leading-relaxed max-w-[390px] pt-1">
            Experience a refined, quiet digital environment built for the pure game. Real-time matches, elite puzzles, and zero clutter.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-3 font-montserrat w-full sm:w-auto">
            <Link
              href="/play"
              className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium text-xs px-6 py-3.5 rounded-xl border border-blue-600 transition-all shadow-[0_4px_16px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2.5 w-full sm:w-[170px]"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> Play Now
            </Link>
            <Link
              href="/play/local"
              className="bg-white dark:bg-black/[0.15] hover:bg-slate-50 dark:hover:bg-black/[0.25] border border-[var(--border-primary)] text-[var(--text-primary)] font-medium text-xs px-6 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 w-full sm:w-[170px]"
            >
              <Users className="w-3.5 h-3.5 text-[#2563EB]" /> Invite a Friend
            </Link>
          </div>
        </div>

        {/* Right Side: The Rotated 3D Board Panel */}
        <div className="lg:col-span-7 flex justify-center lg:justify-end w-full relative order-last lg:pl-10">
          <HeroChessBoard />
        </div>

      </div>

      {/* Faint Bottom Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-45 pointer-events-none hidden md:flex">
        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] animate-bounce" />
        <span className="text-[8px] font-light tracking-[0.25em] text-[var(--text-muted)] uppercase">Scroll to explore</span>
      </div>

    </div>
  );
}
