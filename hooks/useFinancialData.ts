"use client";

import { useState, useCallback } from "react";

export interface FundamentalData {
    roe?: number;
    revenueGrowth?: number;
    grossMargin?: number;
    freeCashFlow?: number;
}

export interface ValuationData {
    marketCap?: number;
    peRatio?: number;
    forwardPE?: number;
    pegRatio?: number;
}

export interface TechnicalData {
    fiftyTwoWeekHigh?: number;
    fiftyTwoWeekLow?: number;
    beta?: number;
    fiftyDayAvg?: number;
    currentPrice?: number;
}

export interface VolatilityData {
    beta?: number;
    // VIX proxy
}

export interface PricePoint {
    date: string;
    close: number;
}

export interface FinancialDataResult {
    ticker: string;
    name: string;
    fundamentals: FundamentalData;
    valuation: ValuationData;
    technical: TechnicalData;
    volatility: VolatilityData;
    priceHistory: PricePoint[];
}

export function useFinancialData() {
    const [data, setData] = useState<FinancialDataResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (ticker: string) => {
        if (!ticker.trim()) return;

        setLoading(true);
        setError(null);
        setData(null);

        try {
            const res = await fetch(
                `/api/finance?ticker=${encodeURIComponent(ticker.toUpperCase())}`
            );
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || `Failed to fetch data (${res.status})`);
            }
            const result: FinancialDataResult = await res.json();
            setData(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, []);

    const clearData = useCallback(() => {
        setData(null);
        setError(null);
    }, []);

    return { data, loading, error, fetchData, clearData };
}
