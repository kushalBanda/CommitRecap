"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useRecapStore } from "@/stores/recap-store";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { KeyboardHint } from "@/components/shared/keyboard-hint";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MonthlyJourneyPage() {
  const { recapData } = useRecapStore();

  if (!recapData) return null;

  const { monthly, year } = recapData;
  const monthlyData = monthly.monthly_counts;

  // Transform and calculate stats
  const { chartData, maxCommits, peakMonthIndex, totalCommits } = useMemo(() => {
    const data = MONTH_NAMES.map((month, index) => {
      const monthKey = Object.keys(monthlyData).find((key) => {
        const monthNum = parseInt(key.split("-")[1]);
        return monthNum === index + 1;
      });
      return {
        month,
        commits: monthKey ? monthlyData[monthKey] : 0,
        index,
      };
    });

    const max = Math.max(...data.map((d) => d.commits), 1);
    const peak = data.reduce((maxIdx, item, idx, arr) => 
      item.commits > arr[maxIdx].commits ? idx : maxIdx, 0);
    const total = data.reduce((sum, d) => sum + d.commits, 0);

    return { chartData: data, maxCommits: max, peakMonthIndex: peak, totalCommits: total };
  }, [monthlyData]);

  const maxBarHeight = 280; // Fixed max height in pixels

  return (
    <section className="relative min-h-screen w-full snap-start snap-always flex flex-col">
      <div className="flex-1 flex flex-col justify-between px-6 md:px-12 lg:px-24 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Narrative */}
          <p className="text-narrative">
            You kept the momentum going:
          </p>

          {/* Large stats row */}
          <div className="flex gap-16 mt-8">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Commits</p>
              <div className="flex items-baseline gap-2">
                <span className="text-display text-foreground font-serif">
                  <AnimatedNumber value={totalCommits} />
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Pull Requests</p>
              <span className="text-display-sm text-muted-foreground font-serif">
                <AnimatedNumber value={year.pull_requests} />
              </span>
            </div>
          </div>
        </motion.div>

        {/* Monthly breakdown with numbers */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="grid grid-cols-6 md:grid-cols-12 gap-x-2 gap-y-4 my-6"
        >
          {chartData.map((item) => (
            <div key={item.month} className="text-left">
              <p className="text-xs text-muted-foreground">{item.month}</p>
              <p className={`text-base md:text-lg font-medium ${item.commits > 0 ? "text-foreground" : "text-muted-foreground/40"}`}>
                {item.commits > 0 ? item.commits : "—"}
              </p>
              {item.commits > 0 && (
                <p className="text-[10px] text-muted-foreground hidden md:block">
                  {item.commits === 1 ? "Commit" : "Commits"}
                </p>
              )}
            </div>
          ))}
        </motion.div>

        {/* Bar chart - using pixel heights for reliability */}
        <div className="flex-1 flex items-end pb-2">
          <div 
            className="w-full flex items-end gap-2 md:gap-3 lg:gap-4"
            style={{ height: maxBarHeight }}
          >
            {chartData.map((item, index) => {
              // Calculate pixel height based on commits
              const barHeight = item.commits > 0 
                ? Math.max(20, (item.commits / maxCommits) * maxBarHeight) 
                : 8;
              const isPeak = index === peakMonthIndex && item.commits > 0;

              return (
                <motion.div
                  key={item.month}
                  className="flex-1"
                  initial={{ height: 0 }}
                  whileInView={{ height: barHeight }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.3 + index * 0.04,
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                >
                  <div
                    className={`w-full h-full rounded-t-sm ${
                      isPeak 
                        ? "bg-primary" 
                        : item.commits > 0 
                          ? "bg-[var(--bar-inactive)]" 
                          : "bg-[var(--bar-inactive)] opacity-20"
                    }`}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Month labels under bars */}
        <div className="flex gap-2 md:gap-3 lg:gap-4 mt-2">
          {chartData.map((item, index) => (
            <div key={`label-${item.month}`} className="flex-1 text-center">
              <span className={`text-xs ${index === peakMonthIndex && chartData[index].commits > 0 ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {item.month}
              </span>
            </div>
          ))}
        </div>

        {/* Navigation hint */}
        <div className="flex justify-center mt-6">
          <KeyboardHint />
        </div>
      </div>
    </section>
  );
}
