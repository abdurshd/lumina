'use client';

import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from 'lucide-react';

interface SessionControlsProps {
  isConnected: boolean;
  isConnecting: boolean;
  isMicActive: boolean;
  isCamActive: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function SessionControls({
  isConnected,
  isConnecting,
  isMicActive,
  isCamActive,
  onConnect,
  onDisconnect,
}: SessionControlsProps) {
  if (!isConnected && !isConnecting) {
    return (
      <Button onClick={onConnect} size="lg" className="gap-2">
        <Video className="h-5 w-5" />
        Start Session
      </Button>
    );
  }

  if (isConnecting) {
    return (
      <Button disabled size="lg" className="gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        Connecting...
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
        {isMicActive ? (
          <Mic className="h-4 w-4 text-green-500" />
        ) : (
          <MicOff className="h-4 w-4 text-red-500" />
        )}
        <span className="text-xs">{isMicActive ? 'Mic on' : 'Mic off'}</span>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
        {isCamActive ? (
          <Video className="h-4 w-4 text-green-500" />
        ) : (
          <VideoOff className="h-4 w-4 text-red-500" />
        )}
        <span className="text-xs">{isCamActive ? 'Cam on' : 'Cam off'}</span>
      </div>
      <Button onClick={onDisconnect} variant="destructive" size="icon" className="h-12 w-12 rounded-full">
        <PhoneOff className="h-5 w-5" />
      </Button>
    </div>
  );
}
