'use client'

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Loader2, Eye, EyeOff, ChevronLeft, ArrowRight, Sparkles, Volume2, VolumeX } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBoardTheme, BOARD_THEMES } from "@/components/BoardThemeProvider";

// Premium Custom Chess Vector Icons for Experience Selection
const PawnRegisterIcon = () => (
  <svg viewBox="0 0 100 100" className="w-6 h-6 flex-shrink-0">
    <defs>
      <linearGradient id="pawnRegGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#047857" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
    <circle cx="50" cy="30" r="14" fill="url(#pawnRegGrad)" stroke="var(--text-primary)" strokeWidth="3" />
    <path d="M42,22 C48,18 56,22 58,28" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    <path d="M36,48 L64,48 L60,54 L40,54 Z" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M38,54 C38,68 30,76 26,82 L74,82 C70,76 62,68 62,54 Z" fill="url(#pawnRegGrad)" stroke="var(--text-primary)" strokeWidth="3" strokeLinejoin="round" />
    <path d="M46,58 C46,68 40,74 34,80" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    <path d="M18,82 L82,82 L77,90 L23,90 Z" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="2.5" />
  </svg>
);

const KnightRegisterIcon = () => (
  <svg viewBox="0 0 100 100" className="w-6 h-6 flex-shrink-0">
    <defs>
      <linearGradient id="knightRegGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1D4ED8" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
    <path d="M28,82 C32,60 30,42 42,26 C46,20 52,15 54,8 L59,18 C62,16 66,16 69,18 L70,12 C72,20 78,26 80,32 C83,42 80,48 72,50 C62,52 50,50 48,58 C46,66 48,76 52,82 Z" fill="url(#knightRegGrad)" stroke="var(--text-primary)" strokeWidth="3" strokeLinejoin="round" />
    <path d="M36,46 C40,40 48,34 52,24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    <path d="M34,60 C38,54 44,48 48,38" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
    <polygon points="60,26 66,28 62,31" fill="var(--accent)" />
    <path d="M18,82 L82,82 L77,90 L23,90 Z" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="2.5" />
  </svg>
);

const RookRegisterIcon = () => (
  <svg viewBox="0 0 100 100" className="w-6 h-6 flex-shrink-0">
    <defs>
      <linearGradient id="rookRegGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#5B21B6" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
    <path d="M26,22 L34,22 L34,30 L44,30 L44,22 L56,22 L56,30 L66,30 L66,22 L74,22 L74,40 L26,40 Z" fill="url(#rookRegGrad)" stroke="var(--text-primary)" strokeWidth="3" strokeLinejoin="round" />
    <line x1="32" y1="36" x2="68" y2="36" stroke="var(--accent)" strokeWidth="2" />
    <path d="M30,40 C32,54 32,68 34,78 L66,78 C68,68 68,54 70,40 Z" fill="url(#rookRegGrad)" stroke="var(--text-primary)" strokeWidth="3" strokeLinejoin="round" />
    <path d="M42,46 L42,70" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M58,46 L58,70" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M18,78 L82,78 L77,86 L23,86 Z" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="2.5" />
  </svg>
);

const StarRegisterIcon = () => (
  <svg viewBox="0 0 100 100" className="w-6 h-6 flex-shrink-0">
    <defs>
      <linearGradient id="starRegGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#B45309" />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="4 2" opacity="0.6" />
    <path d="M50,12 L57,39 L85,39 L62,55 L70,82 L50,65 L30,82 L38,55 L15,39 L43,39 Z" fill="url(#starRegGrad)" stroke="var(--text-primary)" strokeWidth="3" strokeLinejoin="round" />
    <circle cx="50" cy="50" r="7" fill="var(--accent)" stroke="var(--text-primary)" strokeWidth="1.5" />
  </svg>
);

export default function Register() {
  const router = useRouter();
  const [formStep, setFormStep] = useState<
    | "options"
    | "email_form"
    | "google_onboarding_username"
    | "google_onboarding_experience"
    | "google_onboarding_coach"
    | "google_onboarding_style"
    | "google_onboarding_friends"
    | "google_onboarding_premium"
    | "google_onboarding_notify"
  >("options");
  
  // Auth Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Google Onboarding states
  const [googleEmail, setGoogleEmail] = useState("kunal.bose.27722@gmail.com");
  const [chessExperience, setChessExperience] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState("magnus");
  
  const { boardTheme, setBoardThemeById } = useBoardTheme();
  const selectedBoard = boardTheme.id;
  const setSelectedBoard = setBoardThemeById;

  // TTS State & Functionality
  const [isMuted, setIsMuted] = useState(false);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speakCoachText = useCallback((text: string, coachId: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    // Stop any active speech
    window.speechSynthesis.cancel();
    
    if (isMuted) return;

    const utterance = new SpeechSynthesisUtterance(text);
    speechUtteranceRef.current = utterance;

    // Fetch and assign genuine voice based on coach personality
    const voices = window.speechSynthesis.getVoices();
    
    // Custom voice selection mappings
    let selectedVoice = null;
    if (voices.length > 0) {
      if (coachId === "anna") {
        selectedVoice = voices.find(v => v.lang.startsWith("en-GB") && v.name.toLowerCase().includes("female")) ||
                        voices.find(v => v.name.toLowerCase().includes("zira") || v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("hazel")) ||
                        voices.find(v => v.lang.startsWith("en"));
        utterance.pitch = 1.15;
        utterance.rate = 1.0;
      } else if (coachId === "judit") {
        selectedVoice = voices.find(v => v.lang.startsWith("en-IE")) ||
                        voices.find(v => v.name.toLowerCase().includes("female")) ||
                        voices.find(v => v.lang.startsWith("en"));
        utterance.pitch = 0.95;
        utterance.rate = 0.95;
      } else if (coachId === "magnus") {
        selectedVoice = voices.find(v => v.lang.startsWith("en-GB") && v.name.toLowerCase().includes("male")) ||
                        voices.find(v => v.name.toLowerCase().includes("david") || v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("george")) ||
                        voices.find(v => v.lang.startsWith("en"));
        utterance.pitch = 0.85;
        utterance.rate = 0.9;
      } else if (coachId === "hikaru") {
        selectedVoice = voices.find(v => v.lang.startsWith("en-US") && v.name.toLowerCase().includes("male")) ||
                        voices.find(v => v.name.toLowerCase().includes("male")) ||
                        voices.find(v => v.lang.startsWith("en"));
        utterance.pitch = 1.05;
        utterance.rate = 1.18;
      } else if (coachId === "vishy") {
        selectedVoice = voices.find(v => v.lang.startsWith("en-IN")) ||
                        voices.find(v => v.name.toLowerCase().includes("ravi") || v.name.toLowerCase().includes("heera")) ||
                        voices.find(v => v.lang.startsWith("en"));
        utterance.pitch = 0.95;
        utterance.rate = 0.88;
      } else if (coachId === "levy") {
        selectedVoice = voices.find(v => v.lang.startsWith("en-US") && (v.name.toLowerCase().includes("natural") || v.name.toLowerCase().includes("guy"))) ||
                        voices.find(v => v.name.toLowerCase().includes("male")) ||
                        voices.find(v => v.lang.startsWith("en"));
        utterance.pitch = 1.02;
        utterance.rate = 1.02;
      } else if (coachId === "canty") {
        selectedVoice = voices.find(v => v.lang.startsWith("en-US") && v.name.toLowerCase().includes("male")) ||
                        voices.find(v => v.lang.startsWith("en"));
        utterance.pitch = 0.92;
        utterance.rate = 1.05;
      } else {
        selectedVoice = voices.find(v => v.lang.startsWith("en-US") && v.name.toLowerCase().includes("male")) ||
                        voices.find(v => v.lang.startsWith("en"));
        utterance.pitch = 1.0;
        utterance.rate = 1.0;
      }
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }, [isMuted]);

  useEffect(() => {
    if (formStep === "google_onboarding_coach") {
      const activeCoach = [
        { id: "david", speech: "Hi, I'm David. Choose me and I'll help you learn chess step by step." },
        { id: "levy", speech: "Welcome! I'm Levy. Let's analyze your games and climb the rating ladder!" },
        { id: "magnus", speech: "Hi, I'm Magnus. Ready to learn positional mastery and play like a World Champion?" },
        { id: "anna", speech: "Hello, I'm Anna. Let's practice tactical patterns and make learning fun!" },
        { id: "hikaru", speech: "What's up, I'm Hikaru. Let's literally crush your opponents with active piece play!" },
        { id: "judit", speech: "Welcome, I'm Judit. Let's master aggressive attacking combinations together!" },
        { id: "vishy", speech: "Hello, I'm Vishy. I'll help you develop deep strategic planning and endgame technique." },
        { id: "canty", speech: "Hey, I'm Canty. Let's build a solid, champion-level opening repertoire!" },
      ].find(c => c.id === selectedCoach);
      if (activeCoach) {
        speakCoachText(activeCoach.speech, selectedCoach);
      }
    } else {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [selectedCoach, formStep, speakCoachText]);

  const [billingCycle, setBillingCycle] = useState<"yearly" | "monthly">("yearly");
  
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

  // Handle Google Onboarding Mock Submit
  const handleGoogleOnboardingSubmit = async () => {
    setLoading(true);
    setError(null);
    playWoodTap();

    // Mock onboarding delay and complete signup success chime
    setTimeout(() => {
      playSuccessChime();
      setSuccess("Onboarding complete! Staging your grandmaster profile...");
      
      setTimeout(async () => {
        // Refreshes the local auth profile session
        await refreshProfile();
        router.push("/play");
      }, 1500);
    }, 1500);
  };

  return (
    <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto py-16 px-6 bg-salon font-montserrat">
      
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
          className="text-xs font-black text-[var(--text-primary)] hover:text-[var(--primary)] uppercase tracking-wider transition-colors border-b-2 border-transparent hover:border-[var(--primary)]"
        >
          Sign In
        </Link>
      </header>

      {/* Main Console Wrapper */}
      <div className="relative z-10 w-full max-w-[430px] flex flex-col items-center gap-6 mt-4">
        
        {/* Animated Bobbing 3D Knight Graphic */}
        {(formStep === "options" || formStep === "email_form") && (
          <div className="relative w-28 h-28 flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-full h-full flex items-center justify-center"
            >
              {/* Glow behind the knight */}
              <div className="absolute inset-0 bg-[var(--primary)]/10 blur-xl rounded-full scale-75 animate-pulse" />
              
              {/* Sparkles */}
              <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-[var(--accent)] animate-bounce" />
              
              {/* 3D Knight image render */}
              <img 
                src="/images/knight-3d.png" 
                alt="Luxury 3D Knight" 
                className="w-24 h-24 object-contain filter drop-shadow-[0_8px_16px_rgba(16,185,129,0.2)]"
              />
            </motion.div>
            
            {/* Shadow reflection */}
            <motion.div 
              animate={{ scaleX: [1, 0.9, 1], opacity: [0.3, 0.2, 0.3] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-0 w-16 h-2 bg-[var(--text-primary)]/10 rounded-full blur-sm"
            />
          </div>
        )}

        {/* ── DYNAMIC PANEL CAROUSEL ───────────────────────────────────── */}
        <div className="w-full bg-[var(--bg-elevated)] border-2 border-[var(--text-primary)] outline-1 outline-[var(--text-primary)] outline-offset-4 shadow-[6px_6px_0px_var(--text-primary)] rounded-[var(--radius-sm)] p-6 sm:p-8 relative overflow-hidden">
          
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
                {/* Title */}
                <div className="text-center flex flex-col gap-1.5">
                  <h2 className="text-2xl font-black font-jost text-[var(--text-primary)] leading-tight uppercase tracking-tight">
                    Create Your Account
                  </h2>
                  <p className="text-[12.5px] text-[var(--text-muted)] font-bold leading-relaxed">
                    Step inside our luxury grandmaster arena and join thousands of active players globally.
                  </p>
                </div>

                {/* Grid of CTAs */}
                <div className="flex flex-col gap-3">
                  
                  {/* Email Sign Up Option */}
                  <button
                    onClick={() => { playWoodTap(); setFormStep("email_form"); }}
                    className="btn-primary w-full !py-4 gap-3 text-sm flex items-center justify-center cursor-pointer"
                  >
                    <Mail className="w-4.5 h-4.5 text-white" />
                    Continue with Email
                  </button>

                  <div className="flex items-center gap-4 py-2">
                    <div className="flex-1 h-0.5 bg-[var(--text-primary)]/10" />
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider font-mono">or</span>
                    <div className="flex-1 h-0.5 bg-[var(--text-primary)]/10" />
                  </div>

                  {/* Google Action */}
                  <button
                    onClick={() => { playWoodTap(); setFormStep("google_onboarding_username"); }}
                    className="w-full py-3.5 bg-white border-2 border-[var(--text-primary)] rounded-sm text-xs font-black uppercase tracking-wider text-[var(--text-primary)] shadow-[2.5px_2.5px_0px_var(--text-primary)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_var(--text-primary)] active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--text-primary)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.62 14.99 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.75 2.91C6.03 7.54 8.78 5.04 12 5.04z"/>
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.62z"/>
                      <path fill="#FBBC05" d="M5.14 14.86c-.25-.76-.39-1.57-.39-2.41s.14-1.65.39-2.41L1.39 7.13C.5 8.93 0 10.91 0 13s.5 4.07 1.39 5.87l3.75-3.01z"/>
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.51 1.18-4.23 1.18-3.22 0-5.97-2.5-6.86-5.43L1.39 15.96C3.37 19.85 7.35 23 12 23z"/>
                    </svg>
                    Continue with Google
                  </button>

                  {/* Apple Action */}
                  <button
                    onClick={playWoodTap}
                    className="w-full py-3.5 bg-white border-2 border-[var(--text-primary)] rounded-sm text-xs font-black uppercase tracking-wider text-[var(--text-primary)] shadow-[2.5px_2.5px_0px_var(--text-primary)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_var(--text-primary)] active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--text-primary)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.51-.62.72-1.16 1.87-1.01 2.98 1.1.09 2.23-.55 2.94-1.43z"/>
                    </svg>
                    Continue with Apple
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
                  className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer self-start uppercase tracking-wider"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to options
                </button>

                {/* Form header */}
                <div className="flex flex-col gap-1 text-left">
                  <h3 className="text-xl font-black font-jost text-[var(--text-primary)] uppercase tracking-tight">Start Your Chess Journey</h3>
                  <p className="text-xs text-[var(--text-muted)] font-bold">Set up your username and password below.</p>
                </div>

                {/* Notification banners */}
                {error && (
                  <div className="px-4 py-3 rounded-sm bg-red-50 border-2 border-red-800 text-red-800 text-xs font-bold leading-normal">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="px-4 py-3 rounded-sm bg-emerald-50 border-2 border-emerald-800 text-emerald-800 text-xs font-bold leading-normal">
                    {success}
                  </div>
                )}

                {/* Registration Form */}
                <form onSubmit={handleSignUp} className="space-y-4">
                  
                  {/* Username Field */}
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      placeholder="Choose Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[var(--text-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]/40 rounded-sm text-sm focus:outline-none focus:bg-[var(--bg-elevated)] shadow-[2px_2px_0px_rgba(0,0,0,0.05)] focus:shadow-[2px_2px_0px_var(--text-primary)] transition-all font-bold"
                    />
                  </div>

                  {/* Email Field */}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[var(--text-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]/40 rounded-sm text-sm focus:outline-none focus:bg-[var(--bg-elevated)] shadow-[2px_2px_0px_rgba(0,0,0,0.05)] focus:shadow-[2px_2px_0px_var(--text-primary)] transition-all font-bold"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-11 py-3 bg-white border-2 border-[var(--text-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]/40 rounded-sm text-sm focus:outline-none focus:bg-[var(--bg-elevated)] shadow-[2px_2px_0px_rgba(0,0,0,0.05)] focus:shadow-[2px_2px_0px_var(--text-primary)] transition-all font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => { playWoodTap(); setShowPassword(!showPassword); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 mt-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <><Loader2 className="w-4.5 h-4.5 animate-spin mr-2" /> Staging Account...</>
                    ) : (
                      <>Create Account <ArrowRight className="w-4 h-4 inline ml-1.5" /></>
                    )}
                  </button>
                </form>

              </motion.div>
            )}

            {/* PHASE 3: GOOGLE ONBOARDING - CHOOSE USERNAME */}
            {formStep === "google_onboarding_username" && (
              <motion.div
                key="google_username"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-6"
              >
                {/* Back Button */}
                <button
                  onClick={() => { playWoodTap(); setFormStep("options"); }}
                  className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer self-start uppercase tracking-wider"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {/* Checked Google Box */}
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-sm border-2 border-[var(--text-primary)] bg-[var(--bg-secondary)] text-[var(--text-primary)] text-xs font-bold self-center shadow-[2px_2px_0px_var(--text-primary)]">
                  <div className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-[var(--primary)] text-white font-extrabold text-[10px]">✓</div>
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.62 14.99 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.75 2.91C6.03 7.54 8.78 5.04 12 5.04z"/>
                    <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.99 3.7-8.62z"/>
                    <path fill="#FBBC05" d="M5.14 14.86c-.25-.76-.39-1.57-.39-2.41s.14-1.65.39-2.41L1.39 7.13C.5 8.93 0 10.91 0 13s.5 4.07 1.39 5.87l3.75-3.01z"/>
                    <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.51 1.18-4.23 1.18-3.22 0-5.97-2.5-6.86-5.43L1.39 15.96C3.37 19.85 7.35 23 12 23z"/>
                  </svg>
                  <span className="font-mono text-[11px] text-[var(--text-secondary)] font-bold">{googleEmail}</span>
                </div>

                {/* Form header */}
                <div className="flex flex-col gap-1.5 text-center">
                  <h3 className="text-xl font-black font-jost text-[var(--text-primary)] uppercase tracking-tight leading-tight">Choose a Username</h3>
                  <p className="text-xs text-[var(--text-muted)] font-bold">You can change this later</p>
                </div>

                {/* Username Input */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[var(--text-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]/40 rounded-sm text-sm focus:outline-none focus:bg-[var(--bg-elevated)] shadow-[2px_2px_0px_rgba(0,0,0,0.05)] focus:shadow-[2px_2px_0px_var(--text-primary)] transition-all font-bold"
                  />
                </div>

                <p className="text-[10px] text-[var(--text-muted)] font-bold text-center leading-relaxed">
                  I accept the site <span className="underline hover:text-[var(--text-primary)] cursor-pointer">Terms of Service</span> and agree to the <span className="underline hover:text-[var(--text-primary)] cursor-pointer">Privacy Policy</span>.
                </p>

                {/* Continue Button */}
                <button
                  type="button"
                  onClick={() => { playWoodTap(); setFormStep("google_onboarding_experience"); }}
                  disabled={!username.trim()}
                  className="btn-primary w-full py-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                </button>

              </motion.div>
            )}

            {/* PHASE 4: GOOGLE ONBOARDING - CHOOSE CHESS EXPERIENCE */}
            {formStep === "google_onboarding_experience" && (
              <motion.div
                key="google_experience"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-6"
              >
                {/* Back Button */}
                <button
                  onClick={() => { playWoodTap(); setFormStep("google_onboarding_username"); }}
                  className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer self-start uppercase tracking-wider"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {/* Title */}
                <div className="flex flex-col gap-1 text-center">
                  <h3 className="text-xl font-black font-jost text-[var(--text-primary)] uppercase tracking-tight">What Is Your Chess Experience?</h3>
                </div>

                {/* Experience Levels Grid */}
                <div className="flex flex-col gap-3">
                  {[
                    {
                      id: "beginner",
                      title: "I don't know how to play",
                      icon: <PawnRegisterIcon />
                    },
                    {
                      id: "intermediate",
                      title: "I know the rules and basics",
                      icon: <KnightRegisterIcon />
                    },
                    {
                      id: "advanced",
                      title: "I know strategies and tactics",
                      icon: <RookRegisterIcon />
                    },
                    {
                      id: "expert",
                      title: "I'm a tournament player",
                      icon: <StarRegisterIcon />
                    }
                  ].map((exp) => {
                    const isSel = chessExperience === exp.id
                    return (
                      <button
                        key={exp.id}
                        type="button"
                        onClick={() => { playWoodTap(); setChessExperience(exp.id); }}
                        className={`w-full py-4 px-5 border-2 border-[var(--text-primary)] rounded-sm flex items-center gap-4 text-left transition-all cursor-pointer group ${
                          isSel 
                            ? "bg-[var(--primary)] text-white shadow-[2.5px_2.5px_0px_var(--text-primary)] -translate-y-0.5" 
                            : "bg-white text-[var(--text-primary)] shadow-[2.5px_2.5px_0px_var(--text-primary)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_var(--text-primary)]"
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-sm border-2 border-[var(--text-primary)] flex items-center justify-center p-0.5 ${
                          isSel ? 'bg-white text-[var(--primary)]' : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                        }`}>
                          {exp.icon}
                        </div>
                        <span className="text-xs font-black uppercase tracking-wide">{exp.title}</span>
                      </button>
                    )
                  })}
                 </div>

                 {/* Notification banners */}
                 {error && (
                   <div className="px-4 py-3 rounded-sm bg-red-50 border-2 border-red-800 text-red-800 text-xs font-bold leading-normal">
                     {error}
                   </div>
                 )}
                 {success && (
                   <div className="px-4 py-3 rounded-sm bg-emerald-50 border-2 border-emerald-800 text-emerald-800 text-xs font-bold leading-normal">
                     {success}
                   </div>
                 )}

                 {/* Submit Button */}
                 <button
                   type="button"
                   onClick={() => { playWoodTap(); setFormStep("google_onboarding_coach"); }}
                   disabled={!chessExperience || loading}
                   className="btn-primary w-full py-4 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                 >
                   Continue
                 </button>

              </motion.div>
            )}

            {/* PHASE 5: GOOGLE ONBOARDING - CHOOSE YOUR COACH */}
            {formStep === "google_onboarding_coach" && (
              <motion.div
                key="google_coach"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5"
              >
                {/* Back Button */}
                <button
                  onClick={() => { playWoodTap(); setFormStep("google_onboarding_experience"); }}
                  className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer self-start uppercase tracking-wider"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {/* Title */}
                <div className="flex flex-col gap-1 text-center">
                  <h3 className="text-xl font-black font-jost text-[var(--text-primary)] uppercase tracking-tight">Choose Your Coach</h3>
                </div>

                {/* Coach Speech Bubble Panel */}
                {(() => {
                  const activeCoach = [
                    { id: "david", name: "David", gradient: "from-emerald-700 to-green-900", speech: "Hi, I'm David. Choose me and I'll help you learn chess step by step." },
                    { id: "levy", name: "Levy", gradient: "from-amber-600 to-amber-800", speech: "Welcome! I'm Levy. Let's analyze your games and climb the rating ladder!" },
                    { id: "magnus", name: "Magnus", gradient: "from-green-700 to-emerald-900", speech: "Hi, I'm Magnus. Ready to learn positional mastery and play like a World Champion?" },
                    { id: "anna", name: "Anna", gradient: "from-amber-600 to-orange-700", speech: "Hello, I'm Anna. Let's practice tactical patterns and make learning fun!" },
                    { id: "hikaru", name: "Hikaru", gradient: "from-emerald-700 to-green-900", speech: "What's up, I'm Hikaru. Let's literally crush your opponents with active piece play!" },
                    { id: "judit", name: "Judit", gradient: "from-amber-600 to-orange-700", speech: "Welcome, I'm Judit. Let's master aggressive attacking combinations together!" },
                    { id: "vishy", name: "Vishy", gradient: "from-green-700 to-emerald-900", speech: "Hello, I'm Vishy. I'll help you develop deep strategic planning and endgame technique." },
                    { id: "canty", name: "Canty", gradient: "from-orange-600 to-amber-700", speech: "Hey, I'm Canty. Let's build a solid, champion-level opening repertoire!" },
                  ].find(c => c.id === selectedCoach) || { id: "david", name: "David", gradient: "from-emerald-700 to-green-900", speech: "Hi, I'm David. Choose me and I'll help you learn chess." };

                  return (
                    <div className="flex items-center gap-4 w-full">
                      {/* Avatar Display */}
                      <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
                        <div className="absolute inset-0 bg-[var(--primary)]/10 rounded-full scale-110" />
                        <div className="w-24 h-24 rounded-full bg-slate-900 border-2 border-[var(--text-primary)] flex items-center justify-center shadow-[3px_3px_0px_var(--text-primary)] relative overflow-hidden">
                          <img 
                            src={`/images/coaches/${selectedCoach}.png`} 
                            alt={selectedCoach} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        {/* Audio Toggle Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const newMute = !isMuted;
                            setIsMuted(newMute);
                            if (newMute) {
                              window.speechSynthesis.cancel();
                            } else {
                              speakCoachText(activeCoach.speech, selectedCoach);
                            }
                          }}
                          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-[var(--text-primary)] flex items-center justify-center cursor-pointer shadow-[1px_1px_0px_var(--text-primary)] hover:scale-105 active:scale-95 transition-all text-[var(--text-primary)]"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>
                      {/* Speech Bubble */}
                      <div className="flex-1 bg-white border-2 border-[var(--text-primary)] p-4 rounded-sm text-[11px] font-bold text-[var(--text-secondary)] shadow-[3px_3px_0px_var(--text-primary)] relative text-left">
                        <div className="absolute top-1/2 -translate-y-1/2 right-full h-0 w-0 border-[8px] border-transparent" style={{ borderRightColor: 'var(--text-primary)' }} />
                        <div className="absolute top-1/2 -translate-y-1/2 right-full -mr-[1.5px] h-0 w-0 border-[7px] border-transparent z-10" style={{ borderRightColor: '#fff' }} />
                        <span className="font-black text-[var(--primary)]">{activeCoach.name}</span>: "{activeCoach.speech}"
                      </div>
                    </div>
                  );
                })()}

                {/* Grid of Coaches */}
                <div className="grid grid-cols-3 gap-4 w-full mt-2 select-none">
                  {[
                    { id: "magnus", name: "Magnus" },
                    { id: "hikaru", name: "Hikaru" },
                    { id: "levy", name: "Levy" },
                    { id: "vishy", name: "Vishy" },
                    { id: "anna", name: "Anna" },
                    { id: "judit", name: "Judit" }
                  ].map((coach) => {
                    const isSel = selectedCoach === coach.id
                    return (
                      <button
                        key={coach.id}
                        type="button"
                        onClick={() => { playWoodTap(); setSelectedCoach(coach.id); }}
                        className={`flex flex-col items-center gap-2 p-3 rounded-sm border-2 transition-all cursor-pointer ${
                          isSel
                            ? "bg-[var(--primary)] border-[var(--text-primary)] text-white scale-[1.03] shadow-[2.5px_2.5px_0px_var(--text-primary)]"
                            : "bg-white border-[var(--text-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/50 hover:scale-[1.01] shadow-[2.5px_2.5px_0px_var(--text-primary)]"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-full border-2 border-[var(--text-primary)] flex items-center justify-center overflow-hidden bg-slate-900">
                          <img 
                            src={`/images/coaches/${coach.id}.png`} 
                            alt={coach.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] font-black tracking-wide uppercase">
                          {coach.name}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Continue Button */}
                <button
                  type="button"
                  onClick={() => { playWoodTap(); setFormStep("google_onboarding_style"); }}
                  className="btn-primary w-full py-4 mt-2 cursor-pointer"
                >
                  Continue
                </button>

              </motion.div>
            )}

            {/* PHASE 6: GOOGLE ONBOARDING - BOARD STYLE */}
            {formStep === "google_onboarding_style" && (
              <motion.div
                key="google_style"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5"
              >
                {/* Back Button */}
                <button
                  onClick={() => { playWoodTap(); setFormStep("google_onboarding_coach"); }}
                  className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer self-start uppercase tracking-wider"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {/* Title */}
                <div className="flex flex-col gap-1 text-center">
                  <h3 className="text-xl font-black font-jost text-[var(--text-primary)] uppercase tracking-tight">Choose Board Style</h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-bold">Select from premium designer finishes</p>
                </div>

                {/* 4-Column Board Swatches */}
                <div className="grid grid-cols-4 gap-2.5 select-none w-full">
                  {BOARD_THEMES.map((style) => {
                    const isSel = selectedBoard === style.id
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => { playWoodTap(); setSelectedBoard(style.id); }}
                        className={`flex flex-col items-center gap-1.5 p-2 border-2 rounded-sm transition-all cursor-pointer ${
                          isSel
                            ? "bg-[var(--bg-secondary)] border-[var(--text-primary)] shadow-[2px_2px_0px_var(--text-primary)] scale-[1.03]"
                            : "bg-white border-[var(--text-primary)]/40 hover:border-[var(--text-primary)] hover:bg-[var(--bg-secondary)]/10 shadow-[2px_2px_0px_rgba(0,0,0,0.05)] hover:scale-[1.01]"
                        }`}
                      >
                        {/* Mini Board Swatch */}
                        <div className="grid grid-cols-2 aspect-square w-10 h-10 border border-[var(--text-primary)] rounded-sm overflow-hidden shadow-inner flex-shrink-0">
                          <div style={{ backgroundColor: style.light }} />
                          <div style={{ backgroundColor: style.dark }} />
                          <div style={{ backgroundColor: style.dark }} />
                          <div style={{ backgroundColor: style.light }} />
                        </div>
                        <span className="text-[8px] font-black uppercase tracking-tight text-center leading-none text-[var(--text-primary)]">
                          {style.name.split(" ")[0]}
                        </span>
                      </button>
                    )
                  })}
                </div>

                {/* Selected Theme Showcase Card */}
                {(() => {
                  const activeTheme = BOARD_THEMES.find(t => t.id === selectedBoard) || BOARD_THEMES[0];
                  return (
                    <motion.div 
                      key={activeTheme.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border-2 border-[var(--text-primary)] p-3.5 rounded-sm text-[11px] text-[var(--text-secondary)] font-bold shadow-[2.5px_2.5px_0px_var(--text-primary)] flex flex-col gap-0.5 text-left border-l-[6px]"
                      style={{ borderLeftColor: activeTheme.accent }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black uppercase tracking-wider text-xs" style={{ color: activeTheme.accent }}>
                          {activeTheme.name}
                        </span>
                        <span className="text-[8.5px] font-black text-[var(--text-muted)] uppercase tracking-widest font-mono">
                          Showcase
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] font-bold leading-normal mt-0.5">
                        {activeTheme.description}
                      </p>
                    </motion.div>
                  );
                })()}

                {/* Continue Button */}
                <button
                  type="button"
                  onClick={() => { playWoodTap(); setFormStep("google_onboarding_friends"); }}
                  className="btn-primary w-full py-4 cursor-pointer"
                >
                  Continue
                </button>

              </motion.div>
            )}

            {/* PHASE 7: GOOGLE ONBOARDING - FIND FRIENDS */}
            {formStep === "google_onboarding_friends" && (
              <motion.div
                key="google_friends"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-6"
              >
                {/* Back Button */}
                <button
                  onClick={() => { playWoodTap(); setFormStep("google_onboarding_style"); }}
                  className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer self-start uppercase tracking-wider"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {/* Title */}
                <div className="flex flex-col gap-1 text-center">
                  <h3 className="text-xl font-black font-jost text-[var(--text-primary)] uppercase tracking-tight">Find Your Friends</h3>
                </div>

                {/* Social Button Grid */}
                <div className="flex flex-col gap-3">
                  {/* Facebook Button */}
                  <button
                    onClick={playWoodTap}
                    className="w-full py-4 rounded-sm bg-[#1877F2] border-2 border-[var(--text-primary)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-3 text-xs font-black text-white shadow-[3px_3px_0px_var(--text-primary)] uppercase tracking-wider"
                  >
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Facebook Friends</span>
                  </button>

                  {/* Send Email Invite */}
                  <button
                    onClick={playWoodTap}
                    className="w-full py-3.5 bg-white border-2 border-[var(--text-primary)] rounded-sm text-xs font-black uppercase tracking-wider text-[var(--text-primary)] shadow-[2.5px_2.5px_0px_var(--text-primary)] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_var(--text-primary)] active:translate-y-0.5 active:shadow-[1px_1px_0px_var(--text-primary)] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5"
                  >
                    <Mail className="w-4.5 h-4.5 text-[var(--text-muted)]" />
                    <span>Send Email Invite</span>
                  </button>
                </div>

                {/* Separator OR */}
                <div className="flex items-center gap-4 py-1">
                  <div className="flex-1 h-0.5 bg-[var(--text-primary)]/10" />
                  <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider font-mono">or search</span>
                  <div className="flex-1 h-0.5 bg-[var(--text-primary)]/10" />
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by name or username"
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[var(--text-primary)] text-[var(--text-primary)] placeholder-[var(--text-muted)]/40 rounded-sm text-sm focus:outline-none focus:bg-[var(--bg-elevated)] shadow-[2px_2px_0px_rgba(0,0,0,0.05)] focus:shadow-[2px_2px_0px_var(--text-primary)] transition-all font-bold"
                  />
                </div>

                {/* Continue/Skip Buttons */}
                <div className="flex flex-col items-center gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => { playWoodTap(); setFormStep("google_onboarding_premium"); }}
                    className="btn-primary w-full py-4 cursor-pointer"
                  >
                    Continue
                  </button>

                  <button
                    type="button"
                    onClick={() => { playWoodTap(); setFormStep("google_onboarding_premium"); }}
                    className="text-xs font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Skip
                  </button>
                </div>

              </motion.div>
            )}

            {/* PHASE 8: GOOGLE ONBOARDING - SPRING SALE */}
            {formStep === "google_onboarding_premium" && (
              <motion.div
                key="google_premium"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5"
              >
                {/* Back Button */}
                <button
                  onClick={() => { playWoodTap(); setFormStep("google_onboarding_friends"); }}
                  className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer self-start uppercase tracking-wider"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {/* Header */}
                <div className="flex flex-col gap-0.5 text-center">
                  <span className="text-[10px] font-black text-[var(--primary)] uppercase tracking-widest animate-pulse font-mono">Spring Sale</span>
                  <h3 className="text-xl font-black font-jost text-[var(--text-primary)] uppercase tracking-tight leading-tight">Get 50% Off Premium</h3>
                  <p className="text-[9px] text-[var(--accent)] font-black tracking-wider uppercase mt-0.5">Limited Time Offer!</p>
                </div>

                {/* Checklist */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-[var(--text-secondary)] font-bold px-2 justify-center max-w-[320px] mx-auto">
                  {[
                    "Unlimited Game Review",
                    "Unlimited Puzzles",
                    "Unlimited Lessons",
                    "Unlock All Bots",
                    "No Ads"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 col-span-2 sm:col-span-1 justify-center sm:justify-start">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)] font-extrabold text-[9px]">✓</div>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Gemstone Badge */}
                <div className="relative w-16 h-16 mx-auto flex items-center justify-center mt-1">
                  <div className="absolute inset-0 bg-[var(--accent)]/15 blur-md rounded-full scale-90" />
                  <svg className="w-12 h-12 text-[var(--accent)] filter drop-shadow-[0_2px_6px_rgba(184,144,71,0.4)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] text-[8px] font-black text-white px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider scale-95 border border-[var(--text-primary)]">50%</div>
                </div>

                {/* Tab Pill Swapper */}
                <div className="flex bg-[var(--bg-secondary)]/50 border-2 border-[var(--text-primary)] p-1 rounded-sm max-w-[200px] mx-auto w-full">
                  <button
                    type="button"
                    onClick={() => { playWoodTap(); setBillingCycle("yearly"); }}
                    className={`flex-1 py-1 text-[10px] font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                      billingCycle === "yearly"
                        ? "bg-[var(--primary)] text-white border border-[var(--text-primary)] shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Yearly
                  </button>
                  <button
                    type="button"
                    onClick={() => { playWoodTap(); setBillingCycle("monthly"); }}
                    className={`flex-1 py-1 text-[10px] font-black uppercase tracking-wider rounded-sm transition-all cursor-pointer ${
                      billingCycle === "monthly"
                        ? "bg-[var(--primary)] text-white border border-[var(--text-primary)] shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    Monthly
                  </button>
                </div>

                {/* Dynamic Billing Subtext */}
                <div className="text-center min-h-[32px] flex items-center justify-center px-4">
                  {billingCycle === "yearly" ? (
                    <p className="text-[10px] text-[var(--text-muted)] font-bold leading-normal">
                      First year <span className="font-black text-[var(--text-primary)]">₹1,899.50</span> (<span className="text-[var(--primary)]">₹158.29/mo</span>). Then ₹3,799/yr. Cancel anytime.
                    </p>
                  ) : (
                    <p className="text-[10px] text-[var(--text-muted)] font-bold leading-normal">
                      First month <span className="font-black text-[var(--text-primary)]">₹174.50</span> (<span className="text-[var(--primary)]">₹174.50/mo</span>). Then ₹349/mo. Cancel anytime.
                    </p>
                  )}
                </div>

                {/* Bottom CTA Buttons */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { playWoodTap(); setFormStep("google_onboarding_notify"); }}
                    className="btn-primary w-full py-4 cursor-pointer"
                  >
                    Redeem Now
                  </button>

                  <button
                    type="button"
                    onClick={() => { playWoodTap(); setFormStep("google_onboarding_notify"); }}
                    className="text-xs font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    No thanks
                  </button>
                </div>

              </motion.div>
            )}

            {/* PHASE 9: GOOGLE ONBOARDING - PUSH NOTIFICATIONS */}
            {formStep === "google_onboarding_notify" && (
              <motion.div
                key="google_notify"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-6"
              >
                {/* Back Button */}
                <button
                  onClick={() => { playWoodTap(); setFormStep("google_onboarding_premium"); }}
                  className="flex items-center gap-1.5 text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer self-start uppercase tracking-wider"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>

                {/* Title */}
                <div className="flex flex-col gap-1 text-center">
                  <h3 className="text-xl font-black font-jost text-[var(--text-primary)] uppercase tracking-tight">Turn On Notifications</h3>
                </div>

                {/* Mock Notification Toast */}
                <div className="bg-white border-2 border-[var(--text-primary)] p-3.5 rounded-sm shadow-[3px_3px_0px_var(--text-primary)] flex items-center justify-between gap-3.5 max-w-[320px] mx-auto w-full relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-sm bg-[var(--bg-secondary)] border-2 border-[var(--text-primary)] flex items-center justify-center shadow-inner flex-shrink-0">
                      <svg className="w-5 h-5 text-[var(--primary)]" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>

                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-[11.5px] font-black text-[var(--text-primary)] uppercase tracking-wide">Your move!</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-bold">Your opponent played Nc6.</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-[var(--primary)]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2a3 3 0 0 1 3 3c0 .95-.44 1.81-1.13 2.37A4 4 0 0 1 17 11v1a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-1a4 4 0 0 1 3.13-3.63c-.69-.56-1.13-1.42-1.13-2.37a3 3 0 0 1 3-3m-3 18h6v2H9v-2m-1-4h8v2H8v-2z"/>
                    </svg>
                  </div>
                </div>

                {/* Subtitle instructions */}
                <div className="flex flex-col gap-2 text-center">
                  <span className="text-[12px] text-[var(--text-primary)] font-black uppercase tracking-wider">Allow notifications for:</span>
                  <ul className="text-[11px] text-[var(--text-muted)] font-bold space-y-1">
                    <li>• It's your turn to move</li>
                    <li>• You receive a message</li>
                    <li>• You get challenged by a friend</li>
                  </ul>
                </div>

                {/* Notification CTAs */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGoogleOnboardingSubmit}
                    disabled={loading}
                    className="btn-primary w-full py-4 cursor-pointer"
                  >
                    {loading ? (
                      <><Loader2 className="w-4.5 h-4.5 animate-spin mr-2" /> Completing Onboarding...</>
                    ) : (
                      <>Allow</>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleOnboardingSubmit}
                    className="text-xs font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    No, thank you
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
