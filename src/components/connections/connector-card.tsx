"use client";

import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingButton } from "@/components/shared/loading-button";
import { AnimatedCounter } from "@/components/motion/animated-counter";
import { CheckCircle2 } from "lucide-react";
import { smoothTransition, snappySpring } from "@/lib/motion";
import type { ReactNode } from "react";

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
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      layout={!shouldReduceMotion}
      whileHover={shouldReduceMotion ? undefined : { y: -3 }}
      transition={smoothTransition}
    >
      <Card
        className={`transition-colors duration-300 ${isConnected ? "border-primary/30 bg-primary/[0.03]" : "hover:border-overlay-strong"}`}
      >
        <CardHeader className="flex flex-row items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border-2 border-primary/20">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-sans">{title}</CardTitle>
              {isConnected && (
                <motion.span
                  initial={
                    shouldReduceMotion ? false : { scale: 0, opacity: 0 }
                  }
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                  <Badge>
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Connected
                  </Badge>
                </motion.span>
              )}
            </div>
            <CardDescription>{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <motion.p
              className="text-sm text-muted-foreground font-medium"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={smoothTransition}
            >
              ~<AnimatedCounter value={tokenCount ?? 0} /> tokens of data
              collected
            </motion.p>
          ) : disabled ? (
            <p className="text-sm text-muted-foreground italic">
              {disabledReason}
            </p>
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
    </motion.div>
  );
});
