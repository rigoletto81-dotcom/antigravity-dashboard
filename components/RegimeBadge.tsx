"use client";

import { motion } from "framer-motion";
import type { RegimeInfo } from "@/hooks/useDynamicWeighting";

interface RegimeBadgeProps {
    regime: RegimeInfo;
    loading?: boolean;
}

export function RegimeBadge({ regime, loading }: RegimeBadgeProps) {
    if (loading) {
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                <div className="w-3 h-3 border border-white/20 border-t-white/50 rounded-full animate-spin" />
                <span className="text-[10px] font-mono text-white/30">
                    SCANNING
                </span>
            </div>
        );
    }

    return (
        <motion.div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
            style={{
                backgroundColor: regime.bgColor,
                borderColor: regime.borderColor,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            key={regime.type}
        >
            <span className="text-xs">{regime.icon}</span>
            <span
                className="text-[10px] font-mono font-bold tracking-wider"
                style={{ color: regime.color }}
            >
                {regime.label}
            </span>
        </motion.div>
    );
}
