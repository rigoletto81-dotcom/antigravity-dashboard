"use client";

import { motion } from "framer-motion";
import { InvestorSlider } from "./InvestorSlider";
import type { Engine } from "@/hooks/useInvestmentScoring";

interface EngineCardProps {
    engine: Engine;
    scores: Record<string, number>;
    engineScore: number;
    onScoreChange: (id: string, value: number) => void;
    index: number;
}

const ENGINE_ICONS: Record<string, string> = {
    secular: "🏛️",
    regime: "📊",
    tactical: "🎯",
    cycle: "⚠️",
};

export function EngineCard({
    engine,
    scores,
    engineScore,
    onScoreChange,
    index,
}: EngineCardProps) {
    return (
        <motion.div
            className="glass-card p-5 flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                    <span className="text-xl">{ENGINE_ICONS[engine.id] || "⚡"}</span>
                    <div>
                        <h3 className="text-sm font-semibold text-white/90">
                            {engine.name}
                        </h3>
                        <p className="text-[11px] text-white/30">{engine.subtitle}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
                        Weight
                    </span>
                    <span className="font-mono text-sm font-bold glow-teal">
                        {engine.totalWeight}%
                    </span>
                </div>
            </div>

            {/* Engine sub-score bar */}
            <div className="relative h-1 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{
                        background:
                            "linear-gradient(90deg, #00FFD1, #22D3EE)",
                    }}
                    initial={{ width: "50%" }}
                    animate={{ width: `${engineScore}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-white/20">
                <span>0</span>
                <span className="text-white/50">
                    Engine Avg: {Math.round(engineScore)}
                </span>
                <span>100</span>
            </div>

            {/* Investors */}
            <div className="flex flex-col divide-y divide-white/[0.04]">
                {engine.investors.map((investor) => (
                    <InvestorSlider
                        key={investor.id}
                        investor={investor}
                        score={scores[investor.id] ?? 50}
                        onScoreChange={onScoreChange}
                    />
                ))}
            </div>

            {/* Cycle Brake special note */}
            {engine.id === "cycle" && (
                <div className="text-[10px] text-amber-400/60 bg-amber-400/5 rounded-lg px-3 py-2 mt-1 border border-amber-400/10">
                    ⚡ HIGH score = Safe · LOW score = Dangerous
                </div>
            )}
        </motion.div>
    );
}
