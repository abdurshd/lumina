'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { toast } from 'sonner';
import { useAssessmentStore } from '@/stores/assessment-store';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  StatusBadge,
  StageCardSkeleton,
  LoadingButton,
} from '@/components/shared';
import { AnimatedCounter } from '@/components/motion/animated-counter';
import {
  staggerContainer,
  staggerItem,
  smoothTransition,
  fadeInUp,
  reducedMotionVariants,
  snappySpring,
  popIn,
} from '@/lib/motion';
import {
  Plug,
  Brain,
  Video,
  FileText,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { LuminaIcon } from '@/components/icons/lumina-icon';
import Link from 'next/link';
import type { AssessmentStage, UserProfile } from '@/types';

const stages: {
  key: AssessmentStage;
  label: string;
  description: string;
  icon: typeof Plug;
  href: string;
}[] = [
  {
    key: 'connections',
    label: 'Data Connections',
    description: 'Connect your digital footprint sources',
    icon: Plug,
    href: '/connections',
  },
  {
    key: 'quiz',
    label: 'Talent Quiz',
    description: 'AI-adaptive assessment of your skills and interests',
    icon: Brain,
    href: '/quiz',
  },
  {
    key: 'session',
    label: 'Live Session',
    description: 'Video conversation with your AI career counselor',
    icon: Video,
    href: '/session',
  },
  {
    key: 'report',
    label: 'Talent Report',
    description: 'Your comprehensive talent discovery report',
    icon: FileText,
    href: '/report',
  },
];

interface PreCompletionDashboardProps {
  profile: UserProfile;
  loading: boolean;
}

export function PreCompletionDashboard({ profile, loading }: PreCompletionDashboardProps) {
  const { resetForRetake } = useAssessmentStore();
  const [isRetaking, setIsRetaking] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const completedCount = Object.values(profile.stages).filter(
    (s) => s === 'completed'
  ).length;

  const allCompleted = completedCount === 4;

  const handleRetake = useCallback(async () => {
    setIsRetaking(true);
    try {
      await resetForRetake();
      toast.success(
        'Assessment reset! You can now retake the quiz and session.'
      );
    } catch {
      toast.error('Failed to reset assessment.');
    } finally {
      setIsRetaking(false);
    }
  }, [resetForRetake]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <motion.div
        className="mb-8"
        initial="hidden"
        animate="visible"
        variants={shouldReduceMotion ? reducedMotionVariants : fadeInUp}
      >
        <div className="flex items-center gap-3 mb-2">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border-2 border-primary/20"
            initial={shouldReduceMotion ? false : { scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <LuminaIcon className="h-5 w-5 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-bold">
            Welcome back
            {profile.displayName
              ? `, ${profile.displayName.split(' ')[0]}`
              : ''}
          </h1>
        </div>
        <p className="text-muted-foreground ml-[52px]">
          Complete all four stages to unlock your personalized talent report.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-4 flex-1 rounded-full bg-overlay-light overflow-hidden">
            <motion.div
              className="h-4 rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / 4) * 100}%` }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 200, damping: 25 }
              }
            />
          </div>
          <span className="text-sm font-bold text-muted-foreground font-mono">
            <AnimatedCounter value={completedCount} />
            /4
          </span>
          {allCompleted && (
            <motion.div
              initial={shouldReduceMotion ? false : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              variants={popIn}
            >
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div
        className="space-y-4"
        initial="hidden"
        animate="visible"
        variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StageCardSkeleton key={i} />
            ))
          : stages.map((stage) => {
              const status = profile.stages[stage.key] ?? 'locked';
              const isActive = status === 'active';
              const isCompleted = status === 'completed';
              const isLocked = status === 'locked';
              const Icon = stage.icon;

              return (
                <motion.div
                  key={stage.key}
                  variants={
                    shouldReduceMotion ? reducedMotionVariants : staggerItem
                  }
                  whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                  whileTap={
                    shouldReduceMotion || !isLocked
                      ? undefined
                      : { x: [0, -3, 3, -3, 0] }
                  }
                  transition={smoothTransition}
                >
                  <Card
                    className={`transition-colors duration-200 ${
                      isActive
                        ? 'border-primary/30 bg-primary/[0.03]'
                        : isCompleted
                          ? 'border-primary/20'
                          : 'opacity-50'
                    }`}
                  >
                    <CardHeader className="flex flex-row items-center gap-4 py-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors border-2 ${
                          isActive
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : isCompleted
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-overlay-subtle text-muted-foreground border-overlay-light'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg font-sans">
                            {stage.label}
                          </CardTitle>
                          <StatusBadge status={status} />
                        </div>
                        <CardDescription>{stage.description}</CardDescription>
                      </div>
                      {(isActive || isCompleted) && (
                        <Link href={stage.href}>
                          <motion.div
                            whileHover={
                              shouldReduceMotion ? undefined : { scale: 1.05 }
                            }
                            whileTap={
                              shouldReduceMotion ? undefined : { scale: 0.95 }
                            }
                          >
                            <Button
                              variant={isActive ? 'default' : 'outline'}
                              size="sm"
                            >
                              {isActive ? 'Start' : 'Review'}
                              <motion.span
                                className="ml-1 inline-block"
                                whileHover={
                                  shouldReduceMotion ? undefined : { x: 3 }
                                }
                                transition={snappySpring}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </motion.span>
                            </Button>
                          </motion.div>
                        </Link>
                      )}
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
      </motion.div>

      <AnimatePresence>
        {allCompleted && (
          <motion.div
            className="mt-8"
            initial={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }
            }
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.01 }
                : { type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }
            }
          >
            <Card className="border-primary/20">
              <CardHeader className="flex flex-row items-center gap-4 py-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border-2 border-primary/20">
                  <RotateCcw className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-sans">
                    Retake Assessment
                  </CardTitle>
                  <CardDescription>
                    Reset quiz, session, and report to generate a fresh talent
                    analysis. Your data connections will be preserved.
                  </CardDescription>
                </div>
                <LoadingButton
                  variant="outline"
                  onClick={handleRetake}
                  loading={isRetaking}
                  loadingText="Resetting..."
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake
                </LoadingButton>
              </CardHeader>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
