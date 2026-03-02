import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { STOCK_UNIVERSE } from "@/lib/nasdaqUniverse";
import { computeSuggestedScores } from "@/lib/suggestedScores";
import { calculateRegimeWeights, mapToInvestorWeights, type MarketData } from "@/lib/regimeEngine";
import type { FinancialDataResult } from "@/hooks/useFinancialData";

const yahooFinance = new YahooFinance();

// Fetch financial data for a single ticker (simplified)
async function fetchTickerData(ticker: string): Promise<FinancialDataResult | null> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const quote: any = await yahooFinance.quoteSummary(ticker, {
            modules: ["financialData", "defaultKeyStatistics", "price", "summaryDetail"],
        });

        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);

        let priceHistory: { date: string; close: number }[] = [];
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const historical: any[] = await yahooFinance.historical(ticker, {
                period1: startDate.toISOString().split("T")[0],
                period2: endDate.toISOString().split("T")[0],
                interval: "1d",
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            priceHistory = historical.map((h: any) => ({
                date: h.date instanceof Date ? h.date.toISOString().split("T")[0] : String(h.date),
                close: h.close ?? 0,
            }));
        } catch {
            priceHistory = [];
        }

        const fd = quote.financialData;
        const ks = quote.defaultKeyStatistics;
        const price = quote.price;
        const sd = quote.summaryDetail;

        return {
            ticker: ticker.toUpperCase(),
            name: price?.shortName || price?.longName || ticker.toUpperCase(),
            fundamentals: {
                roe: fd?.returnOnEquity ? Math.round(fd.returnOnEquity * 10000) / 100 : undefined,
                revenueGrowth: fd?.revenueGrowth ? Math.round(fd.revenueGrowth * 10000) / 100 : undefined,
                grossMargin: fd?.grossMargins ? Math.round(fd.grossMargins * 10000) / 100 : undefined,
                freeCashFlow: fd?.freeCashflow || undefined,
            },
            valuation: {
                marketCap: price?.marketCap || undefined,
                peRatio: sd?.trailingPE || undefined,
                forwardPE: sd?.forwardPE || ks?.forwardPE || undefined,
                pegRatio: ks?.pegRatio || undefined,
            },
            technical: {
                fiftyTwoWeekHigh: sd?.fiftyTwoWeekHigh || undefined,
                fiftyTwoWeekLow: sd?.fiftyTwoWeekLow || undefined,
                beta: sd?.beta || ks?.beta || undefined,
                fiftyDayAvg: sd?.fiftyDayAverage || undefined,
                currentPrice: fd?.currentPrice || price?.regularMarketPrice || undefined,
            },
            volatility: {
                beta: sd?.beta || ks?.beta || undefined,
            },
            priceHistory,
        };
    } catch (err) {
        console.error(`Failed to fetch ${ticker}:`, err);
        return null;
    }
}

// Compute the final weighted score for a stock
function computeFinalScore(
    investorScores: Record<string, number>,
    investorWeights: Record<string, number>
): number {
    let total = 0;
    for (const [id, score] of Object.entries(investorScores)) {
        const w = investorWeights[id] ?? 10;
        total += score * (w / 100);
    }
    return Math.round(total * 100) / 100;
}

function getVerdict(score: number): string {
    if (score > 80) return "STRONG BUY";
    if (score > 60) return "BUY";
    if (score >= 40) return "HOLD";
    return "REJECT";
}

function getVerdictColor(verdict: string): string {
    switch (verdict) {
        case "STRONG BUY": return "#A855F7";
        case "BUY": return "#22C55E";
        case "HOLD": return "#EAB308";
        default: return "#EF4444";
    }
}

export interface ScanResult {
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

export async function GET() {
    try {
        // 1. Fetch regime data and build MarketData for the engine
        let marketData: MarketData = {
            price: 500, sma200: 480, vix: 20, yieldCurve: 0.5, creditSpread: 0,
        };

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const [vixQ, spyQ, tnxQ, twoYQ]: any[] = await Promise.all([
                yahooFinance.quoteSummary("^VIX", { modules: ["price"] }),
                yahooFinance.quoteSummary("SPY", { modules: ["summaryDetail", "price"] }),
                yahooFinance.quoteSummary("^TNX", { modules: ["price"] }).catch(() => null),
                yahooFinance.quoteSummary("^IRX", { modules: ["price"] }).catch(() => null),
            ]);
            const vix = vixQ?.price?.regularMarketPrice ?? 20;
            const spyPrice = spyQ?.price?.regularMarketPrice ?? 500;
            const spy200dma = spyQ?.summaryDetail?.twoHundredDayAverage ?? 480;
            const tenY = tnxQ?.price?.regularMarketPrice ?? 4.0;
            const twoY = twoYQ?.price?.regularMarketPrice ?? 4.0;

            marketData = {
                price: spyPrice,
                sma200: spy200dma,
                vix,
                yieldCurve: tenY - twoY,
                creditSpread: 0,
            };
        } catch (err) {
            console.error("Failed to fetch regime data for scan:", err);
        }

        const committeeResult = calculateRegimeWeights(marketData);
        const investorWeights = mapToInvestorWeights(committeeResult);

        // 2. Fetch financials for all tickers in batches of 5
        const BATCH_SIZE = 5;
        const allData: (FinancialDataResult | null)[] = [];
        const tickers = STOCK_UNIVERSE.map((s) => s.ticker);

        for (let i = 0; i < tickers.length; i += BATCH_SIZE) {
            const batch = tickers.slice(i, i + BATCH_SIZE);
            const results = await Promise.all(batch.map(fetchTickerData));
            allData.push(...results);
        }

        // 3. Score each stock
        const results: ScanResult[] = [];
        for (let i = 0; i < STOCK_UNIVERSE.length; i++) {
            const stock = STOCK_UNIVERSE[i];
            const data = allData[i];
            if (!data) continue;

            const investorScores = computeSuggestedScores(data);
            const finalScore = computeFinalScore(investorScores, investorWeights);
            const verdict = getVerdict(finalScore);

            results.push({
                ticker: stock.ticker,
                name: data.name || stock.name,
                sector: stock.sector,
                finalScore,
                verdict,
                verdictColor: getVerdictColor(verdict),
                investorScores,
                metrics: {
                    peRatio: data.valuation.peRatio,
                    roe: data.fundamentals.roe,
                    revenueGrowth: data.fundamentals.revenueGrowth,
                    grossMargin: data.fundamentals.grossMargin,
                    beta: data.technical.beta,
                    currentPrice: data.technical.currentPrice,
                    marketCap: data.valuation.marketCap,
                },
            });
        }

        // 4. Sort by score descending
        results.sort((a, b) => b.finalScore - a.finalScore);

        return NextResponse.json({
            regime: committeeResult.regimeKey,
            vix: Math.round(marketData.vix * 100) / 100,
            scannedAt: new Date().toISOString(),
            results,
        });
    } catch (err) {
        console.error("Scan API error:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Scan failed" },
            { status: 500 }
        );
    }
}
