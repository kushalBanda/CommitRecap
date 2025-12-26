"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useRecapStore } from "@/stores/recap-store";
import { ActivityBars } from "@/components/charts/activity-bars";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { KeyboardHint } from "@/components/shared/keyboard-hint";

export function ActivityTimelinePage() {
  const { recapData } = useRecapStore();

  if (!recapData) return null;

  const { heatmap, year } = recapData;

  // Find the peak day with a milestone
  const peakDay = useMemo(() => {
    let max = { date: "", count: 0 };
    
    heatmap.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        if (day.contributionCount > max.count) {
          max = { date: day.date, count: day.contributionCount };
        }
      });
    });

    return max;
  }, [heatmap]);

  const formatPeakDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section className="relative min-h-screen w-full snap-start snap-always flex flex-col">
      <div className="flex-1 flex flex-col justify-between px-6 md:px-12 lg:px-24 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-8"
        >
          {/* Narrative */}
          <motion.p variants={itemVariants} className="text-narrative">
            You put code to work:
          </motion.p>

          {/* Large stat */}
          <motion.div variants={itemVariants} className="flex items-baseline gap-4">
            <span className="text-display text-primary font-serif">
              <AnimatedNumber value={year.commits} />
            </span>
            <span className="text-2xl text-muted-foreground">commits</span>
          </motion.div>

          {/* Secondary stats */}
          <motion.div variants={itemVariants} className="flex gap-12 text-muted-foreground">
            <div>
              <span className="text-display-sm text-foreground font-serif">
                <AnimatedNumber value={year.pull_requests} />
              </span>
              <span className="ml-2 text-lg">PRs</span>
            </div>
            <div>
              <span className="text-display-sm text-foreground font-serif">
                <AnimatedNumber value={year.reviews} />
              </span>
              <span className="ml-2 text-lg">reviews</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Activity bars chart */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex-1 flex flex-col justify-center my-8"
        >
          {/* Peak indicator */}
          {peakDay.date && (
            <div className="mb-4 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{formatPeakDate(peakDay.date)}</p>
                <p className="text-sm font-medium text-foreground">Your busiest day</p>
              </div>
              <div className="h-px flex-1 bg-border" />
            </div>
          )}

          <ActivityBars
            heatmap={heatmap}
            highlightDate={peakDay.date}
            showHighlightLabel={false}
            showMonthLabels={true}
            barWidth={4}
            maxHeight={160}
          />
        </motion.div>

        {/* Navigation hint */}
        <div className="flex justify-center">
          <KeyboardHint />
        </div>
      </div>
    </section>
  );
}
