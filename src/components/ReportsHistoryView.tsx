import React, { useState } from 'react';
import { useCareer } from '../context/CareerContext';
import { ScoreCircle } from './ScoreCircle';
import {
  FileText,
  Mic,
  Clock,
  Sparkles,
} from 'lucide-react';
import { MockInterviewRecord } from '../types';

export const ReportsHistoryView: React.FC = () => {
  const {
    currentInterview,
    interviewHistory,
    resumeHistory,
    setActiveTab,
  } = useCareer();

  const [selectedInterview, setSelectedInterview] = useState<MockInterviewRecord | null>(
    currentInterview || (interviewHistory.length > 0 ? interviewHistory[0] : null)
  );

  const report = selectedInterview?.finalReport;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 bg-[#F8F4E9] text-[#502D55]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#502D55] tracking-tight">
            Interview Analytics & Report History
          </h2>
          <p className="mt-1 text-sm text-[#935073]">
            Review detailed sub-scores, behavioral performance rubrics, and track your career growth over time.
          </p>
        </div>

        {selectedInterview && (
          <button
            onClick={() => setActiveTab('roadmap')}
            className="px-4 py-2.5 rounded-xl bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] font-bold text-xs shadow-md shadow-[#502D55]/20 transition flex items-center gap-2 self-start sm:self-auto cursor-pointer"
          >
            <span>View 14-Day Roadmap →</span>
          </button>
        )}
      </div>

      {/* DETAILED INTERVIEW REPORT (Section 12 requirement in Violet Dusk) */}
      {report ? (
        <div className="space-y-8">
          {/* Main Score & Sub-scores */}
          <div className="bg-white rounded-3xl border border-[#935073]/25 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Circular Overall Score */}
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left shrink-0">
                <ScoreCircle
                  score={report.overallScore}
                  maxScore={100}
                  size={140}
                  strokeWidth={12}
                  variant="dusty-plum"
                  sublabel={
                    report.overallScore >= 85
                      ? 'Exceptional'
                      : report.overallScore >= 70
                      ? 'Interview Ready'
                      : 'Needs Coaching'
                  }
                />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#935073]">
                    Mock Interview Assessment
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#502D55] mt-0.5">
                    {selectedInterview?.targetRole || 'Target Role'}
                  </h3>
                  <p className="text-xs text-[#935073] mt-1 max-w-sm font-medium">
                    Evaluated across 7 core interview dimensions using STAR methodology and technical verification.
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#935073]">
                    <Clock className="w-3.5 h-3.5 text-[#502D55]" />
                    <span>Completed {new Date(selectedInterview?.completedAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* The 7 Mandatory Sub-scores in Violet Dusk */}
              <div className="w-full lg:max-w-xl grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[#F8F4E9] border border-[#935073]/20">
                  <span className="text-[11px] font-bold text-[#502D55] block">Communication</span>
                  <span className="text-lg font-extrabold text-[#935073] mt-1 block">
                    {report.subScores.communication}/100
                  </span>
                  <div className="w-full bg-[#F6DBC0] h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-[#502D55] h-full rounded-full" style={{ width: `${report.subScores.communication}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F4E9] border border-[#935073]/20">
                  <span className="text-[11px] font-bold text-[#502D55] block">Tech Knowledge</span>
                  <span className="text-lg font-extrabold text-[#935073] mt-1 block">
                    {report.subScores.technicalKnowledge}/100
                  </span>
                  <div className="w-full bg-[#F6DBC0] h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-[#935073] h-full rounded-full" style={{ width: `${report.subScores.technicalKnowledge}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F4E9] border border-[#935073]/20">
                  <span className="text-[11px] font-bold text-[#502D55] block">Confidence</span>
                  <span className="text-lg font-extrabold text-[#935073] mt-1 block">
                    {report.subScores.confidence}/100
                  </span>
                  <div className="w-full bg-[#F6DBC0] h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-[#502D55] h-full rounded-full" style={{ width: `${report.subScores.confidence}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F4E9] border border-[#935073]/20">
                  <span className="text-[11px] font-bold text-[#502D55] block">Relevance</span>
                  <span className="text-lg font-extrabold text-[#935073] mt-1 block">
                    {report.subScores.relevance}/100
                  </span>
                  <div className="w-full bg-[#F6DBC0] h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-[#935073] h-full rounded-full" style={{ width: `${report.subScores.relevance}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F4E9] border border-[#935073]/20">
                  <span className="text-[11px] font-bold text-[#502D55] block">Problem Solving</span>
                  <span className="text-lg font-extrabold text-[#935073] mt-1 block">
                    {report.subScores.problemSolving}/100
                  </span>
                  <div className="w-full bg-[#F6DBC0] h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-[#502D55] h-full rounded-full" style={{ width: `${report.subScores.problemSolving}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F4E9] border border-[#935073]/20">
                  <span className="text-[11px] font-bold text-[#502D55] block">Answer Structure</span>
                  <span className="text-lg font-extrabold text-[#935073] mt-1 block">
                    {report.subScores.answerStructure}/100
                  </span>
                  <div className="w-full bg-[#F6DBC0] h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-[#935073] h-full rounded-full" style={{ width: `${report.subScores.answerStructure}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F4E9] border border-[#935073]/20">
                  <span className="text-[11px] font-bold text-[#502D55] block">HR Readiness</span>
                  <span className="text-lg font-extrabold text-[#502D55] mt-1 block">
                    {report.subScores.hrReadiness}/100
                  </span>
                  <div className="w-full bg-[#F6DBC0] h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-[#502D55] h-full rounded-full" style={{ width: `${report.subScores.hrReadiness}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F6DBC0]/40 border border-[#935073]/30">
                  <span className="text-[11px] font-bold text-[#502D55] block">Voice Delivery</span>
                  <span className="text-lg font-extrabold text-[#935073] mt-1 block">
                    {report.subScores.voiceDelivery ?? 84}/100
                  </span>
                  <div className="w-full bg-white h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-[#502D55] h-full rounded-full"
                      style={{ width: `${report.subScores.voiceDelivery ?? 84}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Delivery Analytics Summary */}
          {report.voiceSummary && (
            <div className="p-6 bg-[#F6DBC0]/40 rounded-3xl border border-[#935073]/25 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#502D55] flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#502D55]" />
                  <span>Voice Delivery & Speech Cadence Analysis</span>
                </span>
                <span className="text-[11px] text-[#935073] font-semibold">
                  Objective speaking delivery metrics
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#935073]/20">
                  <span className="text-[10px] text-[#935073] font-bold uppercase block">Average Pacing</span>
                  <span className="text-base font-extrabold text-[#502D55] mt-0.5 block">
                    {report.voiceSummary.avgWpm} WPM
                  </span>
                  <span className="text-[11px] text-[#935073] font-medium block mt-0.5">
                    {report.voiceSummary.avgWpm > 165
                      ? 'Fast'
                      : report.voiceSummary.avgWpm < 110
                      ? 'Deliberate'
                      : 'Ideal conversational speed'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#935073]/20">
                  <span className="text-[10px] text-[#935073] font-bold uppercase block">Filler Words</span>
                  <span className="text-base font-extrabold text-[#502D55] mt-0.5 block">
                    {report.voiceSummary.totalFillerWords} detected
                  </span>
                  <span className="text-[11px] text-[#935073] font-medium block mt-0.5">
                    {report.voiceSummary.totalFillerWords <= 3 ? 'Excellent composure' : 'Room to reduce filler markers'}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#935073]/20">
                  <span className="text-[10px] text-[#935073] font-bold uppercase block">Total Spoken Time</span>
                  <span className="text-base font-extrabold text-[#502D55] mt-0.5 block">
                    {Math.round(report.voiceSummary.totalDurationSeconds || 180)}s
                  </span>
                  <span className="text-[11px] text-[#935073] font-medium block mt-0.5">
                    {Math.round((report.voiceSummary.totalDurationSeconds || 180) / 60)}m speaking practice
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#935073]/20">
                  <span className="text-[10px] text-[#935073] font-bold uppercase block">Delivery Cadence</span>
                  <p className="text-xs font-semibold text-[#502D55] mt-0.5 leading-snug">
                    {report.voiceSummary.pacingSummary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 🟢 Strong Areas, 🟡 Areas to Improve, 🔴 Critical Weaknesses in Violet Dusk */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 🟢 Strong Areas */}
            <div className="p-6 bg-white rounded-3xl border border-[#502D55]/30 shadow-xs">
              <div className="flex items-center gap-2 text-[#502D55] font-extrabold text-sm mb-4">
                <span className="w-3 h-3 rounded-full bg-[#502D55] inline-block" />
                <span>Strong Areas</span>
              </div>
              <ul className="space-y-2.5">
                {report.strongAreas.map((sa, i) => (
                  <li key={i} className="text-xs text-[#502D55]/90 flex items-start gap-2 font-medium">
                    <span className="text-[#502D55] font-bold mt-0.5">✓</span>
                    <span>{sa}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 🟡 Areas to Improve */}
            <div className="p-6 bg-white rounded-3xl border border-[#935073]/30 shadow-xs">
              <div className="flex items-center gap-2 text-[#935073] font-extrabold text-sm mb-4">
                <span className="w-3 h-3 rounded-full bg-[#935073] inline-block" />
                <span>Areas to Improve</span>
              </div>
              <ul className="space-y-2.5">
                {report.areasToImprove.map((ai, i) => (
                  <li key={i} className="text-xs text-[#502D55]/90 flex items-start gap-2 font-medium">
                    <span className="text-[#935073] font-bold mt-0.5">≈</span>
                    <span>{ai}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 🔴 Critical Weaknesses */}
            <div className="p-6 bg-[#F6DBC0]/50 rounded-3xl border border-[#935073]/30 shadow-xs">
              <div className="flex items-center gap-2 text-[#502D55] font-extrabold text-sm mb-4">
                <span className="w-3 h-3 rounded-full bg-[#935073] inline-block" />
                <span>Critical Weaknesses</span>
              </div>
              <ul className="space-y-2.5">
                {report.criticalWeaknesses.map((cw, i) => (
                  <li key={i} className="text-xs text-[#502D55] flex items-start gap-2 font-medium">
                    <span className="text-[#935073] font-bold mt-0.5">✕</span>
                    <span>{cw}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Updated Career Recommendations (Resume + Job Matching + Interview Performance) */}
          {report.updatedCareerRecommendations && report.updatedCareerRecommendations.length > 0 && (
            <div className="bg-white rounded-3xl border border-[#935073]/25 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F6DBC0] text-[#502D55] text-xs font-bold mb-1 border border-[#935073]/20">
                    <Sparkles className="w-3.5 h-3.5 text-[#502D55]" />
                    <span>Composite Career Recommendation</span>
                  </div>
                  <h4 className="text-base font-extrabold text-[#502D55]">
                    Recommended Career Roles (Updated Post-Interview)
                  </h4>
                  <p className="text-xs text-[#935073]">
                    Integrated analysis combining your Resume + Job Match + Voice Mock Interview performance.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {report.updatedCareerRecommendations.map((role, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#F8F4E9] border border-[#935073]/20 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#502D55] text-[#F8F4E9]">
                          {role.difficulty}
                        </span>
                        <span className="text-base font-black text-[#502D55]">
                          {role.matchPercentage}% Match
                        </span>
                      </div>
                      <h5 className="font-extrabold text-sm text-[#502D55] mt-2.5">{role.role}</h5>
                      <p className="text-xs text-[#502D55]/85 mt-1 leading-relaxed font-medium">
                        {role.whySuits}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#935073]/15 space-y-2">
                      <div className="text-[11px] text-[#935073]">
                        <strong className="text-[#502D55]">Next step:</strong> {role.nextSteps[0]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Personalized Recommendations in Warm Blush Soft Card */}
          <div className="p-6 bg-[#F6DBC0]/40 rounded-3xl border border-[#935073]/25 shadow-xs">
            <h4 className="text-sm font-extrabold text-[#502D55] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#502D55]" />
              <span>Personalized Mentor Recommendations</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.personalizedRecommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white border border-[#935073]/20 text-xs text-[#502D55]">
                  <span className="font-bold text-[#502D55] block mb-1">Recommendation #{i + 1}</span>
                  <p className="leading-relaxed font-medium">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#935073]/25">
          <div className="w-16 h-16 rounded-2xl bg-[#F6DBC0] text-[#502D55] flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#502D55]">No Mock Interview Completed Yet</h3>
          <p className="text-xs text-[#935073] mt-1 max-w-md mx-auto font-medium">
            Practice our 10-question simulation to generate your comprehensive 7-dimension report and personalized 14-day roadmap.
          </p>
          <button
            onClick={() => setActiveTab('mock-interview')}
            className="mt-6 px-6 py-2.5 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] font-bold text-xs rounded-xl shadow-md transition inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Start AI Mock Interview Now</span>
          </button>
        </div>
      )}

      {/* REPORT HISTORY ARCHIVE */}
      <div className="bg-white rounded-3xl border border-[#935073]/25 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-extrabold text-[#502D55]">Historical Report Records</h3>
          <p className="text-xs text-[#935073]">Track and compare all previous evaluations</p>
        </div>

        <div className="space-y-6">
          {/* Mock Interviews History */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#935073] mb-3 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-[#502D55]" />
              <span>Mock Interview Sessions</span>
            </h4>

            {interviewHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {interviewHistory.map(session => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedInterview(session)}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                      selectedInterview?.id === session.id
                        ? 'border-[#502D55] bg-[#F6DBC0]/40'
                        : 'border-[#935073]/20 hover:border-[#935073] bg-[#F8F4E9]/50'
                    }`}
                  >
                    <div>
                      <h5 className="font-bold text-sm text-[#502D55]">{session.targetRole}</h5>
                      <span className="text-[11px] text-[#935073] block mt-0.5 font-medium">
                        {new Date(session.completedAt || session.startedAt).toLocaleDateString()} • {session.questions.length} Questions
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-lg font-extrabold text-[#502D55]">
                        {session.finalReport?.overallScore || 'Pending'}/100
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#935073] italic">No previous mock interview sessions recorded.</p>
            )}
          </div>

          {/* Resumes Evaluated History */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#935073] mb-3 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#502D55]" />
              <span>Resume Analysis Archive</span>
            </h4>

            {resumeHistory.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {resumeHistory.map(res => (
                  <div
                    key={res.id}
                    onClick={() => setActiveTab('resume')}
                    className="p-4 rounded-2xl border border-[#935073]/20 bg-[#F8F4E9]/50 hover:border-[#502D55] transition cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h5 className="font-bold text-xs text-[#502D55] truncate max-w-[140px]">{res.fileName}</h5>
                      <span className="text-[10px] text-[#935073] font-medium">
                        {new Date(res.analyzedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-[#F6DBC0] text-[#502D55] font-bold text-xs">
                      {res.score.overall}/100
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#935073] italic">No resume records saved yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
