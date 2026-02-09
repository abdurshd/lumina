'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp, reducedMotionVariants } from '@/lib/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { ProfileSnapshot } from '@/types';

interface DimensionTrendsProps {
  snapshots: ProfileSnapshot[];
}

const DIMENSION_COLORS: Record<string, string> = {
  Realistic: '#ef4444',
  Investigative: '#3b82f6',
  Artistic: '#a855f7',
  Social: '#f59e0b',
  Enterprising: '#10b981',
  Conventional: '#6366f1',
};

const FALLBACK_COLORS = [
  '#14b8a6',
  '#f97316',
  '#ec4899',
  '#8b5cf6',
  '#06b6d4',
  '#84cc16',
  '#e11d48',
  '#0ea5e9',
];

function formatDateShort(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

interface ChartDataPoint {
  date: string;
  timestamp: number;
  [dimension: string]: string | number;
}

export function DimensionTrends({ snapshots }: DimensionTrendsProps) {
  const shouldReduceMotion = useReducedMotion();

  const { chartData, dimensions } = useMemo(() => {
    const sorted = [...snapshots].sort((a, b) => a.timestamp - b.timestamp);

    const allDimensions = new Set<string>();
    sorted.forEach((s) => {
      Object.keys(s.dimensionScores).forEach((d) => allDimensions.add(d));
    });
    const dims = Array.from(allDimensions);

    const data: ChartDataPoint[] = sorted.map((s) => {
      const point: ChartDataPoint = {
        date: formatDateShort(s.timestamp),
        timestamp: s.timestamp,
      };
      dims.forEach((d) => {
        point[d] = s.dimensionScores[d] ?? 0;
      });
      return point;
    });

    return { chartData: data, dimensions: dims };
  }, [snapshots]);

  if (snapshots.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans">
            <TrendingUp className="h-5 w-5 text-primary" />
            Dimension Trends
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          At least two profile snapshots are needed to show trends. Keep exploring to see your growth.
        </CardContent>
      </Card>
    );
  }

  function getColor(dimension: string, index: number): string {
    return DIMENSION_COLORS[dimension] ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? reducedMotionVariants : fadeInUp}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans">
            <TrendingUp className="h-5 w-5 text-primary" />
            Dimension Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tickLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '2px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ fontWeight: 700 }}
                />
                {dimensions.map((dim, i) => (
                  <Line
                    key={dim}
                    type="monotone"
                    dataKey={dim}
                    stroke={getColor(dim, i)}
                    strokeWidth={2}
                    dot={{ r: 4, fill: getColor(dim, i) }}
                    activeDot={{ r: 6 }}
                    animationDuration={shouldReduceMotion ? 0 : 800}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-3 justify-center">
            {dimensions.map((dim, i) => (
              <div key={dim} className="flex items-center gap-1.5">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: getColor(dim, i) }}
                />
                <span className="text-xs text-muted-foreground font-medium">{dim}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
