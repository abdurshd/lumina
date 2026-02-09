'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export function useWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 768, height: 768, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      console.error('Webcam error:', err);
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    const tracks = streamRef.current?.getVideoTracks() ?? [];
    for (const track of tracks) {
      track.enabled = enabled;
    }
    setIsActive(enabled && tracks.length > 0);
  }, []);

  const toggle = useCallback((): boolean => {
    const tracks = streamRef.current?.getVideoTracks() ?? [];
    if (tracks.length === 0) return false;
    const nextEnabled = !tracks[0].enabled;
    for (const track of tracks) {
      track.enabled = nextEnabled;
    }
    setIsActive(nextEnabled);
    return nextEnabled;
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, isActive, error, start, stop, setEnabled, toggle };
}
