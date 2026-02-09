'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function QuizMockup() {
    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="glass p-8 relative overflow-hidden">
                {/* Progress Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="flex-1">
                        <div className="flex justify-between text-xs uppercase tracking-wider text-muted-foreground mb-2">
                            <span>Module 1: Interests</span>
                            <span>Question 3/8</span>
                        </div>
                        <div className="progress-duo">
                            <div className="progress-duo-fill" style={{ width: '37%' }} />
                        </div>
                    </div>
                </div>

                {/* Question */}
                <h3 className="text-xl sm:text-2xl font-bold mb-6 leading-tight">
                    When solving a complex problem, which approach feels most natural to you?
                </h3>

                {/* Options */}
                <div className="space-y-3 mb-8">
                    {[
                        "I break it down into logical steps and analyze data.",
                        "I look for creative, unconventional solutions others missed.",
                        "I discuss it with a team to get diverse perspectives.",
                        "I jump in and start experimenting with hands-on trials."
                    ].map((option, i) => (
                        <motion.div
                            key={i}
                            className={cn(
                                "option-card flex items-center gap-3",
                                i === 1 ? "selected" : ""
                            )}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <div className={cn(
                                "h-6 w-6 rounded-full border-2 flex items-center justify-center shrink-0",
                                i === 1 ? "border-primary bg-primary text-white" : "border-muted-foreground/30"
                            )}>
                                {i === 1 && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                            </div>
                            <span className="text-sm sm:text-base font-medium">{option}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Footer */}
                <div className="flex justify-end">
                    <Button size="lg" className="w-full sm:w-auto px-8">
                        Continue
                    </Button>
                </div>

                {/* Decorative Overlay for "Mockup" feel */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent pointer-events-none" />
            </div>
        </div>
    );
}
