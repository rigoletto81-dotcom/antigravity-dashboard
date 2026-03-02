/**
 * Antigravity Investment Committee: Dynamic Weighting Engine v2.0
 * Based on 25-Year Market Backtest (2000-2025)
 */

export type MarketData = {
    price: number;
    sma200: number;
    vix: number;
    yieldCurve: number; // 10Y - 2Y Spread
    creditSpread: number; // Optional: HY Spread (BAMLH0A0HYM2)
};

export type CommitteeWeights = {
    secular: number;
    regime: number;
    tactical: number;
    cycle: number;
    regimeName: string;
    regimeKey: "goldilocks" | "meltup" | "defensive" | "crash";
    rationale: string;
};

export const calculateRegimeWeights = (data: MarketData): CommitteeWeights => {
    const { price, sma200, vix, yieldCurve } = data;

    // 1. 기본 상태 판별 (4분면 로직)
    const isTrendBull = price > sma200;
    const isVolHigh = vix > 22; // 25년 평균 VIX 19~20을 상회하는 시점

    let weights: { secular: number; regime: number; tactical: number; cycle: number } = {
        secular: 30,
        regime: 40,
        tactical: 20,
        cycle: 10,
    };

    let regimeName = "";
    let regimeKey: CommitteeWeights["regimeKey"] = "defensive";
    let rationale = "";

    // ---------------------------------------------------------
    // 2. 4분면 기반 가중치 할당
    // ---------------------------------------------------------

    if (isTrendBull && !isVolHigh) {
        // Quadrant 1: Goldilocks (상승장 + 낮은 변동성)
        regimeName = "Goldilocks Expansion";
        regimeKey = "goldilocks";
        weights = { secular: 45, regime: 20, tactical: 25, cycle: 10 };
        rationale =
            "Historically similar to 2017. Maximize the compounding effect of quality stocks (Buffett) and growth stocks (Coleman) and enjoy the trend.";
    } else if (isTrendBull && isVolHigh) {
        // Quadrant 2: Reflexive Boom (상승장 + 높은 변동성 / 버블 후반)
        regimeName = "Volatile Melt-up";
        regimeKey = "meltup";
        weights = { secular: 25, regime: 15, tactical: 45, cycle: 15 };
        rationale =
            "Similar to 1999 or 2021. The market is driven by flows and momentum (PTJ/Griffin) rather than fundamentals. Be ready to exit at any time while following the momentum.";
    } else if (!isTrendBull && !isVolHigh) {
        // Quadrant 3: Defensive Grind (하락장 + 낮은 변동성 / 완만한 침체)
        regimeName = "Defensive Consolidation";
        regimeKey = "defensive";
        weights = { secular: 35, regime: 35, tactical: 10, cycle: 20 };
        rationale =
            "A 2022-style bear market. Reliable cash flows (Ackman) and macro defense (Druckenmiller) protect the account better than flashy growth.";
    } else {
        // Quadrant 4: Panic / Capitulation (하락장 + 높은 변동성 / 위기)
        regimeName = "Market Crash / Panic";
        regimeKey = "crash";
        weights = { secular: 10, regime: 40, tactical: 15, cycle: 35 };
        rationale =
            "Reminiscent of 2008 and March 2020. Prioritize Howard Marks' cycle warnings and focus on the 'Regime' engine looking for contrarian opportunities.";
    }

    // ---------------------------------------------------------
    // 3. 정교한 Overrides (25년 백테스트 특이점 반영)
    // ---------------------------------------------------------

    // [Tepper Rule] 공포가 극에 달했을 때 (VIX 45+)
    if (vix > 45) {
        weights.regime = 60;
        weights.secular = 5;
        rationale =
            "An unprecedented buying opportunity. Activating David Tepper mode. Ignoring valuation and betting on extreme undervaluation.";
    }

    // [Liquidity/Recession Rule] 장단기 금리차 역전 심화
    if (yieldCurve < -0.3) {
        weights.secular -= 10;
        weights.cycle += 10;
        rationale +=
            " Recession signal (yield curve inversion) detected. Reduce growth stock exposure and secure a margin of safety.";
    }

    // ---------------------------------------------------------
    // 4. 가중치 합계 정규화 (보정)
    // ---------------------------------------------------------
    const total = weights.secular + weights.regime + weights.tactical + weights.cycle;
    const normalizedWeights: CommitteeWeights = {
        secular: Math.round((weights.secular / total) * 100),
        regime: Math.round((weights.regime / total) * 100),
        tactical: Math.round((weights.tactical / total) * 100),
        cycle: Math.round((weights.cycle / total) * 100),
        regimeName,
        regimeKey,
        rationale,
    };

    return normalizedWeights;
};

/**
 * Map engine weights to individual investor weights.
 * Each engine has fixed investor proportions within it.
 */
export function mapToInvestorWeights(cw: CommitteeWeights): Record<string, number> {
    // Secular Engine: Buffett / Coleman / Ackman
    const buffett = Math.round(cw.secular * 0.45);
    const coleman = Math.round(cw.secular * 0.30);
    const ackman = cw.secular - buffett - coleman;

    // Regime Engine: Druckenmiller / Tepper / Soros
    const druckenmiller = Math.round(cw.regime * 0.40);
    const tepper = Math.round(cw.regime * 0.35);
    const soros = cw.regime - druckenmiller - tepper;

    // Tactical Engine: Griffin / PTJ
    const griffin = Math.round(cw.tactical * 0.50);
    const ptj = cw.tactical - griffin;

    // Cycle Engine: Marks
    const marks = cw.cycle;

    return { buffett, coleman, ackman, druckenmiller, tepper, soros, griffin, ptj, marks };
}
