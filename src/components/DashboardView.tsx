import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCareer } from '../context/CareerContext';
import { ScoreCircle } from './ScoreCircle';
import {
  FileText,
  Target,
  Mic,
  BarChart3,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  ChevronRight,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const {
    setActiveTab,
    currentResume,
    currentJobMatch,
    currentInterview,
    careerReadinessScore,
    startWorkflowWithPreset,
  } = useCareer();

  const resumeScore = currentResume?.score.overall ?? 0;
  const jobMatchScore = currentJobMatch?.matchPercentage ?? 0;
  const interviewScore = currentInterview?.finalReport?.overallScore ?? 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 bg-[#F8F4E9] text-[#502D55]">
      {/* Welcome Banner in Deep Violet (#502D55) with Warm Blush highlights */}
      <div className="relative overflow-hidden rounded-3xl bg-[#502D55] text-[#F8F4E9] p-6 sm:p-8 shadow-xl border border-[#935073]/40">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#935073]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#F6DBC0]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#935073]/40 border border-[#F6DBC0]/30 text-[#F6DBC0] text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Career Platform Active • Violet Dusk Edition</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#F8F4E9]">
              Welcome to HireMentor, <span className="text-[#F6DBC0]">{user?.name || 'Candidate'}</span>!
            </h2>
            <p className="mt-2 text-[#F8F4E9]/80 text-sm sm:text-base leading-relaxed font-medium">
              Your personalized AI career mentor is ready. Upload your CV to receive ATS scoring, compare against job descriptions, practice realistic mock interviews, and conquer your target role.
            </p>

            {user?.targetRole && (
              <div className="mt-4 flex items-center gap-2 text-xs text-[#F6DBC0]">
                <Target className="w-4 h-4 text-[#F6DBC0]" />
                <span>Targeting: <strong className="text-[#F8F4E9] font-bold">{user.targetRole}</strong></span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {/* Primary Action Button using Warm Blush on Deep Violet card */}
            {!currentResume ? (
              <button
                onClick={() => setActiveTab('resume')}
                className="px-5 py-3 rounded-xl bg-[#F6DBC0] hover:bg-[#F6DBC0]/90 text-[#502D55] font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#502D55]" />
                <span>Upload Resume</span>
                <ArrowRight className="w-4 h-4 text-[#502D55]" />
              </button>
            ) : !currentJobMatch ? (
              <button
                onClick={() => setActiveTab('job-match')}
                className="px-5 py-3 rounded-xl bg-[#F6DBC0] hover:bg-[#F6DBC0]/90 text-[#502D55] font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Target className="w-4 h-4 text-[#502D55]" />
                <span>Match Job Description</span>
                <ArrowRight className="w-4 h-4 text-[#502D55]" />
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('mock-interview')}
                className="px-5 py-3 rounded-xl bg-[#F6DBC0] hover:bg-[#F6DBC0]/90 text-[#502D55] font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mic className="w-4 h-4 text-[#502D55]" />
                <span>Practice Mock Interview</span>
                <ArrowRight className="w-4 h-4 text-[#502D55]" />
              </button>
            )}

            {!currentResume && (
              <button
                onClick={() => startWorkflowWithPreset('ai-ml-grad')}
                className="px-4 py-3 rounded-xl bg-[#935073]/50 hover:bg-[#935073]/80 border border-[#F6DBC0]/30 text-[#F8F4E9] font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#F6DBC0]" />
                <span>Try Sample Candidate</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Progress Scores Overview (Exact palette mapping per prompt instructions) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-extrabold text-[#502D55] tracking-tight">Your Progress & Readiness</h3>
            <p className="text-xs text-[#935073] font-medium">Continuous scoring calculated across all HireMentor AI modules</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Resume Score -> Dusty Plum (#935073) */}
          <div
            onClick={() => setActiveTab('resume')}
            className="p-5 bg-white rounded-2xl border border-[#935073]/25 shadow-xs hover:shadow-md hover:border-[#935073] transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#935073] uppercase tracking-wider">Resume Score</span>
              <span className="p-1.5 rounded-lg bg-[#935073]/15 text-[#935073]">
                <FileText className="w-4 h-4" />
              </span>
            </div>
            <div className="my-3 flex justify-center">
              <ScoreCircle
                score={resumeScore}
                maxScore={100}
                size={110}
                strokeWidth={9}
                variant="dusty-plum"
                sublabel={currentResume ? currentResume.score.grade : 'Not uploaded'}
              />
            </div>
            <div className="pt-2 border-t border-[#935073]/15 flex items-center justify-between text-xs font-semibold">
              <span className="text-[#935073]">{currentResume ? 'ATS Verified' : 'Awaiting CV'}</span>
              <span className="text-[#502D55] flex items-center gap-0.5 font-bold">
                {currentResume ? 'View Breakdown' : 'Upload Now'} <ArrowRight className="w-3 h-3 text-[#935073]" />
              </span>
            </div>
          </div>

          {/* Card 2: Job Match -> Deep Violet (#502D55) */}
          <div
            onClick={() => setActiveTab('job-match')}
            className="p-5 bg-white rounded-2xl border border-[#502D55]/25 shadow-xs hover:shadow-md hover:border-[#502D55] transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#502D55] uppercase tracking-wider">Job Match Score</span>
              <span className="p-1.5 rounded-lg bg-[#502D55]/10 text-[#502D55]">
                <Target className="w-4 h-4" />
              </span>
            </div>
            <div className="my-3 flex justify-center">
              <ScoreCircle
                score={jobMatchScore}
                maxScore={100}
                size={110}
                strokeWidth={9}
                showPercent
                variant="deep-violet"
                sublabel={currentJobMatch ? currentJobMatch.jobTitle.slice(0, 18) : 'No JD matched'}
              />
            </div>
            <div className="pt-2 border-t border-[#935073]/15 flex items-center justify-between text-xs font-semibold">
              <span className="text-[#935073]">
                {currentJobMatch ? `${currentJobMatch.matchingSkills.length} Matching skills` : 'Paste Job Posting'}
              </span>
              <span className="text-[#502D55] flex items-center gap-0.5 font-bold">
                {currentJobMatch ? 'Analyze Gaps' : 'Match Now'} <ArrowRight className="w-3 h-3 text-[#935073]" />
              </span>
            </div>
          </div>

          {/* Card 3: Interview Score -> Warm Blush (#F6DBC0 with Deep Violet text) */}
          <div
            onClick={() => setActiveTab('mock-interview')}
            className="p-5 bg-[#F6DBC0]/70 rounded-2xl border border-[#935073]/30 shadow-xs hover:shadow-md hover:border-[#502D55] transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#502D55] uppercase tracking-wider">Interview Score</span>
              <span className="p-1.5 rounded-lg bg-[#502D55] text-[#F6DBC0]">
                <Mic className="w-4 h-4" />
              </span>
            </div>
            <div className="my-3 flex justify-center">
              <ScoreCircle
                score={interviewScore}
                maxScore={100}
                size={110}
                strokeWidth={9}
                variant="warm-blush"
                sublabel={currentInterview?.finalReport ? 'Report Ready' : 'Pending Mock'}
              />
            </div>
            <div className="pt-2 border-t border-[#935073]/25 flex items-center justify-between text-xs font-semibold text-[#502D55]">
              <span>
                {currentInterview?.finalReport ? 'STAR Evaluated' : '10 Questions'}
              </span>
              <span className="font-bold flex items-center gap-0.5">
                {currentInterview?.finalReport ? 'View Report' : 'Start Simulation'} <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

          {/* Card 4: Career Readiness -> Dusty Plum (#935073) */}
          <div
            onClick={() => setActiveTab('roadmap')}
            className="p-5 bg-white rounded-2xl border border-[#935073]/30 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#935073] uppercase tracking-wider">Career Readiness</span>
              <span className="p-1.5 rounded-lg bg-[#935073]/15 text-[#935073]">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="my-3 flex justify-center">
              <ScoreCircle
                score={careerReadinessScore}
                maxScore={100}
                size={110}
                strokeWidth={9}
                showPercent
                variant="dusty-plum"
                sublabel={
                  careerReadinessScore >= 80
                    ? 'Job Ready'
                    : careerReadinessScore >= 50
                    ? 'On Track'
                    : 'Needs Prep'
                }
              />
            </div>
            <div className="pt-2 border-t border-[#935073]/15 flex items-center justify-between text-xs font-semibold">
              <span className="text-[#935073]">14-Day Sprint</span>
              <span className="font-bold text-[#502D55] flex items-center gap-0.5">
                View Roadmap <ArrowRight className="w-3 h-3 text-[#935073]" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards in Warm Blush & Deep Violet */}
      <div>
        <h3 className="text-lg font-extrabold text-[#502D55] tracking-tight mb-4">Quick Actions</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Card 1 */}
          <div
            onClick={() => setActiveTab('resume')}
            className="p-5 bg-white rounded-2xl border border-[#935073]/20 hover:border-[#502D55] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#502D55] text-[#F6DBC0] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#502D55] text-sm group-hover:text-[#935073] transition">
                Upload Resume
              </h4>
              <p className="text-xs text-[#502D55]/75 mt-1 line-clamp-2">
                Drop your PDF/DOCX to extract skills, calculate 7-dimension ATS score and get suggestions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#935073]/15 flex items-center text-xs font-bold text-[#502D55]">
              <span>{currentResume ? 'Update Resume' : 'Start Upload'}</span>
              <ChevronRight className="w-4 h-4 ml-auto text-[#935073]" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => setActiveTab('resume')}
            className="p-5 bg-white rounded-2xl border border-[#935073]/20 hover:border-[#502D55] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#935073] text-[#F8F4E9] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-[#F6DBC0]" />
              </div>
              <h4 className="font-bold text-[#502D55] text-sm group-hover:text-[#935073] transition">
                Find My Best Career
              </h4>
              <p className="text-xs text-[#502D55]/75 mt-1 line-clamp-2">
                Discover your top-matched tech roles based on your actual experience, degrees, and skills.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#935073]/15 flex items-center text-xs font-bold text-[#502D55]">
              <span>View Roles</span>
              <ChevronRight className="w-4 h-4 ml-auto text-[#935073]" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => setActiveTab('job-match')}
            className="p-5 bg-white rounded-2xl border border-[#935073]/20 hover:border-[#502D55] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#F6DBC0] text-[#502D55] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#502D55] text-sm group-hover:text-[#935073] transition">
                Match With Job
              </h4>
              <p className="text-xs text-[#502D55]/75 mt-1 line-clamp-2">
                Paste any job description to uncover exact keyword alignments and High/Medium/Low skill gaps.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#935073]/15 flex items-center text-xs font-bold text-[#502D55]">
              <span>Check Match</span>
              <ChevronRight className="w-4 h-4 ml-auto text-[#935073]" />
            </div>
          </div>

          {/* Card 4: Interview Start */}
          <div
            onClick={() => setActiveTab('mock-interview')}
            className="p-5 bg-white rounded-2xl border border-[#935073]/20 hover:border-[#502D55] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#502D55] text-[#F8F4E9] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5 text-[#F6DBC0]" />
              </div>
              <h4 className="font-bold text-[#502D55] text-sm group-hover:text-[#935073] transition">
                Start Mock Interview
              </h4>
              <p className="text-xs text-[#502D55]/75 mt-1 line-clamp-2">
                Practice 10 realistic questions with real-time speech dictation and instant STAR evaluations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#935073]/15 flex items-center text-xs font-bold text-[#502D55]">
              <span>Begin Session</span>
              <ChevronRight className="w-4 h-4 ml-auto text-[#935073]" />
            </div>
          </div>

          {/* Card 5 */}
          <div
            onClick={() => setActiveTab('reports')}
            className="p-5 bg-white rounded-2xl border border-[#935073]/20 hover:border-[#502D55] hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#935073] text-[#F6DBC0] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-[#502D55] text-sm group-hover:text-[#935073] transition">
                View Previous Reports
              </h4>
              <p className="text-xs text-[#502D55]/75 mt-1 line-clamp-2">
                Compare your past interview performances, score trends, and saved resume analyses.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#935073]/15 flex items-center text-xs font-bold text-[#502D55]">
              <span>History & Insights</span>
              <ChevronRight className="w-4 h-4 ml-auto text-[#935073]" />
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Complete Journey Stepper in Violet Dusk */}
      <div className="p-6 bg-white rounded-3xl border border-[#935073]/25 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-[#502D55]">Your Structured HireMentor Path</h3>
            <p className="text-xs text-[#935073]">Follow this sequence to maximize your chances of securing job offers</p>
          </div>
          <span className="text-xs font-bold text-[#502D55] bg-[#F6DBC0] px-3 py-1 rounded-full border border-[#935073]/25 self-start sm:self-auto">
            Recommended Workflow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div
            onClick={() => setActiveTab('resume')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              currentResume ? 'bg-[#F6DBC0]/40 border-[#935073]/40' : 'bg-[#F8F4E9] border-[#935073]/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#935073]">Step 1</span>
              {currentResume ? <CheckCircle2 className="w-4 h-4 text-[#502D55]" /> : <span className="w-2 h-2 rounded-full bg-[#935073]/30" />}
            </div>
            <h5 className="font-bold text-sm text-[#502D55]">Resume Analysis</h5>
            <p className="text-xs text-[#502D55]/75 mt-1 font-medium">
              {currentResume ? `Completed: Score ${currentResume.score.overall}/100` : 'Upload your resume to begin'}
            </p>
          </div>

          <div
            onClick={() => setActiveTab('job-match')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              currentJobMatch ? 'bg-[#F6DBC0]/40 border-[#935073]/40' : 'bg-[#F8F4E9] border-[#935073]/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#935073]">Step 2</span>
              {currentJobMatch ? <CheckCircle2 className="w-4 h-4 text-[#502D55]" /> : <span className="w-2 h-2 rounded-full bg-[#935073]/30" />}
            </div>
            <h5 className="font-bold text-sm text-[#502D55]">Job Description Match</h5>
            <p className="text-xs text-[#502D55]/75 mt-1 font-medium">
              {currentJobMatch ? `Match: ${currentJobMatch.matchPercentage}% Alignment` : 'Compare against target role'}
            </p>
          </div>

          <div
            onClick={() => setActiveTab('mock-interview')}
            className={`p-4 rounded-xl border transition cursor-pointer ${
              currentInterview?.finalReport ? 'bg-[#F6DBC0]/40 border-[#935073]/40' : 'bg-[#F8F4E9] border-[#935073]/20'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#935073]">Step 3</span>
              {currentInterview?.finalReport ? <CheckCircle2 className="w-4 h-4 text-[#502D55]" /> : <span className="w-2 h-2 rounded-full bg-[#935073]/30" />}
            </div>
            <h5 className="font-bold text-sm text-[#502D55]">AI Mock Interview</h5>
            <p className="text-xs text-[#502D55]/75 mt-1 font-medium">
              {currentInterview?.finalReport ? `Report Score: ${currentInterview.finalReport.overallScore}/100` : 'Practice 10 tailored questions'}
            </p>
          </div>

          <div
            onClick={() => setActiveTab('roadmap')}
            className="p-4 rounded-xl border bg-[#F8F4E9] border-[#935073]/20 hover:border-[#502D55] transition cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#935073]">Step 4</span>
              <Calendar className="w-4 h-4 text-[#502D55]" />
            </div>
            <h5 className="font-bold text-sm text-[#502D55]">14-Day Roadmap</h5>
            <p className="text-xs text-[#502D55]/75 mt-1 font-medium">
              Follow daily interview preparation sprint
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
