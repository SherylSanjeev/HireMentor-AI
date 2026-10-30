import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCareer } from '../context/CareerContext';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ActiveTab } from '../types';

import { HireMentorLogo } from './HireMentorLogo';

export const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { activeTab, setActiveTab, currentResume, currentJobMatch, currentInterview, startWorkflowWithPreset } = useCareer();

  let nextAction: { label: string; tab: ActiveTab } = {
    label: 'Upload your CV / Resume',
    tab: 'resume',
  };

  if (currentResume && !currentJobMatch) {
    nextAction = {
      label: 'Match with a Job Description',
      tab: 'job-match',
    };
  } else if (currentResume && currentJobMatch && (!currentInterview || !currentInterview.finalReport)) {
    nextAction = {
      label: 'Practice AI Mock Interview',
      tab: 'mock-interview',
    };
  } else if (currentInterview?.finalReport) {
    nextAction = {
      label: 'View 14-Day Career Roadmap',
      tab: 'roadmap',
    };
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Career Overview';
      case 'resume':
        return 'Resume Studio & Scoring';
      case 'job-match':
        return 'Job Description Match & Skill Gaps';
      case 'mock-interview':
        return 'AI Mock Interview Coach';
      case 'reports':
        return 'Reports & Score History';
      case 'roadmap':
        return '14-Day Interview Readiness Plan';
      case 'profile':
        return 'Candidate Profile & Settings';
      default:
        return 'HireMentor AI';
    }
  };

  return (
    <header className="h-16 bg-[#502D55] text-[#F8F4E9] border-b border-[#935073]/40 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-md">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <HireMentorLogo size={28} variant="light" />
        </div>
        <h1 className="text-base sm:text-lg font-bold text-[#F8F4E9] tracking-tight">
          {getPageTitle()}
        </h1>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#502D55] bg-[#F6DBC0] px-2.5 py-0.5 rounded-full border border-[#935073]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#502D55] animate-pulse" />
          AI Engine Online
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Next recommended action pill: Warm Blush background with Deep Violet text */}
        <button
          onClick={() => setActiveTab(nextAction.tab)}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F6DBC0] hover:bg-[#F6DBC0]/85 text-[#502D55] text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#502D55]" />
          <span>Next: {nextAction.label}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {!currentResume && (
          <button
            onClick={() => startWorkflowWithPreset('ai-ml-grad')}
            className="px-3 py-1.5 rounded-xl bg-[#935073] hover:bg-[#935073]/85 text-[#F8F4E9] text-xs font-bold shadow-xs transition flex items-center gap-1.5 border border-[#F6DBC0]/30 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F6DBC0]" />
            <span>Load Sample Profile</span>
          </button>
        )}

        <div
          onClick={() => setActiveTab('profile')}
          className="w-9 h-9 rounded-xl bg-[#935073] text-[#F8F4E9] border border-[#F6DBC0]/30 flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer hover:opacity-90 transition"
          title="View Profile"
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
};
