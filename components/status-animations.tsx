"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { useEffect, useState } from "react"

export function SuccessAnimation({ message = "Payment Successful" }: { message?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center rounded-3xl bg-card p-12 shadow-2xl border border-border"
            >
                <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.1,
                        }}
                        className="absolute inset-0 rounded-full bg-green-500/20"
                    />
                    <svg className="h-12 w-12 text-green-600 dark:text-green-400" viewBox="0 0 50 50">
                        <motion.path
                            fill="none"
                            strokeWidth="4"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M 10 25 L 22 37 L 40 12" // Checkmark path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{
                                duration: 0.5,
                                ease: "easeInOut",
                                delay: 0.3,
                            }}
                        />
                    </svg>
                </div>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-2xl font-bold text-foreground"
                >
                    {message}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-2 text-muted-foreground"
                >
                    Redirecting you to your downloads...
                </motion.p>
            </motion.div>
        </div>
    )
}

export function FailureAnimation({ message = "Payment Failed" }: { message?: string }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="flex flex-col items-center rounded-3xl bg-card p-12 shadow-2xl border border-border"
            >
                <div className="relative mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 260,
                            damping: 20,
                            delay: 0.1,
                        }}
                        className="absolute inset-0 rounded-full bg-red-500/20"
                    />
                    <svg className="h-12 w-12 text-red-600 dark:text-red-400" viewBox="0 0 50 50">
                        <motion.path
                            fill="none"
                            strokeWidth="4"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M 12 12 L 38 38 M 38 12 L 12 38" // X path
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{
                                duration: 0.5,
                                ease: "easeInOut",
                                delay: 0.3,
                            }}
                        />
                    </svg>
                </div>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-2xl font-bold text-foreground"
                >
                    {message}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-2 text-muted-foreground"
                >
                    Please try again or contact support.
                </motion.p>
                <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="mt-6 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </motion.button>
            </motion.div>
        </div>
    )
}

export function CouponConfetti() {
    // Simple particle system for confetti
    const [particles, setParticles] = useState<number[]>([])

    useEffect(() => {
        // Generate particles
        setParticles(Array.from({ length: 50 }).map((_, i) => i))
    }, [])

    return (
        <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" style={{ minHeight: '100%' }}>
            {particles.map((i) => (
                <ConfettiParticle key={i} />
            ))}
        </div>
    )
}

function ConfettiParticle() {
    const [randoms] = useState(() => ({
        x: Math.random() * 100 - 50, // -50% to 50%
        y: Math.random() * -100 - 50, // -150% to -50%
        rotate: Math.random() * 360,
        color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)],
        delay: Math.random() * 0.2
    }))

    return (
        <motion.div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '8px',
                height: '8px',
                backgroundColor: randoms.color,
            }}
            initial={{
                x: 0,
                y: 0,
                opacity: 1,
                scale: 0
            }}
            animate={{
                x: `${randoms.x}vw`,
                y: `${randoms.y}vh`,
                opacity: 0,
                scale: 1,
                rotate: randoms.rotate
            }}
            transition={{
                duration: 2.5,
                ease: "easeOut",
                delay: randoms.delay
            }}
        />
    )
}
