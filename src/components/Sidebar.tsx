import React from 'react';
import {
  Home,
  FileText,
  Target,
  BriefcaseBusiness,
  Mic,
  BarChart3,
  MapPin,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from '../types';
import { useCareer } from '../context/CareerContext';
import { useAuth } from '../context/AuthContext';
import { HireMentorLogo } from './HireMentorLogo';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentResume, currentJobMatch, currentInterview, careerReadinessScore } = useCareer();
  const { user, logout } = useAuth();

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'resume', label: 'Resume', icon: FileText, badge: currentResume ? `${currentResume.score.overall}` : undefined },
    { id: 'job-match', label: 'Job Match', icon: Target, badge: currentJobMatch ? `${currentJobMatch.matchPercentage}%` : undefined },
    { id: 'find-jobs', label: 'Find Jobs', icon: BriefcaseBusiness },
    { id: 'mock-interview', label: 'Mock Interview', icon: Mic, badge: currentInterview?.finalReport ? `${currentInterview.finalReport.overallScore}` : undefined },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'roadmap', label: 'Career Roadmap', icon: MapPin },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Desktop Sidebar in Deep Violet (#502D55) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#502D55] text-[#F8F4E9] border-r border-[#935073]/40 h-screen sticky top-0 z-30 select-none shadow-xl">
        {/* Brand */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-[#935073]/30">
          <HireMentorLogo size={36} variant="light" />
          <div className="flex flex-col">
            <span className="font-extrabold text-[#F8F4E9] tracking-tight text-base leading-none">
              HireMentor <span className="text-[#F6DBC0]">AI</span>
            </span>
            <span className="text-[10px] font-medium text-[#F6DBC0]/80 mt-1">
              Violet Dusk Career Mentor
            </span>
          </div>
        </div>

        {/* Readiness Meter Card in Dusty Plum / Warm Blush */}
        <div className="p-4 mx-3 my-3 bg-[#935073]/30 rounded-2xl border border-[#935073]/40 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#F6DBC0] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#F6DBC0]" />
              Career Readiness
            </span>
            <span className="text-xs font-black text-[#F8F4E9]">
              {careerReadinessScore > 0 ? `${careerReadinessScore}%` : 'Getting Started'}
            </span>
          </div>
          <div className="w-full bg-[#502D55] rounded-full h-2 overflow-hidden border border-[#935073]/30">
            <div
              className="bg-[#F6DBC0] h-2 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${Math.max(8, careerReadinessScore)}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-[#F8F4E9]/75 leading-tight">
            {!currentResume
              ? 'Upload your resume to calculate your score'
              : !currentJobMatch
              ? 'Match with a job description next'
              : !currentInterview
              ? 'Complete a mock interview to reach 100%'
              : 'Great work! Review your roadmap sprint'}
          </p>
        </div>

        {/* Nav list - Active item #935073, Hover #935073/50 */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pt-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-[#935073] text-[#F8F4E9] shadow-sm border border-[#F6DBC0]/30'
                    : 'text-[#F8F4E9]/80 hover:text-[#F8F4E9] hover:bg-[#935073]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#F6DBC0]' : 'text-[#F8F4E9]/70 group-hover:text-[#F6DBC0]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      isActive
                        ? 'bg-[#F6DBC0] text-[#502D55]'
                        : 'bg-[#935073]/50 text-[#F6DBC0] border border-[#F6DBC0]/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-[#935073]/30">
          <div className="p-2.5 rounded-xl bg-[#935073]/20 border border-[#935073]/30 flex items-center justify-between">
            <div
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2.5 overflow-hidden cursor-pointer hover:opacity-90 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-[#F6DBC0] text-[#502D55] flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-[#F8F4E9] truncate">{user?.name || 'Candidate'}</p>
                <p className="text-[10px] text-[#F6DBC0]/80 truncate">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-1.5 rounded-lg text-[#F8F4E9]/70 hover:text-[#F8F4E9] hover:bg-[#935073] transition cursor-pointer"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation in Deep Violet (#502D55) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#502D55] border-t border-[#935073]/40 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {navItems.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition cursor-pointer ${
                isActive ? 'text-[#F6DBC0]' : 'text-[#F8F4E9]/70 hover:text-[#F8F4E9]'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#F6DBC0] stroke-[2.5]' : 'text-[#F8F4E9]/70'}`} />
              <span className="truncate max-w-[54px]">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-semibold transition cursor-pointer ${
            activeTab === 'profile' ? 'text-[#F6DBC0]' : 'text-[#F8F4E9]/70'
          }`}
        >
          <User className={`w-5 h-5 mb-0.5 ${activeTab === 'profile' ? 'text-[#F6DBC0] stroke-[2.5]' : 'text-[#F8F4E9]/70'}`} />
          <span>Profile</span>
        </button>
      </nav>
    </>
  );
};
