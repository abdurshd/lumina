"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { LuminaIcon } from "@/components/icons/lumina-icon";

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const scrollYSpring = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax transforms
  const textY = useTransform(scrollYSpring, [0, 1], ["0%", "50%"]);
  const backgroundY = useTransform(scrollYSpring, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYSpring, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYSpring, [0, 1], [1, 1.1]);

  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="discovery"
      ref={containerRef}
      className="relative min-h-[92svh] w-full flex items-center justify-center overflow-hidden bg-background pt-24 pb-16"
    >
      {/* Immersive Background */}
      <motion.div
        style={{ y: backgroundY, scale }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06]" style={{
          backgroundImage: `radial-gradient(var(--primary) 1px, transparent 1px)`,
          backgroundSize: '44px 44px'
        }} />
      </motion.div>

      {/* Content Overlay */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 container mx-auto px-6"
      >
        {/* Powered by Gemini AI badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground">
            <LuminaIcon className="h-4 w-4 text-primary" /> Gemini-powered career discovery
          </div>
        </motion.div>

        {/* Title */}
        <div className="mb-6 max-w-5xl">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground leading-[0.98] perspective-1000">
            <span className="block mb-2">
              Find the work
            </span>
            <span className="text-primary block">
              that fits how you
            </span>
            <span className="text-primary block">
              think.
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="max-w-2xl mb-12"
        >
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Lumina combines your data, an adaptive assessment, and a guided AI session into one clear career profile.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-start gap-4"
        >
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto min-w-[208px]">
              Start assessment
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto min-w-[208px]"
            onClick={scrollToHowItWorks}
          >
            See the method
          </Button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="text-xs text-muted-foreground/70 font-medium">How it works</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5 text-primary/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}
