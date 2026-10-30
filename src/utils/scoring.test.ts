import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateResumeScore,
  calculateJobMatch,
  calculateCareerReadiness,
  prioritizeSkillGaps,
  calculateVoiceDeliveryMetrics,
} from './scoring';

test('calculateResumeScore produces expected weighted score and grade', () => {
  const result = calculateResumeScore({
    skills: 90,
    education: 85,
    projects: 80,
    experience: 75,
    certifications: 70,
    atsReadiness: 90,
    presentation: 85,
  });

  // 90*0.25 (22.5) + 80*0.20 (16) + 75*0.20 (15) + 85*0.15 (12.75) + 90*0.10 (9) + 85*0.05 (4.25) + 70*0.05 (3.5) = 83
  assert.equal(result.overall, 83);
  assert.equal(result.grade, 'Good');
  assert.equal(result.breakdown.skills, 90);
});

test('calculateResumeScore clamps out-of-range values', () => {
  const result = calculateResumeScore({
    skills: 150,
    education: -20,
  });
  assert.equal(result.breakdown.skills, 100);
  assert.equal(result.breakdown.education, 0);
  assert(result.overall >= 0 && result.overall <= 100);
});

test('calculateJobMatch handles exact, partial and missing skills correctly', () => {
  const resumeSkills = ['Python', 'Machine Learning', 'Pandas', 'PostgreSQL'];
  const required = ['Python', 'SQL', 'Docker', 'Machine Learning'];

  const match = calculateJobMatch(resumeSkills, required);
  assert.deepEqual(match.matching, ['Python', 'Machine Learning']);
  // PostgreSQL contains sql -> partial
  assert.deepEqual(match.partiallyMatching, ['SQL']);
  assert.deepEqual(match.missing, ['Docker']);
  // (2*1 + 1*0.5) / 4 = 2.5 / 4 = 62.5% -> 63%
  assert.equal(match.matchPercentage, 63);
});

test('calculateCareerReadiness weights available metrics properly', () => {
  const zeroMetrics = calculateCareerReadiness({});
  assert.equal(zeroMetrics, 0);

  const partialMetrics = calculateCareerReadiness({ resumeScore: 80, jobMatchScore: 90 });
  // (80*0.35 + 90*0.30) / (0.65) = (28 + 27) / 0.65 = 55 / 0.65 = 85
  assert.equal(partialMetrics, 85);

  const allMetrics = calculateCareerReadiness({ resumeScore: 80, jobMatchScore: 90, interviewScore: 70 });
  // 80*0.35 + 90*0.30 + 70*0.35 = 28 + 27 + 24.5 = 79.5 -> 80
  assert.equal(allMetrics, 80);
});

test('prioritizeSkillGaps assigns high priority to core skills', () => {
  const gaps = prioritizeSkillGaps(['SQL', 'Docker', 'AWS'], ['Git']);
  assert(gaps.highPriority.includes('SQL'));
  assert(gaps.mediumPriority.includes('Docker') || gaps.mediumPriority.includes('AWS') || gaps.mediumPriority.includes('Git'));
});

test('calculateVoiceDeliveryMetrics computes accurate WPM, filler count, and pacing', () => {
  const spoken = 'Um, I led the development of a real-time system, like, basically using Python and Redis.';
  const metrics = calculateVoiceDeliveryMetrics(spoken, 6);

  assert.equal(metrics.wordCount, 15);
  // (15 / 6) * 60 = 150 WPM
  assert.equal(metrics.wordsPerMinute, 150);
  assert.equal(metrics.pacingRating, 'Ideal (120-150 WPM)');
  assert.equal(metrics.fillerWordsCount, 3); // um, like, basically
  assert(metrics.fillerWordsList.includes('um'));
  assert(metrics.fillerWordsList.includes('like'));
  assert(metrics.fillerWordsList.includes('basically'));
});

test('calculateVoiceDeliveryMetrics assesses brief vs balanced lengths correctly', () => {
  const brief = calculateVoiceDeliveryMetrics('I agree.', 4);
  assert.equal(brief.lengthAssessment, 'Too Brief');

  const balancedText = new Array(50).fill('word').join(' ');
  const balanced = calculateVoiceDeliveryMetrics(balancedText, 30);
  assert.equal(balanced.lengthAssessment, 'Well Balanced');
});

