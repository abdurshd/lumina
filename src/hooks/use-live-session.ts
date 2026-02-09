'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { LiveSessionManager, type LiveSessionCallbacks, type NextStepSuggestion } from '@/lib/gemini/live-session';
import { AudioPlaybackManager, base64ToFloat32 } from '@/lib/gemini/audio-utils';
import { FrameCapturer } from '@/lib/gemini/video-utils';
import { useWebcam } from './use-webcam';
import { useMicrophone } from './use-microphone';
import type { SessionInsight, UserSignal, QuizModuleId } from '@/types';

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
  const [error, setError] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const webcam = useWebcam();

  const onSendAudio = useCallback((base64: string) => {
    managerRef.current?.sendAudio(base64);
  }, []);

  const microphone = useMicrophone(onSendAudio);

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
      } else {
        // Stop sending audio/video when connection drops
        capturerRef.current?.stop();
        capturerRef.current = null;
        microphoneRef.current.stop();
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
      setSignals((prev) => [...prev, signal]);
    },
    onQuizModuleSuggested: (moduleId: QuizModuleId, reason: string) => {
      setSuggestedModule({ moduleId, reason });
    },
    onNextStepScheduled: (step: NextStepSuggestion) => {
      setNextSteps((prev) => [...prev, step]);
    },
  });

  // Store webcam/microphone refs to avoid dependency issues
  const webcamRef = useRef(webcam);
  webcamRef.current = webcam;
  const microphoneRef = useRef(microphone);
  microphoneRef.current = microphone;

  const connect = useCallback(async (apiKey: string, dataContext: string) => {
    setIsConnecting(true);
    setError(null);

    const manager = new LiveSessionManager(callbacksRef.current);
    managerRef.current = manager;

    await webcamRef.current.start();
    await microphoneRef.current.start();

    playbackRef.current = new AudioPlaybackManager();
    await playbackRef.current.resume();

    await manager.connect(apiKey, dataContext);

    // Start video frame capture
    if (webcamRef.current.videoRef.current) {
      const capturer = new FrameCapturer(
        webcamRef.current.videoRef.current,
        (base64) => manager.sendVideo(base64),
        1 // 1 FPS
      );
      capturerRef.current = capturer;
      capturer.start();
    }

    // Start session timer
    timerRef.current = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const disconnect = useCallback(() => {
    capturerRef.current?.stop();
    capturerRef.current = null;
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
  }, []);

  const sendText = useCallback((text: string) => {
    managerRef.current?.sendText(text);
  }, []);

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
    suggestedModule,
    nextSteps,
    dismissSuggestedModule: () => setSuggestedModule(null),
    error,
    sessionDuration,
    webcam,
    microphone,
    connect,
    disconnect,
    sendText,
  };
}
