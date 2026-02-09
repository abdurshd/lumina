'use client';

import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronRight } from 'lucide-react';
import type { CareerPath } from '@/types';

interface CareerPathsProps {
  paths: CareerPath[];
}

export const CareerPaths = memo(function CareerPaths({ paths }: CareerPathsProps) {
  return (
    <div className="space-y-4">
      {paths.map((path, i) => (
        <Card key={i} className="overflow-hidden glass animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-sans">{path.title}</CardTitle>
              <Badge variant={path.match >= 85 ? 'default' : 'secondary'} className={path.match >= 85 ? '' : 'bg-white/[0.06]'}>
                {path.match}% match
              </Badge>
            </div>
            <Progress value={path.match} className="h-1.5" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{path.description}</p>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Next steps:</p>
              {path.nextSteps.map((step, j) => (
                <div key={j} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
