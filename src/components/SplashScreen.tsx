import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { HireMentorLogo } from './HireMentorLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

/**
 * Starting / Splash Page (Prompt Requirements 1, 2 & 3)
 *
 * Visual Concept:
 * - Minimal, elegant composition inspired by reference sketch
 * - Palette: Soft Ivory (#F8F4E9) background, Deep Violet (#502D55) primary typography,
 *   Dusty Plum (#935073) decorative accents, Warm Blush (#F6DBC0) subtle glow
 * - Spacious, minimal, premium — no SaaS cards or clutter
 * - Logo animation: Staggered laurel leaves -> Glasses & Tie emerge ->
 *   Stacked HIRE / MENTOR / AI reveal -> Subtitle reveal -> [ Get Started ] CTA
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<number>(0);
  const [fadingOut, setFadingOut] = useState<boolean>(false);

  useEffect(() => {
    // Stage 0: Initial mount (0ms)
    // Stage 1: Petals & central glasses appear (250ms)
    // Stage 2: Stacked Title reveals (800ms)
    // Stage 3: Subtitle reveals (1400ms)
    // Stage 4: Get Started button reveals (1900ms)
    const t1 = setTimeout(() => setStage(1), 250);
    const t2 = setTimeout(() => setStage(2), 850);
    const t3 = setTimeout(() => setStage(3), 1450);
    const t4 = setTimeout(() => setStage(4), 1950);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  const handleStart = () => {
    setFadingOut(true);
    setTimeout(onComplete, 350);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between py-12 px-6 bg-[#F8F4E9] text-[#502D55] transition-opacity duration-400 select-none ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Bar with Minimal Branding & Skip option */}
      <header className="w-full max-w-4xl flex items-center justify-between text-xs font-semibold text-[#935073]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#502D55]" />
          <span className="tracking-widest uppercase text-[11px] font-bold text-[#502D55]">
            HireMentor AI
          </span>
        </div>

        <button
          onClick={handleStart}
          className="text-xs text-[#935073] hover:text-[#502D55] transition px-3 py-1.5 rounded-full hover:bg-[#F6DBC0]/40 font-medium cursor-pointer"
        >
          Skip Intro →
        </button>
      </header>

      {/* Main Spacious Center Composition */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-xl text-center w-full my-auto">
        {/* Subtle Warm Blush aura */}
        <div className="relative">
          <div className="absolute -inset-8 bg-[#F6DBC0]/50 rounded-full blur-2xl -z-10 pointer-events-none" />

          {/* 1. HIREMENTOR AI VECTOR LOGO (Glasses + Tie + Surrounding Leaves) */}
          <div
            className={`transition-all duration-700 ease-out transform ${
              stage >= 1
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-3'
            }`}
          >
            <HireMentorLogo
              size={110}
              variant="duo"
              animated={true}
              className="drop-shadow-sm"
            />
          </div>
        </div>

        {/* 2. STACKED TYPOGRAPHY (HIRE / MENTOR / AI) inspired by reference sketch */}
        <div
          className={`mt-8 transition-all duration-700 ease-out delay-100 ${
            stage >= 2
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Decorative subtle divider line */}
          <div className="w-12 h-0.5 bg-[#935073]/40 mx-auto mb-4 rounded-full" />

          <h1 className="flex flex-col items-center font-serif tracking-[0.25em] leading-[1.05] select-none">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#502D55]">
              HIRE
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold text-[#935073] my-0.5">
              MENTOR
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#502D55] tracking-[0.35em] mt-0.5">
              AI
            </span>
          </h1>
        </div>

        {/* 3. SUBTITLE: "Your AI-Powered Career Mentor" */}
        <div
          className={`mt-6 transition-all duration-700 ease-out ${
            stage >= 3
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <p className="text-sm sm:text-base font-medium text-[#502D55]/85 tracking-wide max-w-md">
            Your AI-Powered Career Mentor
          </p>

          <div className="flex items-center justify-center gap-2 mt-2 text-[11px] font-semibold tracking-wider uppercase text-[#935073]">
            <span>ATS Resume</span>
            <span>•</span>
            <span>Job Match</span>
            <span>•</span>
            <span>Mock Interview</span>
          </div>
        </div>

        {/* 4. [ GET STARTED ] BUTTON */}
        <div
          className={`mt-10 transition-all duration-700 ease-out ${
            stage >= 4
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <button
            onClick={handleStart}
            className="group px-8 py-3.5 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] rounded-xl font-bold text-sm tracking-wide shadow-md shadow-[#502D55]/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center gap-2.5 cursor-pointer mx-auto"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 text-[#F6DBC0] group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full max-w-4xl flex items-center justify-between text-[11px] text-[#935073]/80">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#935073]" />
          <span>Violet Dusk Edition</span>
        </div>
        <span>Empowering student & career success</span>
      </footer>
    </div>
  );
};
