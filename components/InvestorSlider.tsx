"use client";

import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import type { Investor } from "@/hooks/useInvestmentScoring";

interface InvestorSliderProps {
    investor: Investor;
    score: number;
    onScoreChange: (id: string, value: number) => void;
}

const INVESTOR_INITIALS: Record<string, string> = {
    buffett: "WB",
    coleman: "CC",
    ackman: "BA",
    druckenmiller: "SD",
    tepper: "DT",
    soros: "GS",
    griffin: "KG",
    ptj: "PTJ",
    marks: "HM",
};

const INVESTOR_COLORS: Record<string, string> = {
    buffett: "#22C55E",
    coleman: "#06B6D4",
    ackman: "#3B82F6",
    druckenmiller: "#F59E0B",
    tepper: "#EF4444",
    soros: "#8B5CF6",
    griffin: "#EC4899",
    ptj: "#14B8A6",
    marks: "#F97316",
};

export function InvestorSlider({
    investor,
    score,
    onScoreChange,
}: InvestorSliderProps) {
    const initials = INVESTOR_INITIALS[investor.id] || "??";
    const color = INVESTOR_COLORS[investor.id] || "#00FFD1";

    return (
        <motion.div
            className="group flex flex-col gap-2 py-3 px-3 rounded-xl transition-colors hover:bg-white/[0.02]"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                        className="flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold font-mono shrink-0"
                        style={{
                            backgroundColor: `${color}15`,
                            color: color,
                            border: `1px solid ${color}30`,
                        }}
                    >
                        {initials}
                    </div>

                    {/* Name and weight */}
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white/90">
                                {investor.name}
                            </span>
                            <span
                                className="text-[10px] font-mono px-1.5 py-0.5 rounded-full"
                                style={{
                                    backgroundColor: `${color}15`,
                                    color: color,
                                }}
                            >
                                {investor.weight}%
                            </span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <HelpCircle className="w-3.5 h-3.5 text-white/20 hover:text-white/50 cursor-help transition-colors" />
                                </TooltipTrigger>
                                <TooltipContent
                                    side="top"
                                    className="bg-[#1a1a3a] border-white/10 text-white/80 text-xs max-w-[200px]"
                                >
                                    {investor.question}
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <span className="text-[11px] text-white/30 leading-tight mt-0.5 hidden sm:block">
                            {investor.question}
                        </span>
                    </div>
                </div>

                {/* Score display */}
                <motion.span
                    key={score}
                    className="font-mono text-lg font-bold min-w-[3ch] text-right tabular-nums"
                    style={{
                        color: score > 70 ? "#22C55E" : score < 30 ? "#EF4444" : "#00FFD1",
                        textShadow:
                            score > 70
                                ? "0 0 10px rgba(34,197,94,0.4)"
                                : score < 30
                                    ? "0 0 10px rgba(239,68,68,0.4)"
                                    : "0 0 10px rgba(0,255,209,0.3)",
                    }}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                >
                    {score}
                </motion.span>
            </div>

            {/* Slider */}
            <div className="pl-12">
                <Slider
                    value={[score]}
                    onValueChange={([v]) => onScoreChange(investor.id, v)}
                    min={0}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                />
            </div>
        </motion.div>
    );
}
