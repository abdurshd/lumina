'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { LiveSessionManager, type LiveSessionCallbacks } from '@/lib/gemini/live-session';
import { AudioPlaybackManager, base64ToFloat32 } from '@/lib/gemini/audio-utils';
import { FrameCapturer } from '@/lib/gemini/video-utils';
import { useWebcam } from './use-webcam';
import { useMicrophone } from './use-microphone';
import type { SessionInsight } from '@/types';

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
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [insights, setInsights] = useState<SessionInsight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const webcam = useWebcam();

  const onSendAudio = useCallback((base64: string) => {
    managerRef.current?.sendAudio(base64);
  }, []);

  const microphone = useMicrophone(onSendAudio);

  const callbacks: LiveSessionCallbacks = {
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
    },
    onInterrupted: () => {
      playbackRef.current?.stop();
    },
  };

  const connect = useCallback(async (apiKey: string, dataContext: string) => {
    setIsConnecting(true);
    setError(null);

    const manager = new LiveSessionManager(callbacks);
    managerRef.current = manager;

    await webcam.start();
    await microphone.start();

    playbackRef.current = new AudioPlaybackManager();
    await playbackRef.current.resume();

    await manager.connect(apiKey, dataContext);

    // Start video frame capture
    if (webcam.videoRef.current) {
      const capturer = new FrameCapturer(
        webcam.videoRef.current,
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
  }, [webcam, microphone]);

  const disconnect = useCallback(async () => {
    capturerRef.current?.stop();
    capturerRef.current = null;
    microphone.stop();
    webcam.stop();
    playbackRef.current?.close();
    playbackRef.current = null;
    managerRef.current?.disconnect();
    managerRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [microphone, webcam]);

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
    transcript,
    insights,
    error,
    sessionDuration,
    webcam,
    microphone,
    connect,
    disconnect,
    sendText,
  };
}
