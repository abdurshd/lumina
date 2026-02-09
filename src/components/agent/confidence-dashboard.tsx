'use client';

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ConfidenceProfile } from '@/types';

interface ConfidenceDashboardProps {
  profile: ConfidenceProfile | null;
  compact?: boolean;
}

function getConfidenceColor(confidence: number): string {
  if (confidence < 40) return 'text-red-400';
  if (confidence < 70) return 'text-yellow-400';
  return 'text-green-400';
}

function getProgressColor(confidence: number): string {
  if (confidence < 40) return '[&>div]:bg-red-500/70';
  if (confidence < 70) return '[&>div]:bg-yellow-500/70';
  return '[&>div]:bg-green-500/70';
}

export function ConfidenceDashboard({ profile, compact = false }: ConfidenceDashboardProps) {
  if (!profile || Object.keys(profile.dimensions).length === 0) {
    return (
      <Card className="glass p-3 border-neutral-800">
        <p className="text-xs text-neutral-500 text-center py-2">
          No confidence data yet. Connect data sources or take the quiz to start building your profile.
        </p>
      </Card>
    );
  }

  const sortedDimensions = Object.values(profile.dimensions)
    .sort((a, b) => a.confidence - b.confidence);

  const displayDimensions = compact
    ? sortedDimensions.slice(0, 6)
    : sortedDimensions;

  return (
    <Card className="glass p-3 border-neutral-800">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-neutral-200">
          Confidence
        </span>
        <span className={`text-sm font-mono font-bold ${getConfidenceColor(profile.overallConfidence)}`}>
          {profile.overallConfidence}%
        </span>
      </div>

      <div className="space-y-2">
        {displayDimensions.map((dc) => (
          <div key={dc.dimension} className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-neutral-400 truncate max-w-[140px]">
                {dc.dimension}
              </span>
              <span className={`text-[10px] font-mono ${getConfidenceColor(dc.confidence)}`}>
                {dc.confidence}%
              </span>
            </div>
            <Progress
              value={dc.confidence}
              className={`h-1 bg-neutral-800 ${getProgressColor(dc.confidence)}`}
            />
          </div>
        ))}
      </div>

      {compact && sortedDimensions.length > 6 && (
        <p className="text-[10px] text-neutral-500 mt-2 text-center">
          +{sortedDimensions.length - 6} more dimensions
        </p>
      )}

      <div className="flex items-center gap-3 mt-3 pt-2 border-t border-neutral-800">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500/70" />
          <span className="text-[10px] text-neutral-500">&lt;40%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500/70" />
          <span className="text-[10px] text-neutral-500">40-70%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500/70" />
          <span className="text-[10px] text-neutral-500">&gt;70%</span>
        </div>
      </div>
    </Card>
  );
}
