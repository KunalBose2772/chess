"use client";

import React from "react";

interface AnimatedStreakFlameProps {
  className?: string;
  size?: number;
}

export default function AnimatedStreakFlame({ className = "", size = 120 }: AnimatedStreakFlameProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Dynamic ambient radial backdrop glow */}
      <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-xl animate-pulse -z-10" />
      
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible select-none"
      >
        <defs>
          {/* Flame Gradients */}
          <linearGradient id="outerFlameGrad" x1="50" y1="95" x2="50" y2="5" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EA580C" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#F97316" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </linearGradient>
          
          <linearGradient id="middleFlameGrad" x1="50" y1="90" x2="50" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="50%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
          
          <linearGradient id="innerFlameGrad" x1="50" y1="85" x2="50" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="60%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#FEF08A" />
          </linearGradient>
          
          {/* Glow Filters */}
          <filter id="flameGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          
          <filter id="pawnShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#7C2D12" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Embedded micro-animations inside the SVG for perfect cross-platform render safety */}
        <style>{`
          @keyframes swayOuter {
            0% { transform: scale(1) rotate(-1.5deg); }
            50% { transform: scale(1.02) rotate(1.5deg); }
            100% { transform: scale(1) rotate(-1.5deg); }
          }
          @keyframes swayMiddle {
            0% { transform: translateY(0px) scale(1) rotate(1deg); }
            50% { transform: translateY(-2px) scale(1.04) rotate(-2deg); }
            100% { transform: translateY(0px) scale(1) rotate(1deg); }
          }
          @keyframes pulseInner {
            0% { transform: scale(0.98); opacity: 0.9; }
            50% { transform: scale(1.06); opacity: 1; }
            100% { transform: scale(0.98); opacity: 0.9; }
          }
          @keyframes floatSpark1 {
            0% { transform: translate(0px, 15px) scale(0); opacity: 0; }
            30% { opacity: 0.8; }
            80% { opacity: 0.4; }
            100% { transform: translate(-8px, -25px) scale(1.3); opacity: 0; }
          }
          @keyframes floatSpark2 {
            0% { transform: translate(0px, 10px) scale(0); opacity: 0; }
            40% { opacity: 0.9; }
            90% { opacity: 0.2; }
            100% { transform: translate(8px, -35px) scale(1.1); opacity: 0; }
          }
          @keyframes floatSpark3 {
            0% { transform: translate(0px, 20px) scale(0); opacity: 0; }
            50% { opacity: 0.7; }
            100% { transform: translate(-4px, -18px) scale(1); opacity: 0; }
          }
          
          .outer-layer {
            animation: swayOuter 4s ease-in-out infinite;
            transform-origin: bottom center;
          }
          .middle-layer {
            animation: swayMiddle 3s ease-in-out infinite;
            transform-origin: bottom center;
          }
          .inner-layer {
            animation: pulseInner 1.6s ease-in-out infinite;
            transform-origin: bottom center;
          }
          .spark-a {
            animation: floatSpark1 2.2s ease-out infinite;
          }
          .spark-b {
            animation: floatSpark2 2.8s ease-out infinite;
            animation-delay: 0.7s;
          }
          .spark-c {
            animation: floatSpark3 2s ease-out infinite;
            animation-delay: 1.3s;
          }
        `}</style>

        {/* ─── Animated Rising Sparks ─── */}
        <circle cx="34" cy="45" r="1.5" fill="#FBBF24" className="spark-a" />
        <circle cx="66" cy="40" r="1.2" fill="#F59E0B" className="spark-b" />
        <circle cx="50" cy="30" r="1.8" fill="#FEF08A" className="spark-c" />

        {/* ─── Layer 1: Outer Flame (Sways slowly) ─── */}
        <path
          d="M 50 95 C 22 95, 12 75, 12 55 C 12 35, 34 15, 50 3 C 66 15, 88 35, 88 55 C 88 75, 78 95, 50 95 Z"
          fill="url(#outerFlameGrad)"
          className="outer-layer"
          filter="url(#flameGlow)"
        />

        {/* ─── Layer 2: Middle Flame (Floats and sways offset) ─── */}
        <path
          d="M 50 90 C 26 90, 18 72, 18 55 C 18 38, 36 20, 50 8 C 64 20, 82 38, 82 55 C 82 72, 74 90, 50 90 Z"
          fill="url(#middleFlameGrad)"
          className="middle-layer"
        />

        {/* ─── Layer 3: Inner Core Flame (Pulses dynamically) ─── */}
        <path
          d="M 50 84 C 32 84, 25 70, 25 55 C 25 42, 38 28, 50 16 C 62 28, 75 42, 75 55 C 75 70, 68 84, 50 84 Z"
          fill="url(#innerFlameGrad)"
          className="inner-layer"
        />

        {/* ─── Layer 4: The Hero Chess Pawn Silhouette (Standing solid in core) ─── */}
        <g filter="url(#pawnShadow)" className="pawn-group">
          {/* Pawn Crown / Head */}
          <circle cx="50" cy="51" r="7.5" fill="#FFFFFF" />
          
          {/* Collar ring */}
          <ellipse cx="50" cy="60.5" rx="5.5" ry="1.5" fill="#FFFFFF" />
          
          {/* Body structure */}
          <path 
            d="M 45 61 C 45 61, 44 71.5, 40 76.5 C 44 76.5, 56 76.5, 60 76.5 C 56 71.5, 55 61, 55 61 Z" 
            fill="#FFFFFF" 
          />
          
          {/* Double step solid base */}
          <path 
            d="M 37 77 C 37 75.5, 63 75.5, 63 77 C 63 78, 37 78, 37 77 Z" 
            fill="#FFFFFF" 
          />
          <path 
            d="M 35 79 C 35 77.5, 65 77.5, 65 79 C 65 80.5, 35 80.5, 35 79 Z" 
            fill="#FFFFFF" 
          />
        </g>
      </svg>
    </div>
  );
}
