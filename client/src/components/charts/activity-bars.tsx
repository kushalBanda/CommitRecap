"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { ContributionHeatmap } from "@/types/api";

interface ActivityBarsProps {
  heatmap: ContributionHeatmap;
  highlightDate?: string;
  highlightLabel?: string;
  showMonthLabels?: boolean;
  className?: string;
  barWidth?: number;
  maxHeight?: number;
  interactive?: boolean;
}

interface DayData {
  date: string;
  count: number;
  month: number;
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ActivityBars({
  heatmap,
  highlightDate,
  highlightLabel,
  showMonthLabels = true,
  className = "",
  barWidth = 3,
  maxHeight = 120,
  interactive = true,
}: ActivityBarsProps) {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  // Transform heatmap data into daily counts
  const dailyData = useMemo(() => {
    const days: DayData[] = [];
    
    heatmap.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        const date = new Date(day.date);
        days.push({
          date: day.date,
          count: day.contributionCount,
          month: date.getMonth(),
        });
      });
    });

    return days;
  }, [heatmap]);

  // Find max count for scaling
  const maxCount = useMemo(() => {
    return Math.max(...dailyData.map((d) => d.count), 1);
  }, [dailyData]);

  // Find peak day
  const peakDay = useMemo(() => {
    return dailyData.reduce((max, day) => 
      day.count > max.count ? day : max, 
      dailyData[0] || { date: "", count: 0, month: 0 }
    );
  }, [dailyData]);

  // Calculate month positions for labels
  const monthPositions = useMemo(() => {
    const positions: { month: number; startIndex: number }[] = [];
    let currentMonth = -1;

    dailyData.forEach((day, index) => {
      if (day.month !== currentMonth) {
        positions.push({ month: day.month, startIndex: index });
        currentMonth = day.month;
      }
    });

    return positions;
  }, [dailyData]);

  const getBarHeight = (count: number) => {
    if (count === 0) return 4; // Minimum height for visibility
    return Math.max(8, (count / maxCount) * maxHeight);
  };

  const isHighlighted = (date: string) => {
    if (highlightDate) return date === highlightDate;
    return date === peakDay.date;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className={`relative ${className}`}>
      {/* Hover tooltip */}
      {interactive && hoveredDay && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg z-10 pointer-events-none"
        >
          <p className="text-sm font-medium text-foreground">{formatDate(hoveredDay.date)}</p>
          <p className="text-xs text-muted-foreground">{hoveredDay.count} contributions</p>
        </motion.div>
      )}

      {/* Highlight label for peak */}
      {(highlightLabel || isHighlighted(peakDay.date)) && !hoveredDay && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center pointer-events-none">
          <p className="text-xs text-muted-foreground">{formatDate(highlightDate || peakDay.date)}</p>
          <p className="text-sm font-medium text-foreground">{highlightLabel || "Peak Activity"}</p>
        </div>
      )}

      {/* Bars container */}
      <div 
        className="flex items-end gap-[1px] overflow-x-auto scrollbar-hide"
        style={{ height: maxHeight + 40 }}
      >
        {dailyData.map((day, index) => {
          const height = getBarHeight(day.count);
          const highlighted = isHighlighted(day.date);

          return (
            <motion.div
              key={day.date}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ 
                delay: index * 0.002, 
                duration: 0.4,
                ease: "easeOut"
              }}
              style={{ 
                height,
                width: barWidth,
                transformOrigin: "bottom",
              }}
              className={`
                rounded-t-sm transition-colors duration-150 cursor-pointer
                ${highlighted 
                  ? "bg-primary" 
                  : day.count > 0 
                    ? "bg-[var(--bar-inactive)] hover:bg-muted-foreground" 
                    : "bg-[var(--bar-inactive)] opacity-30"
                }
              `}
              onMouseEnter={() => interactive && setHoveredDay(day)}
              onMouseLeave={() => interactive && setHoveredDay(null)}
            />
          );
        })}
      </div>

      {/* Month labels */}
      {showMonthLabels && (
        <div className="relative mt-2 h-6">
          {monthPositions.map(({ month, startIndex }) => (
            <span
              key={`${month}-${startIndex}`}
              className="absolute text-xs text-muted-foreground"
              style={{ 
                left: `${(startIndex / dailyData.length) * 100}%`,
              }}
            >
              {MONTH_LABELS[month]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Simplified version for background decoration - no labels, just bars
export function ActivityBarsBackground({
  heatmap,
  className = "",
}: {
  heatmap: ContributionHeatmap;
  className?: string;
}) {
  // Transform heatmap data into daily counts
  const dailyData = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    
    heatmap.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        days.push({
          date: day.date,
          count: day.contributionCount,
        });
      });
    });

    return days;
  }, [heatmap]);

  // Find max count for scaling
  const maxCount = useMemo(() => {
    return Math.max(...dailyData.map((d) => d.count), 1);
  }, [dailyData]);

  const maxHeight = 200;
  const barWidth = 2;

  const getBarHeight = (count: number) => {
    if (count === 0) return 4;
    return Math.max(8, (count / maxCount) * maxHeight);
  };

  return (
    <div className={`opacity-30 ${className}`}>
      <div 
        className="flex items-end gap-[1px] overflow-hidden"
        style={{ height: maxHeight + 20 }}
      >
        {dailyData.map((day, index) => {
          const height = getBarHeight(day.count);
          // Highlight high activity days (top 10%)
          const isHighActivity = day.count > maxCount * 0.7;

          return (
            <motion.div
              key={day.date}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ 
                delay: index * 0.001, 
                duration: 0.3,
              }}
              style={{ 
                height,
                width: barWidth,
                transformOrigin: "bottom",
              }}
              className={`rounded-t-sm ${
                isHighActivity 
                  ? "bg-primary/80" 
                  : day.count > 0 
                    ? "bg-[var(--bar-inactive)]" 
                    : "bg-[var(--bar-inactive)] opacity-30"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

