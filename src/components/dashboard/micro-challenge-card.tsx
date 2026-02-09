'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { smoothTransition } from '@/lib/motion';
import { Clock, Play, CheckCircle2, SkipForward } from 'lucide-react';
import type { MicroChallenge, ChallengeCategory } from '@/types';

interface MicroChallengeCardProps {
  challenge: MicroChallenge;
  onAccept?: () => void;
  onComplete?: () => void;
  onSkip?: () => void;
}

const categoryColors: Record<ChallengeCategory, string> = {
  explore: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  create: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  connect: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  learn: 'bg-green-500/10 text-green-400 border-green-500/20',
  reflect: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

export function MicroChallengeCard({ challenge, onAccept, onComplete, onSkip }: MicroChallengeCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const isActionable = challenge.status === 'suggested' || challenge.status === 'accepted' || challenge.status === 'in_progress';

  return (
    <motion.div
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      transition={smoothTransition}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm">{challenge.title}</h4>
            <Badge
              variant="outline"
              className={`shrink-0 text-xs border ${categoryColors[challenge.category]}`}
            >
              {challenge.category}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {challenge.description}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{challenge.suggestedDuration}</span>
            <Badge variant="outline" className="text-xs ml-auto">
              {challenge.difficulty}
            </Badge>
          </div>
          {isActionable && (
            <div className="flex items-center gap-2 pt-1">
              {challenge.status === 'suggested' && onAccept && (
                <Button size="sm" variant="default" onClick={onAccept} className="text-xs h-7">
                  <Play className="h-3 w-3 mr-1" />
                  Accept
                </Button>
              )}
              {(challenge.status === 'accepted' || challenge.status === 'in_progress') && onComplete && (
                <Button size="sm" variant="default" onClick={onComplete} className="text-xs h-7">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Complete
                </Button>
              )}
              {challenge.status !== 'completed' && challenge.status !== 'skipped' && onSkip && (
                <Button size="sm" variant="outline" onClick={onSkip} className="text-xs h-7">
                  <SkipForward className="h-3 w-3 mr-1" />
                  Skip
                </Button>
              )}
            </div>
          )}
          {challenge.status === 'completed' && (
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="font-medium">Completed</span>
            </div>
          )}
          {challenge.status === 'skipped' && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <SkipForward className="h-3.5 w-3.5" />
              <span>Skipped</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
