'use client';

import { useReducedMotion } from 'framer-motion';
import { TalentRadarChart } from '@/components/report/talent-radar-chart';
import { Badge } from '@/components/ui/badge';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { fadeInUp } from '@/lib/motion';
import type { RadarDimension } from '@/types';

interface TalentSummaryHeroProps {
  headline: string;
  tagline: string;
  riasecCode?: string;
  radarDimensions: RadarDimension[];
}

export function TalentSummaryHero({ headline, tagline, riasecCode, radarDimensions }: TalentSummaryHeroProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <ScrollReveal variants={shouldReduceMotion ? undefined : fadeInUp}>
      <div className="flex flex-col items-center text-center gap-6">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gradient-gold">
            {headline}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {tagline}
          </p>
          {riasecCode && (
            <Badge variant="secondary" className="text-sm">
              RIASEC: {riasecCode}
            </Badge>
          )}
        </div>
        {radarDimensions.length > 0 && (
          <div className="w-full max-w-sm">
            <TalentRadarChart dimensions={radarDimensions} />
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}
