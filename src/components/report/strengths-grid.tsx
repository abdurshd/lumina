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
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {strengths.map((strength, i) => (
        <Card key={i}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-sm">{strength.name}</h4>
              <span className="text-xs font-medium text-primary">{strength.score}/100</span>
            </div>
            <Progress value={strength.score} className="h-1.5 mb-2" />
            <p className="text-xs text-muted-foreground">{strength.evidence}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
