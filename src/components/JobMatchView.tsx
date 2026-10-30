import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { SAMPLE_JOB_DESCRIPTIONS } from '../utils/presets';
import { ScoreCircle } from './ScoreCircle';
import {
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Mic,
  TrendingUp,
} from 'lucide-react';
import { JobMatchRecord } from '../types';

export const JobMatchView: React.FC = () => {
  const { currentResume, currentJobMatch, addJobMatchRecord, setActiveTab } = useCareer();

  const [jobTitle, setJobTitle] = useState(currentJobMatch?.jobTitle || 'AI / Machine Learning Engineer');
  const [jobDescription, setJobDescription] = useState(currentJobMatch?.jobDescription || '');
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMatch = async (titleToUse?: string, descToUse?: string) => {
    const finalTitle = titleToUse || jobTitle;
    const finalDesc = descToUse || jobDescription;

    if (!finalDesc.trim()) {
      setError('Please paste a job description or choose a sample job posting.');
      return;
    }

    setMatching(true);
    setError(null);

    try {
      const response = await fetch('/api/job/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: finalTitle,
          jobDescription: finalDesc,
          resumeSkills: currentResume?.parsed?.technicalSkills || [
            'Python', 'Machine Learning', 'Pandas', 'NumPy', 'Git', 'SQL',
          ],
          resumeText: currentResume?.rawText || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to compute job match.');
      }

      const data: JobMatchRecord = await response.json();
      addJobMatchRecord(data);
    } catch (err: any) {
      console.error('Job match error:', err);
      setError(err.message || 'Error comparing job description.');
    } finally {
      setMatching(false);
    }
  };

  const handleSelectSampleJob = (sampleId: string) => {
    const sample = SAMPLE_JOB_DESCRIPTIONS.find(s => s.id === sampleId);
    if (!sample) return;
    setJobTitle(sample.title);
    setJobDescription(sample.description);
    handleMatch(sample.title, sample.description);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 bg-[#F8F4E9] text-[#502D55]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#502D55] tracking-tight">
            Job Description Matching & Skill Gap Engine
          </h2>
          <p className="mt-1 text-sm text-[#935073]">
            Compare your resume directly against specific job postings to detect matching, partial, and missing skills.
          </p>
        </div>
      </div>

      {/* Input Form & Sample Job Selectors */}
      <div className="bg-white rounded-3xl border border-[#935073]/25 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-base font-extrabold text-[#502D55]">Target Role & Job Description</h3>
          {/* Quick preset buttons in Warm Blush / Dusty Plum */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#935073]">Sample Postings:</span>
            {SAMPLE_JOB_DESCRIPTIONS.map(sample => (
              <button
                key={sample.id}
                onClick={() => handleSelectSampleJob(sample.id)}
                className="px-2.5 py-1 rounded-lg border border-[#935073]/30 bg-[#F8F4E9] hover:bg-[#F6DBC0] text-[#502D55] text-xs font-bold transition cursor-pointer"
              >
                {sample.title.split(' ')[0]} {sample.title.split(' ')[1]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-[#935073]/15 border border-[#935073]/30 text-[#502D55] text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#935073]" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#502D55] mb-1.5">Target Job Title</label>
            <input
              type="text"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              placeholder="e.g. Junior AI / Machine Learning Engineer"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#935073]/30 bg-white text-[#502D55] focus:outline-none focus:ring-2 focus:ring-[#935073]/25 focus:border-[#502D55]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#502D55] mb-1.5">Job Description Requirements</label>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste the full job posting, required qualifications, tech stack, and responsibilities here..."
              className="w-full p-4 text-xs font-mono rounded-2xl border border-[#935073]/30 bg-[#F8F4E9]/30 text-[#502D55] focus:outline-none focus:ring-2 focus:ring-[#935073]/25 focus:border-[#502D55] leading-relaxed"
            />
          </div>

          <div className="flex justify-end">
            {/* Primary button: Background #502D55, text #F8F4E9, hover #935073 */}
            <button
              onClick={() => handleMatch()}
              disabled={matching || !jobDescription.trim()}
              className="px-6 py-2.5 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] rounded-xl text-xs font-bold shadow-md shadow-[#502D55]/20 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {matching ? (
                <span>Calculating Match Alignment...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#F6DBC0]" />
                  <span>Analyze Job Match & Skill Gaps →</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MATCH RESULTS (When currentJobMatch exists) */}
      {currentJobMatch && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Circular Match Percentage Card & Keyword Alignment */}
          <div className="bg-white rounded-3xl border border-[#935073]/25 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left shrink-0">
                <ScoreCircle
                  score={currentJobMatch.matchPercentage}
                  maxScore={100}
                  size={140}
                  strokeWidth={12}
                  showPercent
                  variant="deep-violet"
                  sublabel={
                    currentJobMatch.matchPercentage >= 80
                      ? 'Strong Match'
                      : currentJobMatch.matchPercentage >= 65
                      ? 'Moderate Match'
                      : 'Skill Gap Warning'
                  }
                />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#935073]">
                    Target Job Alignment
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#502D55] mt-0.5">
                    {currentJobMatch.jobTitle}
                  </h3>
                  <p className="text-xs text-[#935073] mt-1 max-w-sm font-medium">
                    {currentJobMatch.matchingSkills.length} verified matching qualifications, {currentJobMatch.partiallyMatchingSkills.length} partial, and {currentJobMatch.missingSkills.length} identified gaps.
                  </p>
                </div>
              </div>

              {/* Skill Alignment Snapshot */}
              <div className="w-full lg:max-w-md p-5 rounded-2xl bg-[#F8F4E9] border border-[#935073]/20 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#502D55] block">
                  Skill Alignment Snapshot
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {currentJobMatch.matchingSkills.map((s, i) => (
                    <span key={'m_' + i} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#502D55] text-[#F8F4E9] flex items-center gap-1">
                      <span>✓</span>
                      <span>{s}</span>
                    </span>
                  ))}
                  {currentJobMatch.partiallyMatchingSkills.map((s, i) => (
                    <span key={'p_' + i} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#F6DBC0] text-[#502D55] border border-[#935073]/30 flex items-center gap-1">
                      <span>≈</span>
                      <span>{s}</span>
                    </span>
                  ))}
                  {currentJobMatch.missingSkills.map((s, i) => (
                    <span key={'mis_' + i} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#935073]/20 text-[#502D55] border border-[#935073]/40 flex items-center gap-1">
                      <span>✕</span>
                      <span>{s}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* DEDICATED SKILL GAP ANALYSIS SECTION in Violet Dusk */}
          <div className="bg-white rounded-3xl border border-[#935073]/25 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6DBC0] border border-[#935073]/30 text-[#502D55] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#502D55]" />
                <span>Section 9 • Dedicated Skill Gap Analysis</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#502D55] tracking-tight">
                Skill Gap Categorization
              </h3>
              <p className="text-xs text-[#935073] mt-1 font-medium">
                Pinpointing where your profile excels and where to invest prep hours before interview day.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Already Strong */}
              <div className="p-6 rounded-2xl border border-[#502D55]/30 bg-[#F8F4E9]">
                <div className="flex items-center gap-2 text-[#502D55] font-extrabold text-sm mb-3">
                  <CheckCircle2 className="w-5 h-5 text-[#502D55]" />
                  <span>Already Strong</span>
                </div>
                <p className="text-xs text-[#935073] mb-4 font-medium">
                  Fully verified from your projects, degrees, or internships.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentJobMatch.skillGaps.alreadyStrong.map((s, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-[#502D55] text-[#F8F4E9] font-bold text-xs">
                      {s}
                    </span>
                  ))}
                  {currentJobMatch.skillGaps.alreadyStrong.length === 0 && (
                    <span className="text-xs text-[#935073] italic">None detected</span>
                  )}
                </div>
              </div>

              {/* Needs Improvement */}
              <div className="p-6 rounded-2xl border border-[#935073]/30 bg-[#F6DBC0]/40">
                <div className="flex items-center gap-2 text-[#502D55] font-extrabold text-sm mb-3">
                  <AlertTriangle className="w-5 h-5 text-[#935073]" />
                  <span>Needs Improvement</span>
                </div>
                <p className="text-xs text-[#935073] mb-4 font-medium">
                  Partial match or needs deeper production / optimization evidence.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentJobMatch.skillGaps.needsImprovement.map((s, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-[#935073] text-[#F8F4E9] font-bold text-xs">
                      {s}
                    </span>
                  ))}
                  {currentJobMatch.skillGaps.needsImprovement.length === 0 && (
                    <span className="text-xs text-[#935073] italic">No partial skills</span>
                  )}
                </div>
              </div>

              {/* Missing */}
              <div className="p-6 rounded-2xl border border-[#935073]/40 bg-white">
                <div className="flex items-center gap-2 text-[#502D55] font-extrabold text-sm mb-3">
                  <XCircle className="w-5 h-5 text-[#935073]" />
                  <span>Missing</span>
                </div>
                <p className="text-xs text-[#935073] mb-4 font-medium">
                  Crucial keywords not found on your current resume document.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {currentJobMatch.skillGaps.missing.map((s, i) => (
                    <span key={i} className="px-3 py-1 rounded-xl bg-[#F6DBC0] text-[#502D55] font-bold text-xs border border-[#935073]/30">
                      {s}
                    </span>
                  ))}
                  {currentJobMatch.skillGaps.missing.length === 0 && (
                    <span className="text-xs text-[#935073] italic">No missing critical skills</span>
                  )}
                </div>
              </div>
            </div>

            {/* Personalized Learning Priority (HIGH -> MEDIUM -> LOW) */}
            <div className="mt-8 pt-6 border-t border-[#935073]/15">
              <h4 className="text-sm font-extrabold text-[#502D55] mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#935073]" />
                <span>Personalized Learning Priority</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentJobMatch.skillGaps.priorities.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex flex-col justify-between ${
                      item.priority === 'HIGH'
                        ? 'bg-[#F6DBC0]/60 border-[#502D55]/30'
                        : item.priority === 'MEDIUM'
                        ? 'bg-[#F8F4E9] border-[#935073]/30'
                        : 'bg-white border-[#935073]/25'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            item.priority === 'HIGH'
                              ? 'bg-[#502D55] text-[#F8F4E9]'
                              : item.priority === 'MEDIUM'
                              ? 'bg-[#935073] text-[#F8F4E9]'
                              : 'bg-[#F6DBC0] text-[#502D55] border border-[#935073]/20'
                          }`}
                        >
                          {item.priority} PRIORITY
                        </span>
                      </div>
                      <h5 className="font-extrabold text-[#502D55] text-sm">{item.skill}</h5>
                      <p className="text-xs text-[#502D55]/85 mt-1 leading-relaxed font-medium">{item.reason}</p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#935073]/15 text-xs">
                      <span className="text-[#935073] block text-[10px] uppercase font-bold">Study Path:</span>
                      <span className="font-semibold text-[#502D55]">{item.recommendedResource}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Keywords to Improve */}
            {currentJobMatch.resumeKeywordsToImprove.length > 0 && (
              <div className="p-4 rounded-2xl bg-[#F6DBC0]/40 border border-[#935073]/20">
                <span className="text-xs font-bold text-[#502D55] block mb-1.5">
                  💡 Resume Keywords To Enhance Before Applying:
                </span>
                <ul className="list-disc list-inside text-xs text-[#502D55]/90 space-y-1 font-medium">
                  {currentJobMatch.resumeKeywordsToImprove.map((kw, i) => (
                    <li key={i}>{kw}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Workflow Stepper to Mock Interview in Deep Violet */}
          <div className="p-6 bg-[#502D55] rounded-3xl text-[#F8F4E9] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-[#935073]/40">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F6DBC0]">Next Step in HireMentor Journey</span>
              <h4 className="text-lg font-bold mt-1 text-[#F8F4E9]">Ready for your AI Mock Interview?</h4>
              <p className="text-xs text-[#F8F4E9]/80 mt-0.5">
                Practice 10 tailored questions covering HR, Resume, Technical, Situational, and Salary categories for {currentJobMatch.jobTitle}.
              </p>
            </div>
            {/* Primary CTA button in Warm Blush */}
            <button
              onClick={() => setActiveTab('mock-interview')}
              className="px-6 py-3 bg-[#F6DBC0] hover:bg-[#F6DBC0]/90 text-[#502D55] font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-[#502D55]" />
              <span>Start AI Mock Interview</span>
              <ArrowRight className="w-4 h-4 text-[#502D55]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
