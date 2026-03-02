"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import type { RegimeInfo, WeightAttribution } from "@/hooks/useDynamicWeighting";
import { WeightRadialChart } from "./WeightRadialChart";
import type { EngineWeights } from "@/hooks/useDynamicWeighting";

interface RationalePanelProps {
    regime: RegimeInfo;
    rationale: string;
    keyDriver: string;
    attributions: WeightAttribution[];
    engineWeights: EngineWeights;
    regimeData: {
        vix: number;
        spyPrice: number;
        spy200dma: number;
        tenYearYield: number;
        twoYearYield: number;
        hySpreadWidening: boolean;
        yieldCurveInverted: boolean;
    } | null;
}

// Typing animation hook
function useTypingAnimation(text: string, speed: number = 30) {
    const [displayed, setDisplayed] = useState("");
    const indexRef = useRef(0);
    const prevText = useRef("");

    useEffect(() => {
        if (text !== prevText.current) {
            setDisplayed("");
            indexRef.current = 0;
            prevText.current = text;
        }

        const interval = setInterval(() => {
            if (indexRef.current < text.length) {
                setDisplayed(text.slice(0, indexRef.current + 1));
                indexRef.current++;
            } else {
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed]);

    return { displayed, isTyping: displayed.length < text.length };
}

export function RationalePanel({
    regime,
    rationale,
    keyDriver,
    attributions,
    engineWeights,
    regimeData,
}: RationalePanelProps) {
    const { displayed, isTyping } = useTypingAnimation(rationale, 25);
    const [showAttr, setShowAttr] = useState(false);

    return (
        <motion.div
            className="glass-card p-5 flex flex-col gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* ── Header Row ── */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{regime.icon}</span>
                        <div>
                            <h3 className="text-sm font-semibold text-white/90">
                                Committee Minutes
                            </h3>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span
                                    className="text-[10px] font-mono font-bold tracking-wider"
                                    style={{ color: regime.color }}
                                >
                                    {regime.label}
                                </span>
                                <span className="text-[10px] text-white/20">
                                    {regime.labelKo}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Rationale text (typing animation) */}
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={regime.type}
                            className="text-sm text-white/60 leading-relaxed min-h-[3.5rem]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {displayed}
                            {isTyping && (
                                <span className="inline-block w-0.5 h-4 bg-neon-teal/70 ml-0.5 animate-pulse align-text-bottom" />
                            )}
                        </motion.p>
                    </AnimatePresence>

                    {/* Key Driver */}
                    <div className="flex items-center gap-2 mt-3">
                        <span className="text-[10px] font-mono text-white/20 uppercase tracking-wider">
                            Key Driver
                        </span>
                        <span
                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                            style={{
                                color: regime.color,
                                backgroundColor: regime.bgColor,
                                borderColor: regime.borderColor,
                            }}
                        >
                            {keyDriver}
                        </span>
                    </div>
                </div>

                {/* Radial chart */}
                <div className="shrink-0 hidden sm:block">
                    <WeightRadialChart weights={engineWeights} />
                </div>
            </div>

            {/* ── Market Indicators ── */}
            {regimeData && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                    <IndicatorPill
                        label="VIX"
                        value={regimeData.vix.toFixed(1)}
                        alert={regimeData.vix > 30}
                        good={regimeData.vix < 15}
                    />
                    <IndicatorPill
                        label="SPY vs 200DMA"
                        value={`${(((regimeData.spyPrice - regimeData.spy200dma) / regimeData.spy200dma) * 100).toFixed(1)}%`}
                        good={regimeData.spyPrice > regimeData.spy200dma}
                        alert={regimeData.spyPrice < regimeData.spy200dma}
                    />
                    <IndicatorPill
                        label="HY Spread"
                        value={regimeData.hySpreadWidening ? "Widening" : "Stable"}
                        alert={regimeData.hySpreadWidening}
                        good={!regimeData.hySpreadWidening}
                    />
                    <IndicatorPill
                        label="Yield Curve"
                        value={`${(regimeData.tenYearYield - regimeData.twoYearYield).toFixed(2)}%`}
                        alert={regimeData.yieldCurveInverted}
                        good={!regimeData.yieldCurveInverted}
                    />
                </div>
            )}

            {/* ── Weight Attributions Toggle ── */}
            <div>
                <button
                    onClick={() => setShowAttr(!showAttr)}
                    className="text-[10px] font-mono text-white/30 hover:text-white/50 transition-colors"
                >
                    {showAttr ? "▲ Hide" : "▼ Show"} Weight Attribution
                </button>
                <AnimatePresence>
                    {showAttr && (
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-2"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            {attributions.map((attr) => (
                                <div
                                    key={attr.investorId}
                                    className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5"
                                >
                                    <span className="text-[10px] font-mono font-bold text-neon-teal shrink-0 pt-0.5">
                                        {attr.weight}%
                                    </span>
                                    <div className="min-w-0">
                                        <span className="text-[10px] text-white/50 font-medium capitalize">
                                            {attr.investorId}
                                        </span>
                                        <p className="text-[10px] text-white/25 leading-snug">
                                            {attr.reason}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// ── Tiny indicator pill ──

function IndicatorPill({
    label,
    value,
    alert,
    good,
}: {
    label: string;
    value: string;
    alert?: boolean;
    good?: boolean;
}) {
    const color = alert ? "#EF4444" : good ? "#00FFD1" : "#FFFFFF60";
    return (
        <div className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="text-[9px] font-mono text-white/25 uppercase tracking-wider">
                {label}
            </span>
            <span
                className="text-xs font-mono font-bold"
                style={{ color }}
            >
                {value}
            </span>
        </div>
    );
}
