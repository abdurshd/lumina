'use client';

import { memo, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import type { RadarDimension } from '@/types';

interface TalentRadarChartProps {
  dimensions: RadarDimension[];
}

export const TalentRadarChart = memo(function TalentRadarChart({ dimensions }: TalentRadarChartProps) {
  const data = useMemo(() => dimensions.map((d) => ({
    subject: d.label,
    value: d.value,
    fullMark: 100,
  })), [dimensions]);

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#a3a3a3', fontSize: 12 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Talent"
            dataKey="value"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
});
