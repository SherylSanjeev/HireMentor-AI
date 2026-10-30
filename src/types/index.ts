export interface User {
  id: string;
  name: string;
  email: string;
  careerGoal?: string;
  targetRole?: string;
  avatar?: string;
  createdAt: string;
}

export interface ResumeScoreBreakdown {
  skills: number;
  education: number;
  projects: number;
  experience: number;
  certifications: number;
  atsReadiness: number;
  presentation: number;
}

export interface RecommendedRole {
  role: string;
  matchPercentage: number;
  whySuits: string;
  matchingSkills: string[];
  missingSkills: string[];
  learnSkills: string[];
  difficulty: 'Entry-Level' | 'Moderate' | 'Advanced';
  nextSteps: string[];
}

export interface ParsedResume {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  education: string;
  degree: string;
  institution?: string;
  graduationYear?: string;
  gpa?: string;
  technicalSkills: string[];
  programmingLanguages: string[];
  toolsAndTechnologies: string[];
  databases: string[];
  softSkills: string[];
  projects: Array<{
    title: string;
    tech: string;
    description: string;
    highlights?: string[];
  }>;
  internships: Array<{
    role: string;
    company: string;
    duration: string;
    description: string;
  }>;
  experience: Array<{
    role: string;
    company: string;
    duration: string;
    description: string;
  }>;
  certifications: string[];
  achievements: string[];
}

export interface ResumeAnalysisRecord {
  id: string;
  fileName: string;
  analyzedAt: string;
  rawText: string;
  parsed: ParsedResume;
  score: {
    overall: number;
    breakdown: ResumeScoreBreakdown;
    grade: string;
  };
  strengths: string[];
  weakAreas: string[];
  suggestions: string[];
  recommendedRoles: RecommendedRole[];
}

export interface SkillPriority {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  skill: string;
  reason: string;
  recommendedResource: string;
}

export interface JobMatchRecord {
  id: string;
  jobTitle: string;
  companyName?: string;
  jobDescription: string;
  matchPercentage: number;
  matchingSkills: string[];
  partiallyMatchingSkills: string[];
  missingSkills: string[];
  recommendedSkills: string[];
  resumeKeywordsToImprove: string[];
  skillGaps: {
    alreadyStrong: string[];
    needsImprovement: string[];
    missing: string[];
    priorities: SkillPriority[];
  };
  matchedAt: string;
}

export type InterviewCategory =
  | 'HR'
  | 'Resume'
  | 'Technical'
  | 'Situational'
  | 'Salary / Career';

export interface VoiceMetrics {
  durationSeconds: number;
  wordCount: number;
  wordsPerMinute: number;
  pacingRating: string;
  fillerWordsCount: number;
  fillerWordsList: string[];
  pauseAnalysis: string;
  lengthAssessment: 'Too Brief' | 'Well Balanced' | 'Overly Verbose';
}

export interface GranularRubricScores {
  relevance: number; // 0 - 10
  accuracy: number; // 0 - 10
  clarity: number; // 0 - 10
  structure: number; // 0 - 10
  confidence: number; // 0 - 10
  completeness: number; // 0 - 10
  communication: number; // 0 - 10
}

export interface InterviewAnswerEvaluation {
  score: number;
  scoresOutOf10: GranularRubricScores;
  voiceMetrics?: VoiceMetrics;
  strengths: string[];
  weaknesses: string[];
  betterStrategy: string;
  idealAnswer: string;
  adaptiveFollowUp?: {
    question: string;
    reason: string;
  };
}

export interface InterviewQuestion {
  id: string;
  category: InterviewCategory;
  question: string;
  contextTip: string;
  expectedKeyPoints: string[];
  userAnswer?: string;
  isVoiceRecorded?: boolean;
  voiceMetrics?: VoiceMetrics;
  evaluation?: InterviewAnswerEvaluation;
}

export interface RoadmapDayPlan {
  dayRange: string;
  title: string;
  focus: string;
  tasks: string[];
  completed: boolean;
}

export interface InterviewFinalReport {
  overallScore: number;
  subScores: {
    communication: number;
    technicalKnowledge: number;
    confidence: number;
    relevance: number;
    problemSolving: number;
    answerStructure: number;
    hrReadiness: number;
    voiceDelivery?: number;
  };
  voiceSummary?: {
    avgWpm: number;
    totalFillerWords: number;
    pacingSummary: string;
    totalDurationSeconds: number;
  };
  strongAreas: string[];
  areasToImprove: string[];
  criticalWeaknesses: string[];
  personalizedRecommendations: string[];
  updatedCareerRecommendations?: RecommendedRole[];
  roadmap: RoadmapDayPlan[];
}

export interface MockInterviewRecord {
  id: string;
  targetRole: string;
  jobDescriptionSnippet?: string;
  startedAt: string;
  completedAt?: string;
  isVoiceSession?: boolean;
  questions: InterviewQuestion[];
  finalReport?: InterviewFinalReport;
}

export type ActiveTab =
  | 'dashboard'
  | 'resume'
  | 'job-match'
  | 'find-jobs'
  | 'mock-interview'
  | 'reports'
  | 'roadmap'
  | 'profile';

