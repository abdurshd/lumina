'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { LiveSessionManager, type LiveSessionCallbacks, type NextStepSuggestion, type AgentReasoningEntry } from '@/lib/gemini/live-session';
import { AudioPlaybackManager, base64ToFloat32 } from '@/lib/gemini/audio-utils';
import { FrameCapturer } from '@/lib/gemini/video-utils';
import { useWebcam } from './use-webcam';
import { useMicrophone } from './use-microphone';
import type { SessionInsight, UserSignal, QuizModuleId, ConfidenceProfile } from '@/types';

export interface TranscriptEntry {
  text: string;
  isUser: boolean;
  timestamp: number;
}

export function useLiveSession() {
  const managerRef = useRef<LiveSessionManager | null>(null);
  const playbackRef = useRef<AudioPlaybackManager | null>(null);
  const capturerRef = useRef<FrameCapturer | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [insights, setInsights] = useState<SessionInsight[]>([]);
  const [signals, setSignals] = useState<UserSignal[]>([]);
  const [suggestedModule, setSuggestedModule] = useState<{ moduleId: QuizModuleId; reason: string } | null>(null);
  const [nextSteps, setNextSteps] = useState<NextStepSuggestion[]>([]);
  const [agentReasoning, setAgentReasoning] = useState<AgentReasoningEntry[]>([]);
  const [behaviorCaptureEnabled, setBehaviorCaptureEnabled] = useState(true);
  const confidenceProfileRef = useRef<ConfidenceProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const behaviorCaptureEnabledRef = useRef(behaviorCaptureEnabled);

  const webcam = useWebcam();

  const onSendAudio = useCallback((base64: string) => {
    managerRef.current?.sendAudio(base64);
  }, []);

  const microphone = useMicrophone(onSendAudio);

  useEffect(() => {
    behaviorCaptureEnabledRef.current = behaviorCaptureEnabled;
  }, [behaviorCaptureEnabled]);

  // Use a ref for callbacks so they always reference the latest state setters
  // without causing re-creation of the connect function
  const callbacksRef = useRef<LiveSessionCallbacks>({
    onAudioData: (base64Audio: string) => {
      if (!playbackRef.current) {
        playbackRef.current = new AudioPlaybackManager();
      }
      const float32 = base64ToFloat32(base64Audio);
      playbackRef.current.enqueue(float32);
    },
    onTranscript: (text: string, isUser: boolean) => {
      setTranscript((prev) => [...prev, { text, isUser, timestamp: Date.now() }]);
    },
    onInsight: (insight: SessionInsight) => {
      if (!behaviorCaptureEnabledRef.current) return;
      setInsights((prev) => [...prev, insight]);
    },
    onError: (err: Error) => {
      setError(err.message);
      console.error('Live session error:', err);
    },
    onConnectionChange: (connected: boolean) => {
      setIsConnected(connected);
      setIsConnecting(false);
      if (connected) {
        setIsReconnecting(false);
        setReconnectAttempt(0);
      }
    },
    onInterrupted: () => {
      playbackRef.current?.stop();
    },
    onReconnecting: (attempt: number) => {
      setIsReconnecting(true);
      setReconnectAttempt(attempt);
    },
    onSignal: (signal: UserSignal) => {
      if (!behaviorCaptureEnabledRef.current) return;
      setSignals((prev) => [...prev, signal]);
    },
    onQuizModuleSuggested: (moduleId: QuizModuleId, reason: string) => {
      setSuggestedModule({ moduleId, reason });
    },
    onNextStepScheduled: (step: NextStepSuggestion) => {
      setNextSteps((prev) => [...prev, step]);
    },
    onConfidenceRequested: () => {
      return confidenceProfileRef.current;
    },
    onAgentReasoning: (entry: AgentReasoningEntry) => {
      setAgentReasoning((prev) => [...prev, entry]);
    },
  });

  // Store webcam/microphone refs to avoid dependency issues
  const webcamRef = useRef(webcam);
  const microphoneRef = useRef(microphone);

  useEffect(() => {
    webcamRef.current = webcam;
    microphoneRef.current = microphone;
  });

  const stopFrameCapture = useCallback(() => {
    capturerRef.current?.stop();
    capturerRef.current = null;
  }, []);

  const maybeStartFrameCapture = useCallback(() => {
    if (!isConnected) return;
    if (!webcamRef.current.isActive) return;
    if (capturerRef.current) return;
    const videoEl = webcamRef.current.videoRef.current;
    if (!videoEl) return;

    const capturer = new FrameCapturer(
      videoEl,
      (base64) => managerRef.current?.sendVideo(base64),
      1,
    );
    capturerRef.current = capturer;
    capturer.start();
  }, [isConnected]);

  const connect = useCallback(
    async (
      authToken: string,
      dataContext: string,
      apiVersion: 'v1alpha' | 'v1' = 'v1alpha',
      confidenceProfile?: ConfidenceProfile
    ) => {
    setIsConnecting(true);
    setError(null);
    if (confidenceProfile) {
      confidenceProfileRef.current = confidenceProfile;
    }

    const manager = new LiveSessionManager(callbacksRef.current);
    managerRef.current = manager;

    await webcamRef.current.start();
    await microphoneRef.current.start();

    playbackRef.current = new AudioPlaybackManager();
    await playbackRef.current.resume();

    await manager.connect(authToken, dataContext, apiVersion, confidenceProfile);
    maybeStartFrameCapture();

    // Start session timer
    timerRef.current = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
    },
    [maybeStartFrameCapture]
  );

  const disconnect = useCallback(() => {
    stopFrameCapture();
    microphoneRef.current.stop();
    webcamRef.current.stop();
    playbackRef.current?.close();
    playbackRef.current = null;
    managerRef.current?.disconnect();
    managerRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [stopFrameCapture]);

  const sendText = useCallback((text: string) => {
    managerRef.current?.sendText(text);
  }, []);

  const toggleBehaviorCapture = useCallback(() => {
    setBehaviorCaptureEnabled((prev) => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    const enabled = webcamRef.current.toggle();
    if (!enabled) {
      stopFrameCapture();
      return;
    }
    maybeStartFrameCapture();
  }, [maybeStartFrameCapture, stopFrameCapture]);

  const toggleMicrophone = useCallback(() => {
    microphoneRef.current.toggle();
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    if (webcam.isActive) {
      maybeStartFrameCapture();
    } else {
      stopFrameCapture();
    }
  }, [isConnected, webcam.isActive, maybeStartFrameCapture, stopFrameCapture]);

  useEffect(() => {
    return () => {
      capturerRef.current?.stop();
      playbackRef.current?.close();
      managerRef.current?.disconnect();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    isConnected,
    isConnecting,
    isReconnecting,
    reconnectAttempt,
    transcript,
    insights,
    signals,
    behaviorCaptureEnabled,
    suggestedModule,
    nextSteps,
    agentReasoning,
    dismissSuggestedModule: () => setSuggestedModule(null),
    error,
    sessionDuration,
    webcam,
    microphone,
    connect,
    disconnect,
    sendText,
    toggleBehaviorCapture,
    toggleCamera,
    toggleMicrophone,
  };
}
