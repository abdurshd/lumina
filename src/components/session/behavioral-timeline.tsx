'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { BehavioralTrend, BehavioralCorrelation, TimelineSnapshot, BehavioralCategory } from '@/types';

interface BehavioralTimelineViewProps {
  trends: BehavioralTrend[];
  correlations: BehavioralCorrelation[];
  snapshots: TimelineSnapshot[];
  narrative: string;
}

const CATEGORY_COLORS: Partial<Record<BehavioralCategory, string>> = {
  engagement: '#22c55e',
  hesitation: '#ef4444',
  emotional_intensity: '#f59e0b',
  clarity_structure: '#3b82f6',
  collaboration_orientation: '#8b5cf6',
  enthusiasm: '#ec4899',
  analytical: '#06b6d4',
  creative: '#f97316',
  interpersonal: '#a855f7',
  body_language: '#14b8a6',
  voice_tone: '#6366f1',
};

const CATEGORY_LABELS: Partial<Record<BehavioralCategory, string>> = {
  engagement: 'Engagement',
  hesitation: 'Hesitation',
  emotional_intensity: 'Emotion',
  clarity_structure: 'Clarity',
  collaboration_orientation: 'Collab.',
  enthusiasm: 'Enthusiasm',
  analytical: 'Analytical',
  creative: 'Creative',
  interpersonal: 'Interpersonal',
  body_language: 'Body Lang.',
  voice_tone: 'Voice Tone',
};

function TrendIcon({ direction }: { direction: BehavioralTrend['direction'] }) {
  switch (direction) {
    case 'rising':
      return <TrendingUp className="h-3.5 w-3.5 text-green-400" />;
    case 'falling':
      return <TrendingDown className="h-3.5 w-3.5 text-red-400" />;
    case 'stable':
      return <Minus className="h-3.5 w-3.5 text-neutral-400" />;
  }
}

function Sparkline({ snapshots, category }: { snapshots: TimelineSnapshot[]; category: BehavioralCategory }) {
  const points = useMemo(() => {
    const values = snapshots
      .map((s) => s.categories[category])
      .filter((v): v is number => v !== undefined);

    if (values.length < 2) return null;

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 80;
    const height = 24;
    const step = width / (values.length - 1);

    return values
      .map((v, i) => {
        const x = i * step;
        const y = height - ((v - min) / range) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }, [snapshots, category]);

  if (!points) return <span className="text-[10px] text-neutral-600">—</span>;

  const color = CATEGORY_COLORS[category] ?? '#737373';

  return (
    <svg width={80} height={24} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.8}
      />
    </svg>
  );
}

export function BehavioralTimelineView({
  trends,
  correlations,
  snapshots,
  narrative,
}: BehavioralTimelineViewProps) {
  if (trends.length === 0 && correlations.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-sans flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Behavioral Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Narrative summary */}
        {narrative && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {narrative}
          </p>
        )}

        {/* Trends with sparklines */}
        <AnimatePresence mode="popLayout">
          {trends.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <p className="text-xs font-medium text-neutral-300">Trends</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {trends.map((trend) => (
                  <motion.div
                    key={trend.category}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/50 px-3 py-2"
                  >
                    <TrendIcon direction={trend.direction} />
                    <span className="text-xs text-neutral-300 min-w-[70px]">
                      {CATEGORY_LABELS[trend.category] ?? trend.category}
                    </span>
                    <Sparkline snapshots={snapshots} category={trend.category} />
                    <span
                      className={`text-xs font-mono ml-auto ${
                        trend.delta > 0
                          ? 'text-green-400'
                          : trend.delta < 0
                            ? 'text-red-400'
                            : 'text-neutral-500'
                      }`}
                    >
                      {trend.delta > 0 ? '+' : ''}
                      {(trend.delta * 100).toFixed(0)}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Correlations */}
        <AnimatePresence mode="popLayout">
          {correlations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <p className="text-xs font-medium text-neutral-300">Patterns</p>
              <div className="flex flex-wrap gap-2">
                {correlations.slice(0, 5).map((corr, i) => (
                  <motion.div
                    key={`${corr.category}-${corr.topic}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Badge
                      variant="outline"
                      className="py-1 text-[11px] gap-1"
                    >
                      {corr.effect === 'increase' ? (
                        <ArrowUpRight className="h-3 w-3 text-green-400" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-400" />
                      )}
                      {corr.description}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
