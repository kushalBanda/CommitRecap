"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import type { ContributionHeatmap } from "@/types/api";

interface ContributionDotsProps {
  heatmap: ContributionHeatmap;
  className?: string;
  dotSize?: number;
  gap?: number;
  showWeekdays?: boolean;
}

export function ContributionDots({
  heatmap,
  className = "",
  dotSize = 10,
  gap = 3,
}: ContributionDotsProps) {
  // Transform heatmap data into a grid format
  const { grid, maxCount } = useMemo(() => {
    const weeks: { date: string; count: number }[][] = [];
    let max = 0;

    heatmap.weeks.forEach((week) => {
      const weekData = week.contributionDays.map((day) => {
        if (day.contributionCount > max) max = day.contributionCount;
        return {
          date: day.date,
          count: day.contributionCount,
        };
      });
      weeks.push(weekData);
    });

    return { grid: weeks, maxCount: max };
  }, [heatmap]);

  const getDotColor = (count: number) => {
    if (count === 0) return "var(--dot-empty)";
    const intensity = count / maxCount;
    if (intensity < 0.25) return "var(--dot-low)";
    if (intensity < 0.5) return "var(--dot-medium)";
    return "var(--dot-high)";
  };

  return (
    <div className={`flex gap-[${gap}px] ${className}`} style={{ gap }}>
      {grid.map((week, weekIndex) => (
        <div 
          key={weekIndex} 
          className="flex flex-col" 
          style={{ gap }}
        >
          {week.map((day, dayIndex) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: (weekIndex * 7 + dayIndex) * 0.003,
                duration: 0.2,
              }}
              style={{
                width: dotSize,
                height: dotSize,
                backgroundColor: getDotColor(day.count),
              }}
              className="rounded-full"
              title={`${day.date}: ${day.count} contributions`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Compact version for the summary card
export function ContributionDotsCompact({
  heatmap,
  className = "",
}: {
  heatmap: ContributionHeatmap;
  className?: string;
}) {
  // Only show last ~20 weeks for compact view
  const recentWeeks = useMemo(() => {
    const weeks = heatmap.weeks.slice(-20);
    let maxCount = 0;
    
    weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        if (day.contributionCount > maxCount) {
          maxCount = day.contributionCount;
        }
      });
    });

    return { weeks, maxCount };
  }, [heatmap]);

  const getDotColor = (count: number) => {
    if (count === 0) return "var(--dot-empty)";
    const intensity = count / recentWeeks.maxCount;
    if (intensity < 0.25) return "var(--dot-low)";
    if (intensity < 0.5) return "var(--dot-medium)";
    return "var(--dot-high)";
  };

  return (
    <div className={`flex gap-[2px] ${className}`}>
      {recentWeeks.weeks.map((week, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-[2px]">
          {week.contributionDays.map((day) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: weekIndex * 0.02,
                duration: 0.3,
              }}
              style={{
                width: 8,
                height: 8,
                backgroundColor: getDotColor(day.contributionCount),
              }}
              className="rounded-full"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

