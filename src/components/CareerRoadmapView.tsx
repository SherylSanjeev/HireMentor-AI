import React from 'react';
import { useCareer } from '../context/CareerContext';
import {
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Target,
  CheckSquare,
  Square,
  Download,
  RotateCcw,
} from 'lucide-react';

const DEFAULT_14_DAY_ROADMAP = [
  {
    dayRange: 'Day 1–3',
    title: 'Core Technical & SQL Mastery',
    focus: 'Review relational database concepts, indexing, window functions, and data manipulation.',
    tasks: [
      'Solve 10 Medium SQL queries on LeetCode focusing on JOINs and Window Functions',
      'Review database transactions (ACID properties) and normalization',
      'Optimize query execution plans using EXPLAIN ANALYZE',
    ],
    completed: true,
  },
  {
    dayRange: 'Day 4–5',
    title: 'Language & Coding Fundamentals',
    focus: 'Python / TypeScript interview coding patterns and data structures.',
    tasks: [
      'Practice two-pointer and sliding window coding interview problems',
      'Revise Big-O time & space complexity analysis for standard algorithms',
      'Implement binary search and tree traversal patterns from scratch',
    ],
    completed: true,
  },
  {
    dayRange: 'Day 6–7',
    title: 'System Architecture & API Design',
    focus: 'RESTful standards, error handling, database caching with Redis.',
    tasks: [
      'Design a rate-limited URL shortener or real-time notification service',
      'Review HTTP status codes, idempotent methods, and JWT authentication',
      'Evaluate trade-offs between SQL vs NoSQL for high concurrency',
    ],
    completed: false,
  },
  {
    dayRange: 'Day 8',
    title: 'Resume Polish & Quantifiable Metrics',
    focus: 'Incorporate feedback from HireMentor AI resume analysis into every bullet point.',
    tasks: [
      'Update all project bullets to follow: [Action Verb] + [Context] + [Measurable Result]',
      'Verify PDF formatting and ATS readability check',
      'Add live demo URL and GitHub repository links',
    ],
    completed: false,
  },
  {
    dayRange: 'Day 9–11',
    title: 'Role-Specific Deep Dive Practice',
    focus: 'Deepen domain mastery for your target role.',
    tasks: [
      'Run an in-depth mock interview focusing exclusively on Technical & Situational questions',
      'Review edge-case questions, concurrency bugs, and debugging scenarios',
      'Build a lightweight proof-of-concept for the role’s primary missing skill',
    ],
    completed: false,
  },
  {
    dayRange: 'Day 12',
    title: 'HR & Behavioral Question Mastery',
    focus: 'Prepare confident answers for "Tell me about yourself", conflict resolution, and career vision.',
    tasks: [
      'Outline 4 STAR stories (Leadership, Failure, Innovation, Conflict)',
      'Practice answers aloud with 90-second timer to eliminate filler words',
      'Calibrate strengths and genuine weaknesses with improvement steps',
    ],
    completed: false,
  },
  {
    dayRange: 'Day 13',
    title: 'Full-Length Timed Simulation',
    focus: 'Simulate a live 45-minute hiring manager round without notes.',
    tasks: [
      'Complete a full 10-question HireMentor AI simulation',
      'Analyze weak score categories and calibrate pacing',
      'Refine answers scored below 80 points',
    ],
    completed: false,
  },
  {
    dayRange: 'Day 14',
    title: 'Final Review & Offer Negotiation Strategy',
    focus: 'Prepare smart reverse-interview questions and compensation research.',
    tasks: [
      'Prepare 5 thoughtful questions to ask the interviewer',
      'Research market compensation ranges on Levels.fyi and Glassdoor',
      'Review technical cheat sheet and ensure restful night of sleep',
    ],
    completed: false,
  },
];

export const CareerRoadmapView: React.FC = () => {
  const { roadmap, setRoadmap, toggleRoadmapTask, currentResume, currentJobMatch, setActiveTab } = useCareer();

  const activeRoadmap = roadmap.length > 0 ? roadmap : DEFAULT_14_DAY_ROADMAP;

  const completedCount = activeRoadmap.filter(d => d.completed).length;
  const progressPercent = Math.round((completedCount / activeRoadmap.length) * 100);

  const handleResetChecklist = () => {
    const reset = activeRoadmap.map(d => ({ ...d, completed: false }));
    setRoadmap(reset);
  };

  const handleMarkAllComplete = () => {
    const all = activeRoadmap.map(d => ({ ...d, completed: true }));
    setRoadmap(all);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6DBC0]/40 border border-[#F6DBC0] text-[#502D55] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#935073]" />
            <span>Personalized Readiness Sprint</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#502D55] tracking-tight">
            14-Day Interview Readiness Plan
          </h2>
          <p className="mt-1 text-sm text-[#502D55]/70">
            Targeting: <strong className="text-[#502D55]">{currentJobMatch?.jobTitle || currentResume?.recommendedRoles[0]?.role || 'Software Engineer'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleResetChecklist}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#935073]/20 bg-[#F8F4E9] hover:bg-[#F6DBC0]/30 text-[#502D55] transition"
          >
            Reset
          </button>
          <button
            onClick={handleMarkAllComplete}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] transition shadow-xs"
          >
            Mark All Completed
          </button>
        </div>
      </div>

      {/* Progress Metric Banner */}
      <div className="bg-[#F8F4E9] rounded-3xl border border-[#935073]/20 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#502D55] text-[#F8F4E9] flex items-center justify-center font-extrabold text-xl shrink-0 shadow-sm">
            {progressPercent}%
          </div>
          <div>
            <h4 className="font-bold text-[#502D55] text-base">Sprint Completion</h4>
            <p className="text-xs text-[#502D55]/70 mt-0.5">
              {completedCount} of {activeRoadmap.length} milestones finished
            </p>
          </div>
        </div>

        <div className="w-full sm:max-w-xs">
          <div className="w-full bg-[#F6DBC0]/50 h-3 rounded-full overflow-hidden border border-[#935073]/15">
            <div
              className="bg-[#935073] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-[#502D55]/70 mt-1.5 block text-right font-medium">
            {progressPercent === 100 ? '🎉 Ready for interviews!' : 'Keep momentum high daily'}
          </span>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-4">
        {activeRoadmap.map((day, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-3xl border transition ${
              day.completed
                ? 'bg-[#F6DBC0]/25 border-[#935073]/40'
                : 'bg-[#F8F4E9] border-[#935073]/20 shadow-xs hover:border-[#935073]'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                    day.completed ? 'bg-[#935073] text-[#F8F4E9]' : 'bg-[#F6DBC0] text-[#502D55]'
                  }`}
                >
                  {day.dayRange}
                </span>
                <h4 className="text-base font-bold text-[#502D55]">{day.title}</h4>
              </div>

              {/* Interactive Completion Toggle */}
              <button
                onClick={() => toggleRoadmapTask(idx, 0)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto ${
                  day.completed
                    ? 'bg-[#502D55] text-[#F8F4E9]'
                    : 'bg-[#F6DBC0]/40 hover:bg-[#F6DBC0] text-[#502D55]'
                }`}
              >
                {day.completed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#F6DBC0]" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <Square className="w-4 h-4 text-[#935073]" />
                    <span>Mark as Done</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-[#502D55]/85 leading-relaxed mb-4">
              <strong className="text-[#502D55]">Curriculum Focus:</strong> {day.focus}
            </p>

            <div className="pt-3 border-t border-[#935073]/15">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#935073] block mb-2">
                Action Items:
              </span>
              <ul className="space-y-2">
                {day.tasks.map((task, tIdx) => (
                  <li key={tIdx} className="text-xs text-[#502D55] flex items-start gap-2">
                    <span className="text-[#935073] font-bold mt-0.5">•</span>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Next Step Banner */}
      <div className="p-6 bg-[#502D55] rounded-3xl text-[#F8F4E9] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#F6DBC0]">Reinforce Your Learning</span>
          <h4 className="text-lg font-bold mt-1 text-[#F8F4E9]">Want to test your answers right now?</h4>
          <p className="text-xs text-[#F8F4E9]/80 mt-0.5">
            Take another mock interview session to verify that your technical answers and STAR phrasing have improved.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('mock-interview')}
          className="px-6 py-3 bg-[#F6DBC0] hover:bg-[#F6DBC0]/90 text-[#502D55] font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
        >
          <span>Practice Mock Interview</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
