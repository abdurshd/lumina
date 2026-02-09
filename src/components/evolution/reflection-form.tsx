'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeInUp, reducedMotionVariants } from '@/lib/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Send } from 'lucide-react';
import type { MicroChallenge } from '@/types';

interface ReflectionFormProps {
  onSubmit: (content: string, challengeId?: string) => void;
  isSubmitting: boolean;
  challenges?: MicroChallenge[];
}

export function ReflectionForm({ onSubmit, isSubmitting, challenges }: ReflectionFormProps) {
  const shouldReduceMotion = useReducedMotion();
  const [content, setContent] = useState('');
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>('');

  const completedChallenges = challenges?.filter((c) => c.status === 'completed') ?? [];

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim(), selectedChallengeId || undefined);
    setContent('');
    setSelectedChallengeId('');
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={shouldReduceMotion ? reducedMotionVariants : fadeInUp}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-sans">
            <MessageSquare className="h-5 w-5 text-primary" />
            Add a Reflection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, observations, or insights about your growth journey..."
              className="w-full rounded-xl border-2 border-overlay-light bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none min-h-[120px]"
              disabled={isSubmitting}
            />

            {completedChallenges.length > 0 && (
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1.5 block">
                  Link to a challenge (optional)
                </label>
                <select
                  value={selectedChallengeId}
                  onChange={(e) => setSelectedChallengeId(e.target.value)}
                  className="w-full rounded-xl border-2 border-overlay-light bg-card px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none appearance-none cursor-pointer"
                  disabled={isSubmitting}
                >
                  <option value="">No linked challenge</option>
                  {completedChallenges.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Reflections help Lumina understand your growth and refine your profile.
              </p>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
              >
                <Send className="h-3.5 w-3.5" />
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
