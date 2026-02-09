import type { Variants, Transition } from 'framer-motion';

// --- Transitions ---

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const smoothTransition: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 25,
};

export const gentleSpring: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

// --- Variants ---

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: smoothTransition },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: smoothTransition },
  exit: { opacity: 0, x: 30, transition: { duration: 0.2 } },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: smoothTransition,
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothTransition,
  },
};

export const shake: Variants = {
  hidden: { opacity: 0, x: 0 },
  visible: {
    opacity: 1,
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
};

// --- Hover / Tap presets (use spread syntax) ---

export const scaleOnHover = {
  whileHover: { scale: 1.02, y: -1 },
  whileTap: { scale: 0.98 },
  transition: springTransition,
};

export const tapScale = {
  whileTap: { scale: 0.95 },
  transition: springTransition,
};

export const hoverLift = {
  whileHover: { y: -3 },
  transition: smoothTransition,
};

export const hoverNudge = {
  whileHover: { x: 4 },
  transition: smoothTransition,
};

// --- Reduced motion helper ---

export const reducedMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.01 } },
};
