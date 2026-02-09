'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { getReportHistory } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, ChevronRight } from 'lucide-react';
import { ScrollReveal } from '@/components/motion/scroll-reveal';
import { staggerContainer, staggerItem, collapseExpand, reducedMotionVariants, snappySpring } from '@/lib/motion';
import type { TalentReport, QuizDimensionSummary } from '@/types';

interface ReportHistoryProps {
  uid: string;
}

interface HistoryEntry {
  report: TalentReport;
  timestamp: number;
  quizScores?: QuizDimensionSummary;
}

export function ReportHistory({ uid }: ReportHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    getReportHistory(uid).then((h) => {
      setHistory(h);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [uid]);

  if (loading || history.length <= 1) return null;

  return (
    <ScrollReveal>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans">
            <History className="h-5 w-5 text-primary" />
            Report History ({history.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
          >
            {history.map((entry, i) => (
              <motion.div
                key={entry.timestamp}
                className="rounded-lg border p-3"
                variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
              >
                <button
                  onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div>
                    <p className="text-sm font-medium">{entry.report.headline}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <motion.span
                    animate={{ rotate: expandedIndex === i ? 90 : 0 }}
                    transition={snappySpring}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {expandedIndex === i && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={shouldReduceMotion ? reducedMotionVariants : collapseExpand}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2">
                        <p className="text-sm text-muted-foreground">{entry.report.tagline}</p>
                        <div className="flex flex-wrap gap-1">
                          {entry.report.radarDimensions.map((dim, j) => (
                            <Badge key={j} variant="outline" className="text-xs">
                              {dim.label}: {dim.value}
                            </Badge>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-muted-foreground mb-1">Top Strengths:</p>
                          <div className="flex flex-wrap gap-1">
                            {entry.report.topStrengths.slice(0, 3).map((s, j) => (
                              <Badge key={j} variant="secondary" className="text-xs">
                                {s.name} ({s.score})
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </ScrollReveal>
  );
}
