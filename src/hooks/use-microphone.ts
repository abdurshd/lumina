'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { float32ToPcm16Base64, AUDIO_WORKLET_PROCESSOR } from '@/lib/gemini/audio-utils';

export function useMicrophone(onAudioData: (base64: string) => void) {
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const workletRef = useRef<AudioWorkletNode | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const onAudioDataRef = useRef(onAudioData);

  useEffect(() => {
    onAudioDataRef.current = onAudioData;
  });

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const ctx = new AudioContext({ sampleRate: 16000 });
      contextRef.current = ctx;

      const blob = new Blob([AUDIO_WORKLET_PROCESSOR], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);
      URL.revokeObjectURL(url);

      const source = ctx.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(ctx, 'pcm-processor');
      workletRef.current = workletNode;

      workletNode.port.onmessage = (e: MessageEvent) => {
        const { audioData } = e.data as { audioData: Float32Array };
        const base64 = float32ToPcm16Base64(audioData);
        onAudioDataRef.current(base64);
      };

      source.connect(workletNode);
      workletNode.connect(ctx.destination);

      setIsActive(true);
      setError(null);
    } catch (err) {
      setError('Microphone access denied. Please enable microphone permissions.');
      console.error('Microphone error:', err);
    }
  }, []);

  const stop = useCallback(() => {
    workletRef.current?.disconnect();
    workletRef.current = null;
    contextRef.current?.close();
    contextRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => {
      workletRef.current?.disconnect();
      contextRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { isActive, error, start, stop };
}
