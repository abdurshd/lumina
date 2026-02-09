'use client';

import { memo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star } from 'lucide-react';
import { smoothTransition } from '@/lib/motion';

interface SatisfactionSurveyProps {
  onSubmit: (rating: number, comment?: string) => void;
}

export const SatisfactionSurvey = memo(function SatisfactionSurvey({ onSubmit }: SatisfactionSurveyProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, comment.trim() || undefined);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Thanks for your feedback!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-sans">How accurate was your report?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
            {[1, 2, 3, 4, 5].map((value) => (
              <motion.button
                key={value}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoveredRating(value)}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.85 }}
                transition={smoothTransition}
                className="p-1"
              >
                <Star
                  className={`h-6 w-6 transition-colors ${
                    value <= (hoveredRating || rating)
                      ? 'fill-primary text-primary'
                      : 'text-muted-foreground/30'
                  }`}
                />
              </motion.button>
            ))}
            {rating > 0 && (
              <span className="text-xs text-muted-foreground ml-2">
                {rating === 1 ? 'Not accurate' : rating === 2 ? 'Somewhat off' : rating === 3 ? 'Decent' : rating === 4 ? 'Accurate' : 'Very accurate'}
              </span>
            )}
          </div>

          {rating > 0 && (
            <motion.div
              className="space-y-2"
              initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={smoothTransition}
            >
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any additional thoughts? (optional)"
                className="text-sm"
              />
              <Button size="sm" onClick={handleSubmit}>
                Submit Feedback
              </Button>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
