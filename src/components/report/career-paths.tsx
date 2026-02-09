'use client';

import { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, ThumbsUp, ThumbsDown, Info } from 'lucide-react';
import type { CareerPath, CareerRecommendation } from '@/types';

interface CareerPathsProps {
  paths: CareerPath[];
  recommendations?: CareerRecommendation[];
  onFeedback?: (pathTitle: string, feedback: 'agree' | 'disagree', reason?: string) => void;
}

export const CareerPaths = memo(function CareerPaths({ paths, recommendations, onFeedback }: CareerPathsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, 'agree' | 'disagree'>>({});
  const [feedbackReason, setFeedbackReason] = useState('');
  const [showReasonFor, setShowReasonFor] = useState<number | null>(null);

  const handleFeedback = (index: number, type: 'agree' | 'disagree') => {
    if (type === 'disagree') {
      setShowReasonFor(index);
    } else {
      setFeedbackGiven((prev) => ({ ...prev, [index]: type }));
      onFeedback?.(paths[index].title, type);
    }
  };

  const submitDisagree = (index: number) => {
    setFeedbackGiven((prev) => ({ ...prev, [index]: 'disagree' }));
    onFeedback?.(paths[index].title, 'disagree', feedbackReason || undefined);
    setShowReasonFor(null);
    setFeedbackReason('');
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Recommendations (when available) */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-4 mb-6">
          {recommendations.map((rec, i) => (
            <Card key={`rec-${i}`} className="overflow-hidden animate-fade-in-up border-primary/20" style={{ animationDelay: `${i * 80}ms` }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <CardTitle className="text-lg font-sans">{rec.clusterId}</CardTitle>
                    <Badge variant="outline" className="font-mono text-xs">{rec.matchScore}% match</Badge>
                    <span className="text-xs text-muted-foreground font-mono">{rec.confidence}% conf</span>
                  </div>
                </div>
                <Progress value={rec.matchScore} className="h-3" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
                  <p className="text-sm"><span className="font-bold text-primary">Why you: </span>{rec.whyYou}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">What you&apos;d do:</p>
                  <p className="text-sm text-muted-foreground">{rec.whatYouDo}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">How to test cheaply:</p>
                  <p className="text-sm text-muted-foreground">{rec.howToTest}</p>
                </div>
                {rec.skillsToBuild.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Skills to build:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.skillsToBuild.map((skill, j) => (
                        <Badge key={j} variant="secondary" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {rec.evidenceChain.length > 0 && (
                  <div className="mt-2 space-y-1 pl-3 border-l-2 border-primary/20">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Evidence:</p>
                    {rec.evidenceChain.map((ev, j) => (
                      <p key={j} className="text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-[10px] mr-1 py-0">{ev.type}</Badge>
                        {ev.excerpt}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Standard Career Paths */}
      {paths.map((path, i) => (
        <Card key={i} className="overflow-hidden animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <CardTitle className="text-lg font-sans">{path.title}</CardTitle>
                {path.riasecCodes && (
                  <Badge variant="outline" className="font-mono text-xs">
                    {path.riasecCodes}
                  </Badge>
                )}
                {path.onetCluster && (
                  <Badge variant="secondary" className="text-xs">
                    {path.onetCluster}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {path.confidence != null && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {path.confidence}% conf
                  </span>
                )}
                <Badge variant={path.match >= 85 ? 'default' : 'secondary'}>
                  {path.match}% match
                </Badge>
              </div>
            </div>
            <Progress value={path.match} className="h-3" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">{path.description}</p>

            {path.whyYou && (
              <div className="mb-3 rounded-lg bg-primary/5 border border-primary/10 p-3">
                <p className="text-sm">
                  <span className="font-bold text-primary">Why you: </span>
                  {path.whyYou}
                </p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Next steps:</p>
              {path.nextSteps.map((step, j) => (
                <div key={j} className="flex items-start gap-2 text-sm">
                  <ChevronRight className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* Evidence expandable section */}
            {path.evidenceSources && path.evidenceSources.length > 0 && (
              <div className="mt-3">
                <button
                  onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Info className="h-3 w-3" />
                  Why am I seeing this?
                  {expandedIndex === i ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
                {expandedIndex === i && (
                  <div className="mt-2 space-y-1 pl-4 border-l-2 border-primary/20">
                    {path.evidenceSources.map((src, j) => (
                      <p key={j} className="text-xs text-muted-foreground">{src}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Feedback buttons */}
            {onFeedback && (
              <div className="mt-3 flex items-center gap-2">
                {feedbackGiven[i] ? (
                  <span className="text-xs text-muted-foreground">
                    {feedbackGiven[i] === 'agree' ? 'Thanks for your feedback!' : 'We\'ll refine this recommendation.'}
                  </span>
                ) : showReasonFor === i ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={feedbackReason}
                      onChange={(e) => setFeedbackReason(e.target.value)}
                      placeholder="Why does this not fit? (optional)"
                      className="flex-1 rounded-md border bg-transparent px-2 py-1 text-xs"
                    />
                    <Button size="sm" variant="outline" onClick={() => submitDisagree(i)}>
                      Submit
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleFeedback(i, 'agree')}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" /> Good match
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleFeedback(i, 'disagree')}
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" /> Not for me
                    </Button>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
});
