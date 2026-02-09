"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { AnimatedText } from "@/components/motion/animated-text";
import { FloatingParticles } from "@/components/landing/floating-particles";
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
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Immersive Background */}
      <motion.div
        style={{ y: backgroundY, scale }}
        className="absolute inset-0 z-0"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_70%)]" />

        {/* Futuristic Grid/Neural Map Placeholder */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(var(--primary) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        <FloatingParticles count={6} className="opacity-30" />

        {/* Subtle Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse-glow" />
      </motion.div>

      {/* Content Overlay */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 container mx-auto px-6 text-center"
      >
        {/* Powered by Gemini AI badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass-premium px-6 py-2 text-xs font-bold text-primary uppercase tracking-[0.2em]">
            <LuminaIcon className="h-4 w-4" /> Powered by Gemini AI
          </div>
        </motion.div>

        {/* Title */}
        <div className="mb-6 max-w-5xl mx-auto">
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground leading-[0.9] perspective-1000">
            <span className="block mb-2">
              <AnimatedText text="Illuminate your " />
            </span>
            <span className="text-primary text-glow block">
              <AnimatedText text="hidden talent" />
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <p className="text-xl sm:text-2xl text-muted-foreground font-light leading-relaxed tracking-wide">
            Next-generation AI discovery platform that bridges the gap between who you are and
            who you <span className="text-white font-medium">could become</span>.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <Link href="/login" className="w-full sm:w-auto">
            <button className="btn-premium w-full sm:w-auto min-w-[240px]">
              Start Discovery Journey
            </button>
          </Link>
          <button
            className="btn-premium-outline w-full sm:w-auto min-w-[240px] glass-premium"
            onClick={scrollToHowItWorks}
          >
            Explore Methodology
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 font-medium">Discover More</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <ChevronDown className="h-6 w-6 text-primary/60" />
        </motion.div>
      </motion.div>

      {/* Decorative side accents */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
    </section>
  );
}
