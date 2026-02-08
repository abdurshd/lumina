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
    <Card className={isConnected ? 'border-green-500/30' : ''}>
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            {isConnected && (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
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
          <p className="text-sm text-muted-foreground">
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
