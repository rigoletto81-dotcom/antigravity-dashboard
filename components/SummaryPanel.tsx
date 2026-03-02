"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";

interface SummaryPanelProps {
    summary: string;
    verdict: string;
    verdictColor: string;
}

export function SummaryPanel({
    summary,
    verdict,
    verdictColor,
}: SummaryPanelProps) {
    return (
        <motion.div
            className="glass-card p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
        >
            <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-white/30" />
                <h3 className="text-sm font-semibold text-white/70">
                    Committee Summary
                </h3>
                <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full ml-auto"
                    style={{
                        backgroundColor: `${verdictColor}15`,
                        color: verdictColor,
                        border: `1px solid ${verdictColor}30`,
                    }}
                >
                    {verdict}
                </span>
            </div>

            <motion.p
                key={summary}
                className="text-sm text-white/50 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {summary}
            </motion.p>
        </motion.div>
    );
}
