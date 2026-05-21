'use client'

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Loader2, Eye, EyeOff, ChevronLeft, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [formStep, setFormStep] = useState<"options" | "email_form">("options");
  
  // Auth Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const supabase = createClient();
  const { refreshProfile } = useAuthStore();

  // Persistent, single stateful AudioContext to unlock browser audio natively
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Initialize and bind active AudioContext on page load
  useEffect(() => {
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtxClass) {
      const ctx = new AudioCtxClass();
      setAudioCtx(ctx);
      audioCtxRef.current = ctx;

      // Click or Hover listener to unlock browser audio autoplay blocks
      const unlockAudio = () => {
        if (ctx.state === "suspended") {
          ctx.resume().then(() => {
            console.log("Onboarding Audio Engine engaged.");
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

  // ── SOUND SYNTHESIS ENGINE (Stateful Web Audio API) ───────────────────
  
  // Wood click sound - replicates a real chess piece tapping on wood
  const playWoodTap = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = "triangle";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.07);
      
      gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {
      console.log("Audio play blocked/failed", e);
    }
  };

  // Crystalline success chime - plays on registration success
  const playSuccessChime = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime + start);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Arpeggiated clean C-Major chord (C5 -> E5 -> G5 -> C6)
      playTone(523.25, 0, 0.5);      // C5
      playTone(659.25, 0.06, 0.5);   // E5
      playTone(783.99, 0.12, 0.5);   // G5
      playTone(1046.50, 0.18, 0.6);  // C6
    } catch (e) {
      console.log("Audio chime blocked", e);
    }
  };

  // Handle Supabase sign-up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    playWoodTap();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      playSuccessChime();
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(async () => {
        await refreshProfile();
        router.push("/play");
      }, 1500);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto py-16 px-6 bg-[#04060A]">
      
      {/* ── AMBIENT BACKGROUND ────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#04060A]">
        <img 
          src="/images/hero-dark.png" 
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-[0.15] mix-blend-screen"
        />
        <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-600/[0.03] blur-[140px]" />
        <div className="absolute bottom-[15%] right-[20%] w-[500px] h-[500px] rounded-full bg-indigo-600/[0.03] blur-[140px]" />
      </div>

      {/* Header bar featuring our official logo */}
      <header className="absolute top-0 left-0 right-0 z-20 px-8 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2" onClick={playWoodTap}>
          <img 
            src="/images/logo-dark.png" 
            alt="ChessOnline Logo" 
            className="w-[140px] h-auto object-contain opacity-95 hover:opacity-100 transition-opacity" 
          />
        </Link>
        <Link 
          href="/play" 
          onClick={playWoodTap}
          className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          Sign In
        </Link>
      </header>

      {/* Main Console Wrapper */}
      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center gap-6">
        
        {/* Animated Bobbing 3D Sapphire Knight Graphic (Custom branded, premium) */}
        <div className="relative w-28 h-28 flex items-center justify-center mt-4">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10 w-full h-full flex items-center justify-center"
          >
            {/* Ambient blue/indigo glow behind the knight */}
            <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full scale-75 animate-pulse" />
            
            {/* Sparkles */}
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-blue-400 animate-bounce" />
            
            {/* Majestic custom royal Knight vector graphic */}
            <svg viewBox="0 0 100 100" className="w-20 h-20 filter drop-shadow-[0_8px_20px_rgba(37,99,235,0.4)]">
              {/* Grandmaster Knight body with metal highlights */}
              <defs>
                <linearGradient id="sapphireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1E40AF" />
                </linearGradient>
                <linearGradient id="glowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
              
              {/* Mane & Back Neck */}
              <path d="M68,85 C68,75 75,55 60,35 C52,25 40,24 35,26 C30,28 26,34 26,40 C26,45 32,48 35,46 C38,44 42,48 42,52 C42,56 32,58 26,62 C20,66 18,72 22,80 C24,84 30,85 30,85 Z" fill="url(#sapphireGrad)" />
              
              {/* Snout & Jaw */}
              <path d="M42,28 C45,28 58,16 68,26 C75,32 78,42 66,48 C55,54 48,46 42,46 Z" fill="url(#sapphireGrad)" />
              
              {/* Ear */}
              <path d="M36,26 L30,12 L38,20 Z" fill="#1E40AF" />
              <path d="M35,24 L31,14 L36,19 Z" fill="#60A5FA" />
              
              {/* Eye (Shining gold/white) */}
              <circle cx="54" cy="31" r="3" fill="#FFFFFF" />
              <circle cx="54" cy="31" r="1.5" fill="#FBBF24" />

              {/* Nose details */}
              <path d="M68,34 C67,34 66,35 66,36 C66,37 67,38 68,38 C69,38 70,37 70,36 C70,35 69,34 68,34 Z" fill="#1E40AF" opacity="0.6" />

              {/* Mane stroke accents */}
              <path d="M28,45 C34,46 38,42 38,36" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
              <path d="M25,65 C32,66 38,62 38,54" fill="none" stroke="#60A5FA" strokeWidth="2" strokeLinecap="round" />
              
              {/* Custom Shield Base Rim */}
              <path d="M15,85 L85,85 L80,92 L20,92 Z" fill="#1D4ED8" />
            </svg>
          </motion.div>
          
          {/* Shadow reflection stretching */}
          <motion.div 
            animate={{ scaleX: [1, 0.9, 1], opacity: [0.3, 0.2, 0.3] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-0 w-16 h-2 bg-black/40 rounded-full blur-sm"
          />
        </div>

        {/* ── DYNAMIC PANEL CAROUSEL ───────────────────────────────────── */}
        <div className="w-full bg-[#090D16]/95 border border-white/[0.05] rounded-3xl p-6 sm:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.9)] overflow-hidden relative backdrop-blur-xl">
          
          {/* Subtle top edge glow */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0" />

          <AnimatePresence mode="wait">
            
            {/* PHASE 1: SELECTOR OPTIONS */}
            {formStep === "options" && (
              <motion.div
                key="options"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-6"
              >
                {/* Title Copy */}
                <div className="text-center flex flex-col gap-1.5">
                  <h2 className="text-2xl sm:text-[25px] font-medium font-jost text-white leading-tight">
                    Create Your Account
                  </h2>
                  <p className="text-[12.5px] text-slate-400 font-light leading-relaxed">
                    Step inside our luxury grandmaster arena and join thousands of active players globally.
                  </p>
                </div>

                {/* Grid of CTAs */}
                <div className="flex flex-col gap-3">
                  
                  {/* Email Sign Up Option - Branded sapphire blue steel */}
                  <button
                    onClick={() => { playWoodTap(); setFormStep("email_form"); }}
                    className="group w-full py-4 rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[0_6px_24px_rgba(37,99,235,0.3)] border border-blue-500/30 cursor-pointer flex items-center justify-center gap-3 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Mail className="w-4.5 h-4.5 text-white animate-pulse" />
                    <span className="text-sm font-bold text-white tracking-wider font-jost">Continue with Email</span>
                  </button>

                  <div className="flex items-center gap-4 py-2.5">
                    <div className="flex-1 h-[1px] bg-white/5" />
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">or</span>
                    <div className="flex-1 h-[1px] bg-white/5" />
                  </div>

                  {/* Google Action */}
                  <button
                    onClick={playWoodTap}
                    className="w-full py-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] hover:scale-[1.01] active:scale-[0.99] transition-all border border-white/5 cursor-pointer flex items-center justify-center gap-3 text-xs font-semibold text-white shadow-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.62 14.99 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.75 2.91C6.03 7.54 8.78 5.04 12 5.04z"/>
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.62z"/>
                      <path fill="#FBBC05" d="M5.14 14.86c-.25-.76-.39-1.57-.39-2.41s.14-1.65.39-2.41L1.39 7.13C.5 8.93 0 10.91 0 13s.5 4.07 1.39 5.87l3.75-3.01z"/>
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.51 1.18-4.23 1.18-3.22 0-5.97-2.5-6.86-5.43L1.39 15.96C3.37 19.85 7.35 23 12 23z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* Apple Action */}
                  <button
                    onClick={playWoodTap}
                    className="w-full py-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] hover:scale-[1.01] active:scale-[0.99] transition-all border border-white/5 cursor-pointer flex items-center justify-center gap-3 text-xs font-semibold text-white shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.51-.62.72-1.16 1.87-1.01 2.98 1.1.09 2.23-.55 2.94-1.43z"/>
                    </svg>
                    <span>Continue with Apple</span>
                  </button>

                </div>
              </motion.div>
            )}

            {/* PHASE 2: DETAILED REGISTER FORM */}
            {formStep === "email_form" && (
              <motion.div
                key="email_form"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-6"
              >
                {/* Back Link */}
                <button
                  onClick={() => { playWoodTap(); setFormStep("options"); }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer self-start"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to options
                </button>

                {/* Form header */}
                <div className="flex flex-col gap-1 text-left">
                  <h3 className="text-xl font-bold font-jost text-white">Start Your Chess Journey</h3>
                  <p className="text-xs text-slate-400 font-light">Set up your username and password below.</p>
                </div>

                {/* Notification banners */}
                {error && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                    {success}
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSignUp} className="space-y-4">
                  
                  {/* Username Field */}
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Choose Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-11 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => { playWoodTap(); setShowPassword(!showPassword); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>

                  {/* Submit Branded Blue Steel Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full py-4 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white font-bold text-sm tracking-wider font-jost cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(37,99,235,0.3)] disabled:opacity-50 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    {loading ? (
                      <><Loader2 className="w-4.5 h-4.5 animate-spin" /> Staging Account...</>
                    ) : (
                      <>Create Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
