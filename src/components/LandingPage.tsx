import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  FileText,
  Target,
  Mic,
  MapPin,
  CheckCircle,
  TrendingUp,
  Brain,
  Award,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { HireMentorLogo } from './HireMentorLogo';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  initialAuthOpen?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({ initialAuthOpen = false }) => {
  const [authModalOpen, setAuthModalOpen] = useState(initialAuthOpen);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const { loadDemoAccount } = useAuth();

  useEffect(() => {
    if (initialAuthOpen) {
      setAuthModalOpen(true);
    }
  }, [initialAuthOpen]);

  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F4E9] text-[#502D55] flex flex-col selection:bg-[#935073] selection:text-[#F8F4E9]">
      {/* Top Navbar in Deep Violet structure */}
      <header className="sticky top-0 z-40 bg-[#502D55] border-b border-[#935073]/40 text-[#F8F4E9] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HireMentorLogo size={36} variant="light" />
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#F8F4E9]">
                HireMentor <span className="text-[#F6DBC0]">AI</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#935073] text-[#F8F4E9] border border-[#F6DBC0]/20">
                Career Engine
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#F8F4E9]/80">
            <a href="#features" className="hover:text-[#F6DBC0] transition">Features</a>
            <a href="#workflow" className="hover:text-[#F6DBC0] transition">How It Works</a>
            <a href="#interviews" className="hover:text-[#F6DBC0] transition">Mock Interview</a>
            <a href="#roadmap" className="hover:text-[#F6DBC0] transition">Career Roadmap</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenAuth('login')}
              className="px-4 py-2 text-sm font-bold text-[#F8F4E9] hover:text-[#F6DBC0] transition rounded-xl"
            >
              Log In
            </button>
            <button
              onClick={() => handleOpenAuth('signup')}
              className="px-4 py-2 text-sm font-bold text-[#502D55] bg-[#F6DBC0] hover:bg-[#F6DBC0]/90 rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden bg-[#F8F4E9]">
        {/* Soft background accents */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#F6DBC0]/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F6DBC0]/80 border border-[#935073]/30 shadow-xs text-xs font-bold text-[#502D55] mb-6">
            <Sparkles className="w-4 h-4 text-[#935073]" />
            <span>AI Resume Scoring • Job Match • Live Mock Interview Coach</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-[#502D55] tracking-tight leading-[1.15]">
            Land Your Dream Job With <br />
            <span className="text-[#935073]">
              Intelligent Career Mentorship
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#502D55]/80 max-w-2xl mx-auto leading-relaxed font-medium">
            Upload your resume, get an instant 100-point ATS evaluation, match with target job descriptions, and practice realistic mock interviews with immediate AI feedback.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary button: Background #502D55, text #F8F4E9, hover #935073 */}
            <button
              onClick={() => handleOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-[#F8F4E9] bg-[#502D55] hover:bg-[#935073] rounded-xl shadow-md shadow-[#502D55]/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-5 h-5 text-[#F6DBC0]" />
              <span>Analyze My Resume Free</span>
              <ArrowRight className="w-4 h-4 text-[#F6DBC0]" />
            </button>

            {/* Secondary button: Background #F6DBC0, text #502D55 */}
            <button
              onClick={() => loadDemoAccount()}
              className="w-full sm:w-auto px-6 py-3.5 text-base font-bold text-[#502D55] bg-[#F6DBC0] hover:bg-[#F6DBC0]/85 border border-[#935073]/30 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Brain className="w-5 h-5 text-[#935073]" />
              <span>Try Instant Interactive Demo</span>
            </button>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#935073]">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#502D55]" />
              <span>Free for Students & Job Seekers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#502D55]" />
              <span>Real-Time STAR Method Feedback</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#502D55]" />
              <span>14-Day Readiness Roadmap</span>
            </div>
          </div>
        </div>

        {/* Hero Product Preview Card */}
        <div className="max-w-5xl mx-auto mt-14 px-4 sm:px-6">
          <div className="bg-[#F8F4E9] rounded-2xl shadow-xl border border-[#935073]/30 overflow-hidden">
            <div className="bg-[#502D55] px-4 py-3 flex items-center justify-between border-b border-[#935073]/40">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#935073]" />
                <div className="w-3 h-3 rounded-full bg-[#F6DBC0]" />
                <div className="w-3 h-3 rounded-full bg-[#F8F4E9]" />
                <span className="ml-3 text-xs text-[#F8F4E9]/70 font-mono">hirementor.ai/dashboard</span>
              </div>
              <span className="text-xs text-[#F6DBC0] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F6DBC0] animate-ping inline-block" />
                Violet Dusk AI Engine Active
              </span>
            </div>

            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#F8F4E9]">
              {/* Score snippet 1 */}
              <div className="bg-white p-5 rounded-2xl border border-[#935073]/20 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#935073] uppercase tracking-wider">Resume ATS Score</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F6DBC0] text-[#502D55]">Excellent</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-[#502D55]">89</span>
                    <span className="text-[#935073] font-medium">/ 100</span>
                  </div>
                  <p className="mt-2 text-xs text-[#502D55]/80">
                    High impact project metrics, verified skills, and strong education alignment.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#935073]/15 flex items-center justify-between text-xs font-bold text-[#502D55]">
                  <span>ATS Readiness</span>
                  <span className="text-[#935073]">92%</span>
                </div>
              </div>

              {/* Score snippet 2 */}
              <div className="bg-white p-5 rounded-2xl border border-[#935073]/20 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#935073] uppercase tracking-wider">Job Match Target</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#502D55] text-[#F8F4E9]">AI / ML Engineer</span>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-[#935073]">82%</span>
                    <span className="text-[#502D55]/70 font-medium">Alignment</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F6DBC0] text-[#502D55]">✅ Python</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#F6DBC0] text-[#502D55]">✅ PyTorch</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#935073]/15 text-[#502D55]">🟡 SQL</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#502D55]/10 text-[#502D55]">❌ Docker</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#935073]/15 flex items-center justify-between text-xs font-bold text-[#502D55]">
                  <span>Priority Skill:</span>
                  <span className="text-[#935073]">SQL CTEs & Tuning</span>
                </div>
              </div>

              {/* Score snippet 3 */}
              <div className="bg-white p-5 rounded-2xl border border-[#935073]/20 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#935073] uppercase tracking-wider">Mock Interview Coach</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#F6DBC0] text-[#502D55]">Question 3 / 10</span>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-[#502D55] line-clamp-2">
                    "Walk me through the architecture and trade-offs of your autonomous drone vision project."
                  </p>
                  <div className="mt-2 text-[11px] p-2 bg-[#F6DBC0]/60 rounded-xl text-[#502D55] border border-[#935073]/20 font-medium">
                    <strong className="font-bold">AI Coach Tip:</strong> Use STAR. Mention the 35% latency drop.
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#935073]/15 flex items-center justify-between text-xs font-bold text-[#502D55]">
                  <span className="flex items-center gap-1 text-[#935073]">
                    <Mic className="w-3.5 h-3.5" />
                    Speech-to-Text Active
                  </span>
                  <span>STAR Evaluation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 5 Key Pillars / Features */}
      <section id="features" className="py-16 bg-[#F8F4E9] border-y border-[#935073]/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[#935073]">Comprehensive Career Suite</h2>
            <p className="mt-2 text-3xl font-extrabold text-[#502D55]">
              Everything You Need To Get Hired
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[#935073]/20 bg-white hover:border-[#502D55] transition hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#502D55] flex items-center justify-center text-[#F6DBC0] mb-4">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#502D55]">1. AI Resume Analysis</h3>
              <p className="mt-2 text-sm text-[#502D55]/80 leading-relaxed font-medium">
                Extracts your skills, projects, internships, and education. Scores out of 100 with clear Strengths, Weak Areas, and Actionable Suggestions.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#935073]/20 bg-white hover:border-[#502D55] transition hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#935073] flex items-center justify-center text-[#F8F4E9] mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#502D55]">2. Best Career Roles</h3>
              <p className="mt-2 text-sm text-[#502D55]/80 leading-relaxed font-medium">
                Recommends your strongest career matches with match percentages, why they suit you, matching vs missing skills, and interview difficulty.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#935073]/20 bg-white hover:border-[#502D55] transition hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#F6DBC0] flex items-center justify-center text-[#502D55] mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#502D55]">3. Job Description Match</h3>
              <p className="mt-2 text-sm text-[#502D55]/80 leading-relaxed font-medium">
                Paste any job posting. Compares requirements directly against your CV to highlight matching, partial, and missing skills with high/medium/low learning priorities.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#935073]/20 bg-white hover:border-[#502D55] transition hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#502D55] flex items-center justify-center text-[#F8F4E9] mb-4">
                <Mic className="w-6 h-6 text-[#F6DBC0]" />
              </div>
              <h3 className="text-lg font-bold text-[#502D55]">4. AI Mock Interview</h3>
              <p className="mt-2 text-sm text-[#502D55]/80 leading-relaxed font-medium">
                10 structured questions spanning HR, Resume, Technical, Situational, and Salary categories with voice dictation, audio questions, and immediate score breakdowns.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#935073]/20 bg-white hover:border-[#502D55] transition hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#935073] flex items-center justify-center text-[#F6DBC0] mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#502D55]">5. 14-Day Career Roadmap</h3>
              <p className="mt-2 text-sm text-[#502D55]/80 leading-relaxed font-medium">
                A daily step-by-step interview readiness sprint with interactive checklists, curriculum focus areas, and mock test checkpoints.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#935073]/20 bg-white hover:border-[#502D55] transition hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#F6DBC0] flex items-center justify-center text-[#502D55] mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#502D55]">6. Report History</h3>
              <p className="mt-2 text-sm text-[#502D55]/80 leading-relaxed font-medium">
                Track your career readiness over time, revisit past mock interview answers, and see measurable score growth across revisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Complete HireMentor Workflow Journey */}
      <section id="workflow" className="py-16 bg-[#F8F4E9]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold tracking-wider uppercase text-[#935073]">Proven Methodology</h2>
            <p className="mt-2 text-3xl font-extrabold text-[#502D55]">
              The Complete HireMentor AI Workflow
            </p>
            <p className="mt-3 text-sm text-[#502D55]/80">
              Each stage smoothly connects into the next so you are never left guessing what to do.
            </p>
          </div>

          <div className="mt-12 flex flex-col md:flex-row items-stretch justify-between gap-4">
            <div className="flex-1 bg-white p-5 rounded-2xl border border-[#935073]/25 shadow-xs flex flex-col">
              <span className="text-xs font-bold text-[#F8F4E9] bg-[#502D55] w-6 h-6 rounded-full flex items-center justify-center mb-3">1</span>
              <h4 className="font-bold text-[#502D55] text-sm">Upload CV</h4>
              <p className="text-xs text-[#935073] mt-1">Upload PDF, DOCX or paste text to extract 12+ categories.</p>
            </div>

            <div className="flex-1 bg-white p-5 rounded-2xl border border-[#935073]/25 shadow-xs flex flex-col">
              <span className="text-xs font-bold text-[#F8F4E9] bg-[#502D55] w-6 h-6 rounded-full flex items-center justify-center mb-3">2</span>
              <h4 className="font-bold text-[#502D55] text-sm">AI Score & Roles</h4>
              <p className="text-xs text-[#935073] mt-1">Detailed 100-point score & recommended career matches.</p>
            </div>

            <div className="flex-1 bg-white p-5 rounded-2xl border border-[#935073]/25 shadow-xs flex flex-col">
              <span className="text-xs font-bold text-[#F8F4E9] bg-[#502D55] w-6 h-6 rounded-full flex items-center justify-center mb-3">3</span>
              <h4 className="font-bold text-[#502D55] text-sm">Job Description Match</h4>
              <p className="text-xs text-[#935073] mt-1">Check alignment & get prioritized High/Medium/Low skill gaps.</p>
            </div>

            <div className="flex-1 bg-white p-5 rounded-2xl border border-[#935073]/25 shadow-xs flex flex-col">
              <span className="text-xs font-bold text-[#F8F4E9] bg-[#502D55] w-6 h-6 rounded-full flex items-center justify-center mb-3">4</span>
              <h4 className="font-bold text-[#502D55] text-sm">Mock Interview</h4>
              <p className="text-xs text-[#935073] mt-1">10 questions covering HR, Resume, Tech, Situational & Salary.</p>
            </div>

            <div className="flex-1 bg-white p-5 rounded-2xl border border-[#935073]/25 shadow-xs flex flex-col">
              <span className="text-xs font-bold text-[#F8F4E9] bg-[#502D55] w-6 h-6 rounded-full flex items-center justify-center mb-3">5</span>
              <h4 className="font-bold text-[#502D55] text-sm">14-Day Roadmap</h4>
              <p className="text-xs text-[#935073] mt-1">Curated study sprint & final offer negotiation strategy.</p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => handleOpenAuth('signup')}
              className="px-8 py-3.5 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] rounded-xl text-base font-bold shadow-md shadow-[#502D55]/20 transition inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Get Started On Your Journey</span>
              <ArrowRight className="w-4 h-4 text-[#F6DBC0]" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer in Deep Violet */}
      <footer className="mt-auto bg-[#502D55] text-[#F8F4E9]/75 py-10 border-t border-[#935073]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <HireMentorLogo size={32} variant="light" />
            <span className="text-[#F8F4E9] font-bold tracking-tight">HireMentor AI</span>
          </div>

          <p className="text-xs text-[#F8F4E9]/60 text-center sm:text-right">
            © {new Date().getFullYear()} HireMentor AI. Violet Dusk Edition. Built for students, engineers, and career switchers.
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};
