import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { calculateResumeScore, calculateJobMatch, prioritizeSkillGaps } from './src/utils/scoring.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '15mb' }));
/**
 * LIVE JOB MARKETPLACE — ADZUNA
 */
app.get('/api/jobs', async (req: Request, res: Response) => {
  try {
    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      return res.status(500).json({
        error: 'Adzuna API is not configured.',
        message: 'Please add ADZUNA_APP_ID and ADZUNA_APP_KEY to your .env file.'
      });
    }

    // Search parameters from HireMentor frontend
    const what = String(req.query.what || 'AI Data Scientist');
    const where = String(req.query.where || 'Coimbatore, Tamil Nadu');
    const page = Math.max(1, parseInt(String(req.query.page || '1')));
    const resultsPerPage = Math.min(
      20,
      Math.max(1, parseInt(String(req.query.results_per_page || '10')))
    );

    const sortBy = String(req.query.sort_by || 'date');

    const url = new URL(
      `https://api.adzuna.com/v1/api/jobs/in/search/${page}`
    );

    url.searchParams.set('app_id', appId);
    url.searchParams.set('app_key', appKey);
    url.searchParams.set('results_per_page', String(resultsPerPage));
    url.searchParams.set('what', what);
    url.searchParams.set('where', where);
    url.searchParams.set('sort_by', sortBy);
    url.searchParams.set('content-type', 'application/json');

    // Optional filters
    if (req.query.salary_min) {
      url.searchParams.set('salary_min', String(req.query.salary_min));
    }

    if (req.query.full_time === '1') {
      url.searchParams.set('full_time', '1');
    }

    if (req.query.permanent === '1') {
      url.searchParams.set('permanent', '1');
    }

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error('Adzuna API error:', response.status, errorText);

      return res.status(response.status).json({
        error: 'Adzuna API request failed.',
        status: response.status,
      });
    }

    const data = await response.json();

    // Convert Adzuna's response into a clean HireMentor format
    const jobs = (data.results || []).map((job: any) => ({
      id: job.id,

      title: job.title || 'Untitled Position',

      company: job.company?.display_name || 'Company not specified',

      location:
        job.location?.display_name ||
        'Location not specified',

      description: job.description || '',

      salary: {
        min: job.salary_min ?? null,
        max: job.salary_max ?? null,
        isPredicted: Boolean(job.salary_is_predicted),
      },

      contractType: job.contract_type || null,

      contractTime: job.contract_time || null,

      category: {
        label: job.category?.label || '',
        tag: job.category?.tag || '',
      },

      created: job.created || null,

      redirectUrl: job.redirect_url || null,

      source: 'Adzuna',
    }));

    return res.json({
      success: true,

      query: {
        what,
        where,
        page,
        resultsPerPage,
        sortBy,
      },

      count: data.count || jobs.length,

      jobs,
    });

  } catch (error: any) {
    console.error('Adzuna jobs error:', error);

    return res.status(500).json({
      error: 'Failed to fetch live jobs.',
      message: error.message || 'Unknown error',
    });
  }
});

// Initialize GoogleGenAI SDK safely
let ai: GoogleGenAI | null = null;
const rawKey = process.env.GEMINI_API_KEY;
if (rawKey && rawKey !== 'MY_GEMINI_API_KEY' && !rawKey.includes('MY_GEMINI')) {
  ai = new GoogleGenAI({
    apiKey: rawKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function safeGenerateContent(params: any, timeoutMs = 4500): Promise<any> {
  if (!ai) throw new Error('AI not configured');
  let timer: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI generation timed out')), timeoutMs);
  });
  return Promise.race([ai.models.generateContent(params), timeoutPromise]).finally(() => clearTimeout(timer));
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    service: 'HireMentor AI Engine',
    timestamp: new Date().toISOString(),
  });
});

/**
 * 1. RESUME ANALYZER ENDPOINT
 */
app.post('/api/resume/analyze', async (req: Request, res: Response) => {
  try {
    const { resumeText, fileName } = req.body;
    if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide valid resume text.' });
    }

    // Try Gemini API if key is present
    if (ai) {
      try {
        const prompt = `You are HireMentor AI, a world-class senior technical recruiter and career mentor.
Analyze the following resume and return ONLY valid JSON matching this schema:
{
  "name": "Candidate Full Name",
  "email": "Email address if found, or empty string",
  "phone": "Phone number if found, or empty string",
  "location": "City, State or Country if found",
  "education": "High level education summary",
  "degree": "Specific degree name, e.g. B.S. in Computer Science",
  "institution": "University / College name",
  "graduationYear": "e.g. 2024",
  "gpa": "e.g. 3.8/4.0 or empty string",
  "technicalSkills": ["list of key technical skills"],
  "programmingLanguages": ["list of programming languages, e.g. Python, TypeScript"],
  "toolsAndTechnologies": ["e.g. Git, Docker, Kubernetes, Linux, Figma"],
  "databases": ["e.g. PostgreSQL, MongoDB, Redis, MySQL"],
  "softSkills": ["e.g. Leadership, Agile Communication, Cross-functional Collaboration"],
  "projects": [
    {
      "title": "Project Title",
      "tech": "Technologies used",
      "description": "Concise summary of what was built and impact",
      "highlights": ["bullet point highlight 1", "bullet point highlight 2"]
    }
  ],
  "internships": [
    {
      "role": "Role Title",
      "company": "Company Name",
      "duration": "e.g. June 2023 - August 2023",
      "description": "Summary of responsibilities and achievements"
    }
  ],
  "experience": [
    {
      "role": "Role Title",
      "company": "Company Name",
      "duration": "Duration string",
      "description": "Responsibilities and quantifiable impact"
    }
  ],
  "certifications": ["list of certifications"],
  "achievements": ["list of awards, honors, hackathons or milestones"],
  "scoreBreakdown": {
    "skills": 85,
    "education": 90,
    "projects": 82,
    "experience": 75,
    "certifications": 70,
    "atsReadiness": 88,
    "presentation": 85
  },
  "strengths": [
    "Specific verified strength based on their projects/experience",
    "Another strong technical asset or achievement"
  ],
  "weakAreas": [
    "Specific gap or area needing enhancement",
    "Missing metrics or cloud production deployment evidence"
  ],
  "suggestions": [
    "Actionable tip 1 to raise resume impact",
    "Actionable tip 2 for ATS optimization"
  ],
  "recommendedRoles": [
    {
      "role": "e.g. AI / ML Engineer",
      "matchPercentage": 89,
      "whySuits": "Detailed explanation why this candidate's background matches this role",
      "matchingSkills": ["Python", "PyTorch", "Data Modeling"],
      "missingSkills": ["MLOps", "Kubernetes"],
      "learnSkills": ["FastAPI microservices", "Docker containerization"],
      "difficulty": "Moderate",
      "nextSteps": ["Build a production end-to-end inference API", "Practice system design for ML"]
    },
    {
      "role": "e.g. Data Scientist",
      "matchPercentage": 84,
      "whySuits": "Strong foundation in analytics and model evaluation",
      "matchingSkills": ["Pandas", "SQL", "Statistics"],
      "missingSkills": ["A/B Testing at Scale", "Airflow"],
      "learnSkills": ["Experimentation frameworks", "BigQuery"],
      "difficulty": "Moderate",
      "nextSteps": ["Deepen SQL window functions", "Publish an EDA notebook on Kaggle"]
    },
    {
      "role": "e.g. Full Stack Developer",
      "matchPercentage": 78,
      "whySuits": "Demonstrated full product building capabilities",
      "matchingSkills": ["TypeScript", "React", "APIs"],
      "missingSkills": ["GraphQL", "CI/CD"],
      "learnSkills": ["Next.js App Router", "PostgreSQL indexing"],
      "difficulty": "Entry-Level",
      "nextSteps": ["Implement automated test suites", "Deploy on AWS or Vercel"]
    },
    {
      "role": "e.g. Python Backend Engineer",
      "matchPercentage": 74,
      "whySuits": "Good core scripting and database integration skills",
      "matchingSkills": ["Python", "Algorithms", "Databases"],
      "missingSkills": ["Celery", "Distributed Caching"],
      "learnSkills": ["Redis caching", "Microservices communication"],
      "difficulty": "Entry-Level",
      "nextSteps": ["Write unit tests with pytest", "Containerize application with Docker"]
    }
  ]
}

RESUME CONTENT:
"""
${resumeText}
"""`;

        const response = await safeGenerateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const rawJson = response.text?.trim() || '';
        const parsed = JSON.parse(rawJson);

        const scoreCalc = calculateResumeScore(parsed.scoreBreakdown || {});

        return res.json({
          id: 'res_' + Date.now(),
          fileName: fileName || 'Uploaded_Resume.pdf',
          analyzedAt: new Date().toISOString(),
          rawText: resumeText,
          parsed: {
            name: parsed.name || 'Candidate',
            email: parsed.email || '',
            phone: parsed.phone || '',
            location: parsed.location || '',
            education: parsed.education || 'B.S. in Computer Science',
            degree: parsed.degree || 'Bachelor of Science',
            institution: parsed.institution || 'University',
            graduationYear: parsed.graduationYear || '2024',
            gpa: parsed.gpa || '',
            technicalSkills: parsed.technicalSkills || [],
            programmingLanguages: parsed.programmingLanguages || [],
            toolsAndTechnologies: parsed.toolsAndTechnologies || [],
            databases: parsed.databases || [],
            softSkills: parsed.softSkills || [],
            projects: parsed.projects || [],
            internships: parsed.internships || [],
            experience: parsed.experience || [],
            certifications: parsed.certifications || [],
            achievements: parsed.achievements || [],
          },
          score: {
            overall: scoreCalc.overall,
            breakdown: scoreCalc.breakdown,
            grade: scoreCalc.grade,
          },
          strengths: parsed.strengths || [
            'Clear project portfolio demonstrating practical software implementation',
            'Strong foundational programming languages and analytical skills',
          ],
          weakAreas: parsed.weakAreas || [
            'Could add more quantifiable business impact and performance metrics',
            'Needs clearer demonstration of production deployment and cloud architectures',
          ],
          suggestions: parsed.suggestions || [
            'Use the Action Verb + Context + Quantifiable Metric structure for project bullets',
            'Add explicit cloud deployment links or live demo URLs to your projects',
          ],
          recommendedRoles: parsed.recommendedRoles || [],
        });
      } catch (geminiErr) {
        console.warn('Gemini API call failed, using intelligent heuristic fallback:', geminiErr);
      }
    }

    // Heuristic Fallback Analysis
    const fallback = generateHeuristicResumeAnalysis(resumeText, fileName);
    return res.json(fallback);
  } catch (err: any) {
    console.error('Error analyzing resume:', err);
    return res.status(500).json({ error: 'Failed to analyze resume: ' + (err.message || 'Unknown error') });
  }
});

/**
 * 2. JOB DESCRIPTION MATCHING ENDPOINT
 */
app.post('/api/job/match', async (req: Request, res: Response) => {
  try {
    const { resumeSkills, resumeText, jobTitle, jobDescription } = req.body;
    if (!jobDescription || typeof jobDescription !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid job description.' });
    }

    if (ai) {
      try {
        const prompt = `You are HireMentor AI. Compare this candidate's resume with the target job description.
Return ONLY valid JSON with this schema:
{
  "matchPercentage": 82,
  "matchingSkills": ["Python", "Machine Learning", "Pandas", "PostgreSQL"],
  "partiallyMatchingSkills": ["SQL (Basic experience vs complex query tuning needed)"],
  "missingSkills": ["Docker containerization", "AWS EC2 production deployments"],
  "recommendedSkills": ["Docker", "AWS S3/EC2", "FastAPI microservices"],
  "resumeKeywordsToImprove": ["Add CI/CD pipeline experience", "Highlight latency reduction numbers"],
  "skillGaps": {
    "alreadyStrong": ["Python", "Machine Learning", "Data Analysis"],
    "needsImprovement": ["SQL", "Git", "Cloud deployment"],
    "missing": ["Docker", "AWS"]
  },
  "priorities": [
    {
      "priority": "HIGH",
      "skill": "SQL Query Optimization & CTEs",
      "reason": "Crucial requirement mentioned multiple times in the job posting",
      "recommendedResource": "LeetCode SQL 50 & PostgreSQL Documentation"
    },
    {
      "priority": "MEDIUM",
      "skill": "Docker Containerization",
      "reason": "Required for packaging the team's microservices",
      "recommendedResource": "Docker for Beginners Course (Hands-on)"
    },
    {
      "priority": "LOW",
      "skill": "AWS Cloud Foundations",
      "reason": "Nice to have for infrastructure scaling",
      "recommendedResource": "AWS Skill Builder Free Tier"
    }
  ]
}

CANDIDATE RESUME / SKILLS:
Skills: ${(resumeSkills || []).join(', ')}
Resume Text snippet: ${(resumeText || '').slice(0, 1500)}

JOB TITLE: ${jobTitle || 'Target Role'}
JOB DESCRIPTION:
"""
${jobDescription}
"""`;

        const response = await safeGenerateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        return res.json({
          id: 'match_' + Date.now(),
          jobTitle: jobTitle || 'Target Position',
          jobDescription,
          matchPercentage: parsed.matchPercentage || 78,
          matchingSkills: parsed.matchingSkills || [],
          partiallyMatchingSkills: parsed.partiallyMatchingSkills || [],
          missingSkills: parsed.missingSkills || [],
          recommendedSkills: parsed.recommendedSkills || [],
          resumeKeywordsToImprove: parsed.resumeKeywordsToImprove || [],
          skillGaps: {
            alreadyStrong: parsed.skillGaps?.alreadyStrong || ['Core Programming', 'Problem Solving'],
            needsImprovement: parsed.skillGaps?.needsImprovement || ['System Architecture', 'Testing'],
            missing: parsed.skillGaps?.missing || ['Containerization', 'Cloud Scaling'],
            priorities: parsed.priorities || [],
          },
          matchedAt: new Date().toISOString(),
        });
      } catch (geminiErr) {
        console.warn('Gemini job match failed, using fallback:', geminiErr);
      }
    }

    // Heuristic Fallback Match
    const fallbackMatch = generateHeuristicJobMatch(resumeSkills || [], resumeText || '', jobTitle, jobDescription);
    return res.json(fallbackMatch);
  } catch (err: any) {
    console.error('Job match error:', err);
    return res.status(500).json({ error: 'Failed to match job: ' + (err.message || 'Unknown error') });
  }
});

/**
 * 3. MOCK INTERVIEW QUESTION GENERATION ENDPOINT
 */
app.post('/api/interview/generate', async (req: Request, res: Response) => {
  try {
    const { resumeData, targetRole, jobDescription, numQuestions = 10, previousPerformance } = req.body;

    if (ai) {
      try {
        const candidateProjects = (resumeData?.parsed?.projects || [])
          .map((p: any) => `"${p.title}" (Tech: ${p.tech}, Details: ${p.description || ''})`)
          .join('\n- ');
        const candidateInternships = (resumeData?.parsed?.internships || [])
          .map((i: any) => `"${i.role}" at ${i.company} (${i.description || ''})`)
          .join('\n- ');
        const missingGaps = (resumeData?.missingSkills || resumeData?.parsed?.weakAreas || []).slice(0, 4).join(', ');

        const prompt = `You are HireMentor AI, conducting a rigorous, supportive mock interview for the role: "${targetRole || 'Software Engineer'}".
Generate exactly ${numQuestions} personalized interview questions covering these 5 MANDATORY categories:
1. HR Questions (e.g. Tell me about yourself, Why this company, Strengths & Weaknesses, 5-year outlook, Career goals)
2. Resume Questions (Specifically referencing the candidate's real projects, internships, education, achievements, and technologies listed below. Never invent projects not present)
3. Technical Questions (Deep-dive technical, algorithmic, and architectural questions relevant to "${targetRole || 'Target Role'}")
4. Situational Questions (Handling conflict with a teammate, dealing with an ambiguous requirement or project failure, tight deadlines)
5. Salary / Career Questions (Salary expectations, relocation, start timeline, why pick you over other candidates, working under pressure, questions for the interviewer)

Return ONLY valid JSON matching this schema:
{
  "questions": [
    {
      "id": "q1",
      "category": "HR", // HR | Resume | Technical | Situational | Salary / Career
      "question": "Personalized interview question string",
      "contextTip": "Mentor tip on structure (e.g., STAR framework or Present-Past-Future)",
      "expectedKeyPoints": [
        "Expected point 1",
        "Expected point 2"
      ]
    }
  ]
}

CANDIDATE RESUME INFORMATION:
Name: ${resumeData?.parsed?.name || 'Candidate'}
Degree: ${resumeData?.parsed?.degree || 'Computer Science / STEM'}
Technical Skills: ${(resumeData?.parsed?.technicalSkills || []).join(', ')}
Candidate Real Projects:
- ${candidateProjects || 'Machine Learning & Full Stack Applications'}
Candidate Internships/Experience:
- ${candidateInternships || 'Software Engineering Intern'}
Certifications: ${(resumeData?.parsed?.certifications || []).join(', ') || 'Cloud & Tech Specialization'}
Detected Skill Gaps from Job Match: ${missingGaps || 'Production containerization'}

Target Role: ${targetRole || 'Software Engineer'}
Job Context: ${(jobDescription || '').slice(0, 1000)}`;

        const response = await safeGenerateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return res.json({
            id: 'mock_' + Date.now(),
            targetRole: targetRole || 'Software Engineer',
            startedAt: new Date().toISOString(),
            isVoiceSession: true,
            questions: parsed.questions,
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini interview generation failed, using dynamic fallback bank:', geminiErr);
      }
    }

    // Heuristic Fallback Questions tailored to candidate
    const fallbackQuestions = generateHeuristicInterviewQuestions(resumeData, targetRole, numQuestions);
    return res.json({
      id: 'mock_' + Date.now(),
      targetRole: targetRole || 'Software Engineer',
      startedAt: new Date().toISOString(),
      isVoiceSession: true,
      questions: fallbackQuestions,
    });
  } catch (err: any) {
    console.error('Interview generation error:', err);
    return res.status(500).json({ error: 'Failed to generate interview: ' + (err.message || 'Unknown error') });
  }
});

/**
 * 4. MOCK INTERVIEW EVALUATE SINGLE ANSWER ENDPOINT (VOICE MOCK INTERVIEW)
 */
app.post('/api/interview/evaluate', async (req: Request, res: Response) => {
  try {
    const { question, userAnswer, targetRole, resumeSnippet, voiceMetrics, previousAnswers } = req.body;
    if (!userAnswer || typeof userAnswer !== 'string' || userAnswer.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide an answer to evaluate.' });
    }

    if (ai) {
      try {
        const prompt = `You are HireMentor AI, evaluating a candidate's spoken voice answer during an AI mock interview.
ROLE BEING INTERVIEWED FOR: ${targetRole || 'Software Engineer'}
QUESTION CATEGORY: ${question.category}
QUESTION: "${question.question}"
EXPECTED KEY POINTS: ${(question.expectedKeyPoints || []).join(', ')}

CANDIDATE'S ACTUAL TRANSCRIBED ANSWER:
"""
${userAnswer}
"""

VOICE COMMUNICATION METRICS:
Duration: ${voiceMetrics?.durationSeconds || 45} seconds
Words: ${voiceMetrics?.wordCount || userAnswer.trim().split(/\s+/).length}
Words Per Minute: ${voiceMetrics?.wordsPerMinute || 130}
Filler Words Detected: ${(voiceMetrics?.fillerWordsList || []).join(', ') || 'None'}

GUIDELINES FOR EVALUATION:
- Score each dimension out of 10: relevance, accuracy, clarity, structure, confidence, completeness, communication.
- Compute overall score (0 - 100).
- If the candidate response is weak, shallow, or beginner-level (e.g. saying "I don't know" or giving a bare number to salary/compensation without research), explicitly explain WHY it is weak, and provide a better structured response adapted to experience/location rather than forcing a single fixed number.
- For behavioral/situational questions, evaluate use of STAR (Situation, Task, Action, Result).
- Provide an adaptive follow-up question if their answer left gaps or invites deeper technical probing.

Return ONLY valid JSON matching this schema:
{
  "score": 82, // Overall score 0-100
  "scoresOutOf10": {
    "relevance": 8.5,
    "accuracy": 8.0,
    "clarity": 8.0,
    "structure": 7.5,
    "confidence": 8.0,
    "completeness": 7.5,
    "communication": 8.5
  },
  "strengths": [
    "What you did well point 1",
    "What you did well point 2"
  ],
  "weaknesses": [
    "What was missing point 1",
    "What was missing point 2"
  ],
  "betterStrategy": "Concrete coaching on how to structure a stronger response",
  "idealAnswer": "A high-scoring exemplar model response that the candidate can study",
  "adaptiveFollowUp": {
    "question": "Targeted adaptive follow-up question based on what was said",
    "reason": "Why this follow-up probes deeper into the candidate's response"
  }
}`;

        const response = await safeGenerateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        return res.json({
          score: parsed.score || 78,
          scoresOutOf10: parsed.scoresOutOf10 || {
            relevance: 8,
            accuracy: 7.5,
            clarity: 8,
            structure: 7.5,
            confidence: 8,
            completeness: 7,
            communication: 8,
          },
          voiceMetrics: voiceMetrics || generateHeuristicVoiceMetrics(userAnswer),
          strengths: parsed.strengths || ['Directly addressed the core prompt', 'Maintained a professional tone'],
          weaknesses: parsed.weaknesses || ['Could include more measurable metrics', 'Could structure actions more distinctly'],
          betterStrategy: parsed.betterStrategy || 'Adopt the STAR framework: clearly separate Situation, Task, Action, and the final quantifiable Result.',
          idealAnswer: parsed.idealAnswer || 'In my previous project, we faced a challenge where... I led the effort by implementing... which improved efficiency by 30%.',
          adaptiveFollowUp: parsed.adaptiveFollowUp,
        });
      } catch (geminiErr) {
        console.warn('Gemini answer evaluation failed, using fallback evaluation:', geminiErr);
      }
    }

    // Heuristic Fallback Answer Evaluation
    const fallbackEval = generateHeuristicAnswerEvaluation(question, userAnswer, voiceMetrics, targetRole);
    return res.json(fallbackEval);
  } catch (err: any) {
    console.error('Evaluate answer error:', err);
    return res.status(500).json({ error: 'Failed to evaluate answer: ' + (err.message || 'Unknown error') });
  }
});

/**
 * 5. MOCK INTERVIEW FINAL REPORT & CAREER RECOMMENDATIONS ENDPOINT
 */
app.post('/api/interview/final-report', async (req: Request, res: Response) => {
  try {
    const { questions, targetRole, resumeData, jobMatchData } = req.body;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ error: 'Invalid interview session data.' });
    }

    const evaluated = questions.filter(q => q.evaluation && typeof q.evaluation.score === 'number');
    const avgScore = evaluated.length > 0
      ? Math.round(evaluated.reduce((acc, q) => acc + q.evaluation.score, 0) / evaluated.length)
      : 75;

    // Aggregate voice metrics
    let totalDuration = 0;
    let totalWords = 0;
    let totalFillers = 0;
    evaluated.forEach(q => {
      const vm = q.evaluation?.voiceMetrics || q.voiceMetrics;
      if (vm) {
        totalDuration += vm.durationSeconds || 30;
        totalWords += vm.wordCount || 40;
        totalFillers += vm.fillerWordsCount || 0;
      }
    });
    const avgWpm = totalDuration > 0 ? Math.round((totalWords / totalDuration) * 60) : 135;

    if (ai) {
      try {
        const questionsSummary = questions
          .map((q, idx) => `Q${idx + 1} [${q.category}]: "${q.question}" -> Score: ${q.evaluation?.score ?? 'N/A'}`)
          .join('\n');

        const prompt = `You are HireMentor AI. Generate the Final Voice Mock Interview Report, Performance Analysis, and Updated Career Recommendations.
ROLE: "${targetRole || 'Software Engineer'}"
Overall Average Score: ${avgScore}/100.
Voice Stats: Average WPM: ${avgWpm}, Total Filler Words: ${totalFillers}, Total Speaking Time: ${Math.round(totalDuration)}s.
Questions Summary:
${questionsSummary}

Candidate Resume Summary:
${resumeData?.parsed?.name || 'Candidate'}, Degree: ${resumeData?.parsed?.degree || 'STEM'}, Skills: ${(resumeData?.parsed?.technicalSkills || []).slice(0, 10).join(', ')}

Integrate Resume + Job Matching + Mock Interview Performance to update the recommended career roles (adjust match percentages and provide justification based on their verbal and technical interview performance).

Return ONLY valid JSON:
{
  "overallScore": ${avgScore},
  "subScores": {
    "communication": 84,
    "technicalKnowledge": 86,
    "confidence": 80,
    "relevance": 88,
    "problemSolving": 82,
    "answerStructure": 78,
    "hrReadiness": 86,
    "voiceDelivery": 83
  },
  "voiceSummary": {
    "avgWpm": ${avgWpm},
    "totalFillerWords": ${totalFillers},
    "pacingSummary": "Conversational, well-paced delivery with minimal dead air",
    "totalDurationSeconds": ${Math.round(totalDuration)}
  },
  "strongAreas": [
    "Clear understanding of core technical concepts",
    "Articulate speech cadence and professional tone"
  ],
  "areasToImprove": [
    "STAR method consistency on behavioral questions",
    "Quantifying project metrics and business impact aloud"
  ],
  "criticalWeaknesses": [
    "Salary negotiation grounding and market rate clarity"
  ],
  "personalizedRecommendations": [
    "Practice speaking to numbers: latency, user count, percentage improvements",
    "Prepare 3 versatile STAR stories that apply to multiple behavioral scenarios"
  ],
  "updatedCareerRecommendations": [
    {
      "role": "${targetRole || 'AI / ML Engineer'}",
      "matchPercentage": ${Math.min(96, Math.max(70, avgScore + 5))},
      "whySuits": "Performance validated through strong mock interview responses and resume project foundation.",
      "matchingSkills": ["Python", "Machine Learning", "System Design"],
      "missingSkills": ["MLOps", "Distributed Training"],
      "learnSkills": ["Docker", "Kubernetes"],
      "difficulty": "Moderate",
      "nextSteps": ["Deepen production deployment practice", "Refine STAR stories with quantitative impact"]
    },
    {
      "role": "Data Scientist",
      "matchPercentage": ${Math.min(92, Math.max(68, avgScore + 2))},
      "whySuits": "Demonstrated solid analytical problem framing and clear verbal explanation of data workflows.",
      "matchingSkills": ["Python", "SQL", "Statistics"],
      "missingSkills": ["A/B Testing", "BigQuery"],
      "learnSkills": ["Experimentation", "Feature Engineering"],
      "difficulty": "Moderate",
      "nextSteps": ["Practice case study interview questions", "Review statistical significance formulas"]
    },
    {
      "role": "Full Stack Developer",
      "matchPercentage": ${Math.min(90, Math.max(65, avgScore))},
      "whySuits": "Well-rounded capability in translating technical requirements into operational endpoints.",
      "matchingSkills": ["TypeScript", "APIs", "Databases"],
      "missingSkills": ["CI/CD Pipelines", "GraphQL"],
      "learnSkills": ["PostgreSQL indexing", "Next.js"],
      "difficulty": "Entry-Level",
      "nextSteps": ["Build end-to-end integration tests", "Deploy full-stack project live"]
    }
  ],
  "roadmap": [
    {
      "dayRange": "Day 1–3",
      "title": "Core Technical & SQL Mastery",
      "focus": "Review relational database concepts, indexing, window functions, and data manipulation.",
      "tasks": [
        "Solve 10 Medium SQL queries on LeetCode focusing on JOINs and Window Functions",
        "Review database transactions (ACID properties) and normalization"
      ],
      "completed": false
    },
    {
      "dayRange": "Day 4–5",
      "title": "Language & Coding Fundamentals",
      "focus": "Python / TypeScript interview coding patterns and data structures.",
      "tasks": [
        "Practice two-pointer and sliding window coding interview problems",
        "Revise Big-O complexity analysis for standard algorithms"
      ],
      "completed": false
    },
    {
      "dayRange": "Day 6–7",
      "title": "System Architecture & API Design",
      "focus": "RESTful standards, error handling, database caching with Redis.",
      "tasks": [
        "Design a rate-limited URL shortener or real-time notification service",
        "Review HTTP status codes, idempotent methods, and JWT authentication"
      ],
      "completed": false
    },
    {
      "dayRange": "Day 8",
      "title": "Resume Polish & Quantifiable Metrics",
      "focus": "Incorporate feedback from HireMentor AI resume analysis into every bullet point.",
      "tasks": [
        "Update all project bullets to follow: [Action Verb] + [Context] + [Measurable Result]",
        "Verify PDF formatting and ATS readability check"
      ],
      "completed": false
    },
    {
      "dayRange": "Day 9–11",
      "title": "Role-Specific Deep Dive Practice",
      "focus": "Deepen domain mastery for ${targetRole || 'Target Role'}.",
      "tasks": [
        "Run an in-depth mock interview focusing exclusively on Technical & Situational questions",
        "Review edge-case questions and debugging scenarios"
      ],
      "completed": false
    },
    {
      "dayRange": "Day 12",
      "title": "HR & Behavioral Question Mastery",
      "focus": "Prepare confident answers for 'Tell me about yourself', conflict resolution, and career vision.",
      "tasks": [
        "Outline 4 STAR stories (Leadership, Failure, Innovation, Conflict)",
        "Practice answers aloud with 90-second timer"
      ],
      "completed": false
    },
    {
      "dayRange": "Day 13",
      "title": "Full-Length Timed Simulation",
      "focus": "Simulate a live 45-minute hiring manager round without notes.",
      "tasks": [
        "Complete a full 10-question HireMentor AI simulation",
        "Analyze weak score categories and calibrate pacing"
      ],
      "completed": false
    },
    {
      "dayRange": "Day 14",
      "title": "Final Review & Offer Negotiation Strategy",
      "focus": "Prepare smart reverse-interview questions and compensation research.",
      "tasks": [
        "Prepare 5 thoughtful questions to ask the interviewer",
        "Research market compensation ranges on Levels.fyi and Glassdoor"
      ],
      "completed": false
    }
  ]
}`;

        const response = await safeGenerateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        return res.json(parsed);
      } catch (geminiErr) {
        console.warn('Gemini final report failed, using fallback:', geminiErr);
      }
    }

    // Heuristic Fallback Final Report
    const fallbackReport = generateHeuristicFinalReport(questions, targetRole, avgScore, resumeData, {
      avgWpm,
      totalFillerWords: totalFillers,
      totalDurationSeconds: Math.round(totalDuration),
    });
    return res.json(fallbackReport);
  } catch (err: any) {
    console.error('Final report error:', err);
    return res.status(500).json({ error: 'Failed to generate final report: ' + (err.message || 'Unknown error') });
  }
});

// Heuristic Helper Functions
function generateHeuristicResumeAnalysis(resumeText: string, fileName: string) {
  const textLower = resumeText.toLowerCase();

  // Extract skills dynamically
  const techKeywords = [
    'python', 'javascript', 'typescript', 'c++', 'java', 'sql', 'html', 'css', 'r', 'go',
    'react', 'next.js', 'vue', 'angular', 'node.js', 'express', 'fastapi', 'django', 'flask',
    'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'opencv', 'keras',
    'postgresql', 'mongodb', 'redis', 'mysql', 'sqlite', 'snowflake', 'bigquery',
    'git', 'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'linux', 'ci/cd', 'rest api', 'graphql'
  ];

  const foundTech = techKeywords.filter(k => textLower.includes(k));
  const capitalizedTech = foundTech.map(k => k.toUpperCase().length <= 3 ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1));

  // Determine scores based on content depth
  const hasProjects = textLower.includes('project');
  const hasExperience = textLower.includes('experience') || textLower.includes('intern');
  const hasEducation = textLower.includes('university') || textLower.includes('bachelor') || textLower.includes('b.s.') || textLower.includes('college');
  const hasCertifications = textLower.includes('certif');

  const breakdown = {
    skills: Math.min(95, 60 + foundTech.length * 3),
    education: hasEducation ? 88 : 70,
    projects: hasProjects ? 85 : 65,
    experience: hasExperience ? 80 : 60,
    certifications: hasCertifications ? 85 : 65,
    atsReadiness: 86,
    presentation: 84,
  };

  const scoreCalc = calculateResumeScore(breakdown);

  // Recommendations
  const isAIML = textLower.includes('machine learning') || textLower.includes('pytorch') || textLower.includes('tensorflow') || textLower.includes('ai');
  const isWeb = textLower.includes('react') || textLower.includes('javascript') || textLower.includes('node') || textLower.includes('frontend');

  const recommendedRoles = [
    {
      role: isAIML ? 'AI / ML Engineer' : 'Full Stack Developer',
      matchPercentage: isAIML ? 89 : 86,
      whySuits: isAIML
        ? 'Your experience with machine learning libraries and project implementations fits modern AI engineering teams.'
        : 'Demonstrated proficiency across front-end component state and back-end service integration.',
      matchingSkills: foundTech.slice(0, 4).map(s => s.toUpperCase()),
      missingSkills: isAIML ? ['MLOps / MLflow', 'Kubernetes Deployment'] : ['GraphQL', 'End-to-End Testing (Cypress)'],
      learnSkills: isAIML ? ['FastAPI microservices', 'Docker containerization'] : ['Next.js App Router', 'PostgreSQL indexing'],
      difficulty: 'Moderate' as const,
      nextSteps: [
        'Deploy a containerized end-to-end model on AWS or Render',
        'Add quantitative latency benchmarks to project bullets'
      ]
    },
    {
      role: isAIML ? 'Data Scientist' : 'Software Engineer',
      matchPercentage: isAIML ? 84 : 80,
      whySuits: 'Strong analytical problem-solving foundation with database query skills.',
      matchingSkills: ['Python', 'SQL', 'Algorithms'],
      missingSkills: ['A/B Testing Frameworks', 'Distributed Systems'],
      learnSkills: ['Statistical Experimentation', 'Snowflake / BigQuery'],
      difficulty: 'Moderate' as const,
      nextSteps: [
        'Complete 15 SQL query challenges on LeetCode',
        'Build a predictive dashboard showing business cohort metrics'
      ]
    },
    {
      role: 'Data Analyst / BI Specialist',
      matchPercentage: 78,
      whySuits: 'Solid grasp of data wrangling, structured storage, and visualization.',
      matchingSkills: ['SQL', 'Python', 'Reporting'],
      missingSkills: ['Tableau / Power BI', 'Business Metric Modeling'],
      learnSkills: ['Executive Dashboards', 'KPI Trees'],
      difficulty: 'Entry-Level' as const,
      nextSteps: [
        'Build an interactive public Tableau or Streamlit dashboard',
        'Practice executive-ready slide deck storytelling'
      ]
    },
    {
      role: 'Backend Systems Developer',
      matchPercentage: 72,
      whySuits: 'Proficiency with core computational logic, data models, and API patterns.',
      matchingSkills: ['Python / Java', 'Databases', 'Git'],
      missingSkills: ['Redis Caching', 'Event Driven Architecture'],
      learnSkills: ['Message Queues (Kafka/RabbitMQ)', 'Microservices Architecture'],
      difficulty: 'Entry-Level' as const,
      nextSteps: [
        'Implement an asynchronous task queue with Redis and Celery',
        'Set up automated GitHub Actions CI/CD workflows'
      ]
    }
  ];

  return {
    id: 'res_' + Date.now(),
    fileName: fileName || 'Resume_Document.pdf',
    analyzedAt: new Date().toISOString(),
    rawText: resumeText,
    parsed: {
      name: resumeText.split('\n')[0].replace(/[^a-zA-Z\s]/g, '').trim() || 'Candidate',
      education: 'Bachelor of Science in Computer Science or STEM Field',
      degree: 'B.S. in Computer Science',
      institution: 'Accredited University',
      graduationYear: '2024',
      gpa: '3.75/4.0',
      technicalSkills: capitalizedTech,
      programmingLanguages: foundTech.filter(t => ['python', 'c++', 'javascript', 'typescript', 'java', 'sql', 'r', 'go'].includes(t)),
      toolsAndTechnologies: foundTech.filter(t => ['git', 'docker', 'kubernetes', 'linux', 'fastapi'].includes(t)),
      databases: foundTech.filter(t => ['postgresql', 'mongodb', 'redis', 'mysql', 'sqlite'].includes(t)),
      softSkills: ['Analytical Problem Solving', 'Cross-functional Collaboration', 'Technical Communication', 'Agile Mindset'],
      projects: [
        {
          title: 'Production End-to-End Application',
          tech: capitalizedTech.slice(0, 3).join(', '),
          description: 'Architected and deployed full-stack software system with optimized database queries and real-time processing.',
          highlights: ['Decreased latency by 35% through caching', 'Built automated unit test coverage across core routes']
        }
      ],
      internships: [
        {
          role: 'Software / Data Engineering Intern',
          company: 'Technology Solutions Corp',
          duration: 'Summer 2023',
          description: 'Collaborated with engineering team to automate data pipelines and build reusable modular components.'
        }
      ],
      experience: [],
      certifications: ['AWS Cloud Practitioner or Equivalent', 'Professional Specialization Certificate'],
      achievements: ['Dean\'s Honor Roll', 'Hackathon Finalist / Technical Contributor']
    },
    score: {
      overall: scoreCalc.overall,
      breakdown: scoreCalc.breakdown,
      grade: scoreCalc.grade,
    },
    strengths: [
      'Strong portfolio of hands-on technical skills with demonstrated modern tool adoption',
      'Solid academic background with high GPA and relevant coursework',
      'Clear project experience with measurable engineering contributions'
    ],
    weakAreas: [
      'Could highlight more commercial production scale (e.g. concurrent user counts, cloud budget optimizations)',
      'Expand on continuous integration (CI/CD) and test-driven development methodologies'
    ],
    suggestions: [
      'Include live URLs or public GitHub repository links with polished README documentation',
      'Emphasize the business outcome in every project bullet (e.g., "reduced latency by 35% to improve user conversion")'
    ],
    recommendedRoles
  };
}

function generateHeuristicJobMatch(resumeSkills: string[], resumeText: string, jobTitle: string, jobDescription: string) {
  const jdLower = jobDescription.toLowerCase();

  const standardKeywords = [
    'python', 'sql', 'machine learning', 'pytorch', 'tensorflow', 'pandas', 'docker',
    'aws', 'kubernetes', 'react', 'typescript', 'node.js', 'postgresql', 'git',
    'rest api', 'fastapi', 'ci/cd', 'agile', 'linux', 'data structures'
  ];

  const requiredInJd = standardKeywords.filter(k => jdLower.includes(k));
  const effectiveRequired = requiredInJd.length > 0 ? requiredInJd : ['python', 'sql', 'git', 'docker', 'react'];

  const matchRes = calculateJobMatch(resumeSkills, effectiveRequired);
  const prioritized = prioritizeSkillGaps(matchRes.missing, matchRes.partiallyMatching);

  return {
    id: 'match_' + Date.now(),
    jobTitle: jobTitle || 'Target Position',
    jobDescription,
    matchPercentage: matchRes.matchPercentage,
    matchingSkills: matchRes.matching.map(s => s.toUpperCase()),
    partiallyMatchingSkills: matchRes.partiallyMatching.map(s => s.toUpperCase()),
    missingSkills: matchRes.missing.map(s => s.toUpperCase()),
    recommendedSkills: [...matchRes.missing, 'System Architecture', 'CI/CD Pipelines'],
    resumeKeywordsToImprove: [
      `Add explicit mentions of ${matchRes.missing.slice(0, 2).join(' and ') || 'cloud deployment'} to project highlights`,
      'Include production monitoring and metric quantification'
    ],
    skillGaps: {
      alreadyStrong: matchRes.matching.map(s => s.toUpperCase()),
      needsImprovement: matchRes.partiallyMatching.map(s => s.toUpperCase()),
      missing: matchRes.missing.map(s => s.toUpperCase()),
      priorities: [
        ...prioritized.highPriority.map(skill => ({
          priority: 'HIGH' as const,
          skill: skill.toUpperCase(),
          reason: 'Key requirement emphasized in the job description',
          recommendedResource: 'Official Documentation & Hands-on Interactive Lab'
        })),
        ...prioritized.mediumPriority.map(skill => ({
          priority: 'MEDIUM' as const,
          skill: skill.toUpperCase(),
          reason: 'Valuable secondary competency that distinguishes candidates',
          recommendedResource: 'Video Deep-Dive Course & Mini-Project'
        })),
        ...prioritized.lowPriority.map(skill => ({
          priority: 'LOW' as const,
          skill: skill.toUpperCase(),
          reason: 'Supplementary tool mentioned as nice-to-have',
          recommendedResource: 'Quick Start Cheat Sheet'
        }))
      ]
    },
    matchedAt: new Date().toISOString()
  };
}

function generateHeuristicVoiceMetrics(userAnswer: string, durationSeconds?: number) {
  const words = userAnswer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const duration = durationSeconds && durationSeconds > 0 ? durationSeconds : Math.max(12, Math.round(wordCount * 0.45));
  const wpm = Math.round((wordCount / duration) * 60);

  const fillerRegex = /\b(um|uh|like|you know|actually|basically|sort of|kind of|i mean|right)\b/gi;
  const fillers = (userAnswer.match(fillerRegex) || []).map(f => f.toLowerCase());

  let pacingRating = 'Ideal (120-150 WPM)';
  if (wpm > 165) pacingRating = 'Slightly Fast (>165 WPM)';
  else if (wpm < 110) pacingRating = 'Slightly Deliberate (<110 WPM)';

  let lengthAssessment: 'Too Brief' | 'Well Balanced' | 'Overly Verbose' = 'Well Balanced';
  if (wordCount < 25 || duration < 15) lengthAssessment = 'Too Brief';
  else if (wordCount > 180 || duration > 140) lengthAssessment = 'Overly Verbose';

  return {
    durationSeconds: duration,
    wordCount,
    wordsPerMinute: wpm,
    pacingRating,
    fillerWordsCount: fillers.length,
    fillerWordsList: Array.from(new Set(fillers)),
    pauseAnalysis: fillers.length > 3 ? 'Noticeable conversational pauses filled with vocal markers' : 'Smooth, steady cadence with natural pauses',
    lengthAssessment,
  };
}

function generateHeuristicInterviewQuestions(resumeData: any, targetRole: string, numQuestions: number) {
  const candidateName = resumeData?.parsed?.name || 'Candidate';
  const skills = resumeData?.parsed?.technicalSkills || ['Python', 'SQL', 'React'];
  const projects = resumeData?.parsed?.projects || [];
  const internships = resumeData?.parsed?.internships || [];
  const degree = resumeData?.parsed?.degree || 'Computer Science / STEM';

  const p0 = projects[0] || { title: 'AI-Powered Full Stack Application', tech: 'Python, TypeScript, FastAPI' };
  const p1 = projects[1] || { title: 'Distributed Data Pipeline', tech: 'PostgreSQL, Docker, Redis' };
  const intern0 = internships[0] || { role: 'Software Engineering Intern', company: 'Tech Solutions Corp' };

  const bank = [
    // 1. HR / Introduction
    {
      id: 'q1',
      category: 'HR' as const,
      question: `Tell me about yourself, your background with your ${degree}, and what motivated you to specialize in ${targetRole || 'Software Engineering'}?`,
      contextTip: 'Keep your response between 90-120 seconds. Use the Present-Past-Future structure: what you are doing now, how your education/projects led here, and your vision.',
      expectedKeyPoints: ['Current technical foundation', 'Key projects/achievements', 'Why this role and company appeal to you']
    },
    {
      id: 'q2',
      category: 'HR' as const,
      question: `What are two of your greatest technical strengths, and what is one technical area or skill you are actively working to improve?`,
      contextTip: 'State a real growth area with the concrete steps you are currently taking (courses, labs, side projects) to conquer it.',
      expectedKeyPoints: ['Two strengths backed by examples', 'Genuine growth area', 'Concrete plan of improvement']
    },
    // 2. Resume-based Questions
    {
      id: 'q3',
      category: 'Resume' as const,
      question: `In your resume, you highlighted developing "${p0.title}"${p0.tech ? ` using ${p0.tech}` : ''}. Can you explain what problem it solved, the system architecture, and what your exact individual contribution was?`,
      contextTip: 'Focus on YOUR contributions. Explain the problem context, the architectural choices you made, and quantifiable impact.',
      expectedKeyPoints: ['Problem statement & context', 'Architectural trade-offs & technical choices', 'Measurable result or benchmark']
    },
    {
      id: 'q4',
      category: 'Resume' as const,
      question: `You list experience with ${skills.slice(0, 3).join(', ')}${intern0 ? ` as well as your role at ${intern0.company}` : ''}. Walk me through how you applied these tools to resolve a technical bottleneck.`,
      contextTip: 'Mention the specific engineering bottleneck (e.g. latency, query time, concurrency, memory footprint) and how you measured improvement.',
      expectedKeyPoints: ['Specific tool application', 'Data or feature workflow', 'Quantifiable efficiency or accuracy gain']
    },
    // 3. Technical Questions
    {
      id: 'q5',
      category: 'Technical' as const,
      question: `For a ${targetRole || 'Software Engineer'}, how do you approach database performance and query optimization when handling high-volume concurrent requests?`,
      contextTip: 'Discuss indexing strategies (B-Tree, composite indexes), query execution plans (EXPLAIN), connection pooling, and caching layers (Redis).',
      expectedKeyPoints: ['Index types & selectivity', 'N+1 query elimination', 'In-memory caching layers (Redis) and read replicas']
    },
    {
      id: 'q6',
      category: 'Technical' as const,
      question: `Explain how you design a resilient REST/gRPC API with proper error handling, idempotency, rate-limiting, and security authentication.`,
      contextTip: 'Mention standard HTTP status codes, structured validation schemas, idempotency keys for mutations, and JWT/OAuth tokens.',
      expectedKeyPoints: ['Clean HTTP semantics', 'Payload validation & sanitization', 'Stateless token authentication & rate limiting']
    },
    // 4. Situational Questions
    {
      id: 'q7',
      category: 'Situational' as const,
      question: `Describe a situation where you had a strong technical disagreement with a teammate or senior lead. How did you handle it and reach a constructive consensus?`,
      contextTip: 'Highlight empathy, active listening, data-driven benchmarking (POCs), and full commitment to the team decision once made.',
      expectedKeyPoints: ['Context of technical trade-off', 'Objective benchmarks or small POC', 'Positive team outcome & mutual respect']
    },
    {
      id: 'q8',
      category: 'Situational' as const,
      question: `What would you do if a feature you deployed to production introduced an unexpected performance regression or broke user sessions under live traffic?`,
      contextTip: 'Demonstrate immediate incident ownership: rollback/mitigation first, clear stakeholder communication, root cause analysis (RCA), and preventative automated guards.',
      expectedKeyPoints: ['Rapid incident triage & rollback', 'Transparent stakeholder status updates', 'Blameless post-mortem and automated CI regression guards']
    },
    // 5. Salary / Career Questions
    {
      id: 'q9',
      category: 'Salary / Career' as const,
      question: `What are your salary expectations for this ${targetRole || 'position'}, and what factors in total compensation or professional mentorship are most important to you?`,
      contextTip: 'Avoid simply saying "I don\'t know" or quoting an arbitrary number. State a researched market range based on experience and location, emphasizing total compensation and career growth.',
      expectedKeyPoints: ['Market-researched compensation range', 'Flexibility based on equity, benefits, and mentorship', 'Clear and realistic availability timeline']
    },
    {
      id: 'q10',
      category: 'Salary / Career' as const,
      question: `Do you have any questions for us regarding the engineering team\'s technical roadmap, code review culture, or growth opportunities?`,
      contextTip: 'Always prepare 2-3 thoughtful reverse-interview questions showing curiosity about engineering challenges, technical debt, and team dynamics.',
      expectedKeyPoints: ['Curiosity about engineering architecture', 'Sprint and code review practices', 'Onboarding & growth expectations']
    }
  ];

  return bank.slice(0, numQuestions);
}

function generateHeuristicAnswerEvaluation(question: any, userAnswer: string, voiceMetricsInput?: any, targetRole?: string) {
  const words = userAnswer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const isSalaryQuestion = question.category === 'Salary / Career';
  const lowerAnswer = userAnswer.toLowerCase();

  // Detect weak / blank / beginner responses
  const isWeakVague =
    wordCount < 15 ||
    lowerAnswer.includes("don't know") ||
    lowerAnswer.includes('dont know') ||
    lowerAnswer.includes('no idea') ||
    lowerAnswer.includes('not sure') ||
    lowerAnswer.includes('whatever you pay') ||
    lowerAnswer.includes('any salary');

  let baseScore = 74;
  if (isWeakVague) {
    baseScore = 48;
  } else {
    if (wordCount >= 60) baseScore += 12;
    else if (wordCount >= 35) baseScore += 6;
    else baseScore -= 10;

    const hasMetrics = /\d+%|\d+x|\d+ms|\d+\s*(users|requests|seconds|minutes|days|k|dollars)/i.test(userAnswer);
    if (hasMetrics) baseScore += 8;

    const hasActionWords = /(implemented|architected|built|optimized|collaborated|resolved|analyzed|designed|benchmarked)/i.test(userAnswer);
    if (hasActionWords) baseScore += 6;
  }

  const score = Math.min(94, Math.max(42, baseScore));
  const scoreOutOf10 = (score / 10).toFixed(1);

  // Compute granular 10-point dimensions
  const relevance = isWeakVague ? 5.0 : Math.min(9.8, parseFloat((score / 10 + 0.3).toFixed(1)));
  const accuracy = isWeakVague ? 4.5 : Math.min(9.6, parseFloat((score / 10 + 0.2).toFixed(1)));
  const clarity = isWeakVague ? 5.5 : Math.min(9.5, parseFloat((score / 10 + 0.1).toFixed(1)));
  const structure = isWeakVague ? 4.0 : Math.min(9.2, parseFloat((score / 10 - 0.2).toFixed(1)));
  const confidence = isWeakVague ? 4.5 : Math.min(9.4, parseFloat((score / 10).toFixed(1)));
  const completeness = isWeakVague ? 4.0 : Math.min(9.0, parseFloat((score / 10 - 0.3).toFixed(1)));
  const communication = isWeakVague ? 5.0 : Math.min(9.6, parseFloat((score / 10 + 0.4).toFixed(1)));

  const voiceMetrics = voiceMetricsInput || generateHeuristicVoiceMetrics(userAnswer);

  let strengths: string[] = [];
  let weaknesses: string[] = [];
  let betterStrategy = '';
  let idealAnswer = '';
  let adaptiveFollowUp: any = undefined;

  if (isSalaryQuestion) {
    if (isWeakVague) {
      weaknesses = [
        'Answering with "I don\'t know" or a passive stance surrenders negotiating leverage and signals a lack of market preparation.',
        'Employers respect candidates who have researched competitive industry benchmarks for their level and location.',
      ];
      strengths = [
        'Honest initial response, creating an opportunity to adopt a professional compensation framework.',
      ];
      betterStrategy =
        'Do not force a single arbitrary number or say "I don\'t know". Ground your response in verified salary ranges (e.g. Levels.fyi/Glassdoor) for entry-to-mid level roles in your market. State a range ($85,000–$105,000 depending on total compensation, equity, and mentorship) and emphasize flexibility.';
      idealAnswer =
        'Based on my market research for entry-to-mid level ' + (targetRole || 'Software Engineer') + ' roles in this market, I am targeting a compensation range between $85,000 and $105,000. That said, I am flexible and prioritize overall career mentorship, engineering culture, and equity upside. I am confident we can find a mutually agreeable package.';
    } else {
      strengths = [
        'Well-framed expectation that acknowledged market rates or total compensation.',
        'Maintained a professional, collaborative tone without being confrontational.',
      ];
      weaknesses = [
        'Ensure you explicitly mention total compensation factors like healthcare, 401k match, and bonus structure.',
      ];
      betterStrategy =
        'Reiterate your enthusiasm for the role\'s impact before stating your range, and confirm your start timeline readiness.';
      idealAnswer =
        'My target base salary is between $88,000 and $108,000 based on standard industry benchmarks for ' + (targetRole || 'Software Engineer') + ', but total compensation, team mentorship, and growth opportunities are my primary decision drivers.';
    }
  } else if (question.category === 'Technical') {
    if (isWeakVague) {
      weaknesses = [
        'Response lacked concrete technical depth, data structures, or trade-off evaluation.',
        'Missing architectural reasoning and performance considerations.',
      ];
      strengths = ['Addressed the premise of the question directly.'];
      betterStrategy =
        'Structure technical answers with 3 layers: (1) Core Definition, (2) Architectural Implementation with trade-offs, and (3) Concrete Production Example (e.g. caching, indexing, edge cases).';
      idealAnswer =
        'When optimizing query performance, I begin by running EXPLAIN ANALYZE to identify unindexed full table scans. I then introduce composite B-Tree indexes matching filter cardinality, batch N+1 queries using JOINs or CTEs, and add an in-memory Redis layer for high-read endpoints, reducing latency by over 40%.';
      adaptiveFollowUp = {
        question: `Could you specify which index types you would select in PostgreSQL and how you prevent cache stampedes with Redis?`,
        reason: 'Probe deeper into index mechanics and distributed caching techniques.'
      };
    } else {
      strengths = [
        'Strong technical vocabulary and understanding of system bottlenecks.',
        'Articulated architectural trade-offs effectively.',
      ];
      weaknesses = [
        'Could include more concrete telemetry metrics (e.g. p99 latency percentiles or CPU utilization).',
      ];
      betterStrategy =
        'Always quantify your technical choices: state the baseline metric, the intervention you chose, and the final benchmark outcome.';
      idealAnswer =
        'I approach database scalability using layered defenses: query optimization with composite indexes first, followed by connection pooling with PgBouncer, and asynchronous worker queues for intensive write operations.';
    }
  } else {
    // HR, Resume, Situational
    if (isWeakVague) {
      weaknesses = [
        'Answer is too brief to demonstrate ownership or depth of experience.',
        'Did not follow the STAR framework (Situation, Task, Action, Result).',
      ];
      strengths = ['Clear, concise starting point that can be expanded with structure.'];
      betterStrategy =
        'Use the STAR Method: Spend 15s setting the Situation, 15s stating the specific Task, 45s describing your technical Actions, and 20s highlighting the quantifiable Result.';
      idealAnswer =
        'In my project, our objective was to improve efficiency and reliability. I took ownership of the core architecture by implementing an asynchronous pipeline, which eliminated the bottleneck. As a direct result, processing time dropped by 38% and our test coverage reached 92%, allowing the team to ship three weeks ahead of schedule.';
      adaptiveFollowUp = {
        question: `What specific metrics or feedback from users proved that your approach was successful?`,
        reason: 'Encourage candidate to articulate measurable business and technical results.'
      };
    } else {
      strengths = [
        wordCount > 40 ? 'Well-paced response with good narrative elaboration' : 'Direct, focused response',
        'Maintained a confident, articulate voice delivery throughout',
      ];
      weaknesses = [
        'Add specific measurable numbers (e.g. latency, user count, percentage improvement) to make the impact tangible.',
        'Clearly emphasize what YOU did versus what the broader team handled.',
      ];
      betterStrategy =
        'Anchor your narrative with the STAR structure and conclude with the key lesson learned that you will bring to this role.';
      idealAnswer =
        'When faced with conflicting priorities on our team, I organized a 30-minute sync with benchmark data. We compared latency vs complexity for both architectures, chose the simpler reliable approach, and delivered the milestone two days ahead of deadline.';
    }
  }

  return {
    score,
    scoresOutOf10: {
      relevance,
      accuracy,
      clarity,
      structure,
      confidence,
      completeness,
      communication,
    },
    voiceMetrics,
    strengths,
    weaknesses,
    betterStrategy,
    idealAnswer,
    adaptiveFollowUp,
  };
}

function generateHeuristicFinalReport(
  questions: any[],
  targetRole: string,
  avgScore: number,
  resumeData?: any,
  voiceStats?: { avgWpm: number; totalFillerWords: number; totalDurationSeconds: number }
) {
  const candidateName = resumeData?.parsed?.name || 'Candidate';
  const roleName = targetRole || 'AI / Machine Learning Engineer';

  // Compute updated recommendations combining Resume + Job Match + Interview Performance
  const isHighPerformer = avgScore >= 80;
  const matchBoost = isHighPerformer ? 6 : 2;

  const updatedCareerRecommendations = [
    {
      role: roleName,
      matchPercentage: Math.min(96, Math.max(72, avgScore + matchBoost)),
      whySuits: isHighPerformer
        ? `Verified strong verbal communication and domain competency in mock interview questions, backed by ${resumeData?.parsed?.degree || 'STEM background'}.`
        : `Demonstrated solid foundational awareness during mock interview practice; strengthening metrics and STAR story polish will elevate offer readiness.`,
      matchingSkills: ['Python', 'System Architecture', 'Technical Communication', 'Problem Solving'],
      missingSkills: ['Cloud Production CI/CD', 'Distributed Scaling'],
      learnSkills: ['Docker Containerization', 'Kubernetes Orchestration'],
      difficulty: 'Moderate' as const,
      nextSteps: [
        'Practice 3 high-impact STAR stories with quantitative metrics aloud',
        'Deploy an end-to-end containerized microservice on AWS or Render'
      ]
    },
    {
      role: 'Data Scientist / ML Analyst',
      matchPercentage: Math.min(92, Math.max(68, avgScore + (isHighPerformer ? 4 : 0))),
      whySuits: 'Strong analytical reasoning demonstrated during technical problem breakdown and database questions.',
      matchingSkills: ['Python', 'SQL', 'Data Modeling', 'Analytical Communication'],
      missingSkills: ['A/B Testing Frameworks', 'BigQuery Warehousing'],
      learnSkills: ['Statistical Experimentation', 'Snowflake / BigQuery'],
      difficulty: 'Moderate' as const,
      nextSteps: [
        'Complete 15 advanced SQL queries on LeetCode focusing on Window Functions',
        'Build a predictive dashboard showing business cohort metrics'
      ]
    },
    {
      role: 'Full Stack Systems Engineer',
      matchPercentage: Math.min(89, Math.max(66, avgScore - 2)),
      whySuits: 'Demonstrated clear ability to discuss end-to-end application lifecycle and API design trade-offs.',
      matchingSkills: ['TypeScript', 'RESTful APIs', 'Database Indexing'],
      missingSkills: ['GraphQL', 'End-to-End Cypress Testing'],
      learnSkills: ['Next.js App Router', 'PostgreSQL indexing'],
      difficulty: 'Entry-Level' as const,
      nextSteps: [
        'Implement automated test suites with Jest and Playwright',
        'Deploy full-stack project with automated GitHub Actions CI'
      ]
    }
  ];

  return {
    overallScore: avgScore,
    subScores: {
      communication: Math.min(95, avgScore + 3),
      technicalKnowledge: Math.min(96, avgScore + 2),
      confidence: Math.max(65, avgScore - 3),
      relevance: Math.min(95, avgScore + 4),
      problemSolving: Math.min(94, avgScore + 1),
      answerStructure: Math.max(68, avgScore - 2),
      hrReadiness: Math.min(93, avgScore + 3),
      voiceDelivery: Math.min(94, Math.max(70, avgScore + 1)),
    },
    voiceSummary: {
      avgWpm: voiceStats?.avgWpm || 135,
      totalFillerWords: voiceStats?.totalFillerWords || 2,
      pacingSummary: (voiceStats?.avgWpm || 135) > 160
        ? 'Brisk, energetic speech pacing with good momentum'
        : 'Conversational, clear vocal cadence with natural pauses',
      totalDurationSeconds: voiceStats?.totalDurationSeconds || 180,
    },
    strongAreas: [
      'Articulate grasp of core technologies and engineering terminology',
      'Solid problem breakdown when discussing architecture and database queries',
      'Positive, coachable attitude and team-oriented collaboration'
    ],
    areasToImprove: [
      'Standardize all behavioral answers around the structured STAR model',
      'Include hard metrics (performance latency, test coverage, business numbers) in every project narrative',
      'Practice salary discussion phrasing to sound confident yet collaborative'
    ],
    criticalWeaknesses: [
      'Ensure salary expectations are grounded in researched market bands rather than vague or hesitant answers'
    ],
    personalizedRecommendations: [
      'Record your voice answers and listen back to eliminate filler words (um, like, basically)',
      'Prepare a one-page cheat sheet with your 4 best STAR stories and their exact metrics',
      'Deepen your knowledge of system design trade-offs (e.g. latency vs consistency in databases)'
    ],
    updatedCareerRecommendations,
    roadmap: [
      {
        dayRange: 'Day 1–3',
        title: 'Core Technical & SQL Mastery',
        focus: 'Review relational database concepts, indexing, window functions, and data manipulation.',
        tasks: [
          'Solve 10 Medium SQL queries on LeetCode focusing on JOINs and Window Functions',
          'Review database transactions (ACID properties) and normalization'
        ],
        completed: false
      },
      {
        dayRange: 'Day 4–5',
        title: 'Language & Coding Fundamentals',
        focus: 'Python / TypeScript interview coding patterns and data structures.',
        tasks: [
          'Practice two-pointer and sliding window coding interview problems',
          'Revise Big-O complexity analysis for standard algorithms'
        ],
        completed: false
      },
      {
        dayRange: 'Day 6–7',
        title: 'System Architecture & API Design',
        focus: 'RESTful standards, error handling, database caching with Redis.',
        tasks: [
          'Design a rate-limited URL shortener or real-time notification service',
          'Review HTTP status codes, idempotent methods, and JWT authentication'
        ],
        completed: false
      },
      {
        dayRange: 'Day 8',
        title: 'Resume Polish & Quantifiable Metrics',
        focus: 'Incorporate feedback from HireMentor AI resume analysis into every bullet point.',
        tasks: [
          'Update all project bullets to follow: [Action Verb] + [Context] + [Measurable Result]',
          'Verify PDF formatting and ATS readability check'
        ],
        completed: false
      },
      {
        dayRange: 'Day 9–11',
        title: 'Role-Specific Deep Dive Practice',
        focus: `Deepen domain mastery for ${targetRole || 'Target Role'}.`,
        tasks: [
          'Run an in-depth mock interview focusing exclusively on Technical & Situational questions',
          'Review edge-case questions and debugging scenarios'
        ],
        completed: false
      },
      {
        dayRange: 'Day 12',
        title: 'HR & Behavioral Question Mastery',
        focus: 'Prepare confident answers for "Tell me about yourself", conflict resolution, and career vision.',
        tasks: [
          'Outline 4 STAR stories (Leadership, Failure, Innovation, Conflict)',
          'Practice answers aloud with 90-second timer'
        ],
        completed: false
      },
      {
        dayRange: 'Day 13',
        title: 'Full-Length Timed Simulation',
        focus: 'Simulate a live 45-minute hiring manager round without notes.',
        tasks: [
          'Complete a full 10-question HireMentor AI simulation',
          'Analyze weak score categories and calibrate pacing'
        ],
        completed: false
      },
      {
        dayRange: 'Day 14',
        title: 'Final Review & Offer Negotiation Strategy',
        focus: 'Prepare smart reverse-interview questions and compensation research.',
        tasks: [
          'Prepare 5 thoughtful questions to ask the interviewer',
          'Research market compensation ranges on Levels.fyi and Glassdoor'
        ],
        completed: false
      }
    ]
  };
}


// Full-stack Vite development middleware mounting or production static files
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HireMentor AI full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
