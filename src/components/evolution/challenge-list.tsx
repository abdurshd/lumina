'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { staggerContainer, staggerItem, reducedMotionVariants } from '@/lib/motion';
import { ChallengeCard } from './challenge-card';
import type { MicroChallenge } from '@/types';

interface ChallengeListProps {
  challenges: MicroChallenge[];
  onAccept: (id: string) => void;
  onSkip: (id: string) => void;
  onComplete: (id: string, evidence: string) => void;
}

type TabId = 'suggested' | 'in_progress' | 'completed';

const tabs: { id: TabId; label: string }[] = [
  { id: 'suggested', label: 'Suggested' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
];

export function ChallengeList({ challenges, onAccept, onSkip, onComplete }: ChallengeListProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<TabId>('suggested');

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 'suggested':
        return challenges.filter((c) => c.status === 'suggested');
      case 'in_progress':
        return challenges.filter((c) => c.status === 'accepted' || c.status === 'in_progress');
      case 'completed':
        return challenges.filter((c) => c.status === 'completed');
      default:
        return [];
    }
  }, [challenges, activeTab]);

  const counts = useMemo(() => ({
    suggested: challenges.filter((c) => c.status === 'suggested').length,
    in_progress: challenges.filter((c) => c.status === 'accepted' || c.status === 'in_progress').length,
    completed: challenges.filter((c) => c.status === 'completed').length,
  }), [challenges]);

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-overlay-subtle border-2 border-overlay-light w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2 text-sm font-bold rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-card text-foreground shadow-sm border-2 border-overlay-light'
                : 'text-muted-foreground hover:text-foreground border-2 border-transparent'
            }`}
          >
            {tab.label}
            {counts[tab.id] > 0 && (
              <span className={`ml-1.5 text-xs font-mono ${
                activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
              }`}>
                {counts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Challenge cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className="space-y-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={shouldReduceMotion ? reducedMotionVariants : staggerContainer}
        >
          {filtered.length === 0 ? (
            <motion.p
              className="text-center text-sm text-muted-foreground py-8"
              variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
            >
              {activeTab === 'suggested' && 'No suggested challenges right now. Generate new ones to keep growing.'}
              {activeTab === 'in_progress' && 'No challenges in progress. Accept a suggested challenge to get started.'}
              {activeTab === 'completed' && 'No completed challenges yet. Start with a suggested challenge.'}
            </motion.p>
          ) : (
            filtered.map((challenge) => (
              <motion.div
                key={challenge.id}
                variants={shouldReduceMotion ? reducedMotionVariants : staggerItem}
              >
                <ChallengeCard
                  challenge={challenge}
                  onAccept={activeTab === 'suggested' ? () => onAccept(challenge.id) : undefined}
                  onSkip={activeTab === 'suggested' ? () => onSkip(challenge.id) : undefined}
                  onComplete={activeTab === 'in_progress' ? (evidence) => onComplete(challenge.id, evidence) : undefined}
                />
              </motion.div>
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
