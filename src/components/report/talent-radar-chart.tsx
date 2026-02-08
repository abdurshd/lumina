'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import type { RadarDimension } from '@/types';

interface TalentRadarChartProps {
  dimensions: RadarDimension[];
}

export function TalentRadarChart({ dimensions }: TalentRadarChartProps) {
  const data = dimensions.map((d) => ({
    subject: d.label,
    value: d.value,
    fullMark: 100,
  }));

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Talent"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
