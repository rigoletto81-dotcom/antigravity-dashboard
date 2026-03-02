"use client";

import { motion, LazyMotion, domAnimation } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Zap,
    Target,
    BarChart3,
    Shield,
    Gauge,
    TrendingUp,
    Brain,
    HelpCircle,
} from "lucide-react";

const investors = [
    {
        id: "buffett",
        name: "Warren Buffett",
        engine: "Secular Engine",
        weight: "10%",
        question: "Is the moat structural?",
        philosophy:
            "Focused on durable competitive advantages, high return on equity, and compounding power over 3–5 year horizons.",
        metrics: "ROE, Gross Margin",
    },
    {
        id: "coleman",
        name: "Chase Coleman",
        engine: "Secular Engine",
        weight: "10%",
        question: "Is there hyper-growth potential?",
        philosophy:
            "Seeks explosive revenue growth and category-defining companies before the market fully prices them in.",
        metrics: "Revenue Growth",
    },
    {
        id: "ackman",
        name: "Bill Ackman",
        engine: "Secular Engine",
        weight: "10%",
        question: "Is the business simple/predictable?",
        philosophy:
            "Prefers businesses with transparent models, pricing power, and low complexity — companies you can underwrite with confidence.",
        metrics: "Gross Margin, Beta",
    },
    {
        id: "druckenmiller",
        name: "Stan Druckenmiller",
        engine: "Regime / IRR Overlay",
        weight: "15%",
        question: "Does the macro regime support this?",
        philosophy:
            "Evaluates whether the current macro environment (rates, liquidity, earnings cycle) favors the investment thesis.",
        metrics: "Forward P/E vs Trailing P/E",
    },
    {
        id: "tepper",
        name: "David Tepper",
        engine: "Regime / IRR Overlay",
        weight: "15%",
        question: "Is it cheap relative to the risk?",
        philosophy:
            "A value-oriented lens — looks for assets priced below intrinsic value with asymmetric risk-reward.",
        metrics: "P/E Ratio, PEG Ratio",
    },
    {
        id: "soros",
        name: "George Soros",
        engine: "Regime / IRR Overlay",
        weight: "10%",
        question: "Is the reflexivity positive?",
        philosophy:
            "Assesses whether market sentiment and price momentum create a self-reinforcing feedback loop.",
        metrics: "Price vs 50-Day Average",
    },
    {
        id: "griffin",
        name: "Ken Griffin",
        engine: "Portfolio / Tactical",
        weight: "10%",
        question: "How is the quantitative positioning?",
        philosophy:
            "Quantitative analysis of market structure — positioning within the 52-week range and statistical risk metrics.",
        metrics: "52W Range Position, Beta",
    },
    {
        id: "ptj",
        name: "Paul Tudor Jones",
        engine: "Portfolio / Tactical",
        weight: "10%",
        question: "What does the price action/trend say?",
        philosophy:
            "Pure technical analysis — reads the 3-month price trend to gauge whether momentum supports an entry.",
        metrics: "3-Month Price Trend",
    },
    {
        id: "marks",
        name: "Howard Marks",
        engine: "Cycle Brake",
        weight: "10%",
        question: "Where are we in the cycle? Is this overheated?",
        philosophy:
            "The safety valve — measures cycle risk and market exuberance. A low score here triggers a warning regardless of other scores.",
        metrics: "Beta, Distance from 52W High",
    },
];

const engines = [
    {
        name: "Secular Engine",
        weight: "30%",
        icon: Target,
        color: "text-neon-teal",
        description:
            "Long-term structural quality. Evaluates moats, growth potential, and business predictability over a 3–5 year horizon.",
    },
    {
        name: "Regime / IRR Overlay",
        weight: "40%",
        icon: BarChart3,
        color: "text-neon-purple",
        description:
            "The heaviest weight. Assesses whether macro conditions, valuation, and market sentiment support the investment right now.",
    },
    {
        name: "Portfolio / Tactical",
        weight: "20%",
        icon: TrendingUp,
        color: "text-blue-400",
        description:
            "Technical and quantitative positioning. Determines whether the price action and market structure favor entry timing.",
    },
    {
        name: "Cycle Brake",
        weight: "10%",
        icon: Shield,
        color: "text-amber-400",
        description:
            "Risk circuit-breaker. A low score here triggers a ⚠️ CYCLE WARNING regardless of how strong other signals are.",
    },
];

const verdicts = [
    {
        label: "STRONG BUY",
        range: "> 80",
        color: "text-purple-400",
        bg: "bg-purple-400/10 border-purple-400/20",
        description: "Exceptional alignment across all engines. High conviction.",
    },
    {
        label: "BUY",
        range: "61–80",
        color: "text-green-400",
        bg: "bg-green-400/10 border-green-400/20",
        description: "Moderate-to-strong conviction. Worth building a position.",
    },
    {
        label: "HOLD",
        range: "40–60",
        color: "text-yellow-400",
        bg: "bg-yellow-400/10 border-yellow-400/20",
        description: "Mixed signals. Conviction is split across the committee.",
    },
    {
        label: "REJECT",
        range: "< 40",
        color: "text-red-400",
        bg: "bg-red-400/10 border-red-400/20",
        description: "Weak conviction. Significant risk flagged. Consider passing.",
    },
];

export default function HelpPage() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-neon-teal/30 border-t-neon-teal rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <LazyMotion features={domAnimation}>
            <div className="min-h-screen pb-16">
                {/* Header */}
                <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0A0A1A]/70 border-b border-white/5">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Link>
                        </div>
                        <div className="flex items-center gap-2 text-white/60">
                            <HelpCircle className="w-4 h-4 text-neon-teal" />
                            <span className="text-sm font-semibold tracking-wide">
                                How It Works
                            </span>
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
                    {/* Hero */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Zap className="w-7 h-7 text-neon-teal" />
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                Stock Selecting Committee
                            </h1>
                        </div>
                        <p className="text-white/50 text-base leading-relaxed max-w-2xl">
                            A weighted scoring system that channels the investment philosophies
                            of 9 legendary investors to evaluate any stock. Enter a ticker,
                            review the AI-suggested scores, adjust based on your own analysis,
                            and arrive at a committee verdict.
                        </p>
                    </motion.section>

                    {/* How to Use */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="mb-12"
                    >
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Gauge className="w-5 h-5 text-neon-teal" />
                            Quick Start
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                {
                                    step: "1",
                                    title: "Enter a ticker",
                                    desc: "Type a symbol like NVDA, AAPL, or TSLA and press Enter. Live financial data is fetched automatically.",
                                },
                                {
                                    step: "2",
                                    title: "Review AI scores",
                                    desc: "Each investor's slider auto-fills based on real metrics — ROE, P/E, growth rate, momentum, and more.",
                                },
                                {
                                    step: "3",
                                    title: "Adjust & decide",
                                    desc: "Override any slider with your own conviction. The orb and verdict update in real-time to reflect the committee's view.",
                                },
                            ].map((item) => (
                                <div
                                    key={item.step}
                                    className="glass-card rounded-xl p-4 border border-white/5"
                                >
                                    <div className="w-7 h-7 rounded-full bg-neon-teal/15 text-neon-teal flex items-center justify-center text-xs font-bold mb-3">
                                        {item.step}
                                    </div>
                                    <h3 className="text-sm font-semibold text-white mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-white/40 leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Scoring Engines */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-12"
                    >
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-neon-purple" />
                            The 4 Scoring Engines
                        </h2>
                        <p className="text-sm text-white/40 mb-4">
                            The final score is a weighted average across four engines, each
                            representing a different dimension of investment analysis.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {engines.map((engine) => (
                                <div
                                    key={engine.name}
                                    className="glass-card rounded-xl p-4 border border-white/5"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <engine.icon className={`w-4 h-4 ${engine.color}`} />
                                            <h3 className="text-sm font-semibold text-white">
                                                {engine.name}
                                            </h3>
                                        </div>
                                        <span className="text-xs font-mono text-neon-teal">
                                            {engine.weight}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/40 leading-relaxed">
                                        {engine.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Verdict Scale */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mb-12"
                    >
                        <h2 className="text-lg font-bold text-white mb-4">
                            Verdict Scale
                        </h2>
                        <div className="flex flex-col gap-2">
                            {verdicts.map((v) => (
                                <div
                                    key={v.label}
                                    className={`flex items-center gap-4 rounded-lg px-4 py-3 border ${v.bg}`}
                                >
                                    <span
                                        className={`text-xs font-bold font-mono w-24 ${v.color}`}
                                    >
                                        {v.label}
                                    </span>
                                    <span className="text-xs font-mono text-white/30 w-12">
                                        {v.range}
                                    </span>
                                    <span className="text-xs text-white/50">
                                        {v.description}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Investors Table */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <h2 className="text-lg font-bold text-white mb-4">
                            The 9 Virtual Committee Members
                        </h2>
                        <p className="text-sm text-white/40 mb-4">
                            Each investor represents a specific investment lens. Their weight
                            determines how much influence their score has on the final result.
                        </p>
                        <div className="space-y-2">
                            {investors.map((inv) => (
                                <div
                                    key={inv.id}
                                    className="glass-card rounded-xl p-4 border border-white/5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold text-white">
                                                    {inv.name}
                                                </span>
                                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neon-teal/10 text-neon-teal">
                                                    {inv.weight}
                                                </span>
                                                <span className="text-[10px] text-white/20">
                                                    {inv.engine}
                                                </span>
                                            </div>
                                            <p className="text-xs text-neon-teal/70 italic mb-1">
                                                &ldquo;{inv.question}&rdquo;
                                            </p>
                                            <p className="text-xs text-white/40 leading-relaxed">
                                                {inv.philosophy}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="text-[10px] text-white/20 block">
                                                AI uses
                                            </span>
                                            <span className="text-[10px] font-mono text-white/40">
                                                {inv.metrics}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Disclaimer */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.25 }}
                        className="text-center pb-8"
                    >
                        <p className="text-[10px] font-mono text-white/10 tracking-wider">
                            This tool is for educational and entertainment purposes only. Not
                            financial advice.
                        </p>
                    </motion.section>
                </main>
            </div>
        </LazyMotion>
    );
}
