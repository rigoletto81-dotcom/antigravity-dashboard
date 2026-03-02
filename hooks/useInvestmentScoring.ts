"use client";

import { useState, useMemo, useCallback } from "react";

export interface Investor {
    id: string;
    name: string;
    weight: number;
    question: string;
    engine: string;
}

export interface Engine {
    id: string;
    name: string;
    subtitle: string;
    totalWeight: number;
    investors: Investor[];
}

export type Verdict = "reject" | "hold" | "buy" | "strong-buy";

export interface VerdictInfo {
    label: string;
    color: string;
    bgColor: string;
    glowColor: string;
}

export const ENGINES: Engine[] = [
    {
        id: "secular",
        name: "Secular Engine",
        subtitle: "Structural moat, 3-5 year horizon",
        totalWeight: 30,
        investors: [
            {
                id: "buffett",
                name: "Warren Buffett",
                weight: 10,
                question: "Is the moat structural?",
                engine: "secular",
            },
            {
                id: "coleman",
                name: "Chase Coleman",
                weight: 10,
                question: "Is there hyper-growth potential?",
                engine: "secular",
            },
            {
                id: "ackman",
                name: "Bill Ackman",
                weight: 10,
                question: "Is the business simple/predictable?",
                engine: "secular",
            },
        ],
    },
    {
        id: "regime",
        name: "Regime / IRR Overlay",
        subtitle: "Capital allocation, Opportunity cost",
        totalWeight: 40,
        investors: [
            {
                id: "druckenmiller",
                name: "Stan Druckenmiller",
                weight: 15,
                question: "Does the macro regime support this?",
                engine: "regime",
            },
            {
                id: "tepper",
                name: "David Tepper",
                weight: 15,
                question: "Is it cheap relative to the risk?",
                engine: "regime",
            },
            {
                id: "soros",
                name: "George Soros",
                weight: 10,
                question: "Is the reflexivity positive?",
                engine: "regime",
            },
        ],
    },
    {
        id: "tactical",
        name: "Portfolio / Tactical",
        subtitle: "Positioning, Factor, Trend",
        totalWeight: 20,
        investors: [
            {
                id: "griffin",
                name: "Ken Griffin",
                weight: 10,
                question: "How is the quantitative positioning?",
                engine: "tactical",
            },
            {
                id: "ptj",
                name: "Paul Tudor Jones",
                weight: 10,
                question: "What does the price action/trend say?",
                engine: "tactical",
            },
        ],
    },
    {
        id: "cycle",
        name: "Cycle Brake",
        subtitle: "Risk Management, Warning Signals",
        totalWeight: 10,
        investors: [
            {
                id: "marks",
                name: "Howard Marks",
                weight: 10,
                question:
                    "Where are we in the cycle? Is this overheated?",
                engine: "cycle",
            },
        ],
    },
];

const ALL_INVESTORS = ENGINES.flatMap((e) => e.investors);

export function getVerdict(score: number): Verdict {
    if (score > 80) return "strong-buy";
    if (score > 60) return "buy";
    if (score >= 40) return "hold";
    return "reject";
}

export function getVerdictInfo(verdict: Verdict): VerdictInfo {
    switch (verdict) {
        case "reject":
            return {
                label: "REJECT",
                color: "#EF4444",
                bgColor: "rgba(239, 68, 68, 0.15)",
                glowColor: "rgba(239, 68, 68, 0.4)",
            };
        case "hold":
            return {
                label: "HOLD",
                color: "#EAB308",
                bgColor: "rgba(234, 179, 8, 0.15)",
                glowColor: "rgba(234, 179, 8, 0.4)",
            };
        case "buy":
            return {
                label: "BUY",
                color: "#22C55E",
                bgColor: "rgba(34, 197, 94, 0.15)",
                glowColor: "rgba(34, 197, 94, 0.4)",
            };
        case "strong-buy":
            return {
                label: "STRONG BUY",
                color: "#A855F7",
                bgColor: "rgba(168, 85, 247, 0.15)",
                glowColor: "rgba(168, 85, 247, 0.4)",
            };
    }
}

type Scores = Record<string, number>;

export function useInvestmentScoring(
    dynamicInvestorWeights?: Record<string, number>
) {
    const [scores, setScores] = useState<Scores>(() => {
        const initial: Scores = {};
        ALL_INVESTORS.forEach((inv) => {
            initial[inv.id] = 50;
        });
        return initial;
    });

    // Helper: get the effective weight for an investor
    const getWeight = useCallback(
        (investorId: string) => {
            if (dynamicInvestorWeights && investorId in dynamicInvestorWeights) {
                return dynamicInvestorWeights[investorId];
            }
            const inv = ALL_INVESTORS.find((i) => i.id === investorId);
            return inv ? inv.weight : 10;
        },
        [dynamicInvestorWeights]
    );

    const setScore = useCallback((investorId: string, value: number) => {
        setScores((prev) => ({ ...prev, [investorId]: value }));
    }, []);

    const resetScores = useCallback(() => {
        const reset: Scores = {};
        ALL_INVESTORS.forEach((inv) => {
            reset[inv.id] = 50;
        });
        setScores(reset);
    }, []);

    const finalScore = useMemo(() => {
        let total = 0;
        ALL_INVESTORS.forEach((inv) => {
            const w = getWeight(inv.id);
            total += (scores[inv.id] ?? 50) * (w / 100);
        });
        return Math.round(total * 100) / 100;
    }, [scores, getWeight]);

    // Build engines with dynamic weights for display
    const dynamicEngines = useMemo(() => {
        return ENGINES.map((engine) => {
            const investors = engine.investors.map((inv) => ({
                ...inv,
                weight: Math.round(getWeight(inv.id)),
            }));
            const totalWeight = investors.reduce((s, inv) => s + inv.weight, 0);
            return { ...engine, investors, totalWeight };
        });
    }, [getWeight]);

    const engineScores = useMemo(() => {
        const result: Record<string, number> = {};
        dynamicEngines.forEach((engine) => {
            let engineTotal = 0;
            engine.investors.forEach((inv) => {
                engineTotal += (scores[inv.id] ?? 50) * (inv.weight / 100);
            });
            const tw = engine.totalWeight || 1;
            result[engine.id] =
                Math.round((engineTotal / (tw / 100)) * 100) / 100;
        });
        return result;
    }, [scores, dynamicEngines]);

    const verdict = useMemo(() => getVerdict(finalScore), [finalScore]);
    const verdictInfo = useMemo(() => getVerdictInfo(verdict), [verdict]);

    const summary = useMemo(() => {
        let highestInvestor = ALL_INVESTORS[0];
        let lowestInvestor = ALL_INVESTORS[0];
        ALL_INVESTORS.forEach((inv) => {
            if (scores[inv.id] > scores[highestInvestor.id]) highestInvestor = inv;
            if (scores[inv.id] < scores[lowestInvestor.id]) lowestInvestor = inv;
        });

        const highScore = scores[highestInvestor.id];
        const lowScore = scores[lowestInvestor.id];

        const lines: string[] = [];

        if (finalScore > 80) {
            lines.push(
                `Strong conviction across the committee. The ${highestInvestor.name} lens scores highest at ${highScore}, indicating exceptional alignment with the thesis.`
            );
        } else if (finalScore > 60) {
            lines.push(
                `Moderate-to-strong conviction. ${highestInvestor.name} is most bullish at ${highScore}. Worth building a position.`
            );
        } else if (finalScore >= 40) {
            lines.push(
                `Mixed signals from the committee. Conviction is split — ${highestInvestor.name} scores ${highScore} but ${lowestInvestor.name} flags concern at ${lowScore}.`
            );
        } else {
            lines.push(
                `Weak conviction. ${lowestInvestor.name} scores only ${lowScore}, signaling significant risk. Consider passing.`
            );
        }

        if (lowestInvestor.engine === "cycle" && lowScore < 40) {
            lines.push(
                `⚠️ CYCLE WARNING: Howard Marks' risk score of ${lowScore} suggests overheated conditions. Exercise extreme caution.`
            );
        }

        if (lowestInvestor.engine === "regime" && lowScore < 40) {
            lines.push(
                `📉 MACRO HEADWIND: The regime overlay (${lowestInvestor.name}: ${lowScore}) suggests unfavorable macro conditions.`
            );
        }

        return lines.join(" ");
    }, [scores, finalScore]);

    const setAllScores = useCallback((newScores: Record<string, number>) => {
        setScores((prev) => ({ ...prev, ...newScores }));
    }, []);

    return {
        scores,
        setScore,
        setAllScores,
        resetScores,
        finalScore,
        engineScores,
        verdict,
        verdictInfo,
        summary,
        engines: dynamicEngines,
    };
}
