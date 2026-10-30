import React, { useState, useRef } from 'react';
import { useCareer } from '../context/CareerContext';
import { SAMPLE_RESUMES } from '../utils/presets';
import { ScoreCircle } from './ScoreCircle';
import {
  UploadCloud,
  FileText,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  GraduationCap,
  Code2,
  Award,
  ChevronRight,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { ResumeAnalysisRecord } from '../types';

export const ResumeView: React.FC = () => {
  const { currentResume, addResumeRecord, setActiveTab } = useCareer();

  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [rawText, setRawText] = useState(currentResume?.rawText || '');
  const [fileName, setFileName] = useState(currentResume?.fileName || '');
  const [activeTab, setActiveTabLocal] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (content) {
        setRawText(content);
        triggerAnalysis(content, file.name);
      }
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerAnalysis = async (textToAnalyze: string, nameOfFile?: string) => {
    if (!textToAnalyze.trim()) {
      setError('Please provide or paste resume text before analyzing.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: textToAnalyze,
          fileName: nameOfFile || fileName || 'Candidate_Resume.pdf',
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to analyze resume.');
      }

      const data: ResumeAnalysisRecord = await response.json();
      addResumeRecord(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Something went wrong during analysis. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_RESUMES.find(s => s.id === sampleId);
    if (!sample) return;
    setRawText(sample.rawText);
    setFileName(`${sample.name.split('—')[0].trim()}_Resume.pdf`);
    triggerAnalysis(sample.rawText, `${sample.name.split('—')[0].trim()}_Resume.pdf`);
  };

  const handleSelectRecommendedRole = (_role: string) => {
    setActiveTab('job-match');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300 bg-[#F8F4E9] text-[#502D55]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#502D55] tracking-tight">
            Resume Studio & AI ATS Evaluator
          </h2>
          <p className="mt-1 text-sm text-[#935073]">
            Upload your CV or choose a pre-loaded profile to extract skills, calculate 7-dimension scoring, and get personalized career matches.
          </p>
        </div>

        {currentResume && (
          <button
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.click();
            }}
            className="px-4 py-2.5 rounded-xl border border-[#935073]/30 bg-white hover:bg-[#F6DBC0]/40 text-[#502D55] text-xs font-bold shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#935073]" />
            <span>Upload New Resume</span>
          </button>
        )}
      </div>

      {/* Upload Zone / Mode Select */}
      <div className="bg-white rounded-3xl border border-[#935073]/25 shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="border-b border-[#935073]/20 px-6 pt-4 flex gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTabLocal('upload')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'upload'
                ? 'border-[#502D55] text-[#502D55]'
                : 'border-transparent text-[#935073] hover:text-[#502D55]'
            }`}
          >
            Upload Document (PDF / DOCX)
          </button>
          <button
            onClick={() => setActiveTabLocal('paste')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'paste'
                ? 'border-[#502D55] text-[#502D55]'
                : 'border-transparent text-[#935073] hover:text-[#502D55]'
            }`}
          >
            Paste Text Directly
          </button>
          <button
            onClick={() => setActiveTabLocal('samples')}
            className={`pb-3 border-b-2 transition cursor-pointer ${
              activeTab === 'samples'
                ? 'border-[#502D55] text-[#502D55]'
                : 'border-transparent text-[#935073] hover:text-[#502D55]'
            }`}
          >
            ⚡ Test With Sample Resumes
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#935073]/15 border border-[#935073]/30 text-[#502D55] text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#935073]" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'upload' && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                  dragActive
                    ? 'border-[#502D55] bg-[#F6DBC0]/40'
                    : 'border-[#935073]/40 hover:border-[#502D55] bg-[#F8F4E9]/60 hover:bg-[#F6DBC0]/30'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-[#502D55] text-[#F6DBC0] flex items-center justify-center mb-4 shadow-sm">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-[#502D55]">
                  Drop your resume here, or <span className="text-[#935073] underline">Browse Files</span>
                </h4>
                <p className="mt-1 text-xs text-[#935073] max-w-sm font-medium">
                  Supports PDF and DOCX files. Our AI engine extracts technical skills, education, internships, and project highlights.
                </p>

                {fileName && (
                  <div className="mt-4 px-3 py-1.5 bg-[#F6DBC0] border border-[#935073]/30 text-[#502D55] rounded-xl text-xs font-bold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#502D55]" />
                    <span>Selected: {fileName}</span>
                  </div>
                )}
              </div>

              {fileName && !analyzing && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => triggerAnalysis(rawText, fileName)}
                    className="px-6 py-2.5 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] rounded-xl text-xs font-bold shadow-md shadow-[#502D55]/20 transition flex items-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#F6DBC0]" />
                    <span>Analyze My Resume →</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-4">
              <textarea
                rows={8}
                value={rawText}
                onChange={e => setRawText(e.target.value)}
                placeholder="Paste the raw text of your resume here (Summary, Education, Skills, Projects, Experience, Certifications)..."
                className="w-full p-4 text-xs font-mono rounded-2xl border border-[#935073]/30 bg-[#F8F4E9]/30 text-[#502D55] focus:outline-none focus:ring-2 focus:ring-[#935073]/25 focus:border-[#502D55] leading-relaxed"
              />
              <div className="flex justify-end">
                <button
                  onClick={() => triggerAnalysis(rawText, fileName || 'Pasted_Resume.txt')}
                  disabled={analyzing || !rawText.trim()}
                  className="px-6 py-2.5 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] rounded-xl text-xs font-bold shadow-md shadow-[#502D55]/20 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#F6DBC0]" />
                  <span>Analyze My Resume →</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'samples' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SAMPLE_RESUMES.map(sample => (
                <div
                  key={sample.id}
                  onClick={() => handleLoadSample(sample.id)}
                  className="p-5 rounded-2xl border border-[#935073]/20 hover:border-[#502D55] hover:shadow-md bg-[#F8F4E9]/50 hover:bg-[#F6DBC0]/40 transition cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#502D55] bg-[#F6DBC0] px-2 py-0.5 rounded-md">
                      {sample.role}
                    </span>
                    <h5 className="font-bold text-[#502D55] text-sm mt-2">{sample.name}</h5>
                    <p className="text-xs text-[#935073] mt-1 font-medium">{sample.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#935073]/15 flex items-center justify-between text-xs font-bold text-[#502D55]">
                    <span>Load & Analyze</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#935073]" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {analyzing && (
            <div className="mt-6 p-6 rounded-2xl bg-[#F6DBC0]/50 border border-[#935073]/30 text-center flex flex-col items-center justify-center animate-pulse">
              <div className="w-10 h-10 rounded-full border-3 border-[#502D55] border-t-transparent animate-spin mb-3" />
              <h5 className="font-bold text-[#502D55] text-sm">HireMentor AI Engine Analyzing Your Resume...</h5>
              <p className="text-xs text-[#935073] mt-1 font-medium">
                Parsing 12+ categories, benchmarking ATS compatibility, and calculating skill match percentiles.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ANALYSIS RESULTS SECTION */}
      {currentResume && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Top Score Banner + 7-Dimension Breakdown */}
          <div className="bg-white rounded-3xl border border-[#935073]/25 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left Circular Gauge */}
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left shrink-0">
                <ScoreCircle
                  score={currentResume.score.overall}
                  maxScore={100}
                  size={140}
                  strokeWidth={12}
                  variant="dusty-plum"
                  sublabel={currentResume.score.grade}
                />
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#935073]">
                    ATS Resume Score
                  </span>
                  <h3 className="text-2xl font-extrabold text-[#502D55] mt-0.5">
                    {currentResume.score.grade} Rating
                  </h3>
                  <p className="text-xs text-[#935073] mt-1 max-w-sm font-medium">
                    Benchmarked across top tech industry ATS systems (Workday, Greenhouse, Lever).
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#502D55]/80 font-medium">
                    <FileText className="w-4 h-4 text-[#935073]" />
                    <span>Analyzed from: <strong>{currentResume.fileName}</strong></span>
                  </div>
                </div>
              </div>

              {/* 7-Dimension Score Breakdown using Dusty Plum and Deep Violet */}
              <div className="w-full lg:max-w-xl grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                <div className="p-3 rounded-xl bg-[#F8F4E9] border border-[#935073]/20">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#502D55]">
                    <span>Skills</span>
                    <span className="font-bold">{currentResume.score.breakdown.skills}/100</span>
                  </div>
                  <div className="w-full bg-[#F6DBC0] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#502D55] h-full rounded-full" style={{ width: `${currentResume.score.breakdown.skills}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F4E9] border border-[#935073]/20">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#502D55]">
                    <span>Projects</span>
                    <span className="font-bold">{currentResume.score.breakdown.projects}/100</span>
                  </div>
                  <div className="w-full bg-[#F6DBC0] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#935073] h-full rounded-full" style={{ width: `${currentResume.score.breakdown.projects}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F4E9] border border-[#935073]/20">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#502D55]">
                    <span>Experience</span>
                    <span className="font-bold">{currentResume.score.breakdown.experience}/100</span>
                  </div>
                  <div className="w-full bg-[#F6DBC0] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#502D55] h-full rounded-full" style={{ width: `${currentResume.score.breakdown.experience}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F4E9] border border-[#935073]/20">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#502D55]">
                    <span>Education</span>
                    <span className="font-bold">{currentResume.score.breakdown.education}/100</span>
                  </div>
                  <div className="w-full bg-[#F6DBC0] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#935073] h-full rounded-full" style={{ width: `${currentResume.score.breakdown.education}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F4E9] border border-[#935073]/20">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#502D55]">
                    <span>ATS Readiness</span>
                    <span className="font-bold">{currentResume.score.breakdown.atsReadiness}/100</span>
                  </div>
                  <div className="w-full bg-[#F6DBC0] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#502D55] h-full rounded-full" style={{ width: `${currentResume.score.breakdown.atsReadiness}%` }} />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#F8F4E9] border border-[#935073]/20">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#502D55]">
                    <span>Certifications</span>
                    <span className="font-bold">{currentResume.score.breakdown.certifications}/100</span>
                  </div>
                  <div className="w-full bg-[#F6DBC0] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-[#935073] h-full rounded-full" style={{ width: `${currentResume.score.breakdown.certifications}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths, Weak Areas, Suggestions Cards in Violet Dusk */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strengths */}
            <div className="p-6 bg-white rounded-3xl border border-[#935073]/25 shadow-xs">
              <div className="flex items-center gap-2 text-[#502D55] font-bold text-sm mb-4">
                <CheckCircle2 className="w-5 h-5 text-[#935073]" />
                <span>Strengths</span>
              </div>
              <ul className="space-y-3">
                {currentResume.strengths.map((s, idx) => (
                  <li key={idx} className="text-xs text-[#502D55]/85 flex items-start gap-2 font-medium">
                    <span className="text-[#935073] font-bold mt-0.5">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weak Areas */}
            <div className="p-6 bg-white rounded-3xl border border-[#935073]/25 shadow-xs">
              <div className="flex items-center gap-2 text-[#935073] font-bold text-sm mb-4">
                <AlertTriangle className="w-5 h-5 text-[#935073]" />
                <span>Weak Areas</span>
              </div>
              <ul className="space-y-3">
                {currentResume.weakAreas.map((w, idx) => (
                  <li key={idx} className="text-xs text-[#502D55]/85 flex items-start gap-2 font-medium">
                    <span className="text-[#935073] font-bold mt-0.5">⚠️</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="p-6 bg-[#F6DBC0]/50 rounded-3xl border border-[#935073]/30 shadow-xs">
              <div className="flex items-center gap-2 text-[#502D55] font-bold text-sm mb-4">
                <Lightbulb className="w-5 h-5 text-[#502D55]" />
                <span>Suggestions</span>
              </div>
              <ul className="space-y-3">
                {currentResume.suggestions.map((sugg, idx) => (
                  <li key={idx} className="text-xs text-[#502D55] flex items-start gap-2 font-medium">
                    <span className="text-[#935073] font-bold mt-0.5">💡</span>
                    <span>{sugg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Extracted Resume Sections */}
          <div className="bg-white rounded-3xl border border-[#935073]/25 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#935073]/15 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#502D55]">Extracted Candidate Profile</h3>
                <p className="text-xs text-[#935073]">Structured data extracted by HireMentor AI</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#F6DBC0] text-[#502D55] border border-[#935073]/20">
                {currentResume.parsed.name}
              </span>
            </div>

            {/* Candidate Details & Education */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-2xl bg-[#F8F4E9] border border-[#935073]/20">
                <div className="flex items-center gap-2 text-xs font-bold text-[#502D55] mb-2">
                  <GraduationCap className="w-4 h-4 text-[#935073]" />
                  <span>Education & Degree</span>
                </div>
                <p className="text-sm font-bold text-[#502D55]">{currentResume.parsed.degree}</p>
                <p className="text-xs text-[#935073] mt-0.5 font-medium">
                  {currentResume.parsed.institution || 'University'} • {currentResume.parsed.graduationYear}
                </p>
                {currentResume.parsed.gpa && (
                  <span className="inline-block mt-2 text-[11px] font-bold px-2 py-0.5 bg-[#F6DBC0] text-[#502D55] rounded-md">
                    GPA: {currentResume.parsed.gpa}
                  </span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F4E9] border border-[#935073]/20">
                <div className="flex items-center gap-2 text-xs font-bold text-[#502D55] mb-2">
                  <Briefcase className="w-4 h-4 text-[#935073]" />
                  <span>Candidate Details</span>
                </div>
                <p className="text-sm font-bold text-[#502D55]">{currentResume.parsed.name}</p>
                <p className="text-xs text-[#935073] mt-0.5 font-medium">
                  {currentResume.parsed.email || 'Email extracted'} • {currentResume.parsed.location || 'Location verified'}
                </p>
                {currentResume.parsed.certifications.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {currentResume.parsed.certifications.slice(0, 2).map((c, i) => (
                      <span key={i} className="text-[10px] font-semibold bg-[#F6DBC0] text-[#502D55] px-2 py-0.5 rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Extracted Skills */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#935073] mb-3 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-[#502D55]" />
                <span>Extracted Technical & Soft Skills</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {currentResume.parsed.technicalSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-[#502D55]/10 border border-[#502D55]/20 text-[#502D55] text-xs font-bold"
                  >
                    {skill}
                  </span>
                ))}
                {currentResume.parsed.softSkills.map((skill, idx) => (
                  <span
                    key={'soft_' + idx}
                    className="px-3 py-1 rounded-xl bg-[#F6DBC0] border border-[#935073]/20 text-[#502D55] text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Extracted Projects */}
            {currentResume.parsed.projects.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#935073] mb-3 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#502D55]" />
                  <span>Extracted Projects</span>
                </h4>
                <div className="space-y-3">
                  {currentResume.parsed.projects.map((proj, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#F8F4E9] border border-[#935073]/20">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <h5 className="font-bold text-[#502D55] text-sm">{proj.title}</h5>
                        <span className="text-[11px] font-mono text-[#502D55] bg-[#F6DBC0] px-2 py-0.5 rounded-md self-start font-semibold">
                          {proj.tech}
                        </span>
                      </div>
                      <p className="text-xs text-[#502D55]/85 mt-2 leading-relaxed font-medium">{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BEST JOB / CAREER RECOMMENDATIONS in Violet Dusk */}
          <div className="bg-white rounded-3xl border border-[#935073]/25 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F6DBC0] border border-[#935073]/20 text-[#502D55] text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#502D55]" />
                <span>AI Career Matching Algorithm</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#502D55] tracking-tight">
                Your Strongest Career Matches
              </h3>
              <p className="text-xs text-[#935073] mt-1 font-medium">
                Grounded directly on your resume, education, skills, and projects — not generic recommendations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {currentResume.recommendedRoles.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl border border-[#935073]/25 hover:border-[#502D55] hover:shadow-md transition bg-[#F8F4E9]/40 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F6DBC0] text-[#502D55]">
                        Match #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-extrabold text-[#502D55]">{rec.matchPercentage}%</span>
                        <span className="text-[10px] font-bold text-[#935073]">Match</span>
                      </div>
                    </div>

                    <h4 className="text-lg font-bold text-[#502D55]">{rec.role}</h4>
                    <p className="text-xs text-[#502D55]/85 mt-2 leading-relaxed font-medium">{rec.whySuits}</p>

                    {/* Matching Skills */}
                    <div className="mt-4">
                      <span className="text-[11px] font-bold text-[#502D55] block mb-1.5">Matching Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {rec.matchingSkills.map((ms, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#502D55]/10 text-[#502D55] border border-[#502D55]/20"
                          >
                            ✓ {ms}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Missing Skills */}
                    {rec.missingSkills.length > 0 && (
                      <div className="mt-3">
                        <span className="text-[11px] font-bold text-[#935073] block mb-1.5">Skills to Learn:</span>
                        <div className="flex flex-wrap gap-1">
                          {rec.missingSkills.map((mis, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F6DBC0] text-[#502D55] border border-[#935073]/20"
                            >
                              + {mis}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Difficulty */}
                    <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-[#935073]/15">
                      <span className="text-[#935073] font-medium">Interview Difficulty:</span>
                      <span className="font-bold text-[#502D55] bg-[#F6DBC0] px-2 py-0.5 rounded">
                        {rec.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Primary Button */}
                  <div className="mt-5 pt-3 border-t border-[#935073]/15 flex items-center justify-between">
                    <button
                      onClick={() => handleSelectRecommendedRole(rec.role)}
                      className="w-full py-2.5 px-4 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Match With Job Description →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Natural Next Step Banner in Deep Violet */}
          <div className="p-6 bg-[#502D55] rounded-3xl text-[#F8F4E9] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg border border-[#935073]/30">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#F6DBC0]">Next Step in HireMentor Journey</span>
              <h4 className="text-lg font-bold mt-1 text-[#F8F4E9]">Ready to compare against a real Job Description?</h4>
              <p className="text-xs text-[#F8F4E9]/80 mt-0.5">
                Paste any job posting or try our curated targets to view exact keyword match and skill gaps.
              </p>
            </div>
            {/* Secondary button: Warm Blush */}
            <button
              onClick={() => setActiveTab('job-match')}
              className="px-6 py-3 bg-[#F6DBC0] hover:bg-[#F6DBC0]/90 text-[#502D55] font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Match With Job Description</span>
              <ArrowRight className="w-4 h-4 text-[#502D55]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
