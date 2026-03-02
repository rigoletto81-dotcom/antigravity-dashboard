"use client";

import { motion } from "framer-motion";
import { getVerdictInfo, getVerdict } from "@/hooks/useInvestmentScoring";

interface ScoreOrbProps {
    score: number;
}

export function ScoreOrb({ score }: ScoreOrbProps) {
    const verdict = getVerdict(score);
    const info = getVerdictInfo(verdict);

    return (
        <motion.div
            className="flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
        >
            {/* Outer glow ring */}
            <div className="relative">
                {/* Rotating glow ring */}
                <motion.div
                    className="absolute inset-[-12px] rounded-full opacity-30"
                    style={{
                        background: `conic-gradient(from 0deg, transparent, ${info.color}, transparent, ${info.color}, transparent)`,
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                />

                {/* Pulsing glow backdrop */}
                <motion.div
                    className="absolute inset-[-8px] rounded-full blur-xl"
                    style={{ backgroundColor: info.glowColor }}
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                        scale: [0.95, 1.05, 0.95],
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Main orb */}
                <motion.div
                    className="relative w-44 h-44 rounded-full flex flex-col items-center justify-center"
                    style={{
                        background: `radial-gradient(circle at 30% 30%, ${info.bgColor}, rgba(10,10,26,0.9))`,
                        border: `2px solid ${info.color}40`,
                        boxShadow: `0 0 40px ${info.glowColor}, inset 0 0 40px ${info.glowColor}`,
                    }}
                    animate={{
                        y: [0, -6, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    {/* Score number */}
                    <motion.span
                        key={Math.round(score)}
                        className="font-mono text-5xl font-black tabular-nums"
                        style={{
                            color: info.color,
                            textShadow: `0 0 20px ${info.glowColor}`,
                        }}
                        initial={{ scale: 1.15, opacity: 0.7 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    >
                        {Math.round(score)}
                    </motion.span>

                    {/* Label */}
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em] mt-1">
                        Final Score
                    </span>
                </motion.div>
            </div>

            {/* Verdict badge */}
            <motion.div
                key={verdict}
                className="px-5 py-2 rounded-full font-mono text-sm font-bold tracking-wider"
                style={{
                    backgroundColor: info.bgColor,
                    color: info.color,
                    border: `1px solid ${info.color}30`,
                    boxShadow: `0 0 15px ${info.glowColor}`,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
                {info.label}
            </motion.div>
        </motion.div>
    );
}
