export interface ResumeScoreBreakdown {
  skills: number;
  education: number;
  projects: number;
  experience: number;
  certifications: number;
  atsReadiness: number;
  presentation: number;
}

export interface CalculatedResumeScore {
  overall: number;
  breakdown: ResumeScoreBreakdown;
  grade: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical Review';
}

/**
 * Calculates a weighted resume score based on extracted sections.
 */
export function calculateResumeScore(breakdown: Partial<ResumeScoreBreakdown>): CalculatedResumeScore {
  const safeBreakdown: ResumeScoreBreakdown = {
    skills: Math.min(100, Math.max(0, breakdown.skills ?? 75)),
    education: Math.min(100, Math.max(0, breakdown.education ?? 80)),
    projects: Math.min(100, Math.max(0, breakdown.projects ?? 70)),
    experience: Math.min(100, Math.max(0, breakdown.experience ?? 65)),
    certifications: Math.min(100, Math.max(0, breakdown.certifications ?? 60)),
    atsReadiness: Math.min(100, Math.max(0, breakdown.atsReadiness ?? 85)),
    presentation: Math.min(100, Math.max(0, breakdown.presentation ?? 80)),
  };

  // Weights: skills 25%, projects 20%, experience 20%, education 15%, ats 10%, presentation 5%, certifications 5%
  const overall = Math.round(
    safeBreakdown.skills * 0.25 +
    safeBreakdown.projects * 0.20 +
    safeBreakdown.experience * 0.20 +
    safeBreakdown.education * 0.15 +
    safeBreakdown.atsReadiness * 0.10 +
    safeBreakdown.presentation * 0.05 +
    safeBreakdown.certifications * 0.05
  );

  let grade: CalculatedResumeScore['grade'] = 'Needs Improvement';
  if (overall >= 85) grade = 'Excellent';
  else if (overall >= 70) grade = 'Good';
  else if (overall >= 50) grade = 'Needs Improvement';
  else grade = 'Critical Review';

  return {
    overall: Math.min(100, Math.max(0, overall)),
    breakdown: safeBreakdown,
    grade,
  };
}

/**
 * Calculates skill gap matching metrics comparing resume skills with job keywords.
 */
export function calculateJobMatch(
  resumeSkills: string[],
  requiredSkills: string[]
): {
  matchPercentage: number;
  matching: string[];
  partiallyMatching: string[];
  missing: string[];
} {
  if (!requiredSkills || requiredSkills.length === 0) {
    return {
      matchPercentage: 100,
      matching: resumeSkills,
      partiallyMatching: [],
      missing: [],
    };
  }

  const normalizedResume = resumeSkills.map(s => s.trim().toLowerCase());
  const matching: string[] = [];
  const partiallyMatching: string[] = [];
  const missing: string[] = [];

  for (const req of requiredSkills) {
    const reqClean = req.trim().toLowerCase();
    const exact = normalizedResume.find(s => s === reqClean);
    if (exact) {
      matching.push(req);
      continue;
    }

    const partial = normalizedResume.find(s => s.includes(reqClean) || reqClean.includes(s));
    if (partial) {
      partiallyMatching.push(req);
      continue;
    }

    missing.push(req);
  }

  const rawScore = (matching.length * 1.0 + partiallyMatching.length * 0.5) / requiredSkills.length;
  const matchPercentage = Math.round(Math.min(100, Math.max(10, rawScore * 100)));

  return {
    matchPercentage,
    matching,
    partiallyMatching,
    missing,
  };
}

/**
 * Calculates composite career readiness score across all metrics.
 */
export function calculateCareerReadiness(metrics: {
  resumeScore?: number;
  jobMatchScore?: number;
  interviewScore?: number;
}): number {
  const resume = metrics.resumeScore ?? 0;
  const jobMatch = metrics.jobMatchScore ?? 0;
  const interview = metrics.interviewScore ?? 0;

  let activeCount = 0;
  let total = 0;

  if (resume > 0) {
    total += resume * 0.35;
    activeCount += 0.35;
  }
  if (jobMatch > 0) {
    total += jobMatch * 0.30;
    activeCount += 0.30;
  }
  if (interview > 0) {
    total += interview * 0.35;
    activeCount += 0.35;
  }

  if (activeCount === 0) return 0;
  return Math.round(total / activeCount);
}

/**
 * Groups missing skills into learning priorities.
 */
export function prioritizeSkillGaps(missingSkills: string[], partiallyMatching: string[]): {
  highPriority: string[];
  mediumPriority: string[];
  lowPriority: string[];
} {
  const highPriority: string[] = [];
  const mediumPriority: string[] = [];
  const lowPriority: string[] = [];

  // Core foundational technologies usually flagged as high priority
  const criticalTerms = ['python', 'sql', 'javascript', 'typescript', 'react', 'java', 'data structures', 'algorithms', 'git'];

  missingSkills.forEach(skill => {
    const s = skill.toLowerCase();
    if (criticalTerms.some(term => s.includes(term))) {
      highPriority.push(skill);
    } else if (s.includes('cloud') || s.includes('aws') || s.includes('docker') || s.includes('api')) {
      mediumPriority.push(skill);
    } else {
      lowPriority.push(skill);
    }
  });

  // Partially matching skills are fast wins, so they become medium or high priority
  partiallyMatching.forEach(skill => {
    if (!highPriority.includes(skill) && !mediumPriority.includes(skill)) {
      mediumPriority.push(skill);
    }
  });

  // If high priority is empty, elevate the first missing skill
  if (highPriority.length === 0 && missingSkills.length > 0) {
    highPriority.push(missingSkills[0]);
  }

  return { highPriority, mediumPriority, lowPriority };
}

/**
 * Calculates voice communication mechanics: Words Per Minute, filler words, and pacing rating.
 */
export function calculateVoiceDeliveryMetrics(
  spokenText: string,
  durationSeconds: number
): {
  wordCount: number;
  durationSeconds: number;
  wordsPerMinute: number;
  fillerWordsCount: number;
  fillerWordsList: string[];
  pacingRating: string;
  lengthAssessment: 'Too Brief' | 'Well Balanced' | 'Overly Verbose';
} {
  const words = spokenText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const duration = Math.max(1, durationSeconds);
  const wpm = Math.round((wordCount / duration) * 60);

  const fillerRegex = /\b(um|uh|like|you know|actually|basically|sort of|kind of|i mean|right)\b/gi;
  const fillers = (spokenText.match(fillerRegex) || []).map(f => f.toLowerCase());

  let pacingRating = 'Ideal (120-150 WPM)';
  if (wpm > 165) pacingRating = 'Slightly Fast (>165 WPM)';
  else if (wpm < 110) pacingRating = 'Slightly Deliberate (<110 WPM)';

  let lengthAssessment: 'Too Brief' | 'Well Balanced' | 'Overly Verbose' = 'Well Balanced';
  if (wordCount < 25 || duration < 15) lengthAssessment = 'Too Brief';
  else if (wordCount > 180 || duration > 140) lengthAssessment = 'Overly Verbose';

  return {
    wordCount,
    durationSeconds: duration,
    wordsPerMinute: wpm,
    fillerWordsCount: fillers.length,
    fillerWordsList: Array.from(new Set(fillers)),
    pacingRating,
    lengthAssessment,
  };
}

