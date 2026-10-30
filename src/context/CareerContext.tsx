import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ResumeAnalysisRecord,
  JobMatchRecord,
  MockInterviewRecord,
  RoadmapDayPlan,
  ActiveTab,
} from '../types';
import { calculateCareerReadiness } from '../utils/scoring';
import { SAMPLE_RESUMES, SAMPLE_JOB_DESCRIPTIONS } from '../utils/presets';

interface CareerContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  // Resume state
  currentResume: ResumeAnalysisRecord | null;
  resumeHistory: ResumeAnalysisRecord[];
  setCurrentResume: (res: ResumeAnalysisRecord | null) => void;
  addResumeRecord: (res: ResumeAnalysisRecord) => void;
  // Job match state
  currentJobMatch: JobMatchRecord | null;
  jobMatchHistory: JobMatchRecord[];
  setCurrentJobMatch: (match: JobMatchRecord | null) => void;
  addJobMatchRecord: (match: JobMatchRecord) => void;
  // Mock interview state
  currentInterview: MockInterviewRecord | null;
  interviewHistory: MockInterviewRecord[];
  setCurrentInterview: (interview: MockInterviewRecord | null) => void;
  addInterviewRecord: (interview: MockInterviewRecord) => void;
  // Roadmap state
  roadmap: RoadmapDayPlan[];
  setRoadmap: React.Dispatch<React.SetStateAction<RoadmapDayPlan[]>>;
  toggleRoadmapTask: (dayIndex: number, taskIndex: number) => void;
  // Overall composite scores
  careerReadinessScore: number;
  // Quick workflow triggers
  startWorkflowWithPreset: (presetId?: string) => Promise<void>;
  resetAllCareerData: () => void;
}

const CareerContext = createContext<CareerContextType | undefined>(undefined);

const RESUME_KEY = 'hirementor_resumes';
const JOB_MATCH_KEY = 'hirementor_job_matches';
const INTERVIEW_KEY = 'hirementor_interviews';
const ROADMAP_KEY = 'hirementor_roadmap';

export const CareerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentResume, setCurrentResume] = useState<ResumeAnalysisRecord | null>(null);
  const [resumeHistory, setResumeHistory] = useState<ResumeAnalysisRecord[]>([]);
  const [currentJobMatch, setCurrentJobMatch] = useState<JobMatchRecord | null>(null);
  const [jobMatchHistory, setJobMatchHistory] = useState<JobMatchRecord[]>([]);
  const [currentInterview, setCurrentInterview] = useState<MockInterviewRecord | null>(null);
  const [interviewHistory, setInterviewHistory] = useState<MockInterviewRecord[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapDayPlan[]>([]);

  // Restore from storage on mount
  useEffect(() => {
    try {
      const storedRes = localStorage.getItem(RESUME_KEY);
      if (storedRes) {
        const parsed = JSON.parse(storedRes);
        setResumeHistory(parsed);
        if (parsed.length > 0) setCurrentResume(parsed[0]);
      }

      const storedMatches = localStorage.getItem(JOB_MATCH_KEY);
      if (storedMatches) {
        const parsed = JSON.parse(storedMatches);
        setJobMatchHistory(parsed);
        if (parsed.length > 0) setCurrentJobMatch(parsed[0]);
      }

      const storedInterviews = localStorage.getItem(INTERVIEW_KEY);
      if (storedInterviews) {
        const parsed = JSON.parse(storedInterviews);
        setInterviewHistory(parsed);
        if (parsed.length > 0) setCurrentInterview(parsed[0]);
      }

      const storedRoadmap = localStorage.getItem(ROADMAP_KEY);
      if (storedRoadmap) {
        setRoadmap(JSON.parse(storedRoadmap));
      }
    } catch (e) {
      console.error('Failed to load career records from local storage:', e);
    }
  }, []);

  const addResumeRecord = (res: ResumeAnalysisRecord) => {
    setCurrentResume(res);
    setResumeHistory(prev => {
      const next = [res, ...prev.filter(r => r.id !== res.id)];
      localStorage.setItem(RESUME_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addJobMatchRecord = (match: JobMatchRecord) => {
    setCurrentJobMatch(match);
    setJobMatchHistory(prev => {
      const next = [match, ...prev.filter(m => m.id !== match.id)];
      localStorage.setItem(JOB_MATCH_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addInterviewRecord = (interview: MockInterviewRecord) => {
    setCurrentInterview(interview);
    setInterviewHistory(prev => {
      const next = [interview, ...prev.filter(i => i.id !== interview.id)];
      localStorage.setItem(INTERVIEW_KEY, JSON.stringify(next));
      return next;
    });

    // If report has updated career recommendations, update current resume's recommended roles
    if (interview.finalReport?.updatedCareerRecommendations && currentResume) {
      const updatedResume = {
        ...currentResume,
        recommendedRoles: interview.finalReport.updatedCareerRecommendations,
      };
      setCurrentResume(updatedResume);
      setResumeHistory(prev => {
        const next = [updatedResume, ...prev.filter(r => r.id !== updatedResume.id)];
        localStorage.setItem(RESUME_KEY, JSON.stringify(next));
        return next;
      });
    }

    // If report has roadmap, sync roadmap
    if (interview.finalReport?.roadmap && interview.finalReport.roadmap.length > 0) {
      setRoadmap(interview.finalReport.roadmap);
      localStorage.setItem(ROADMAP_KEY, JSON.stringify(interview.finalReport.roadmap));
    }
  };


  const toggleRoadmapTask = (dayIndex: number, _taskIndex: number) => {
    setRoadmap(prev => {
      const updated = prev.map((day, idx) => {
        if (idx === dayIndex) {
          return { ...day, completed: !day.completed };
        }
        return day;
      });
      localStorage.setItem(ROADMAP_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Calculate composite career readiness
  const latestResumeScore = currentResume?.score.overall;
  const latestJobMatchScore = currentJobMatch?.matchPercentage;
  const latestInterviewScore = currentInterview?.finalReport?.overallScore;

  const careerReadinessScore = calculateCareerReadiness({
    resumeScore: latestResumeScore,
    jobMatchScore: latestJobMatchScore,
    interviewScore: latestInterviewScore,
  });

  const startWorkflowWithPreset = async (presetId = 'ai-ml-grad') => {
    const preset = SAMPLE_RESUMES.find(r => r.id === presetId) || SAMPLE_RESUMES[0];
    const sampleJob = SAMPLE_JOB_DESCRIPTIONS[0];

    try {
      const res = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: preset.rawText,
          fileName: `${preset.name.split('—')[0].trim()}_Resume.pdf`,
        }),
      });
      const data: ResumeAnalysisRecord = await res.json();
      addResumeRecord(data);

      // Pre-seed matching
      const matchRes = await fetch('/api/job/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeSkills: data.parsed.technicalSkills,
          resumeText: preset.rawText,
          jobTitle: sampleJob.title,
          jobDescription: sampleJob.description,
        }),
      });
      const matchData: JobMatchRecord = await matchRes.json();
      addJobMatchRecord(matchData);

      setActiveTab('resume');
    } catch (e) {
      console.error('Failed to trigger workflow preset:', e);
    }
  };

  const resetAllCareerData = () => {
    setCurrentResume(null);
    setResumeHistory([]);
    setCurrentJobMatch(null);
    setJobMatchHistory([]);
    setCurrentInterview(null);
    setInterviewHistory([]);
    setRoadmap([]);
    localStorage.removeItem(RESUME_KEY);
    localStorage.removeItem(JOB_MATCH_KEY);
    localStorage.removeItem(INTERVIEW_KEY);
    localStorage.removeItem(ROADMAP_KEY);
    setActiveTab('dashboard');
  };

  return (
    <CareerContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currentResume,
        resumeHistory,
        setCurrentResume,
        addResumeRecord,
        currentJobMatch,
        jobMatchHistory,
        setCurrentJobMatch,
        addJobMatchRecord,
        currentInterview,
        interviewHistory,
        setCurrentInterview,
        addInterviewRecord,
        roadmap,
        setRoadmap,
        toggleRoadmapTask,
        careerReadinessScore,
        startWorkflowWithPreset,
        resetAllCareerData,
      }}
    >
      {children}
    </CareerContext.Provider>
  );
};

export const useCareer = () => {
  const context = useContext(CareerContext);
  if (!context) {
    throw new Error('useCareer must be used within a CareerProvider');
  }
  return context;
};
