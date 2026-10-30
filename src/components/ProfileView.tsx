import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCareer } from '../context/CareerContext';
import {
  User,
  Mail,
  Target,
  Sparkles,
  LogOut,
  Trash2,
  Save,
  CheckCircle2,
  Award,
  Layers,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, updateProfile, logout, loadDemoAccount } = useAuth();
  const {
    careerReadinessScore,
    resumeHistory,
    interviewHistory,
    jobMatchHistory,
    startWorkflowWithPreset,
    resetAllCareerData,
  } = useCareer();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'AI / Machine Learning Engineer');
  const [careerGoal, setCareerGoal] = useState(
    user?.careerGoal || 'Land a tier-1 engineering role at a high-growth tech organization'
  );
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      targetRole,
      careerGoal,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#502D55] tracking-tight">
          Candidate Profile & Preferences
        </h2>
        <p className="mt-1 text-sm text-[#502D55]/70">
          Manage your career target, personal details, and account data persistence.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-2xl bg-[#F6DBC0]/40 border border-[#935073]/30 text-[#502D55] text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#935073]" />
          <span>Profile changes updated and saved to session storage successfully.</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-[#F8F4E9] rounded-3xl border border-[#935073]/20 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-[#935073]/15">
          <div className="w-20 h-20 rounded-2xl bg-[#502D55] text-[#F6DBC0] flex items-center justify-center font-extrabold text-3xl shadow-md shrink-0 border border-[#935073]/30">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold text-[#502D55]">{name || 'Candidate'}</h3>
            <p className="text-xs text-[#502D55]/70 mt-0.5">{email || 'user@example.com'}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-[#F6DBC0] text-[#502D55] text-xs font-semibold border border-[#935073]/20">
                {targetRole}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#935073] text-[#F8F4E9] text-xs font-semibold">
                Readiness: {careerReadinessScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-4 pt-6 text-center">
          <div className="p-3 rounded-2xl bg-[#F6DBC0]/30 border border-[#935073]/10">
            <span className="text-xs text-[#502D55]/70 font-semibold uppercase tracking-wider block">Resumes</span>
            <span className="text-xl font-black text-[#502D55] mt-0.5 block">{resumeHistory.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#F6DBC0]/30 border border-[#935073]/10">
            <span className="text-xs text-[#502D55]/70 font-semibold uppercase tracking-wider block">Job Matches</span>
            <span className="text-xl font-black text-[#502D55] mt-0.5 block">{jobMatchHistory.length}</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#F6DBC0]/30 border border-[#935073]/10">
            <span className="text-xs text-[#502D55]/70 font-semibold uppercase tracking-wider block">Interviews</span>
            <span className="text-xl font-black text-[#502D55] mt-0.5 block">{interviewHistory.length}</span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-[#F8F4E9] rounded-3xl border border-[#935073]/20 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#502D55] mb-2">Edit Candidate Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#502D55] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#935073]/25 bg-white text-[#502D55] focus:outline-none focus:ring-2 focus:ring-[#935073]/30 focus:border-[#502D55]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#502D55] mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#935073]/25 bg-white text-[#502D55] focus:outline-none focus:ring-2 focus:ring-[#935073]/30 focus:border-[#502D55]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#502D55] mb-1">Target Engineering Role</label>
          <input
            type="text"
            value={targetRole}
            onChange={e => setTargetRole(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#935073]/25 bg-white text-[#502D55] focus:outline-none focus:ring-2 focus:ring-[#935073]/30 focus:border-[#502D55]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#502D55] mb-1">Career Goal Statement</label>
          <textarea
            rows={3}
            value={careerGoal}
            onChange={e => setCareerGoal(e.target.value)}
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#935073]/25 bg-white text-[#502D55] focus:outline-none focus:ring-2 focus:ring-[#935073]/30 focus:border-[#502D55]"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>

      {/* Danger & Demo Utilities */}
      <div className="bg-[#F8F4E9] rounded-3xl border border-[#935073]/20 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-[#502D55]">Account Management & Quick Testing</h3>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={() => startWorkflowWithPreset('ai-ml-grad')}
            className="px-4 py-2.5 rounded-xl border border-[#935073]/30 bg-[#F6DBC0]/40 hover:bg-[#F6DBC0] text-[#502D55] text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#935073]" />
            <span>Load Complete AI/ML Candidate Profile</span>
          </button>

          <button
            type="button"
            onClick={resetAllCareerData}
            className="px-4 py-2.5 rounded-xl border border-[#935073]/20 bg-white hover:bg-[#F6DBC0]/20 text-[#502D55] text-xs font-semibold transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-3.5 h-3.5 text-[#935073]" />
            <span>Clear Saved Career Records</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2.5 rounded-xl border border-[#935073]/40 bg-[#935073] hover:bg-[#502D55] text-[#F8F4E9] text-xs font-bold transition flex items-center justify-center gap-2 sm:ml-auto"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
