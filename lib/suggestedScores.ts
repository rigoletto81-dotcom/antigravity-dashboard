import type { FinancialDataResult } from "@/hooks/useFinancialData";

/**
 * Clamp a value between 0 and 100.
 */
function clamp(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Linear interpolation: maps a value from [inMin, inMax] to [outMin, outMax].
 * Values outside the input range are clamped to the output range.
 */
function lerp(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
): number {
    if (value <= inMin) return outMin;
    if (value >= inMax) return outMax;
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
}

/**
 * Generate suggested scores for each investor based on fetched financial data.
 *
 * Each investor's score is derived from the financial metrics most relevant
 * to their investment philosophy:
 *
 * - Buffett: ROE + Gross Margin → structural moat
 * - Coleman: Revenue Growth → hyper-growth potential
 * - Ackman: Gross Margin + low Beta → simple/predictable
 * - Druckenmiller: Forward PE vs Trailing PE → macro improving
 * - Tepper: PE + PEG → cheap relative to risk
 * - Soros: Price vs 50-day avg → reflexivity/momentum
 * - Griffin: Position in 52W range + Beta → quant positioning
 * - PTJ: 3-month price trend → price action
 * - Marks: Beta as volatility proxy → cycle risk (high = safe, low beta = safe)
 */
export function computeSuggestedScores(
    data: FinancialDataResult
): Record<string, number> {
    const { fundamentals, valuation, technical, volatility, priceHistory } = data;

    // ── Buffett: "Is the moat structural?" ──
    // High ROE (>20% = great) + High Gross Margin (>50% = great)
    let buffett = 50;
    if (fundamentals.roe !== undefined) {
        buffett = lerp(fundamentals.roe, 0, 40, 20, 85);
    }
    if (fundamentals.grossMargin !== undefined) {
        const marginBonus = lerp(fundamentals.grossMargin, 20, 70, -10, 15);
        buffett += marginBonus;
    }
    buffett = clamp(buffett);

    // ── Coleman: "Is there hyper-growth potential?" ──
    // Revenue Growth: >30% = excellent, <0% = terrible
    let coleman = 50;
    if (fundamentals.revenueGrowth !== undefined) {
        coleman = lerp(fundamentals.revenueGrowth, -10, 60, 15, 90);
    }
    coleman = clamp(coleman);

    // ── Ackman: "Is the business simple/predictable?" ──
    // High Gross Margin (consistency) + Low Beta (predictability)
    let ackman = 50;
    if (fundamentals.grossMargin !== undefined) {
        ackman = lerp(fundamentals.grossMargin, 20, 70, 25, 75);
    }
    if (technical.beta !== undefined) {
        const betaPenalty = lerp(technical.beta, 0.5, 2.0, 15, -20);
        ackman += betaPenalty;
    }
    ackman = clamp(ackman);

    // ── Druckenmiller: "Does the macro regime support this?" ──
    // Forward PE < Trailing PE = earnings improving = macro supportive
    let druckenmiller = 50;
    if (valuation.forwardPE !== undefined && valuation.peRatio !== undefined) {
        const peImprovement =
            ((valuation.peRatio - valuation.forwardPE) / valuation.peRatio) * 100;
        druckenmiller = lerp(peImprovement, -20, 40, 25, 85);
    } else if (valuation.forwardPE !== undefined) {
        druckenmiller = lerp(valuation.forwardPE, 50, 10, 30, 80);
    }
    druckenmiller = clamp(druckenmiller);

    // ── Tepper: "Is it cheap relative to the risk?" ──
    // Low PE + Low PEG = cheap
    let tepper = 50;
    if (valuation.peRatio !== undefined) {
        tepper = lerp(valuation.peRatio, 50, 10, 25, 80);
    }
    if (valuation.pegRatio !== undefined) {
        const pegBonus = lerp(valuation.pegRatio, 3, 0.5, -15, 25);
        tepper += pegBonus;
    }
    tepper = clamp(tepper);

    // ── Soros: "Is the reflexivity positive?" ──
    // Price above 50-day avg = positive momentum/reflexivity
    let soros = 50;
    if (technical.currentPrice !== undefined && technical.fiftyDayAvg !== undefined) {
        const pctAbove =
            ((technical.currentPrice - technical.fiftyDayAvg) /
                technical.fiftyDayAvg) *
            100;
        soros = lerp(pctAbove, -15, 15, 20, 80);
    }
    soros = clamp(soros);

    // ── Griffin: "How is the quantitative positioning?" ──
    // Position in 52W range (higher = stronger) + moderate Beta
    let griffin = 50;
    if (
        technical.currentPrice !== undefined &&
        technical.fiftyTwoWeekHigh !== undefined &&
        technical.fiftyTwoWeekLow !== undefined
    ) {
        const range = technical.fiftyTwoWeekHigh - technical.fiftyTwoWeekLow;
        if (range > 0) {
            const position =
                ((technical.currentPrice - technical.fiftyTwoWeekLow) / range) * 100;
            griffin = lerp(position, 10, 90, 30, 80);
        }
    }
    griffin = clamp(griffin);

    // ── PTJ: "What does the price action/trend say?" ──
    // 3-month price change: positive trend = bullish
    let ptj = 50;
    if (
        priceHistory.length > 5 &&
        technical.currentPrice !== undefined
    ) {
        const startPrice = priceHistory[0].close;
        const pctChange =
            ((technical.currentPrice - startPrice) / startPrice) * 100;
        ptj = lerp(pctChange, -30, 30, 15, 85);
    }
    ptj = clamp(ptj);

    // ── Marks: "Where are we in the cycle? Is this overheated?" ──
    // HIGH score = Safe, LOW score = Dangerous
    // Low volatility (beta) = safe = high score
    // Also factor in proximity to 52W high (near high = potentially overheated)
    let marks = 60; // default slightly safe
    if (volatility.beta !== undefined) {
        marks = lerp(volatility.beta, 2.5, 0.5, 25, 80);
    }
    if (
        technical.currentPrice !== undefined &&
        technical.fiftyTwoWeekHigh !== undefined
    ) {
        const pctFromHigh =
            ((technical.fiftyTwoWeekHigh - technical.currentPrice) /
                technical.fiftyTwoWeekHigh) *
            100;
        // If very close to 52W high (< 5%), slightly reduce (overheated signal)
        // If far from high (> 20%), slightly increase (not overheated)
        const heatAdjust = lerp(pctFromHigh, 2, 25, -10, 15);
        marks += heatAdjust;
    }
    marks = clamp(marks);

    return {
        buffett,
        coleman,
        ackman,
        druckenmiller,
        tepper,
        soros,
        griffin,
        ptj,
        marks,
    };
}
