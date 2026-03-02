"use client";

import { motion } from "framer-motion";
import type { EngineWeights } from "@/hooks/useDynamicWeighting";

interface WeightRadialChartProps {
    weights: EngineWeights;
}

const ENGINE_META = [
    { key: "secular", label: "Secular", color: "#00FFD1" },
    { key: "regime", label: "Regime", color: "#A855F7" },
    { key: "tactical", label: "Tactical", color: "#3B82F6" },
    { key: "cycle", label: "Cycle", color: "#EAB308" },
] as const;

const SIZE = 160;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

export function WeightRadialChart({ weights }: WeightRadialChartProps) {
    // Convert weights to arc segments
    const total = Object.values(weights).reduce((s, w) => s + w, 0) || 100;
    let accumulated = 0;

    const segments = ENGINE_META.map((meta) => {
        const value = weights[meta.key as keyof EngineWeights] ?? 0;
        const fraction = value / total;
        const dashLength = fraction * CIRCUMFERENCE;
        const gap = CIRCUMFERENCE - dashLength;
        const offset = -(accumulated / total) * CIRCUMFERENCE + CIRCUMFERENCE * 0.25;
        accumulated += value;

        return {
            ...meta,
            value: Math.round(value),
            fraction,
            dashArray: `${dashLength} ${gap}`,
            dashOffset: offset,
        };
    });

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="relative" style={{ width: SIZE, height: SIZE }}>
                <svg
                    width={SIZE}
                    height={SIZE}
                    viewBox={`0 0 ${SIZE} ${SIZE}`}
                    className="transform -rotate-90"
                >
                    {/* Background ring */}
                    <circle
                        cx={CENTER}
                        cy={CENTER}
                        r={RADIUS}
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth={STROKE}
                    />
                    {/* Segments */}
                    {segments.map((seg) => (
                        <motion.circle
                            key={seg.key}
                            cx={CENTER}
                            cy={CENTER}
                            r={RADIUS}
                            fill="none"
                            stroke={seg.color}
                            strokeWidth={STROKE}
                            strokeLinecap="butt"
                            initial={false}
                            animate={{
                                strokeDasharray: seg.dashArray,
                                strokeDashoffset: seg.dashOffset,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 60,
                                damping: 20,
                            }}
                            style={{ opacity: 0.85 }}
                        />
                    ))}
                </svg>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider">
                        Weights
                    </span>
                </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                {segments.map((seg) => (
                    <div key={seg.key} className="flex items-center gap-1.5">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: seg.color }}
                        />
                        <span className="text-[10px] text-white/40">
                            {seg.label}
                        </span>
                        <motion.span
                            className="text-[10px] font-mono font-bold"
                            style={{ color: seg.color }}
                            key={seg.value}
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 1 }}
                        >
                            {seg.value}%
                        </motion.span>
                    </div>
                ))}
            </div>
        </div>
    );
}
