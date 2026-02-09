'use client';

import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Strength } from '@/types';

interface StrengthsGridProps {
  strengths: Strength[];
}

export const StrengthsGrid = memo(function StrengthsGrid({ strengths }: StrengthsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {strengths.map((strength, i) => (
        <Card key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm font-sans">{strength.name}</h4>
              <span className="text-xs font-bold text-primary font-mono">{strength.score}/100</span>
            </div>
            <Progress value={strength.score} className="h-3 mb-3" />
            <p className="text-xs text-muted-foreground">{strength.evidence}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
