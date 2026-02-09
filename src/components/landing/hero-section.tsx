"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedText } from "@/components/motion/animated-text";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { fadeInUp } from "@/lib/motion";
import { LuminaIcon } from "@/components/icons/lumina-icon";

export function HeroSection() {
  const scrollToHowItWorks = () => {
    const element = document.getElementById("how-it-works");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="discovery" className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Powered by Gemini AI badge */}
        <ScrollReveal variants={fadeInUp} className="mb-8" transition={{ delay: 0 }}>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border-2 border-primary/20 px-5 py-2 text-sm font-bold text-primary uppercase tracking-wide">
            <LuminaIcon className="h-4 w-4" /> Powered by Gemini AI
          </div>
        </ScrollReveal>

        {/* Title */}
        <div className="mb-6 max-w-5xl mx-auto">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.1]">
            <span className="block sm:inline">
              <AnimatedText text="Discover talents you " />
            </span>
            <span className="text-gradient-gold block sm:inline">
              <AnimatedText text="never knew" />
            </span>
            <span className="block sm:inline">
              <AnimatedText text=" you had" />
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <ScrollReveal
          variants={fadeInUp}
          className="max-w-2xl mx-auto mb-10"
          transition={{ delay: 0.2 }}
        >
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Lumina uses AI to analyze your digital footprint, conduct a live
            video interview, and illuminate your hidden career potential.
          </p>
        </ScrollReveal>

        {/* CTA Buttons */}
        <ScrollReveal
          variants={fadeInUp}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          transition={{ delay: 0.4 }}
        >
          <Link href="/login">
            <Button
              size="lg"
              className="h-14 px-8 text-lg gap-2 btn-3d-primary rounded-2xl w-full sm:w-auto"
            >
              Start Your Discovery <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-8 text-lg btn-3d-outline rounded-2xl w-full sm:w-auto bg-transparent backdrop-blur-sm hover:bg-white/5"
            onClick={scrollToHowItWorks}
          >
            See How It Works
          </Button>
        </ScrollReveal>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{
          opacity: { delay: 2, duration: 1 },
          y: { repeat: Infinity, duration: 2, ease: "easeInOut", delay: 2 },
        }}
      >
        <ChevronDown className="h-8 w-8 text-muted-foreground/50" />
      </motion.div>
    </section>
  );
}
