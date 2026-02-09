'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import type { EvidenceSource } from '@/types';

interface EvidenceDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  evidenceSources: EvidenceSource[];
  confidenceLevel?: 'high' | 'medium' | 'low';
}

export function EvidenceDrawer({ open, onOpenChange, title, evidenceSources, confidenceLevel }: EvidenceDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-sans">Why &quot;{title}&quot;?</SheetTitle>
          <SheetDescription>
            Here&apos;s the evidence chain that led to this finding.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {confidenceLevel && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <Badge variant={confidenceLevel === 'high' ? 'default' : confidenceLevel === 'medium' ? 'secondary' : 'outline'}>
                {confidenceLevel}
              </Badge>
            </div>
          )}
          <div className="space-y-3">
            {evidenceSources.map((evidence, i) => (
              <div key={i} className="rounded-lg border-2 border-overlay-light p-3">
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                  {evidence.source}
                </p>
                <p className="text-sm text-muted-foreground">{evidence.excerpt}</p>
              </div>
            ))}
          </div>
          {evidenceSources.length === 0 && (
            <p className="text-sm text-muted-foreground">No detailed evidence available for this finding.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
