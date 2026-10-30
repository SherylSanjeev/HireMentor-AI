import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ChevronDown, CheckCircle2, FileText, Target, Mic, MapPin, Award } from 'lucide-react';
import { HireMentorLogo } from './HireMentorLogo';
import { AuthModal } from './AuthModal';
import { useAuth } from '../context/AuthContext';

interface StartingScreenProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  authModalOpen: boolean;
  authMode: 'login' | 'signup';
  onCloseAuth: () => void;
}

/**
 * Starting Screen (Prompt Requirements 1, 2, 3, 4, 5)
 *
 * Visual Concept:
 * - Direct implementation of Reference Sketch 2:
 *   [ HireMentor Logo ]
 *        HIRE
 *       MENTOR
 *         AI
 *   Your AI-Powered Career Mentor
 *     [ Get Started → ]
 *
 * - Staged entrance animations for leaves, glasses, tie, typography, and CTA
 * - Soft Ivory (#F8F4E9) canvas, Deep Violet (#502D55) typography, Dusty Plum (#935073) accents
 * - Spacious, minimal, elegant, uncluttered
 * - Direct transition to Login / Sign Up modal
 */
export const StartingScreen: React.FC<StartingScreenProps> = ({
  onOpenAuth,
  authModalOpen,
  authMode,
  onCloseAuth,
}) => {
  const [stage, setStage] = useState<number>(0);
  const [showFeatures, setShowFeatures] = useState<boolean>(false);
  const { loadDemoAccount } = useAuth();

  useEffect(() => {
    // Stage 1: Petals & central glasses (200ms)
    // Stage 2: Stacked Title reveals (700ms)
    // Stage 3: Subtitle reveals (1200ms)
    // Stage 4: Get Started button reveals (1700ms)
    const t1 = setTimeout(() => setStage(1), 200);
    const t2 = setTimeout(() => setStage(2), 700);
    const t3 = setTimeout(() => setStage(3), 1200);
    const t4 = setTimeout(() => setStage(4), 1700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F4E9] text-[#502D55] flex flex-col selection:bg-[#935073] selection:text-[#F8F4E9]">
      {/* ========================================================================= */}
      {/* 1. MINIMAL TOP BAR */}
      {/* ========================================================================= */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <HireMentorLogo size={28} variant="duo" />
          <span className="text-xs font-bold tracking-widest uppercase text-[#502D55]">
            HireMentor AI
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <button
            onClick={() => onOpenAuth('login')}
            className="px-3.5 py-1.5 text-[#502D55] hover:text-[#935073] transition rounded-lg cursor-pointer"
          >
            Log In
          </button>
          <button
            onClick={() => onOpenAuth('signup')}
            className="px-4 py-1.5 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] rounded-xl font-bold transition shadow-xs cursor-pointer"
          >
            Sign Up
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN SPACIOUS STARTING HERO (FAITHFUL TO REFERENCE SKETCH 2) */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 max-w-2xl mx-auto w-full my-auto">
        {/* Subtle decorative background aura */}
        <div className="relative mb-2">
          <div className="absolute -inset-10 bg-[#F6DBC0]/40 rounded-full blur-3xl -z-10 pointer-events-none" />

          {/* Logo with Staged Appearance: Laurel Petals + Glasses + Tie */}
          <div
            className={`transition-all duration-700 ease-out transform ${
              stage >= 1
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-90 translate-y-4'
            }`}
          >
            <HireMentorLogo
              size={120}
              variant="duo"
              animated={true}
              className="drop-shadow-xs"
            />
          </div>
        </div>

        {/* Stacked Minimal Typography: HIRE / MENTOR / AI */}
        <div
          className={`mt-6 transition-all duration-700 ease-out ${
            stage >= 2
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Subtle accent line */}
          <div className="w-10 h-0.5 bg-[#935073]/30 mx-auto mb-4 rounded-full" />

          <h1 className="flex flex-col items-center font-serif tracking-[0.28em] leading-[1.08] select-none">
            <span className="text-3xl sm:text-5xl font-extrabold text-[#502D55]">
              HIRE
            </span>
            <span className="text-3xl sm:text-5xl font-extrabold text-[#935073] my-0.5">
              MENTOR
            </span>
            <span className="text-2xl sm:text-4xl font-black text-[#502D55] tracking-[0.38em] mt-0.5">
              AI
            </span>
          </h1>
        </div>

        {/* Subtitle: "Your AI-Powered Career Mentor" */}
        <div
          className={`mt-6 transition-all duration-700 ease-out ${
            stage >= 3
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <p className="text-base sm:text-lg font-medium text-[#502D55]/85 tracking-wide max-w-md mx-auto">
            Your AI-Powered Career Mentor
          </p>

          <p className="mt-2 text-xs font-semibold text-[#935073] tracking-wider uppercase">
            Resume Scoring • Job Description Match • Mock Interview Coach
          </p>
        </div>

        {/* [ Get Started ] CTA Button */}
        <div
          className={`mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 transition-all duration-700 ease-out ${
            stage >= 4
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <button
            onClick={() => onOpenAuth('signup')}
            className="group w-full sm:w-auto px-8 py-3.5 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] rounded-xl font-bold text-sm tracking-wide shadow-md shadow-[#502D55]/20 hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 text-[#F6DBC0] group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Instant demo for hackathon evaluators */}
          <button
            onClick={() => loadDemoAccount()}
            className="w-full sm:w-auto px-5 py-3.5 bg-[#F6DBC0] hover:bg-[#F6DBC0]/80 text-[#502D55] border border-[#935073]/30 rounded-xl font-bold text-xs tracking-wide transition flex items-center justify-center gap-2 cursor-pointer"
            title="Instantly sign in as Alex Rivera with sample resume and interview data"
          >
            <Sparkles className="w-4 h-4 text-[#935073]" />
            <span>Try Instant Demo</span>
          </button>
        </div>

        {/* Toggle to peek at feature details */}
        <div
          className={`mt-12 transition-all duration-700 ${
            stage >= 4 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={() => setShowFeatures(!showFeatures)}
            className="inline-flex items-center gap-1.5 text-xs text-[#935073] hover:text-[#502D55] transition font-semibold py-1 px-3 rounded-full hover:bg-[#F6DBC0]/40 cursor-pointer"
          >
            <span>{showFeatures ? 'Hide platform overview' : 'Explore platform capabilities'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-300 ${
                showFeatures ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 3. OPTIONAL COLLAPSIBLE PLATFORM PREVIEW */}
      {/* ========================================================================= */}
      {showFeatures && (
        <section className="bg-white border-t border-[#935073]/20 py-12 px-6 animate-in slide-in-from-top-4 duration-300">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#935073]">
                Full Career Intelligence Suite
              </span>
              <h2 className="text-2xl font-extrabold text-[#502D55] mt-1">
                From Blank CV to Offer Letter
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-5 rounded-2xl bg-[#F8F4E9] border border-[#935073]/20">
                <div className="w-10 h-10 rounded-xl bg-[#502D55] text-[#F6DBC0] flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#502D55]">1. ATS Resume Scoring</h3>
                <p className="text-xs text-[#502D55]/80 mt-1 leading-relaxed">
                  100-point multi-dimensional score evaluating technical depth, ATS keywords, impact metrics, and education.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F8F4E9] border border-[#935073]/20">
                <div className="w-10 h-10 rounded-xl bg-[#935073] text-[#F8F4E9] flex items-center justify-center mb-3">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#502D55]">2. Job Match & Skill Gaps</h3>
                <p className="text-xs text-[#502D55]/80 mt-1 leading-relaxed">
                  Paste any job description to instantly detect matching skills and prioritized missing requirements.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F8F4E9] border border-[#935073]/20">
                <div className="w-10 h-10 rounded-xl bg-[#F6DBC0] text-[#502D55] flex items-center justify-center mb-3">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#502D55]">3. AI Mock Interview Coach</h3>
                <p className="text-xs text-[#502D55]/80 mt-1 leading-relaxed">
                  Practice 10 realistic questions spanning HR, Technical, Situational, and Salary with live STAR method feedback.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => onOpenAuth('signup')}
                className="px-6 py-2.5 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] rounded-xl text-xs font-bold shadow-sm transition inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Create Free Account to Get Started</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#F6DBC0]" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. MINIMAL FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#935073]/80 border-t border-[#935073]/15">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#502D55]" />
          <span>HireMentor AI • Violet Dusk Hackathon Edition</span>
        </div>
        <span className="mt-2 sm:mt-0">Built for Students, Engineers & Career Changers</span>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={onCloseAuth}
        onSuccess={onCloseAuth}
      />
    </div>
  );
};
