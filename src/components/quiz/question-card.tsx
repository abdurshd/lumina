'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
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
    <Card className="w-full max-w-2xl mx-auto glass animate-fade-in-up">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="bg-white/[0.06]">{question.category}</Badge>
          <span className="text-sm text-muted-foreground font-mono">
            {questionNumber} of {totalQuestions}
          </span>
        </div>
        <CardTitle className="text-xl">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {question.type === 'multiple_choice' && question.options && (
          <div className="space-y-2">
            {question.options.map((option, i) => (
              <Button
                key={i}
                variant={selectedOption === option ? 'default' : 'outline'}
                className={`w-full justify-start text-left h-auto py-3 px-4 transition-all duration-200 ${
                  selectedOption === option ? '' : 'hover:bg-white/[0.06]'
                }`}
                onClick={() => setSelectedOption(option)}
              >
                <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-full border border-white/[0.15] text-xs font-mono">
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </Button>
            ))}
          </div>
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
              <span className="font-medium text-foreground font-mono">{sliderValue}</span>
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

        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
          {questionNumber === totalQuestions ? 'Finish Quiz' : 'Next Question'}
        </Button>
      </CardContent>
    </Card>
  );
}
