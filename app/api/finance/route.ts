import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const ticker = searchParams.get("ticker");

    if (!ticker) {
        return NextResponse.json({ error: "Ticker is required" }, { status: 400 });
    }

    try {
        // Fetch quote summary — use type assertion due to yahoo-finance2 type inconsistencies
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const quote: any = await yahooFinance.quoteSummary(ticker, {
            modules: [
                "financialData",
                "defaultKeyStatistics",
                "price",
                "summaryDetail",
            ],
        });

        // Fetch historical prices (3 months)
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
                date:
                    h.date instanceof Date
                        ? h.date.toISOString().split("T")[0]
                        : String(h.date),
                close: h.close ?? 0,
            }));
        } catch {
            // Historical data may fail for some tickers
            priceHistory = [];
        }

        const fd = quote.financialData;
        const ks = quote.defaultKeyStatistics;
        const price = quote.price;
        const sd = quote.summaryDetail;

        const result = {
            ticker: ticker.toUpperCase(),
            name: price?.shortName || price?.longName || ticker.toUpperCase(),
            fundamentals: {
                roe: fd?.returnOnEquity
                    ? Math.round(fd.returnOnEquity * 10000) / 100
                    : undefined,
                revenueGrowth: fd?.revenueGrowth
                    ? Math.round(fd.revenueGrowth * 10000) / 100
                    : undefined,
                grossMargin: fd?.grossMargins
                    ? Math.round(fd.grossMargins * 10000) / 100
                    : undefined,
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
                currentPrice:
                    fd?.currentPrice || price?.regularMarketPrice || undefined,
            },
            volatility: {
                beta: sd?.beta || ks?.beta || undefined,
            },
            priceHistory,
        };

        return NextResponse.json(result);
    } catch (err) {
        console.error("Finance API error:", err);
        return NextResponse.json(
            {
                error:
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch financial data",
            },
            { status: 500 }
        );
    }
}
