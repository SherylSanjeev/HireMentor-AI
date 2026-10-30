import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Bookmark, BookmarkCheck } from 'lucide-react';
import { useCareer } from '../context/CareerContext';

type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: {
    min: number | null;
    max: number | null;
    isPredicted: boolean;
  };
  contractType: string | null;
  contractTime: string | null;
  category: {
    label: string;
    tag: string;
  };
  created: string | null;
  redirectUrl: string | null;
  source: string;
};

type JobAIResult = {
  matchPercentage?: number;
  matchingSkills?: string[];
  missingSkills?: string[];
  partialSkills?: string[];
  explanation?: string;
  whyYouMatch?: string;
  strengths?: string[];
  [key: string]: any;
};

const formatSalary = (job: Job) => {
  if (!job.salary?.min && !job.salary?.max) {
    return 'Salary not disclosed';
  }

  const format = (value: number) =>
    `₹${Math.round(value / 100000)} LPA`;

  if (job.salary.min && job.salary.max) {
    return `${format(job.salary.min)} – ${format(job.salary.max)}`;
  }

  return format(job.salary.min || job.salary.max || 0);
};

const getPostedText = (created: string | null) => {
  if (!created) return 'Recently posted';

  const createdDate = new Date(created);
  const now = new Date();

  const difference = Math.floor(
    (now.getTime() - createdDate.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (difference <= 0) return 'Today';
  if (difference === 1) return '1 day ago';
  if (difference < 7) return `${difference} days ago`;

  return createdDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const FindJobsView: React.FC = () => {
  const { currentResume } = useCareer();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('AI Data Scientist');
  const [location, setLocation] = useState('Coimbatore, Tamil Nadu');
  const [sortBy, setSortBy] = useState('date');

  const [showFilters, setShowFilters] = useState(false);
  const [fullTimeOnly, setFullTimeOnly] = useState(false);

  // AI matching
  const [aiResults, setAiResults] = useState<Record<string, JobAIResult>>({});
  const [analyzingJob, setAnalyzingJob] = useState<string | null>(null);
  const [matchErrors, setMatchErrors] = useState<Record<string, string>>({});

  // Saved jobs
  const [savedJobs, setSavedJobs] = useState<string[]>(() => {
    try {
      return JSON.parse(
        localStorage.getItem('hirementor_saved_jobs') || '[]'
      );
    } catch {
      return [];
    }
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        what: search || 'AI Data Scientist',
        where: location || 'Coimbatore, Tamil Nadu',
        sort_by: sortBy,
        results_per_page: '20',
      });

      if (fullTimeOnly) {
        params.set('full_time', '1');
      }

      const response = await fetch(`/api/jobs?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Unable to load jobs');
      }

      setJobs(data.jobs || []);
    } catch (err: any) {
      console.error('Find Jobs error:', err);

      setError(
        err.message || 'Something went wrong while loading jobs.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const searchText = search.toLowerCase().trim();

      if (!searchText) return true;

      return (
        job.title.toLowerCase().includes(searchText) ||
        job.company.toLowerCase().includes(searchText)
      );
    });
  }, [jobs, search]);

  const analyzeJobMatch = async (job: Job) => {
    if (!currentResume) {
      setMatchErrors((prev) => ({
        ...prev,
        [job.id]:
          'Please upload and analyze your resume first.',
      }));
      return;
    }

    try {
      setAnalyzingJob(job.id);

      setMatchErrors((prev) => {
        const updated = { ...prev };
        delete updated[job.id];
        return updated;
      });

      /*
       * The ResumeAnalysisRecord may contain the original
       * resume text. We try the common fields used by the
       * HireMentor resume analysis flow.
       */
      const resumeData: any = currentResume;

      const resumeText =
        resumeData.rawText ||
        resumeData.resumeText ||
        resumeData.parsed?.rawText ||
        '';

      const resumeSkills =
        resumeData.parsed?.technicalSkills ||
        resumeData.technicalSkills ||
        [];

      if (!resumeText && resumeSkills.length === 0) {
        throw new Error(
          'Your resume text is not available for AI matching. Please analyze your resume again.'
        );
      }

      const response = await fetch('/api/job/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeSkills,
          resumeText,
          jobTitle: job.title,
          jobDescription: job.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            errorData?.error ||
            'AI matching failed.'
        );
      }

      const data: JobAIResult = await response.json();

      setAiResults((prev) => ({
        ...prev,
        [job.id]: data,
      }));
    } catch (err: any) {
      console.error('AI Job Match error:', err);

      setMatchErrors((prev) => ({
        ...prev,
        [job.id]:
          err.message ||
          'Unable to analyze this job right now.',
      }));
    } finally {
      setAnalyzingJob(null);
    }
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => {
      const updated = prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId];

      localStorage.setItem(
        'hirementor_saved_jobs',
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  const getMatchColor = (score?: number) => {
    if (score === undefined) {
      return 'bg-[#F8F4E9] text-[#502D55]';
    }

    if (score >= 80) {
      return 'bg-[#F6DBC0] text-[#502D55]';
    }

    if (score >= 60) {
      return 'bg-[#EBD9E2] text-[#502D55]';
    }

    return 'bg-[#F8E7E7] text-[#7A3030]';
  };

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-[#502D55] flex items-center justify-center text-xl">
              💼
            </div>

            <div>
              <h1 className="text-3xl font-bold text-[#502D55]">
                Find Jobs
              </h1>

              <p className="text-[#935073]">
                Discover live opportunities matched to your career goals.
              </p>
            </div>
          </div>

          {!currentResume && (
            <div className="mt-4 px-4 py-3 rounded-2xl bg-[#F6DBC0] border border-[#935073]/20 text-sm text-[#502D55]">
              💡 Upload your resume first to unlock AI-powered job matching.
            </div>
          )}
        </div>

        {/* Search Area */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#F6DBC0] mb-7">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Job Search */}
            <div>
              <label className="block text-sm font-semibold text-[#502D55] mb-2">
                Job title or keyword
              </label>

              <div className="relative">
                <span className="absolute left-4 top-3.5">
                  🔍
                </span>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="AI Data Scientist"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E7D7DC] bg-[#F8F4E9] outline-none focus:ring-2 focus:ring-[#935073]"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-[#502D55] mb-2">
                Location
              </label>

              <div className="relative">
                <span className="absolute left-4 top-3.5">
                  📍
                </span>

                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Coimbatore, Tamil Nadu"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E7D7DC] bg-[#F8F4E9] outline-none focus:ring-2 focus:ring-[#935073]"
                />
              </div>
            </div>

          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 mt-4">

            <button
              onClick={fetchJobs}
              className="px-6 py-3 rounded-xl bg-[#502D55] text-white font-semibold hover:bg-[#935073] transition"
            >
              🔍 Search Jobs
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-5 py-3 rounded-xl border border-[#935073] text-[#502D55] font-semibold hover:bg-[#F6DBC0] transition"
            >
              ⚙️ Filters
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E7D7DC] bg-white text-[#502D55]"
            >
              <option value="date">Latest</option>
              <option value="salary">Highest Salary</option>
            </select>

          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-5 pt-5 border-t border-[#F6DBC0]">

              <label className="flex items-center gap-3 cursor-pointer text-[#502D55]">
                <input
                  type="checkbox"
                  checked={fullTimeOnly}
                  onChange={(e) =>
                    setFullTimeOnly(e.target.checked)
                  }
                  className="w-4 h-4"
                />

                <span className="font-medium">
                  Full-time jobs only
                </span>
              </label>

            </div>
          )}

        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 rounded-full border-4 border-[#F6DBC0] border-t-[#502D55] animate-spin" />

            <p className="mt-4 text-[#935073]">
              Finding live opportunities...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-white border border-red-200 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-2">⚠️</div>

            <h3 className="font-bold text-[#502D55]">
              Couldn't load jobs
            </h3>

            <p className="text-gray-600 mt-2">
              {error}
            </p>

            <button
              onClick={fetchJobs}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#502D55] text-white"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-[#502D55]">
                  Live Job Opportunities
                </h2>

                <p className="text-sm text-[#935073]">
                  {filteredJobs.length} opportunities found
                </p>
              </div>

              <span className="text-xs px-3 py-2 rounded-full bg-[#F6DBC0] text-[#502D55] font-semibold">
                LIVE • ADZUNA
              </span>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#F6DBC0]">
                <div className="text-4xl mb-3">🔎</div>

                <h3 className="text-lg font-bold text-[#502D55]">
                  No matching jobs found
                </h3>

                <p className="text-gray-600 mt-2">
                  Try a different job title or location.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                {filteredJobs.map((job) => {
                  const ai = aiResults[job.id];
                  const isAnalyzing = analyzingJob === job.id;
                  const isSaved = savedJobs.includes(job.id);
                  const matchError = matchErrors[job.id];

                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-3xl p-6 border border-[#F6DBC0] shadow-sm hover:shadow-md transition"
                    >

                      {/* Job Header */}
                      <div className="flex justify-between gap-4">

                        <div>
                          <h3 className="text-lg font-bold text-[#502D55]">
                            {job.title}
                          </h3>

                          <p className="text-[#935073] font-semibold mt-1">
                            {job.company}
                          </p>
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => toggleSaveJob(job.id)}
                            title={isSaved ? 'Remove saved job' : 'Save job'}
                            className="w-11 h-11 rounded-xl bg-[#F6DBC0] flex items-center justify-center text-[#502D55] hover:bg-[#935073] hover:text-white transition"
                          >
                            {isSaved ? (
                              <BookmarkCheck className="w-5 h-5" />
                            ) : (
                              <Bookmark className="w-5 h-5" />
                            )}
                          </button>

                          <div className="w-11 h-11 rounded-xl bg-[#F6DBC0] flex items-center justify-center">
                            💼
                          </div>
                        </div>

                      </div>

                      {/* Details */}
                      <div className="flex flex-wrap gap-2 mt-4">

                        <span className="px-3 py-1.5 rounded-full bg-[#F8F4E9] text-sm text-[#502D55]">
                          📍 {job.location}
                        </span>

                        <span className="px-3 py-1.5 rounded-full bg-[#F8F4E9] text-sm text-[#502D55]">
                          💰 {formatSalary(job)}
                        </span>

                        {job.contractTime && (
                          <span className="px-3 py-1.5 rounded-full bg-[#F8F4E9] text-sm text-[#502D55]">
                            🕐 {job.contractTime.replace('_', ' ')}
                          </span>
                        )}

                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mt-4 line-clamp-3">
                        {job.description}
                      </p>

                      {/* AI Match Section */}
                      <div className="mt-5 p-4 rounded-2xl bg-[#F8F4E9] border border-[#F6DBC0]">

                        {!ai && !isAnalyzing && (
                          <>
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-bold text-[#502D55] flex items-center gap-2">
                                  <Sparkles className="w-4 h-4" />
                                  AI Job Match
                                </p>

                                <p className="text-xs text-[#935073] mt-1">
                                  Compare this job with your resume.
                                </p>
                              </div>

                              <button
                                onClick={() => analyzeJobMatch(job)}
                                disabled={!currentResume}
                                className="px-4 py-2 rounded-xl bg-[#502D55] text-white text-sm font-semibold hover:bg-[#935073] transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                ✨ Analyze My Match
                              </button>
                            </div>

                            {matchError && (
                              <p className="text-xs text-red-600 mt-3">
                                {matchError}
                              </p>
                            )}
                          </>
                        )}

                        {isAnalyzing && (
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full border-3 border-[#F6DBC0] border-t-[#502D55] animate-spin" />

                            <div>
                              <p className="font-bold text-[#502D55]">
                                Gemini is analyzing your match...
                              </p>

                              <p className="text-xs text-[#935073]">
                                Comparing your resume with this job.
                              </p>
                            </div>
                          </div>
                        )}

                        {ai && !isAnalyzing && (
                          <div>

                            {/* Score */}
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <p className="text-xs uppercase tracking-wider font-bold text-[#935073]">
                                  HireMentor AI Match
                                </p>

                                <p className="text-3xl font-black text-[#502D55] mt-1">
                                  {ai.matchPercentage ?? 0}%
                                </p>
                              </div>

                              <div
                                className={`px-4 py-2 rounded-xl font-bold ${getMatchColor(
                                  ai.matchPercentage
                                )}`}
                              >
                                {ai.matchPercentage !== undefined &&
                                ai.matchPercentage >= 80
                                  ? 'Excellent Match'
                                  : ai.matchPercentage !== undefined &&
                                    ai.matchPercentage >= 60
                                  ? 'Good Match'
                                  : 'Needs Improvement'}
                              </div>
                            </div>

                            {/* Why You Match */}
                            {(ai.whyYouMatch || ai.explanation) && (
                              <div className="mt-4">
                                <p className="text-sm font-bold text-[#502D55]">
                                  💜 Why you match
                                </p>

                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                  {ai.whyYouMatch || ai.explanation}
                                </p>
                              </div>
                            )}

                            {/* Matching Skills */}
                            {ai.matchingSkills &&
                              ai.matchingSkills.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm font-bold text-[#502D55]">
                                    ✅ Matching Skills
                                  </p>

                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {ai.matchingSkills.map(
                                      (skill, index) => (
                                        <span
                                          key={`${skill}-${index}`}
                                          className="px-2.5 py-1 rounded-lg bg-[#F6DBC0] text-[#502D55] text-xs font-semibold"
                                        >
                                          {skill}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Missing Skills */}
                            {ai.missingSkills &&
                              ai.missingSkills.length > 0 && (
                                <div className="mt-4">
                                  <p className="text-sm font-bold text-[#502D55]">
                                    📚 Skills to Improve
                                  </p>

                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {ai.missingSkills.map(
                                      (skill, index) => (
                                        <span
                                          key={`${skill}-${index}`}
                                          className="px-2.5 py-1 rounded-lg bg-[#EBD9E2] text-[#502D55] text-xs font-semibold"
                                        >
                                          {skill}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                          </div>
                        )}

                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-[#F6DBC0]">

                        <div>
                          <p className="text-xs text-gray-500">
                            Posted
                          </p>

                          <p className="text-sm font-semibold text-[#502D55]">
                            {getPostedText(job.created)}
                          </p>
                        </div>

                        {job.redirectUrl && (
                          <a
                            href={job.redirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-5 py-2.5 rounded-xl bg-[#502D55] text-white font-semibold hover:bg-[#935073] transition"
                          >
                            Apply ↗
                          </a>
                        )}

                      </div>

                      {/* Source */}
                      <div className="mt-3 text-right">
                        <span className="text-xs text-gray-400">
                          Source: {job.source}
                        </span>
                      </div>

                    </div>
                  );
                })}

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default FindJobsView;