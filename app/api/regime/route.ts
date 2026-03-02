import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export interface RegimeData {
    vix: number;
    priceVs200dma: "above" | "below";
    spyPrice: number;
    spy200dma: number;
    hySpreadWidening: boolean;
    yieldCurveInverted: boolean;
    tenYearYield: number;
    twoYearYield: number;
}

export async function GET() {
    try {
        // Fetch all regime indicators in parallel
        const [vixQuote, spyQuote, hygQuote, lqdQuote, tnxQuote, irxQuote] =
            await Promise.allSettled([
                // VIX
                yahooFinance.quoteSummary("^VIX", { modules: ["price"] }),
                // SPY for 200DMA
                yahooFinance.quoteSummary("SPY", {
                    modules: ["summaryDetail", "price"],
                }),
                // HYG (High Yield Bond ETF) — credit risk proxy
                yahooFinance.quoteSummary("HYG", {
                    modules: ["summaryDetail", "price"],
                }),
                // LQD (Investment Grade Bond ETF) — credit benchmark
                yahooFinance.quoteSummary("LQD", {
                    modules: ["summaryDetail", "price"],
                }),
                // 10-Year Treasury Yield
                yahooFinance.quoteSummary("^TNX", { modules: ["price"] }),
                // 13-Week Treasury Bill (2Y proxy)
                yahooFinance.quoteSummary("^IRX", { modules: ["price"] }),
            ]);

        // ── VIX ──
        let vix = 20; // default normal
        if (vixQuote.status === "fulfilled") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const q = vixQuote.value as any;
            vix =
                q?.price?.regularMarketPrice ?? q?.price?.regularMarketOpen ?? 20;
        }

        // ── SPY vs 200DMA ──
        let spyPrice = 0;
        let spy200dma = 0;
        let priceVs200dma: "above" | "below" = "above";
        if (spyQuote.status === "fulfilled") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const q = spyQuote.value as any;
            spyPrice =
                q?.price?.regularMarketPrice ?? 0;
            spy200dma =
                q?.summaryDetail?.twoHundredDayAverage ?? 0;
            if (spyPrice > 0 && spy200dma > 0) {
                priceVs200dma = spyPrice > spy200dma ? "above" : "below";
            }
        }

        // ── HY Spread (HYG vs LQD performance divergence) ──
        let hySpreadWidening = false;
        if (
            hygQuote.status === "fulfilled" &&
            lqdQuote.status === "fulfilled"
        ) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const hyg = hygQuote.value as any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const lqd = lqdQuote.value as any;
            const hygPrice = hyg?.price?.regularMarketPrice ?? 0;
            const hyg50d = hyg?.summaryDetail?.fiftyDayAverage ?? hygPrice;
            const lqdPrice = lqd?.price?.regularMarketPrice ?? 0;
            const lqd50d = lqd?.summaryDetail?.fiftyDayAverage ?? lqdPrice;

            if (hyg50d > 0 && lqd50d > 0) {
                const hygReturn = (hygPrice - hyg50d) / hyg50d;
                const lqdReturn = (lqdPrice - lqd50d) / lqd50d;
                // If HYG underperforms LQD, spreads are widening (stress)
                hySpreadWidening = hygReturn < lqdReturn - 0.005;
            }
        }

        // ── Yield Curve (10Y - 2Y) ──
        let tenYearYield = 4.0;
        let twoYearYield = 4.0;
        let yieldCurveInverted = false;
        if (tnxQuote.status === "fulfilled") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const q = tnxQuote.value as any;
            tenYearYield = q?.price?.regularMarketPrice ?? 4.0;
        }
        if (irxQuote.status === "fulfilled") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const q = irxQuote.value as any;
            twoYearYield = q?.price?.regularMarketPrice ?? 4.0;
        }
        yieldCurveInverted = tenYearYield < twoYearYield;

        const result: RegimeData = {
            vix: Math.round(vix * 100) / 100,
            priceVs200dma,
            spyPrice: Math.round(spyPrice * 100) / 100,
            spy200dma: Math.round(spy200dma * 100) / 100,
            hySpreadWidening,
            yieldCurveInverted,
            tenYearYield: Math.round(tenYearYield * 100) / 100,
            twoYearYield: Math.round(twoYearYield * 100) / 100,
        };

        return NextResponse.json(result);
    } catch (err) {
        console.error("Regime API error:", err);
        return NextResponse.json(
            {
                error:
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch regime data",
            },
            { status: 500 }
        );
    }
}
