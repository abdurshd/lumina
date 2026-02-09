'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { staggerContainer, staggerItem, smoothTransition, springTransition, snappySpring } from '@/lib/motion';
import type { QuizQuestion } from '@/types';

interface QuestionCardProps {
  question: QuizQuestion;
  onAnswer: (answer: string | number) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function QuestionCard({ question, onAnswer, questionNumber, totalQuestions }: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [sliderValue, setSliderValue] = useState<number>(50);
  const [textValue, setTextValue] = useState('');
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = () => {
    if (question.type === 'multiple_choice' && selectedOption) {
      onAnswer(selectedOption);
    } else if (question.type === 'slider') {
      onAnswer(sliderValue);
    } else if (question.type === 'freetext' && textValue.trim()) {
      onAnswer(textValue.trim());
    }
  };

  const canSubmit =
    (question.type === 'multiple_choice' && selectedOption !== null) ||
    question.type === 'slider' ||
    (question.type === 'freetext' && textValue.trim().length > 0);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.question}
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -50 }}
        transition={smoothTransition}
      >
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between mb-3">
              <Badge variant="secondary">{question.category}</Badge>
              <span className="text-sm text-muted-foreground font-mono font-bold">
                {questionNumber} of {totalQuestions}
              </span>
            </div>
            <CardTitle className="text-xl">{question.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {question.type === 'multiple_choice' && question.options && (
              <motion.div
                className="space-y-2"
                variants={prefersReducedMotion ? undefined : staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {question.options.map((option, i) => {
                  const isSelected = selectedOption === option;
                  return (
                    <motion.button
                      key={i}
                      type="button"
                      className={cn(
                        'option-card w-full flex items-center text-left',
                        isSelected && 'selected'
                      )}
                      onClick={() => setSelectedOption(option)}
                      variants={prefersReducedMotion ? undefined : staggerItem}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
                      transition={springTransition}
                    >
                      <motion.span
                        className={cn(
                          'mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold font-mono',
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-overlay-strong text-muted-foreground'
                        )}
                        animate={
                          isSelected && !prefersReducedMotion
                            ? { scale: 1.1 }
                            : { scale: 1 }
                        }
                        transition={snappySpring}
                      >
                        {String.fromCharCode(65 + i)}
                      </motion.span>
                      <span className="font-medium text-sm">{option}</span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            {question.type === 'slider' && (
              <div className="space-y-4 py-4">
                <Slider
                  value={[sliderValue]}
                  onValueChange={([v]) => setSliderValue(v)}
                  min={question.sliderMin ?? 0}
                  max={question.sliderMax ?? 100}
                  step={1}
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{question.sliderLabels?.min ?? 'Low'}</span>
                  <span className="font-bold text-foreground font-mono">{sliderValue}</span>
                  <span>{question.sliderLabels?.max ?? 'High'}</span>
                </div>
              </div>
            )}

            {question.type === 'freetext' && (
              <Textarea
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                placeholder="Type your answer here..."
                rows={4}
              />
            )}

            <motion.div
              whileHover={prefersReducedMotion ? undefined : { scale: 1.01 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
              transition={smoothTransition}
            >
              <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
                {questionNumber === totalQuestions ? 'Finish Quiz' : 'Next Question'}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
