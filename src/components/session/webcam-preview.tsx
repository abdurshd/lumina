'use client';

import { type RefObject } from 'react';

interface WebcamPreviewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  isActive: boolean;
}

export function WebcamPreview({ videoRef, isActive }: WebcamPreviewProps) {
  return (
    <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl bg-muted">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`h-full w-full object-cover transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
      />
      {!isActive && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="mx-auto mb-2 h-16 w-16 rounded-full bg-muted-foreground/10 flex items-center justify-center">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm">Camera preview</p>
          </div>
        </div>
      )}
      {isActive && (
        <div className="absolute bottom-3 left-3">
          <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-xs text-white">Live</span>
          </div>
        </div>
      )}
    </div>
  );
}
