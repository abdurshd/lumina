'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { WaveformLoader } from '@/components/loaders';
import { snappySpring } from '@/lib/motion';

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
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {!isConnected && !isConnecting && (
        <motion.div
          key="start"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          transition={snappySpring}
        >
          <Button onClick={onConnect} size="lg" className="gap-2">
            <Video className="h-5 w-5" />
            Start Session
          </Button>
        </motion.div>
      )}

      {isConnecting && (
        <motion.div
          key="connecting"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          transition={snappySpring}
          className="flex flex-col items-center gap-2"
        >
          <WaveformLoader size={100} />
          <p className="text-sm text-muted-foreground animate-pulse">Connecting...</p>
        </motion.div>
      )}

      {isConnected && (
        <motion.div
          key="connected"
          className="flex items-center gap-3"
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          transition={snappySpring}
        >
          <div className="flex items-center gap-2 rounded-xl bg-card border-2 border-overlay-light px-4 py-2">
            <AnimatePresence mode="wait">
              {isMicActive ? (
                <motion.span
                  key="mic-on"
                  initial={shouldReduceMotion ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { scale: 0 }}
                  transition={snappySpring}
                >
                  <Mic className="h-4 w-4 text-primary" />
                </motion.span>
              ) : (
                <motion.span
                  key="mic-off"
                  initial={shouldReduceMotion ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { scale: 0 }}
                  transition={snappySpring}
                >
                  <MicOff className="h-4 w-4 text-destructive" />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="text-xs font-bold font-mono">{isMicActive ? 'Mic on' : 'Mic off'}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-card border-2 border-overlay-light px-4 py-2">
            <AnimatePresence mode="wait">
              {isCamActive ? (
                <motion.span
                  key="cam-on"
                  initial={shouldReduceMotion ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { scale: 0 }}
                  transition={snappySpring}
                >
                  <Video className="h-4 w-4 text-primary" />
                </motion.span>
              ) : (
                <motion.span
                  key="cam-off"
                  initial={shouldReduceMotion ? false : { scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={shouldReduceMotion ? undefined : { scale: 0 }}
                  transition={snappySpring}
                >
                  <VideoOff className="h-4 w-4 text-destructive" />
                </motion.span>
              )}
            </AnimatePresence>
            <span className="text-xs font-bold font-mono">{isCamActive ? 'Cam on' : 'Cam off'}</span>
          </div>
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
          >
            <Button onClick={onDisconnect} variant="destructive" size="icon" className="h-12 w-12 rounded-full">
              <PhoneOff className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
