import React, { useState, useEffect } from 'react';
import { useCareer } from '../context/CareerContext';
import { ScoreCircle } from './ScoreCircle';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import {
  Mic,
  Square,
  Volume2,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  RotateCcw,
  Activity,
  Gauge,
  HelpCircle,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Play,
} from 'lucide-react';
import { InterviewQuestion, MockInterviewRecord } from '../types';

export const MockInterviewView: React.FC = () => {
  const {
    currentResume,
    currentJobMatch,
    addInterviewRecord,
    setActiveTab,
  } = useCareer();

  const [sessionActive, setSessionActive] = useState(false);
  const [targetRole, setTargetRole] = useState(
    currentJobMatch?.jobTitle || currentResume?.recommendedRoles[0]?.role || 'AI / Machine Learning Engineer'
  );
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<any>(null);

  // Audio readout (Text-To-Speech) for question
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);
  const [autoReadAudio, setAutoReadAudio] = useState(true);

  // Voice recorder hook
  const {
    isRecording,
    hasRecorded,
    durationSeconds,
    transcript,
    permissionError,
    audioLevels,
    startRecording,
    stopRecording,
    resetRecording,
    injectSpokenTranscript,
    computeVoiceMetrics,
  } = useVoiceRecorder();

  // Read question aloud when current question changes
  useEffect(() => {
    if (sessionActive && questions[currentIndex] && autoReadAudio) {
      speakQuestion(questions[currentIndex].question);
    }
  }, [currentIndex, sessionActive]);

  const speakQuestion = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeakingQuestion(true);
    utterance.onend = () => setIsSpeakingQuestion(false);
    utterance.onerror = () => setIsSpeakingQuestion(false);

    window.speechSynthesis.speak(utterance);
  };

  const startNewInterview = async () => {
    setLoadingQuestions(true);
    setCurrentEvaluation(null);
    resetRecording();
    setCurrentIndex(0);

    try {
      const response = await fetch('/api/interview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRole,
          resumeData: currentResume,
          jobDescription: currentJobMatch?.jobDescription || '',
          numQuestions,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate interview questions.');
      const data = await response.json();

      setQuestions(data.questions || []);
      setSessionActive(true);
    } catch (e) {
      console.error('Error starting voice interview:', e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleSubmitVoiceAnswer = async () => {
    if (isRecording) {
      stopRecording();
    }

    const recordedText = transcript.trim();
    if (!recordedText) {
      return;
    }

    setEvaluating(true);
    const activeQuestion = questions[currentIndex];
    const voiceMetrics = computeVoiceMetrics();

    try {
      const response = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion,
          userAnswer: recordedText,
          targetRole,
          resumeSnippet: currentResume?.rawText?.slice(0, 1000) || '',
          voiceMetrics,
        }),
      });

      const evaluation = await response.json();
      setCurrentEvaluation(evaluation);

      // Save answer, metrics, and evaluation into question state
      const updatedQuestions = [...questions];
      updatedQuestions[currentIndex] = {
        ...activeQuestion,
        userAnswer: recordedText,
        isVoiceRecorded: true,
        voiceMetrics,
        evaluation,
      };
      setQuestions(updatedQuestions);
    } catch (e) {
      console.error('Error evaluating voice answer:', e);
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    setCurrentEvaluation(null);
    resetRecording();

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    setEvaluating(true);
    try {
      const response = await fetch('/api/interview/final-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions,
          targetRole,
          resumeData: currentResume,
          jobMatchData: currentJobMatch,
        }),
      });

      const finalReport = await response.json();

      const interviewRecord: MockInterviewRecord = {
        id: 'mock_' + Date.now(),
        targetRole,
        jobDescriptionSnippet: currentJobMatch?.jobTitle || '',
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        isVoiceSession: true,
        questions,
        finalReport,
      };

      addInterviewRecord(interviewRecord);
      setSessionActive(false);
      setActiveTab('reports');
    } catch (e) {
      console.error('Failed to create final voice interview report:', e);
    } finally {
      setEvaluating(false);
    }
  };

  // Provide realistic simulated spoken responses for accessibility and test environments
  const handleSimulateVoiceResponse = (type: 'strong' | 'beginner' = 'strong') => {
    const q = questions[currentIndex];
    let sample = '';
    let duration = 42;

    if (type === 'beginner') {
      if (q.category === 'Salary / Career') {
        sample = `Um, I don't know, whatever the standard starting salary is. I haven't really researched it yet, like maybe $50k or whatever is fine.`;
        duration = 14;
      } else if (q.category === 'Technical') {
        sample = `Basically we just put an index on the database and it seemed to run faster, but I am not totally sure how the query plan works under the hood.`;
        duration = 18;
      } else {
        sample = `I worked on that project with some classmates. It was okay, we had some bugs but we fixed them before the final demo.`;
        duration = 15;
      }
    } else {
      // Strong answer tailored to category and candidate's background
      if (q.category === 'HR') {
        sample = `I am a Computer Science graduate passionate about ${targetRole}. Throughout my academic and project work, I specialized in data-intensive systems and machine learning microservices. In my major project, I reduced inference latency by 35% through Redis caching and asynchronous queues. I am excited by your team's mission and look forward to contributing high-velocity engineering.`;
        duration = 46;
      } else if (q.category === 'Resume') {
        sample = `In our project, we faced a major throughput bottleneck when handling concurrent requests. I took full ownership of refactoring the data ingestion pipeline using asynchronous background workers and connection pooling. This increased throughput from 18 to 44 requests per second and achieved 94% accuracy on our evaluation dataset.`;
        duration = 48;
      } else if (q.category === 'Technical') {
        sample = `When optimizing high-volume queries, I start by analyzing query execution plans with EXPLAIN ANALYZE to identify sequential table scans. I then implement targeted composite B-Tree indexes matching filter cardinality, rewrite N+1 queries using batch joins, and place an in-memory Redis cache in front of read-heavy endpoints.`;
        duration = 42;
      } else if (q.category === 'Situational') {
        sample = `When a senior teammate disagreed with my proposed caching strategy, I scheduled a focused 20-minute review. Instead of arguing theoretically, I built a quick benchmark demonstrating latency and memory footprints for both options. With concrete data in hand, we aligned on a hybrid approach and delivered the milestone two days ahead of schedule.`;
        duration = 45;
      } else {
        sample = `Based on my market research for entry to mid-level ${targetRole} positions in this area, my target compensation range is between $88,000 and $108,000. However, team mentorship, engineering culture, and total compensation including equity are my highest priorities, and I am available to start within two weeks.`;
        duration = 40;
      }
    }

    injectSpokenTranscript(sample, duration);
  };

  const activeQ = questions[currentIndex];
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 bg-[#F8F4E9] text-[#502D55]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F6DBC0] text-[#502D55] text-xs font-bold border border-[#935073]/30">
              <Mic className="w-3.5 h-3.5 text-[#502D55]" />
              <span>Voice-Only AI Mock Interview</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#502D55] tracking-tight">
            AI Voice Interview Coach
          </h2>
          <p className="mt-1 text-sm text-[#935073]">
            Voice-only interview simulation. Speak your answers naturally — our AI transcribes your voice, grades delivery pacing, and provides instant coaching.
          </p>
        </div>

        {sessionActive && (
          <button
            onClick={() => {
              if (isRecording) stopRecording();
              window.speechSynthesis?.cancel();
              setSessionActive(false);
            }}
            className="px-3.5 py-1.5 rounded-xl border border-[#935073]/40 text-[#502D55] bg-[#F6DBC0] hover:bg-[#F6DBC0]/80 text-xs font-bold transition flex items-center gap-1.5 self-start cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#502D55]" />
            <span>End Session Early</span>
          </button>
        )}
      </div>

      {/* BEFORE INTERVIEW: Setup Card */}
      {!sessionActive && (
        <div className="bg-white rounded-3xl border border-[#935073]/25 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="max-w-2xl">
            <h3 className="text-xl font-extrabold text-[#502D55]">
              Configure Your Voice Practice Interview
            </h3>
            <p className="text-xs text-[#935073] mt-1 leading-relaxed font-medium">
              HireMentor AI analyzes your parsed resume, detected skill gaps, and target role to generate realistic questions. Candidates must answer using <strong>voice only</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#502D55] mb-1.5">Target Interview Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
                placeholder="e.g. AI / Machine Learning Engineer"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#935073]/30 bg-white text-[#502D55] focus:outline-none focus:ring-2 focus:ring-[#935073]/25 focus:border-[#502D55]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#502D55] mb-1.5">Simulation Length</label>
              <select
                value={numQuestions}
                onChange={e => setNumQuestions(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-[#935073]/30 bg-white text-[#502D55] focus:outline-none focus:ring-2 focus:ring-[#935073]/25 focus:border-[#502D55]"
              >
                <option value={5}>5 Questions (Rapid 10-Min Assessment)</option>
                <option value={10}>10 Questions (Full Comprehensive Simulation)</option>
              </select>
            </div>
          </div>

          {/* Categories Overview */}
          <div className="p-4 rounded-2xl bg-[#F8F4E9] border border-[#935073]/20">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#935073] mb-2">
              Mandatory Multi-Category Rounds
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs font-bold">
              <div className="p-2.5 bg-white rounded-xl border border-[#935073]/20 text-[#502D55]">
                <span>👔 HR / Intro</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#935073]/20 text-[#502D55]">
                <span>📄 Resume-Based</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#935073]/20 text-[#502D55]">
                <span>💻 Technical</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#935073]/20 text-[#502D55]">
                <span>🤝 Situational</span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-[#935073]/20 text-[#502D55]">
                <span>💰 Salary Negotiation</span>
              </div>
            </div>
          </div>

          {/* Voice System Notice */}
          <div className="p-4 rounded-2xl bg-[#F6DBC0]/40 border border-[#935073]/25 flex items-start gap-3">
            <Mic className="w-5 h-5 text-[#502D55] shrink-0 mt-0.5" />
            <div className="text-xs text-[#502D55] space-y-1">
              <p className="font-bold">Voice-Only Strict Protocol:</p>
              <p className="leading-relaxed">
                During the session, candidates answer questions using <strong>voice only</strong> via microphone.
                You can review your speech-to-text transcript before submitting for AI analysis.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoVoice"
                checked={autoReadAudio}
                onChange={e => setAutoReadAudio(e.target.checked)}
                className="w-4 h-4 rounded text-[#502D55] focus:ring-[#935073]"
              />
              <label htmlFor="autoVoice" className="text-xs font-semibold text-[#502D55] cursor-pointer">
                Read questions aloud using AI voice
              </label>
            </div>

            <button
              onClick={startNewInterview}
              disabled={loadingQuestions}
              className="px-6 py-3 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] font-bold text-xs rounded-xl shadow-md shadow-[#502D55]/20 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              {loadingQuestions ? (
                <span>Generating Personalized Voice Questions...</span>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-[#F6DBC0]" />
                  <span>Enter Voice Interview Room →</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE INTERVIEW ROOM */}
      {sessionActive && activeQ && (
        <div className="space-y-6">
          {/* Progress Banner */}
          <div className="bg-white rounded-2xl border border-[#935073]/25 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#502D55] text-[#F8F4E9]">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F6DBC0] text-[#502D55]">
                {activeQ.category} Round
              </span>
            </div>

            {/* Dusty Plum progress bar */}
            <div className="w-full sm:w-48 bg-[#F8F4E9] h-2.5 rounded-full overflow-hidden border border-[#935073]/20">
              <div
                className="bg-[#935073] h-full rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* AI Interviewer Question Card in Deep Violet #502D55 */}
          <div className="bg-[#502D55] text-[#F8F4E9] rounded-2xl border border-[#935073]/40 p-4 sm:p-6 shadow-md space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#F6DBC0] block mb-0.5">
                  AI Interviewer ({activeQ.category}):
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-[#F8F4E9] leading-snug">
                  "{activeQ.question}"
                </h3>
              </div>
              <button
                onClick={() => speakQuestion(activeQ.question)}
                title="Read question aloud"
                className={`p-2 rounded-xl border transition cursor-pointer shrink-0 ${
                  isSpeakingQuestion
                    ? 'bg-[#935073] text-[#F6DBC0] border-[#F6DBC0] animate-pulse'
                    : 'bg-[#935073]/40 text-[#F8F4E9] border-[#935073]/50 hover:bg-[#935073]'
                }`}
              >
                <Volume2 className="w-4 h-4 text-[#F6DBC0]" />
              </button>
            </div>

            {/* Coach Advice */}
            {activeQ.contextTip && (
              <div className="p-2.5 rounded-xl bg-[#935073]/40 border border-[#F6DBC0]/20 text-xs text-[#F8F4E9] flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-[#F6DBC0] shrink-0 mt-0.5" />
                <span>
                  <strong className="font-bold text-[#F6DBC0]">Coach Advice:</strong> {activeQ.contextTip}
                </span>
              </div>
            )}

            {/* Key Expected Points */}
            {activeQ.expectedKeyPoints && activeQ.expectedKeyPoints.length > 0 && (
              <div className="text-[11px] text-[#F6DBC0]/80">
                <span className="font-bold text-[#F8F4E9]">Interviewer will listen for:</span>{' '}
                {activeQ.expectedKeyPoints.join(' • ')}
              </div>
            )}
          </div>

          {/* VOICE-ONLY ANSWER STAGE (Strictly Voice - No Text Typing Box) */}
          <div className="bg-white rounded-2xl border border-[#935073]/30 p-4 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#935073]/15 pb-3">
              <div>
                <h4 className="text-xs font-extrabold text-[#502D55] uppercase tracking-wider flex items-center gap-2">
                  <Mic className="w-4 h-4 text-[#935073]" />
                  <span>Candidate Voice Recording Stage</span>
                </h4>
                <p className="text-[11px] text-[#935073] mt-0.5">
                  Voice-only answering mode. Press the microphone to answer verbally.
                </p>
              </div>

              {/* Demo Spoken Voice simulation button */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#935073] font-semibold hidden sm:inline">Demo Audio:</span>
                <button
                  type="button"
                  onClick={() => handleSimulateVoiceResponse('strong')}
                  className="px-2.5 py-1 text-xs text-[#502D55] bg-[#F6DBC0] hover:bg-[#F6DBC0]/90 border border-[#935073]/30 rounded-lg font-bold transition cursor-pointer"
                  title="Simulate a strong spoken voice answer"
                >
                  ⚡ Strong Voice Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateVoiceResponse('beginner')}
                  className="px-2.5 py-1 text-xs text-[#502D55] bg-[#F8F4E9] hover:bg-[#F6DBC0]/60 border border-[#935073]/30 rounded-lg font-bold transition cursor-pointer"
                  title="Simulate a weak or hesitant voice answer"
                >
                  ⚠️ Beginner Voice Demo
                </button>
              </div>
            </div>

            {/* Permission Error Banner */}
            {permissionError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold">Microphone Permission Notice:</p>
                  <p>{permissionError}</p>
                  <p className="text-[11px] text-amber-800">
                    You can click the <strong>"⚡ Strong Voice Demo"</strong> button above to test the speech evaluation without microphone access.
                  </p>
                </div>
              </div>
            )}

            {/* Central Microphone Stage */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F4E9] border border-[#935073]/20 flex flex-col items-center justify-center text-center space-y-3.5">
              {/* Animated Waveform Visualizer */}
              <div className="flex items-center justify-center gap-1.5 h-10 w-full max-w-md px-4">
                {audioLevels.map((level, idx) => (
                  <div
                    key={idx}
                    className={`w-2 rounded-full transition-all duration-75 ${
                      isRecording
                        ? 'bg-[#502D55]'
                        : hasRecorded
                        ? 'bg-[#935073]/60'
                        : 'bg-[#935073]/25'
                    }`}
                    style={{
                      height: isRecording
                        ? `${Math.max(8, level * 36)}px`
                        : '6px',
                      transform: isRecording ? 'scaleY(1)' : 'scaleY(0.8)',
                    }}
                  />
                ))}
              </div>

              {/* Status and Timer */}
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-2">
                  {isRecording ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full animate-pulse border border-red-200">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                      <span>Recording Live Speech</span>
                    </span>
                  ) : hasRecorded ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#502D55] bg-[#F6DBC0] px-3 py-1 rounded-full border border-[#935073]/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#502D55]" />
                      <span>Voice Recorded</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-[#935073]">
                      Press the microphone button to start answering
                    </span>
                  )}
                </div>

                <div className="text-2xl font-black text-[#502D55] tracking-tight font-mono">
                  {formatTime(durationSeconds)}
                </div>
              </div>

              {/* Main Microphone Button */}
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="group relative flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] shadow-lg shadow-[#502D55]/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
                    title="Click to speak your answer"
                  >
                    <Mic className="w-8 h-8 text-[#F6DBC0]" />
                    <span className="sr-only">Start Speaking</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="group relative flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#935073] hover:bg-[#502D55] text-[#F8F4E9] shadow-lg shadow-[#935073]/40 transition transform hover:scale-105 active:scale-95 animate-pulse cursor-pointer"
                    title="Stop Speaking"
                  >
                    <Square className="w-7 h-7 text-[#F6DBC0]" fill="#F6DBC0" />
                    <span className="sr-only">Stop Speaking</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-[#935073] font-semibold max-w-sm">
                {isRecording
                  ? 'Listening actively... Click the square stop button when you finish speaking.'
                  : hasRecorded
                  ? 'Review your transcribed voice answer below, or click record to try again.'
                  : 'Speak clearly into your device microphone. When finished, press stop to analyze.'}
              </p>
            </div>

            {/* Converted Speech-to-Text Transcript (Shown transparently after recording) */}
            {hasRecorded && (
              <div className="p-5 rounded-2xl bg-[#F6DBC0]/40 border border-[#935073]/30 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#502D55] uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#935073]" />
                    <span>Transcribed Voice Response (Voice-To-Text)</span>
                  </span>

                  <div className="flex items-center gap-2 text-xs text-[#935073] font-bold">
                    <span>{transcript.trim().split(/\s+/).filter(Boolean).length} words</span>
                    <span>•</span>
                    <span>{durationSeconds}s duration</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#935073]/20 text-xs text-[#502D55] leading-relaxed font-medium min-h-16">
                  {transcript ? (
                    <span>"{transcript}"</span>
                  ) : (
                    <span className="italic text-[#935073]">
                      No speech detected. Please speak louder into your microphone or use the Demo Audio button.
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <button
                    type="button"
                    onClick={resetRecording}
                    className="px-4 py-2 text-xs font-bold text-[#502D55] bg-white hover:bg-[#F8F4E9] border border-[#935073]/30 rounded-xl transition flex items-center gap-1.5 cursor-pointer self-start"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#935073]" />
                    <span>Re-record Voice Answer</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitVoiceAnswer}
                    disabled={evaluating || !transcript.trim()}
                    className="px-6 py-2.5 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] rounded-xl text-xs font-bold shadow-md shadow-[#502D55]/20 transition disabled:opacity-50 flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                  >
                    {evaluating ? (
                      <span>Analyzing Voice Answer with AI...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#F6DBC0]" />
                        <span>Submit Voice Answer for Evaluation →</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* REAL-TIME AI VOICE EVALUATION & RUBRIC SCORES (OUT OF 10) */}
          {currentEvaluation && (
            <div className="bg-white rounded-3xl border border-[#935073]/30 p-6 sm:p-8 shadow-md space-y-6 animate-in slide-in-from-bottom-3 duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#935073]/15 pb-4">
                <div className="flex items-center gap-4">
                  <ScoreCircle
                    score={currentEvaluation.score}
                    maxScore={100}
                    size={76}
                    strokeWidth={8}
                    variant="dusty-plum"
                  />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#935073]">
                      Answer Score ({currentEvaluation.score}/100)
                    </span>
                    <h4 className="text-lg font-extrabold text-[#502D55]">
                      {currentEvaluation.score >= 80 ? 'Strong Performance' : 'Constructive Feedback Available'}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={nextQuestion}
                  className="px-6 py-2.5 bg-[#502D55] hover:bg-[#935073] text-[#F8F4E9] font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <span>
                    {currentIndex + 1 < questions.length ? 'Continue to Next Question →' : 'Complete & View Final Report →'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#F6DBC0]" />
                </button>
              </div>

              {/* Granular Rubric Scores Out of 10 */}
              {currentEvaluation.scoresOutOf10 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#935073]">
                    7-Dimension Evaluation (Scores Out of 10)
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                    {[
                      { label: 'Relevance', val: currentEvaluation.scoresOutOf10.relevance },
                      { label: 'Accuracy', val: currentEvaluation.scoresOutOf10.accuracy },
                      { label: 'Clarity', val: currentEvaluation.scoresOutOf10.clarity },
                      { label: 'Structure', val: currentEvaluation.scoresOutOf10.structure },
                      { label: 'Confidence', val: currentEvaluation.scoresOutOf10.confidence },
                      { label: 'Completeness', val: currentEvaluation.scoresOutOf10.completeness },
                      { label: 'Communication', val: currentEvaluation.scoresOutOf10.communication },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#F8F4E9] border border-[#935073]/20 text-center">
                        <span className="text-[11px] font-bold text-[#502D55] block truncate">{item.label}</span>
                        <span className="text-base font-extrabold text-[#935073] block mt-0.5">
                          {item.val ?? 8.0}<span className="text-[10px] text-[#502D55]/60 font-semibold">/10</span>
                        </span>
                        <div className="w-full bg-[#F6DBC0] h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="bg-[#502D55] h-full rounded-full"
                            style={{ width: `${((item.val || 8) / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Delivery Analysis Section */}
              {currentEvaluation.voiceMetrics && (
                <div className="p-4 rounded-2xl bg-[#F6DBC0]/40 border border-[#935073]/25 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#502D55] uppercase tracking-wider flex items-center gap-1.5">
                      <Gauge className="w-4 h-4 text-[#935073]" />
                      <span>Voice Communication Analysis (Speech Mechanics)</span>
                    </span>
                    <span className="text-[11px] text-[#935073] font-semibold">
                      Objective cadence metrics
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-[#935073]/20">
                      <span className="text-[10px] text-[#935073] font-bold uppercase block">Pacing (WPM)</span>
                      <span className="text-sm font-extrabold text-[#502D55]">
                        {currentEvaluation.voiceMetrics.wordsPerMinute} WPM
                      </span>
                      <span className="text-[10px] text-[#935073] block mt-0.5">
                        {currentEvaluation.voiceMetrics.pacingRating}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-[#935073]/20">
                      <span className="text-[10px] text-[#935073] font-bold uppercase block">Filler Words</span>
                      <span className="text-sm font-extrabold text-[#502D55]">
                        {currentEvaluation.voiceMetrics.fillerWordsCount} detected
                      </span>
                      <span className="text-[10px] text-[#935073] block mt-0.5 truncate">
                        {currentEvaluation.voiceMetrics.fillerWordsList.length > 0
                          ? currentEvaluation.voiceMetrics.fillerWordsList.join(', ')
                          : 'None (Clean)'}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-[#935073]/20">
                      <span className="text-[10px] text-[#935073] font-bold uppercase block">Answer Length</span>
                      <span className="text-sm font-extrabold text-[#502D55]">
                        {currentEvaluation.voiceMetrics.lengthAssessment}
                      </span>
                      <span className="text-[10px] text-[#935073] block mt-0.5">
                        {currentEvaluation.voiceMetrics.durationSeconds}s duration
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-[#935073]/20">
                      <span className="text-[10px] text-[#935073] font-bold uppercase block">Pauses & Flow</span>
                      <span className="text-[11px] font-bold text-[#502D55] block mt-0.5 line-clamp-2">
                        {currentEvaluation.voiceMetrics.pauseAnalysis}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Strengths & Weaknesses (What you did well / What was missing) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#F8F4E9] border border-[#935073]/20">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#502D55] mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#935073]" />
                    <span>What You Did Well</span>
                  </div>
                  <ul className="text-xs text-[#502D55]/90 space-y-1.5 font-medium">
                    {currentEvaluation.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#935073] font-bold">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-[#F6DBC0]/40 border border-[#935073]/25">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#502D55] mb-2">
                    <AlertTriangle className="w-4 h-4 text-[#935073]" />
                    <span>What Was Missing / Areas to Improve</span>
                  </div>
                  <ul className="text-xs text-[#502D55]/90 space-y-1.5 font-medium">
                    {currentEvaluation.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#935073] font-bold">⚠️</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Better Strategy & Stronger Exemplar Answer */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#F6DBC0]/60 border border-[#935073]/20">
                  <span className="text-xs font-bold text-[#502D55] block mb-1">
                    💡 How to Elevate This Answer (Coaching Guidance):
                  </span>
                  <p className="text-xs text-[#502D55]/90 leading-relaxed font-medium">
                    {currentEvaluation.betterStrategy}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F8F4E9] border border-[#935073]/20">
                  <span className="text-xs font-bold text-[#502D55] block mb-1">
                    🌟 Stronger Model Answer Example:
                  </span>
                  <p className="text-xs text-[#502D55]/85 italic leading-relaxed font-medium">
                    "{currentEvaluation.idealAnswer}"
                  </p>
                </div>
              </div>

              {/* Adaptive Follow-Up Question if present */}
              {currentEvaluation.adaptiveFollowUp && (
                <div className="p-4 rounded-2xl bg-[#502D55] text-[#F8F4E9] border border-[#935073]/40 space-y-2">
                  <span className="text-[11px] font-bold text-[#F6DBC0] uppercase tracking-wider block">
                    ⚡ Adaptive Follow-Up Question:
                  </span>
                  <p className="text-sm font-bold text-white">
                    "{currentEvaluation.adaptiveFollowUp.question}"
                  </p>
                  <p className="text-xs text-[#F8F4E9]/80 font-medium">
                    <strong>Interviewer Reason:</strong> {currentEvaluation.adaptiveFollowUp.reason}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
