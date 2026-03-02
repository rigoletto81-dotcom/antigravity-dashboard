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
            "역사적으로 2017년과 유사한 구간입니다. 우량주(Buffett)와 성장주(Coleman)의 복리 효과를 극대화하며 추세를 즐기십시오.";
    } else if (isTrendBull && isVolHigh) {
        // Quadrant 2: Reflexive Boom (상승장 + 높은 변동성 / 버블 후반)
        regimeName = "Volatile Melt-up";
        regimeKey = "meltup";
        weights = { secular: 25, regime: 15, tactical: 45, cycle: 15 };
        rationale =
            "1999년이나 2021년과 유사합니다. 펀더멘털보다 수급과 모멘텀(PTJ/Griffin)이 지배합니다. 언제든 탈출할 준비를 하며 모멘텀을 추종하십시오.";
    } else if (!isTrendBull && !isVolHigh) {
        // Quadrant 3: Defensive Grind (하락장 + 낮은 변동성 / 완만한 침체)
        regimeName = "Defensive Consolidation";
        regimeKey = "defensive";
        weights = { secular: 35, regime: 35, tactical: 10, cycle: 20 };
        rationale =
            "2022년형 하락장입니다. 화려한 성장보다 확실한 현금흐름(Ackman)과 거시적 방어(Druckenmiller)가 계좌를 지킵니다.";
    } else {
        // Quadrant 4: Panic / Capitulation (하락장 + 높은 변동성 / 위기)
        regimeName = "Market Crash / Panic";
        regimeKey = "crash";
        weights = { secular: 10, regime: 40, tactical: 15, cycle: 35 };
        rationale =
            "2008년과 2020년 3월의 모습입니다. Howard Marks의 사이클 경고를 최우선으로 하며, 역발상 기회를 노리는 'Regime' 엔진에 집중하십시오.";
    }

    // ---------------------------------------------------------
    // 3. 정교한 Overrides (25년 백테스트 특이점 반영)
    // ---------------------------------------------------------

    // [Tepper Rule] 공포가 극에 달했을 때 (VIX 45+)
    if (vix > 45) {
        weights.regime = 60;
        weights.secular = 5;
        rationale =
            "역대급 매수 기회입니다. David Tepper 모드 가동. 밸류에이션 무시, 극단적 저평가 배팅을 지향합니다.";
    }

    // [Liquidity/Recession Rule] 장단기 금리차 역전 심화
    if (yieldCurve < -0.3) {
        weights.secular -= 10;
        weights.cycle += 10;
        rationale +=
            " 경기 침체 신호(금리 역전)가 감지되었습니다. 성장주 비중을 줄이고 안전 마진을 확보하십시오.";
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
