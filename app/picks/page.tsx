"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { ArrowLeft, Trophy, RefreshCw, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

interface ScanResult {
    ticker: string;
    name: string;
    sector: string;
    finalScore: number;
    verdict: string;
    verdictColor: string;
    investorScores: Record<string, number>;
    metrics: {
        peRatio?: number;
        roe?: number;
        revenueGrowth?: number;
        grossMargin?: number;
        beta?: number;
        currentPrice?: number;
        marketCap?: number;
    };
}

interface ScanResponse {
    regime: string;
    vix: number;
    scannedAt: string;
    results: ScanResult[];
}

const REGIME_META: Record<
    string,
    { icon: string; label: string; color: string; bgColor: string; borderColor: string }
> = {
    goldilocks: {
        icon: "☀️",
        label: "GOLDILOCKS",
        color: "#00FFD1",
        bgColor: "rgba(0,255,209,0.1)",
        borderColor: "rgba(0,255,209,0.2)",
    },
    meltup: {
        icon: "🔥",
        label: "MELT-UP",
        color: "#F97316",
        bgColor: "rgba(249,115,22,0.1)",
        borderColor: "rgba(249,115,22,0.2)",
    },
    defensive: {
        icon: "🛡️",
        label: "DEFENSIVE",
        color: "#EAB308",
        bgColor: "rgba(234,179,8,0.1)",
        borderColor: "rgba(234,179,8,0.2)",
    },
    crash: {
        icon: "🌋",
        label: "CRASH / PANIC",
        color: "#EF4444",
        bgColor: "rgba(239,68,68,0.1)",
        borderColor: "rgba(239,68,68,0.2)",
    },
};

const INVESTOR_LABELS: Record<string, string> = {
    buffett: "Buffett",
    coleman: "Coleman",
    ackman: "Ackman",
    druckenmiller: "Druck.",
    tepper: "Tepper",
    soros: "Soros",
    griffin: "Griffin",
    ptj: "PTJ",
    marks: "Marks",
};

function formatMarketCap(value: number): string {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(0)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(0)}M`;
    return `$${value.toFixed(0)}`;
}

function getVerdictBg(verdict: string): string {
    switch (verdict) {
        case "STRONG BUY":
            return "rgba(168,85,247,0.15)";
        case "BUY":
            return "rgba(34,197,94,0.15)";
        case "HOLD":
            return "rgba(234,179,8,0.15)";
        default:
            return "rgba(239,68,68,0.15)";
    }
}

function getRankMedal(rank: number): string {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
}

export default function PicksPage() {
    const [data, setData] = useState<ScanResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const runScan = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/scan");
            if (!res.ok) throw new Error(`Scan failed (${res.status})`);
            const json: ScanResponse = await res.json();
            setData(json);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Scan failed");
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-scan on mount
    useEffect(() => {
        if (mounted) runScan();
    }, [mounted, runScan]);

    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-neon-teal/30 border-t-neon-teal rounded-full animate-spin" />
                    <span className="text-xs font-mono text-white/20 tracking-widest">INITIALIZING</span>
                </div>
            </div>
        );
    }

    const top10 = data?.results.slice(0, 10) ?? [];
    const regimeMeta = data ? REGIME_META[data.regime] ?? REGIME_META.protective : null;

    return (
        <LazyMotion features={domAnimation}>
            <div className="min-h-screen pb-16">
                {/* Header */}
                <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0A0A1A]/70 border-b border-white/5">
                    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/"
                                className="flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Dashboard
                            </Link>
                            <div className="w-px h-5 bg-white/10" />
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                <h1 className="text-lg font-black tracking-wider text-white/90">
                                    TOP 10 PICKS
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {regimeMeta && !loading && (
                                <motion.div
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                                    style={{
                                        backgroundColor: regimeMeta.bgColor,
                                        borderColor: regimeMeta.borderColor,
                                    }}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <span className="text-xs">{regimeMeta.icon}</span>
                                    <span
                                        className="text-[10px] font-mono font-bold tracking-wider"
                                        style={{ color: regimeMeta.color }}
                                    >
                                        {regimeMeta.label}
                                    </span>
                                </motion.div>
                            )}
                            {data && !loading && (
                                <span className="text-[10px] font-mono text-white/20">
                                    VIX {data.vix}
                                </span>
                            )}
                            <button
                                onClick={runScan}
                                disabled={loading}
                                className="flex items-center gap-1.5 text-[11px] text-neon-teal/70 hover:text-neon-teal transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30"
                            >
                                <RefreshCw
                                    className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                                />
                                Re-scan
                            </button>
                        </div>
                    </div>
                </header>

                <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6">
                    {/* Loading State */}
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-6">
                            <motion.div
                                className="relative"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                                <div className="w-16 h-16 rounded-full border-2 border-neon-teal/10 border-t-neon-teal" />
                                <TrendingUp className="absolute inset-0 m-auto w-6 h-6 text-neon-teal/60" />
                            </motion.div>
                            <div className="text-center">
                                <p className="text-sm text-white/40 font-medium">
                                    Scanning 30 NASDAQ-100 stocks...
                                </p>
                                <p className="text-[10px] text-white/20 font-mono mt-1">
                                    Fetching financials & scoring via committee algorithm
                                </p>
                            </div>
                            {/* Skeleton cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="glass-card p-5 h-44 animate-pulse"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 0.3, y: 0 }}
                                        transition={{ delay: i * 0.08 }}
                                    >
                                        <div className="h-4 w-20 bg-white/5 rounded mb-3" />
                                        <div className="h-3 w-32 bg-white/3 rounded mb-6" />
                                        <div className="h-8 w-16 bg-white/5 rounded" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Error State */}
                    {error && !loading && (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <p className="text-red-400 text-sm">{error}</p>
                            <button
                                onClick={runScan}
                                className="text-sm text-neon-teal hover:text-neon-teal/80 transition-colors"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {/* Results */}
                    {!loading && top10.length > 0 && (
                        <>
                            {/* Subheading */}
                            <motion.div
                                className="text-center mb-8"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <p className="text-white/30 text-xs font-mono">
                                    Scanned {data?.results.length ?? 0} NASDAQ-100 stocks ·{" "}
                                    {new Date(data?.scannedAt ?? "").toLocaleTimeString()}
                                </p>
                            </motion.div>

                            {/* Top 10 Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {top10.map((stock, idx) => (
                                    <motion.div
                                        key={stock.ticker}
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: idx * 0.06 }}
                                    >
                                        <Link href={`/?ticker=${stock.ticker}`}>
                                            <div className="glass-card p-5 hover:border-neon-teal/20 transition-all cursor-pointer group">
                                                {/* Top row: Rank + Ticker + Verdict */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2.5">
                                                        <span className="text-lg">
                                                            {getRankMedal(idx + 1)}
                                                        </span>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-bold text-white/90 group-hover:text-neon-teal transition-colors">
                                                                    ${stock.ticker}
                                                                </span>
                                                                <span
                                                                    className="text-[10px] px-1.5 py-0.5 rounded-full font-mono"
                                                                    style={{
                                                                        backgroundColor: `${stock.verdictColor}20`,
                                                                        color: stock.verdictColor,
                                                                        border: `1px solid ${stock.verdictColor}30`,
                                                                    }}
                                                                >
                                                                    {stock.sector}
                                                                </span>
                                                            </div>
                                                            <p className="text-[11px] text-white/30 mt-0.5">
                                                                {stock.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div
                                                            className="text-2xl font-black font-mono"
                                                            style={{ color: stock.verdictColor }}
                                                        >
                                                            {Math.round(stock.finalScore)}
                                                        </div>
                                                        <span
                                                            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                                                            style={{
                                                                backgroundColor: getVerdictBg(stock.verdict),
                                                                color: stock.verdictColor,
                                                            }}
                                                        >
                                                            {stock.verdict}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Metrics row */}
                                                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                                                    {stock.metrics.currentPrice != null && (
                                                        <MetricPill
                                                            label="Price"
                                                            value={`$${stock.metrics.currentPrice.toFixed(2)}`}
                                                        />
                                                    )}
                                                    {stock.metrics.marketCap != null && (
                                                        <MetricPill
                                                            label="MCap"
                                                            value={formatMarketCap(stock.metrics.marketCap)}
                                                        />
                                                    )}
                                                    {stock.metrics.peRatio != null && (
                                                        <MetricPill
                                                            label="P/E"
                                                            value={stock.metrics.peRatio.toFixed(1)}
                                                        />
                                                    )}
                                                    {stock.metrics.roe != null && (
                                                        <MetricPill
                                                            label="ROE"
                                                            value={`${stock.metrics.roe.toFixed(1)}%`}
                                                            highlight={stock.metrics.roe > 20}
                                                        />
                                                    )}
                                                    {stock.metrics.revenueGrowth != null && (
                                                        <MetricPill
                                                            label="Rev.G"
                                                            value={`${stock.metrics.revenueGrowth.toFixed(1)}%`}
                                                            highlight={stock.metrics.revenueGrowth > 20}
                                                        />
                                                    )}
                                                </div>

                                                {/* Investor mini-bar: thin horizontal stacked */}
                                                <div className="mt-2">
                                                    <div className="flex gap-0.5 h-1.5 rounded-full overflow-hidden mb-1.5">
                                                        {Object.entries(stock.investorScores).map(
                                                            ([id, score]) => (
                                                                <div
                                                                    key={id}
                                                                    className="h-full rounded-sm transition-all"
                                                                    style={{
                                                                        flex: score,
                                                                        backgroundColor:
                                                                            score > 70
                                                                                ? "#00FFD1"
                                                                                : score > 50
                                                                                    ? "#3B82F6"
                                                                                    : score > 30
                                                                                        ? "#EAB308"
                                                                                        : "#EF4444",
                                                                        opacity: 0.6,
                                                                    }}
                                                                    title={`${INVESTOR_LABELS[id]}: ${Math.round(score)}`}
                                                                />
                                                            )
                                                        )}
                                                    </div>
                                                    <div className="flex justify-between">
                                                        {Object.entries(stock.investorScores)
                                                            .slice(0, 5)
                                                            .map(([id, score]) => (
                                                                <span
                                                                    key={id}
                                                                    className="text-[8px] font-mono text-white/20"
                                                                >
                                                                    {INVESTOR_LABELS[id]}{" "}
                                                                    <span
                                                                        style={{
                                                                            color:
                                                                                score > 70
                                                                                    ? "#00FFD1"
                                                                                    : score > 50
                                                                                        ? "#3B82F680"
                                                                                        : "#EAB30880",
                                                                        }}
                                                                    >
                                                                        {Math.round(score)}
                                                                    </span>
                                                                </span>
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Full rankings table (remaining) */}
                            {(data?.results.length ?? 0) > 10 && (
                                <motion.div
                                    className="glass-card mt-6 p-5"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <h3 className="text-xs font-mono text-white/30 mb-3 uppercase tracking-wider">
                                        Full Rankings (11 — {data?.results.length})
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                                        {data?.results.slice(10).map((stock, idx) => (
                                            <Link
                                                key={stock.ticker}
                                                href={`/?ticker=${stock.ticker}`}
                                                className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
                                            >
                                                <span className="text-[10px] text-white/15 font-mono">
                                                    #{idx + 11}
                                                </span>
                                                <span className="text-xs font-mono text-white/50">
                                                    {stock.ticker}
                                                </span>
                                                <span
                                                    className="text-xs font-mono font-bold ml-auto"
                                                    style={{ color: stock.verdictColor }}
                                                >
                                                    {Math.round(stock.finalScore)}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}
                </main>

                {/* Footer */}
                <footer className="mt-12 text-center">
                    <p className="text-[10px] font-mono text-white/10 tracking-wider">
                        Stock Selecting Committee · NASDAQ-100 Scanner · Not Financial Advice
                    </p>
                </footer>
            </div>
        </LazyMotion>
    );
}

function MetricPill({
    label,
    value,
    highlight,
}: {
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <span className="text-[10px] font-mono">
            <span className="text-white/20">{label} </span>
            <span className={highlight ? "text-neon-teal" : "text-white/50"}>
                {value}
            </span>
        </span>
    );
}
