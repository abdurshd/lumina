'use client';

import { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/shared/loading-button';
import { CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface ConnectorCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  isConnected: boolean;
  isLoading: boolean;
  onConnect: () => void;
  tokenCount?: number;
  disabled?: boolean;
  disabledReason?: string;
}

export const ConnectorCard = memo(function ConnectorCard({
  title,
  description,
  icon,
  isConnected,
  isLoading,
  onConnect,
  tokenCount,
  disabled,
  disabledReason,
}: ConnectorCardProps) {
  return (
    <Card className={`transition-all duration-300 ${isConnected ? 'border-primary/30 bg-primary/[0.03]' : 'hover:border-overlay-strong'}`}>
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border-2 border-primary/20">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-sans">{title}</CardTitle>
            {isConnected && (
              <Badge>
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Connected
              </Badge>
            )}
          </div>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <p className="text-sm text-muted-foreground font-medium">
            ~{tokenCount?.toLocaleString() ?? 0} tokens of data collected
          </p>
        ) : disabled ? (
          <p className="text-sm text-muted-foreground italic">{disabledReason}</p>
        ) : (
          <LoadingButton
            onClick={onConnect}
            loading={isLoading}
            loadingText={`Connecting ${title}...`}
            variant="outline"
            className="w-full"
          >
            Connect {title}
          </LoadingButton>
        )}
      </CardContent>
    </Card>
  );
});
