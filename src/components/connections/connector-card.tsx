'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

interface ConnectorCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  isConnected: boolean;
  isLoading: boolean;
  onConnect: () => void;
  tokenCount?: number;
}

export function ConnectorCard({
  title,
  description,
  icon,
  isConnected,
  isLoading,
  onConnect,
  tokenCount,
}: ConnectorCardProps) {
  return (
    <Card className={isConnected ? 'border-green-500/30' : ''}>
      <CardHeader className="flex flex-row items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{title}</CardTitle>
            {isConnected && (
              <Badge variant="default" className="bg-green-600">
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
        ) : (
          <Button
            onClick={onConnect}
            disabled={isLoading}
            variant="outline"
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              `Connect ${title}`
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
