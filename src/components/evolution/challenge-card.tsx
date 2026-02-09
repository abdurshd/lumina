'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp, reducedMotionVariants } from '@/lib/motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Zap, SkipForward, Send } from 'lucide-react';
import type { MicroChallenge } from '@/types';

interface ChallengeCardProps {
  challenge: MicroChallenge;
  onAccept?: () => void;
  onSkip?: () => void;
  onComplete?: (evidence: string) => void;
}

const categoryColors: Record<string, string> = {
  explore: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  create: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  connect: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  learn: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  reflect: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const difficultyColors: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  hard: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function ChallengeCard({ challenge, onAccept, onSkip, onComplete }: ChallengeCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const [evidence, setEvidence] = useState('');
  const [showEvidenceInput, setShowEvidenceInput] = useState(false);

  const handleComplete = () => {
    if (evidence.trim() && onComplete) {
      onComplete(evidence.trim());
      setEvidence('');
      setShowEvidenceInput(false);
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? reducedMotionVariants : fadeInUp}
    >
      <Card>
        <CardContent className="py-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="text-sm font-bold">{challenge.title}</h3>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge
                variant="outline"
                className={categoryColors[challenge.category] ?? 'text-muted-foreground border-overlay-light'}
              >
                {challenge.category}
              </Badge>
              <Badge
                variant="outline"
                className={difficultyColors[challenge.difficulty] ?? 'text-muted-foreground border-overlay-light'}
              >
                {challenge.difficulty}
              </Badge>
            </div>
          </div>

          <p className="text-sm text-muted-foreground mb-3">
            {challenge.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Clock className="h-3.5 w-3.5" />
            <span>{challenge.suggestedDuration}</span>
          </div>

          {/* Actions based on status */}
          {challenge.status === 'suggested' && (
            <div className="flex items-center gap-2">
              {onAccept && (
                <Button size="sm" onClick={onAccept}>
                  <Zap className="h-3.5 w-3.5" />
                  Accept
                </Button>
              )}
              {onSkip && (
                <Button variant="ghost" size="sm" onClick={onSkip}>
                  <SkipForward className="h-3.5 w-3.5" />
                  Skip
                </Button>
              )}
            </div>
          )}

          {(challenge.status === 'accepted' || challenge.status === 'in_progress') && (
            <div className="space-y-3">
              {!showEvidenceInput ? (
                <Button size="sm" onClick={() => setShowEvidenceInput(true)}>
                  <CheckCircle className="h-3.5 w-3.5" />
                  Mark Complete
                </Button>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    placeholder="Describe what you did and what you learned..."
                    className="w-full rounded-xl border-2 border-overlay-light bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none min-h-[80px]"
                  />
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={handleComplete} disabled={!evidence.trim()}>
                      <Send className="h-3.5 w-3.5" />
                      Submit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowEvidenceInput(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {challenge.status === 'completed' && challenge.evidence && (
            <div className="rounded-xl bg-emerald-500/5 border-2 border-emerald-500/10 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">Completed</span>
              </div>
              <p className="text-sm text-muted-foreground">{challenge.evidence}</p>
            </div>
          )}

          {challenge.status === 'skipped' && (
            <Badge variant="outline" className="text-muted-foreground border-overlay-light">
              Skipped
            </Badge>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
