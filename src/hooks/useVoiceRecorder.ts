import { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceMetrics } from '../types';

export interface UseVoiceRecorderOptions {
  onTranscriptChange?: (text: string) => void;
  onSilenceDetected?: () => void;
}

export const useVoiceRecorder = (options?: UseVoiceRecorderOptions) => {
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(16).fill(0.1));
  const [isSupported, setIsSupported] = useState(true);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);
  const transcriptRef = useRef('');

  // Check Web Speech & Audio support on mount
  useEffect(() => {
    const hasMedia = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
    const SpeechRecognition =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (!hasMedia && !SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Update transcript ref
  useEffect(() => {
    transcriptRef.current = transcript;
    if (options?.onTranscriptChange) {
      options.onTranscriptChange(transcript);
    }
  }, [transcript, options]);

  // Audio waveform animation loop
  const updateWaveform = useCallback(() => {
    if (!analyserRef.current || !isRecording) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Sample 16 discrete bands across the spectrum
    const barsCount = 16;
    const step = Math.floor(dataArray.length / barsCount);
    const newLevels: number[] = [];

    for (let i = 0; i < barsCount; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += dataArray[i * step + j] || 0;
      }
      const avg = sum / step;
      // Normalize to 0.1 - 1.0 with natural minimum height
      const normalized = Math.max(0.12, Math.min(1.0, avg / 255));
      newLevels.push(normalized);
    }

    setAudioLevels(newLevels);
    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  }, [isRecording]);

  const startRecording = async () => {
    setPermissionError(null);
    setTranscript('');
    transcriptRef.current = '';
    setDurationSeconds(0);
    setHasRecorded(false);

    try {
      // 1. Request microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Initialize Web Audio analyser
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        audioContextRef.current = audioCtx;
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        analyserRef.current = analyser;
      }

      // 3. Initialize Speech Recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentSessionText = '';
          for (let i = 0; i < event.results.length; ++i) {
            currentSessionText += event.results[i][0].transcript + ' ';
          }
          const cleanText = currentSessionText.trim();
          setTranscript(cleanText);
        };

        recognition.onerror = (e: any) => {
          console.warn('SpeechRecognition error:', e);
          if (e.error === 'not-allowed') {
            setPermissionError('Microphone permission was denied. Please allow microphone access in your browser bar.');
          }
        };

        recognition.onend = () => {
          // If still recording, restart
          if (isRecording) {
            try {
              recognition.start();
            } catch {
              // Ignore restart error
            }
          }
        };

        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch (recErr) {
          console.warn('SpeechRecognition start failed:', recErr);
        }
      }

      setIsRecording(true);

      // Start duration timer
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds(prev => prev + 1);
      }, 1000);

      // Start waveform loop
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    } catch (err: any) {
      console.error('Failed to access microphone:', err);
      setIsRecording(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Microphone permission was denied. Please click the camera/mic icon in your address bar and allow access.');
      } else {
        setPermissionError('Could not connect to microphone: ' + (err.message || 'Device error'));
      }
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setHasRecorded(true);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    // Reset visual levels
    setAudioLevels(new Array(16).fill(0.1));
  };

  const resetRecording = () => {
    stopRecording();
    setTranscript('');
    transcriptRef.current = '';
    setDurationSeconds(0);
    setHasRecorded(false);
    setPermissionError(null);
  };

  // Allow setting transcript directly for demo / test mode
  const injectSpokenTranscript = (text: string, duration = 38) => {
    stopRecording();
    setTranscript(text);
    transcriptRef.current = text;
    setDurationSeconds(duration);
    setHasRecorded(true);
    setPermissionError(null);
  };

  // Compute Voice Metrics from the recorded session
  const computeVoiceMetrics = (): VoiceMetrics => {
    const words = transcript.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const duration = Math.max(durationSeconds, Math.round(wordCount * 0.45), 10);
    const wpm = Math.round((wordCount / duration) * 60);

    const fillerRegex = /\b(um|uh|like|you know|actually|basically|sort of|kind of|i mean|right)\b/gi;
    const detected = (transcript.match(fillerRegex) || []).map(f => f.toLowerCase());

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
      fillerWordsCount: detected.length,
      fillerWordsList: Array.from(new Set(detected)),
      pauseAnalysis: detected.length > 3 ? 'Noticeable conversational pauses filled with vocal markers' : 'Smooth, steady cadence with natural pauses',
      lengthAssessment,
    };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return {
    isRecording,
    hasRecorded,
    durationSeconds,
    transcript,
    permissionError,
    audioLevels,
    isSupported,
    startRecording,
    stopRecording,
    resetRecording,
    injectSpokenTranscript,
    computeVoiceMetrics,
  };
};
