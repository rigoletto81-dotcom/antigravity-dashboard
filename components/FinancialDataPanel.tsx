"use client";

import { motion } from "framer-motion";
import {
    LineChart,
    Line,
    ResponsiveContainer,
    YAxis,
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Loader2 } from "lucide-react";
import type { FinancialDataResult } from "@/hooks/useFinancialData";

interface FinancialDataPanelProps {
    data: FinancialDataResult | null;
    loading: boolean;
    error: string | null;
}

function formatNumber(num: number | undefined): string {
    if (num === undefined || num === null) return "—";
    if (Math.abs(num) >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (Math.abs(num) >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (Math.abs(num) >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return num.toLocaleString();
}

function formatPercent(num: number | undefined): string {
    if (num === undefined || num === null) return "—";
    return `${num.toFixed(2)}%`;
}

function formatPrice(num: number | undefined): string {
    if (num === undefined || num === null) return "—";
    return `$${num.toFixed(2)}`;
}

function MetricRow({
    label,
    value,
    highlight,
}: {
    label: string;
    value: string;
    highlight?: "green" | "red" | "amber" | null;
}) {
    const highlightColor =
        highlight === "green"
            ? "text-emerald-400 glow-cyan"
            : highlight === "red"
                ? "text-red-400"
                : highlight === "amber"
                    ? "text-amber-400"
                    : "glow-cyan";

    return (
        <div className="flex justify-between items-center py-1.5">
            <span className="text-[11px] text-white/40">{label}</span>
            <span className={`font-mono text-xs font-semibold ${highlightColor}`}>
                {value}
            </span>
        </div>
    );
}

function SkeletonBlock() {
    return (
        <div className="space-y-3 py-2">
            <div className="shimmer h-4 w-24" />
            <div className="shimmer h-3 w-full" />
            <div className="shimmer h-3 w-3/4" />
            <div className="shimmer h-3 w-full" />
            <div className="shimmer h-3 w-2/3" />
        </div>
    );
}

export function FinancialDataPanel({
    data,
    loading,
    error,
}: FinancialDataPanelProps) {
    if (loading) {
        return (
            <motion.div
                className="glass-card p-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Loader2 className="w-4 h-4 text-neon-teal animate-spin" />
                    <span className="text-sm text-white/50">
                        Fetching market data...
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <SkeletonBlock />
                    <SkeletonBlock />
                    <SkeletonBlock />
                    <SkeletonBlock />
                </div>
            </motion.div>
        );
    }

    if (error) {
        return (
            <motion.div
                className="glass-card p-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                </div>
                <p className="text-[11px] text-white/30 mt-2">
                    You can still score manually using the sliders above.
                </p>
            </motion.div>
        );
    }

    if (!data) return null;

    const priceChange =
        data.technical.currentPrice && data.priceHistory.length > 0
            ? ((data.technical.currentPrice - data.priceHistory[0].close) /
                data.priceHistory[0].close) *
            100
            : null;

    const aboveFiftyDay =
        data.technical.currentPrice && data.technical.fiftyDayAvg
            ? data.technical.currentPrice > data.technical.fiftyDayAvg
            : null;

    return (
        <motion.div
            className="glass-card p-5"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
                        📡 Market Reference
                        <span className="font-mono text-neon-teal text-xs glow-teal">
                            ${data.ticker}
                        </span>
                    </h3>
                    <p className="text-[11px] text-white/30 mt-0.5">{data.name}</p>
                </div>
                {data.technical.currentPrice && (
                    <div className="text-right">
                        <span className="font-mono text-lg font-bold glow-cyan">
                            {formatPrice(data.technical.currentPrice)}
                        </span>
                        {priceChange !== null && (
                            <div
                                className={`flex items-center gap-1 justify-end text-[11px] font-mono ${priceChange >= 0 ? "text-emerald-400" : "text-red-400"}`}
                            >
                                {priceChange >= 0 ? (
                                    <TrendingUp className="w-3 h-3" />
                                ) : (
                                    <TrendingDown className="w-3 h-3" />
                                )}
                                {priceChange >= 0 ? "+" : ""}
                                {priceChange.toFixed(2)}% (3M)
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Sparkline */}
            {data.priceHistory.length > 0 && (
                <div className="sparkline-container mb-4 h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.priceHistory}>
                            <YAxis domain={["dataMin", "dataMax"]} hide />
                            <Line
                                type="monotone"
                                dataKey="close"
                                stroke="#00FFD1"
                                strokeWidth={1.5}
                                dot={false}
                                animationDuration={800}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-0">
                {/* Secular Engine Metrics */}
                <div>
                    <h4 className="text-[10px] font-mono text-white/20 uppercase tracking-wider mb-2 border-b border-white/5 pb-1">
                        🏛️ Fundamentals
                    </h4>
                    <MetricRow label="ROE (TTM)" value={formatPercent(data.fundamentals.roe)} />
                    <MetricRow
                        label="Revenue Growth"
                        value={formatPercent(data.fundamentals.revenueGrowth)}
                        highlight={
                            data.fundamentals.revenueGrowth
                                ? data.fundamentals.revenueGrowth > 20
                                    ? "green"
                                    : data.fundamentals.revenueGrowth < 0
                                        ? "red"
                                        : null
                                : null
                        }
                    />
                    <MetricRow
                        label="Gross Margin"
                        value={formatPercent(data.fundamentals.grossMargin)}
                    />
                    <MetricRow
                        label="Free Cash Flow"
                        value={formatNumber(data.fundamentals.freeCashFlow)}
                    />
                </div>

                {/* Regime Metrics */}
                <div>
                    <h4 className="text-[10px] font-mono text-white/20 uppercase tracking-wider mb-2 border-b border-white/5 pb-1">
                        📊 Valuation
                    </h4>
                    <MetricRow
                        label="Market Cap"
                        value={formatNumber(data.valuation.marketCap)}
                    />
                    <MetricRow
                        label="P/E (TTM)"
                        value={
                            data.valuation.peRatio
                                ? data.valuation.peRatio.toFixed(2)
                                : "—"
                        }
                    />
                    <MetricRow
                        label="Forward P/E"
                        value={
                            data.valuation.forwardPE
                                ? data.valuation.forwardPE.toFixed(2)
                                : "—"
                        }
                    />
                    <MetricRow
                        label="PEG Ratio"
                        value={
                            data.valuation.pegRatio
                                ? data.valuation.pegRatio.toFixed(2)
                                : "—"
                        }
                        highlight={
                            data.valuation.pegRatio
                                ? data.valuation.pegRatio < 1
                                    ? "green"
                                    : data.valuation.pegRatio > 3
                                        ? "red"
                                        : null
                                : null
                        }
                    />
                </div>

                {/* Technical Metrics */}
                <div className="mt-3">
                    <h4 className="text-[10px] font-mono text-white/20 uppercase tracking-wider mb-2 border-b border-white/5 pb-1">
                        🎯 Technical
                    </h4>
                    <MetricRow
                        label="52W High"
                        value={formatPrice(data.technical.fiftyTwoWeekHigh)}
                    />
                    <MetricRow
                        label="52W Low"
                        value={formatPrice(data.technical.fiftyTwoWeekLow)}
                    />
                    <MetricRow
                        label="50-Day Avg"
                        value={formatPrice(data.technical.fiftyDayAvg)}
                        highlight={aboveFiftyDay === true ? "green" : aboveFiftyDay === false ? "red" : null}
                    />
                    <MetricRow
                        label="Beta (5Y)"
                        value={
                            data.technical.beta ? data.technical.beta.toFixed(2) : "—"
                        }
                        highlight={
                            data.technical.beta
                                ? data.technical.beta > 1.5
                                    ? "amber"
                                    : null
                                : null
                        }
                    />
                </div>

                {/* Volatility */}
                <div className="mt-3">
                    <h4 className="text-[10px] font-mono text-white/20 uppercase tracking-wider mb-2 border-b border-white/5 pb-1">
                        ⚠️ Volatility
                    </h4>
                    <MetricRow
                        label="Beta (Proxy)"
                        value={
                            data.volatility.beta ? data.volatility.beta.toFixed(2) : "—"
                        }
                        highlight={
                            data.volatility.beta
                                ? data.volatility.beta > 1.5
                                    ? "red"
                                    : data.volatility.beta < 0.8
                                        ? "green"
                                        : null
                                : null
                        }
                    />
                    {data.technical.currentPrice && data.technical.fiftyTwoWeekHigh && (
                        <MetricRow
                            label="From 52W High"
                            value={`${(((data.technical.currentPrice - data.technical.fiftyTwoWeekHigh) / data.technical.fiftyTwoWeekHigh) * 100).toFixed(1)}%`}
                            highlight={
                                data.technical.currentPrice / data.technical.fiftyTwoWeekHigh < 0.8
                                    ? "red"
                                    : null
                            }
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
}
