'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useMemo } from 'react';

interface Particle {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    image: string;
}

interface FloatingParticlesProps {
    count?: number;
    images?: string[]; // Array of image paths
    className?: string;
}

export function FloatingParticles({
    count = 5,
    images = ['/lumina-shard.png', '/lumina-spark.png', '/lumina-orb-blue.png'],
    className
}: FloatingParticlesProps) {
    const particles: Particle[] = useMemo(
        () =>
            Array.from({ length: count }).map((_, i) => {
                const xRand = pseudoRandom(i + 11, count);
                const yRand = pseudoRandom(i + 37, count);
                const sizeRand = pseudoRandom(i + 73, count);
                const durationRand = pseudoRandom(i + 109, count);
                const delayRand = pseudoRandom(i + 151, count);
                const imageRand = pseudoRandom(i + 197, count);

                return {
                    id: i,
                    x: xRand * 100, // percentage
                    y: yRand * 100, // percentage
                    size: sizeRand * 25 + 12, // px
                    duration: durationRand * 20 + 10, // seconds
                    delay: delayRand * 5,
                    image: images[Math.floor(imageRand * images.length) % images.length],
                };
            }),
        [count, images],
    );

    return (
        <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute opacity-30"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                    }}
                    animate={{
                        y: [0, -100, 0],
                        x: [0, 50, 0],
                        rotate: [0, 360],
                        opacity: [0.2, 0.5, 0.2],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: p.delay,
                    }}
                >
                    <Image
                        src={p.image}
                        alt="particle"
                        width={60}
                        height={60}
                        className="w-full h-full object-contain"
                    />
                </motion.div>
            ))}
        </div>
    );
}

function pseudoRandom(seed: number, salt: number): number {
    const value = Math.sin(seed * 12.9898 + salt * 78.233) * 43758.5453;
    return value - Math.floor(value);
}
