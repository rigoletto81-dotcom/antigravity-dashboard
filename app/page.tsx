"use client";

import { useState, useCallback, useEffect, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { Search, RotateCcw, Zap, Calendar, Wand2, HelpCircle, Trophy } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { useInvestmentScoring } from "@/hooks/useInvestmentScoring";
import { useFinancialData } from "@/hooks/useFinancialData";
import { useDynamicWeighting } from "@/hooks/useDynamicWeighting";
import { computeSuggestedScores } from "@/lib/suggestedScores";
import { EngineCard } from "@/components/EngineCard";
import { ScoreOrb } from "@/components/ScoreOrb";
import { FinancialDataPanel } from "@/components/FinancialDataPanel";
import { SummaryPanel } from "@/components/SummaryPanel";
import { RegimeBadge } from "@/components/RegimeBadge";
import { RationalePanel } from "@/components/RationalePanel";

export default function DashboardPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-neon-teal/30 border-t-neon-teal rounded-full animate-spin" />
            <span className="text-xs font-mono text-white/20 tracking-widest">INITIALIZING</span>
          </div>
        </div>
      }
    >
      <DashboardPage />
    </Suspense>
  );
}

function DashboardPage() {
  const [ticker, setTicker] = useState("");
  const [submittedTicker, setSubmittedTicker] = useState("");
  const [mounted, setMounted] = useState(false);
  const financial = useFinancialData();
  const dynamicWeighting = useDynamicWeighting();
  const lastAppliedTicker = useRef<string | null>(null);

  // Convert dynamic investor weights to Record<string, number> for the scoring hook
  const investorWeightsRecord = useMemo(() => {
    const w = dynamicWeighting.investorWeights;
    return {
      buffett: w.buffett,
      coleman: w.coleman,
      ackman: w.ackman,
      druckenmiller: w.druckenmiller,
      tepper: w.tepper,
      soros: w.soros,
      griffin: w.griffin,
      ptj: w.ptj,
      marks: w.marks,
    } as Record<string, number>;
  }, [dynamicWeighting.investorWeights]);

  const scoring = useInvestmentScoring(
    dynamicWeighting.regimeData ? investorWeightsRecord : undefined
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ?ticker= from /picks page link
  const searchParams = useSearchParams();
  useEffect(() => {
    if (!mounted) return;
    const urlTicker = searchParams.get("ticker");
    if (urlTicker && urlTicker !== submittedTicker) {
      const clean = urlTicker.replace(/[$\s]/g, "").toUpperCase();
      setTicker(clean);
      setSubmittedTicker(clean);
      lastAppliedTicker.current = null;
      financial.fetchData(clean);
      dynamicWeighting.fetchRegimeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, searchParams]);

  // Auto-apply suggested scores when financial data arrives
  useEffect(() => {
    if (
      financial.data &&
      financial.data.ticker !== lastAppliedTicker.current
    ) {
      const suggested = computeSuggestedScores(financial.data);
      scoring.setAllScores(suggested);
      lastAppliedTicker.current = financial.data.ticker;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [financial.data]);

  const dateStr = mounted
    ? new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : "";

  const handleTickerSubmit = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && ticker.trim()) {
        const clean = ticker.replace(/[$\s]/g, "").toUpperCase();
        setSubmittedTicker(clean);
        lastAppliedTicker.current = null; // allow re-apply
        financial.fetchData(clean);
        dynamicWeighting.fetchRegimeData();
      }
    },
    [ticker, financial, dynamicWeighting]
  );

  const handleTickerChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTicker(e.target.value);
    },
    []
  );

  const handleApplySuggested = useCallback(() => {
    if (financial.data) {
      const suggested = computeSuggestedScores(financial.data);
      scoring.setAllScores(suggested);
    }
  }, [financial.data, scoring]);

  // Prevent SSR hydration mismatch — render a minimal shell until client mounts
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-neon-teal/30 border-t-neon-teal rounded-full animate-spin" />
          <span className="text-xs font-mono text-white/20 tracking-widest">
            INITIALIZING
          </span>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="min-h-screen pb-12">
        {/* ── Header ─────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0A0A1A]/70 border-b border-white/5">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Top Row: Brand & Search */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <motion.div
                className="flex items-center gap-2 sm:gap-3 shrink-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="relative">
                  <Zap className="w-6 h-6 text-neon-teal" />
                  <motion.div
                    className="absolute inset-0 blur-lg bg-neon-teal/30"
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <h1 className="text-lg sm:text-xl font-black tracking-[0.08em] text-white/90 glow-teal">
                  STOCK SELECTING COMMITTEE
                </h1>
              </motion.div>

              {/* Ticker Input + Regime Badge */}
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <Input
                    type="text"
                    placeholder="$NVDA"
                    value={ticker}
                    onChange={handleTickerChange}
                    onKeyDown={handleTickerSubmit}
                    className="w-32 sm:w-40 pl-9 font-mono text-sm bg-white/[0.03] border-white/10 text-neon-teal placeholder:text-white/20 focus:border-neon-teal/30 focus:ring-neon-teal/10 uppercase"
                  />
                </div>
                {submittedTicker && (
                  <motion.div
                    className="hidden sm:flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-neon-teal/10 text-neon-teal border border-neon-teal/20">
                      ${submittedTicker}
                    </span>
                    {financial.data?.name && (
                      <span className="text-xs text-white/40 font-medium truncate max-w-[180px]">
                        {financial.data.name}
                      </span>
                    )}
                  </motion.div>
                )}
                {/* Regime Badge — shows once regime data is loaded */}
                {(dynamicWeighting.regimeData || dynamicWeighting.loading) && (
                  <RegimeBadge
                    regime={dynamicWeighting.regime}
                    loading={dynamicWeighting.loading}
                  />
                )}
              </motion.div>

            </div>

            {/* Bottom Row / Right Side: Buttons & Tools */}
            <motion.div
              className="flex flex-wrap items-center gap-2 sm:gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="hidden lg:flex items-center gap-1.5 text-white/20 text-xs mr-2">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-mono">{dateStr}</span>
              </div>
              {financial.data && (
                <button
                  onClick={handleApplySuggested}
                  className="flex items-center gap-1.5 text-[11px] text-neon-purple hover:text-neon-purple/80 transition-colors px-2.5 py-1.5 rounded-lg bg-neon-purple/10 hover:bg-neon-purple/15 border border-neon-purple/20"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Auto-Score
                </button>
              )}
              <Link
                href="/picks"
                className="flex items-center gap-1.5 text-[11px] text-amber-400/70 hover:text-amber-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-amber-400/5 border border-amber-400/10"
              >
                <Trophy className="w-3.5 h-3.5" />
                Top Picks
              </Link>
              <Link
                href="/help"
                className="flex items-center gap-1.5 text-[11px] text-white/60 hover:text-white transition-colors px-2.5 py-1.5 rounded-lg border border-white/10 hover:bg-white/10"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                About This App
              </Link>
              <button
                onClick={scoring.resetScores}
                className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-white/60 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-white/5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </motion.div>
          </div>
        </header>

        {/* ── Main Content ─────────────────────────────────── */}
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-6">
          {/* Score Orb (Centered) */}
          <section className="flex justify-center py-6 sm:py-10">
            <ScoreOrb score={scoring.finalScore} />
          </section>

          {/* Engine Cards Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {scoring.engines.map((engine, index) => (
              <EngineCard
                key={engine.id}
                engine={engine}
                scores={scoring.scores}
                engineScore={scoring.engineScores[engine.id] ?? 50}
                onScoreChange={scoring.setScore}
                index={index}
              />
            ))}
          </section>

          {/* Regime Rationale Panel — appears when regime data is available */}
          {dynamicWeighting.regimeData && (
            <section className="mt-5">
              <RationalePanel
                regime={dynamicWeighting.regime}
                rationale={dynamicWeighting.rationale}
                keyDriver={dynamicWeighting.keyDriver}
                attributions={dynamicWeighting.attributions}
                engineWeights={dynamicWeighting.engineWeights}
                regimeData={dynamicWeighting.regimeData}
              />
            </section>
          )}

          {/* Financial Data + Summary */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mt-5">
            {/* Financial Data Panel */}
            <FinancialDataPanel
              data={financial.data}
              loading={financial.loading}
              error={financial.error}
            />

            {/* Summary Panel */}
            <SummaryPanel
              summary={scoring.summary}
              verdict={scoring.verdictInfo.label}
              verdictColor={scoring.verdictInfo.color}
            />
          </section>

          {/* Footer */}
          <footer className="mt-12 text-center">
            <p className="text-[10px] font-mono text-white/10 tracking-wider">
              Stock Selecting Committee v1.0 — Not Financial Advice
            </p>
          </footer>
        </main>
      </div>
    </LazyMotion>
  );
}
