'use client';

import { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Info } from 'lucide-react';
import { ConfidenceMeter } from './confidence-meter';
import { EvidenceDrawer } from './evidence-drawer';
import type { Strength } from '@/types';

interface StrengthsGridProps {
  strengths: Strength[];
  onFeedback?: (strengthName: string, feedback: 'agree' | 'disagree', reason?: string) => void;
}

export const StrengthsGrid = memo(function StrengthsGrid({ strengths, onFeedback }: StrengthsGridProps) {
  const [drawerStrength, setDrawerStrength] = useState<Strength | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, 'agree' | 'disagree'>>({});

  const handleFeedback = (index: number, type: 'agree' | 'disagree') => {
    setFeedbackGiven((prev) => ({ ...prev, [index]: type }));
    onFeedback?.(strengths[index].name, type);
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {strengths.map((strength, i) => (
          <Card key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm font-sans">{strength.name}</h4>
                <span className="text-xs font-bold text-primary font-mono">{strength.score}/100</span>
              </div>
              <Progress value={strength.score} className="h-3 mb-3" />
              <p className="text-xs text-muted-foreground mb-2">{strength.evidence}</p>

              {strength.confidenceLevel && (
                <div className="mb-2">
                  <ConfidenceMeter level={strength.confidenceLevel} />
                </div>
              )}

              <div className="flex items-center gap-1">
                {strength.evidenceSources && strength.evidenceSources.length > 0 && (
                  <button
                    onClick={() => setDrawerStrength(strength)}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Info className="h-3 w-3" /> Why?
                  </button>
                )}
                {onFeedback && !feedbackGiven[i] && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[10px]"
                      onClick={() => handleFeedback(i, 'agree')}
                    >
                      <ThumbsUp className="h-2.5 w-2.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-1.5 text-[10px]"
                      onClick={() => handleFeedback(i, 'disagree')}
                    >
                      <ThumbsDown className="h-2.5 w-2.5" />
                    </Button>
                  </>
                )}
                {feedbackGiven[i] && (
                  <span className="text-[10px] text-muted-foreground ml-1">
                    {feedbackGiven[i] === 'agree' ? 'Confirmed' : 'Noted'}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <EvidenceDrawer
        open={!!drawerStrength}
        onOpenChange={(open) => { if (!open) setDrawerStrength(null); }}
        title={drawerStrength?.name ?? ''}
        evidenceSources={drawerStrength?.evidenceSources ?? []}
        confidenceLevel={drawerStrength?.confidenceLevel}
      />
    </>
  );
});
