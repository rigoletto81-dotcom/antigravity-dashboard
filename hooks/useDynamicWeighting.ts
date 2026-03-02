"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
    calculateRegimeWeights,
    mapToInvestorWeights,
    type MarketData,
    type CommitteeWeights,
} from "@/lib/regimeEngine";

// ── Types ──

export type RegimeKey = "goldilocks" | "meltup" | "defensive" | "crash";

export interface RegimeIndicators {
    vix: number;
    priceVs200dma: "above" | "below";
    spyPrice: number;
    spy200dma: number;
    hySpreadWidening: boolean;
    yieldCurveInverted: boolean;
    tenYearYield: number;
    twoYearYield: number;
}

export interface EngineWeights {
    secular: number;
    regime: number;
    tactical: number;
    cycle: number;
}

export interface InvestorWeights {
    buffett: number;
    coleman: number;
    ackman: number;
    druckenmiller: number;
    tepper: number;
    soros: number;
    griffin: number;
    ptj: number;
    marks: number;
}

export interface RegimeInfo {
    type: RegimeKey;
    label: string;
    labelKo: string;
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
}

export interface WeightAttribution {
    investorId: string;
    weight: number;
    reason: string;
}

export interface DynamicWeightingResult {
    regime: RegimeInfo;
    engineWeights: EngineWeights;
    investorWeights: InvestorWeights;
    rationale: string;
    keyDriver: string;
    attributions: WeightAttribution[];
    regimeData: RegimeIndicators | null;
    loading: boolean;
    error: string | null;
    fetchRegimeData: () => Promise<void>;
}

// ── Regime Metadata (4 Quadrants) ──

const REGIMES: Record<RegimeKey, RegimeInfo> = {
    goldilocks: {
        type: "goldilocks",
        label: "GOLDILOCKS",
        labelKo: "Expansion",
        icon: "☀️",
        color: "#00FFD1",
        bgColor: "rgba(0, 255, 209, 0.1)",
        borderColor: "rgba(0, 255, 209, 0.2)",
    },
    meltup: {
        type: "meltup",
        label: "MELT-UP",
        labelKo: "Vol Spike",
        icon: "🔥",
        color: "#F97316",
        bgColor: "rgba(249, 115, 22, 0.1)",
        borderColor: "rgba(249, 115, 22, 0.2)",
    },
    defensive: {
        type: "defensive",
        label: "DEFENSIVE",
        labelKo: "Sideways",
        icon: "🛡️",
        color: "#EAB308",
        bgColor: "rgba(234, 179, 8, 0.1)",
        borderColor: "rgba(234, 179, 8, 0.2)",
    },
    crash: {
        type: "crash",
        label: "CRASH / PANIC",
        labelKo: "Capitulation",
        icon: "🌋",
        color: "#EF4444",
        bgColor: "rgba(239, 68, 68, 0.1)",
        borderColor: "rgba(239, 68, 68, 0.2)",
    },
};

// ── Key Driver Description ──

const KEY_DRIVERS: Record<RegimeKey, string> = {
    goldilocks: "Low Vol + Uptrend (SPY > 200DMA)",
    meltup: "High Vol + Uptrend (Momentum-driven)",
    defensive: "Low Vol + Downtrend (Slow Grind)",
    crash: "High Vol + Downtrend (Capitulation)",
};

// ── Weight Attribution (per investor) ──

function getAttributions(
    regimeKey: RegimeKey,
    weights: InvestorWeights,
    data: RegimeIndicators
): WeightAttribution[] {
    const vixStr = `VIX ${data.vix.toFixed(1)}`;
    const dmaStr =
        data.priceVs200dma === "above" ? "Above 200DMA" : "Below 200DMA";

    const reasons: Record<RegimeKey, Record<string, string>> = {
        goldilocks: {
            buffett: `Maximizing compound effect of quality stocks — ${dmaStr}`,
            coleman: `Max growth exposure — ${vixStr} stable`,
            ackman: `Maintaining predictable businesses`,
            druckenmiller: `Low volatility supports macro`,
            tepper: `Focusing on growth over value`,
            soros: `Positive feedback loop in progress`,
            griffin: `Quant momentum signals strengthening`,
            ptj: `Optimizing price trend — ${dmaStr}`,
            marks: `Cycle risk minimized — ${vixStr}`,
        },
        meltup: {
            buffett: `Market driven by flows rather than fundamentals`,
            coleman: `Caution on growth stock volatility`,
            ackman: `Decreased business predictability`,
            druckenmiller: `Directionality amidst macro uncertainty`,
            tepper: `Wary of valuation overheating`,
            soros: `Reflexivity feedback maximized — ${vixStr}`,
            griffin: `Momentum following maximized — ${dmaStr}`,
            ptj: `Trend following + getting ready to exit — ${vixStr}`,
            marks: `Late cycle warning — increasing cash`,
        },
        defensive: {
            buffett: `Cash flow defense strategy — ${dmaStr}`,
            coleman: `Reducing growth stock exposure`,
            ackman: `Preferring stable businesses — activist opportunities`,
            druckenmiller: `Macro defense protects the portfolio`,
            tepper: `Valuation reassessment needed`,
            soros: `Reflexivity weakening — ${dmaStr}`,
            griffin: `Reducing positioning`,
            ptj: `Trend following weakened — reducing exposure`,
            marks: `Cycle warning lights flashing — ${vixStr}`,
        },
        crash: {
            buffett: `Searching for quality assets amidst fear`,
            coleman: `Avoiding growth stocks — distressed environment`,
            ackman: `Increasing activist investment opportunities`,
            druckenmiller: `Searching for a macro bottom`,
            tepper: `Maximizing distressed value — ${vixStr}`,
            soros: `Panic reflexivity — contrarian opportunity`,
            griffin: `Quant signals mixed — reducing exposure`,
            ptj: `Momentum collapsed — trend invalidated`,
            marks: `Extreme fear — activating veto power — ${vixStr}`,
        },
    };

    return Object.entries(weights).map(([id, weight]) => ({
        investorId: id,
        weight,
        reason: reasons[regimeKey]?.[id] ?? "",
    }));
}

// ── Smoothing Utility ──

function lerpWeights<T extends Record<string, number>>(
    current: T,
    target: T,
    alpha: number
): T {
    const result = { ...current } as T;
    for (const key of Object.keys(target) as (keyof T & string)[]) {
        (result as Record<string, number>)[key] =
            (current[key] as number) * (1 - alpha) + (target[key] as number) * alpha;
    }
    return result;
}

// ── Default Weights (fixed baseline) ──

const DEFAULT_ENGINE_WEIGHTS: EngineWeights = {
    secular: 30,
    regime: 40,
    tactical: 20,
    cycle: 10,
};

const DEFAULT_INVESTOR_WEIGHTS: InvestorWeights = {
    buffett: 10,
    coleman: 10,
    ackman: 10,
    druckenmiller: 15,
    tepper: 15,
    soros: 10,
    griffin: 10,
    ptj: 10,
    marks: 10,
};

// ── Convert API response → MarketData for the engine ──

function toMarketData(indicators: RegimeIndicators): MarketData {
    return {
        price: indicators.spyPrice,
        sma200: indicators.spy200dma,
        vix: indicators.vix,
        yieldCurve: indicators.tenYearYield - indicators.twoYearYield,
        creditSpread: 0, // reserved for future HY OAS data
    };
}

// ── Hook ──

export function useDynamicWeighting(): DynamicWeightingResult {
    const [regimeData, setRegimeData] = useState<RegimeIndicators | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Smoothed weights
    const [smoothedEngineWeights, setSmoothedEngineWeights] =
        useState<EngineWeights>(DEFAULT_ENGINE_WEIGHTS);
    const [smoothedInvestorWeights, setSmoothedInvestorWeights] =
        useState<InvestorWeights>(DEFAULT_INVESTOR_WEIGHTS);

    const targetEngineRef = useRef<EngineWeights>(DEFAULT_ENGINE_WEIGHTS);
    const targetInvestorRef = useRef<InvestorWeights>(DEFAULT_INVESTOR_WEIGHTS);
    const animFrameRef = useRef<number | null>(null);

    // Smoothing animation loop
    useEffect(() => {
        const ALPHA = 0.12;
        const THRESHOLD = 0.3;

        function animate() {
            setSmoothedEngineWeights((prev) => {
                const next = lerpWeights(
                    prev as unknown as Record<string, number>,
                    targetEngineRef.current as unknown as Record<string, number>,
                    ALPHA
                ) as unknown as EngineWeights;
                const maxDiff = Math.max(
                    ...Object.keys(next).map((k) =>
                        Math.abs(
                            (next as unknown as Record<string, number>)[k] -
                            (targetEngineRef.current as unknown as Record<string, number>)[k]
                        )
                    )
                );
                if (maxDiff < THRESHOLD) return targetEngineRef.current;
                return next;
            });

            setSmoothedInvestorWeights((prev) => {
                const next = lerpWeights(
                    prev as unknown as Record<string, number>,
                    targetInvestorRef.current as unknown as Record<string, number>,
                    ALPHA
                ) as unknown as InvestorWeights;
                const maxDiff = Math.max(
                    ...Object.keys(next).map((k) =>
                        Math.abs(
                            (next as unknown as Record<string, number>)[k] -
                            (targetInvestorRef.current as unknown as Record<string, number>)[k]
                        )
                    )
                );
                if (maxDiff < THRESHOLD) return targetInvestorRef.current;
                return next;
            });

            animFrameRef.current = requestAnimationFrame(animate);
        }

        animFrameRef.current = requestAnimationFrame(animate);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    // Run the engine when data changes
    const committeeResult = useMemo<CommitteeWeights | null>(() => {
        if (!regimeData) return null;
        return calculateRegimeWeights(toMarketData(regimeData));
    }, [regimeData]);

    // Update targets when engine result changes
    useEffect(() => {
        if (!committeeResult) return;

        targetEngineRef.current = {
            secular: committeeResult.secular,
            regime: committeeResult.regime,
            tactical: committeeResult.tactical,
            cycle: committeeResult.cycle,
        };

        const investorW = mapToInvestorWeights(committeeResult);
        targetInvestorRef.current = investorW as unknown as InvestorWeights;
    }, [committeeResult]);

    const regimeKey: RegimeKey = committeeResult?.regimeKey ?? "defensive";
    const regimeInfo = REGIMES[regimeKey];

    const rationale = committeeResult?.rationale ?? "";
    const keyDriver = KEY_DRIVERS[regimeKey];

    const attributions = useMemo(() => {
        if (!regimeData) return [];
        return getAttributions(regimeKey, smoothedInvestorWeights, regimeData);
    }, [regimeKey, smoothedInvestorWeights, regimeData]);

    const fetchRegimeData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/regime");
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || `Failed (${res.status})`);
            }
            const data: RegimeIndicators = await res.json();
            setRegimeData(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch regime data"
            );
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        regime: regimeInfo,
        engineWeights: smoothedEngineWeights,
        investorWeights: smoothedInvestorWeights,
        rationale,
        keyDriver,
        attributions,
        regimeData,
        loading,
        error,
        fetchRegimeData,
    };
}
