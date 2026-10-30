/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CareerProvider, useCareer } from './context/CareerContext';
import { StartingScreen } from './components/StartingScreen';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ResumeView } from './components/ResumeView';
import { JobMatchView } from './components/JobMatchView';
import FindJobsView from './components/FindJobsView';
import { MockInterviewView } from './components/MockInterviewView';
import { ReportsHistoryView } from './components/ReportsHistoryView';
import { CareerRoadmapView } from './components/CareerRoadmapView';
import { ProfileView } from './components/ProfileView';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { activeTab } = useCareer();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  // Loading state check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F4E9] flex items-center justify-center text-[#502D55]">
        <div className="w-10 h-10 rounded-full border-3 border-[#502D55] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Unauthenticated State: Mandatory Starting Screen / Auth (Prompt Requirements 1, 2, 3 & 4)
  if (!isAuthenticated) {
    return (
      <StartingScreen
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setAuthModalOpen(true);
        }}
        authModalOpen={authModalOpen}
        authMode={authMode}
        onCloseAuth={() => setAuthModalOpen(false)}
      />
    );
  }

  // Authenticated State -> Dashboard & Subviews with Violet Dusk Theme & Navigation
  return (
    <div className="min-h-screen bg-[#F8F4E9] flex flex-col md:flex-row text-[#502D55] antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 overflow-y-auto min-h-screen">
        <Navbar />

        <main className="flex-1 pb-10">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'resume' && <ResumeView />}
          {activeTab === 'job-match' && <JobMatchView />}
          {activeTab === 'find-jobs' && <FindJobsView />}
          {activeTab === 'mock-interview' && <MockInterviewView />}
          {activeTab === 'reports' && <ReportsHistoryView />}
          {activeTab === 'roadmap' && <CareerRoadmapView />}
          {activeTab === 'profile' && <ProfileView />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CareerProvider>
        <MainAppContent />
      </CareerProvider>
    </AuthProvider>
  );
}
