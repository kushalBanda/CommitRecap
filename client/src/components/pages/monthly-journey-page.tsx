"use client";

import { motion } from "framer-motion";
import { TrendingUp, Calendar, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/page-container";
import { MonthlyBarChart } from "@/components/charts/monthly-bar-chart";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { useRecapStore } from "@/stores/recap-store";

const MONTH_FULL_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function MonthlyJourneyPage() {
  const { recapData } = useRecapStore();

  if (!recapData) return null;

  const { monthly } = recapData;
  const monthlyData = monthly.monthly_counts;

  // Calculate stats
  const entries = Object.entries(monthlyData);
  const totalCommits = entries.reduce((sum, [, count]) => sum + count, 0);
  const activeMonths = entries.filter(([, count]) => count > 0).length;
  const avgPerMonth = activeMonths > 0 ? Math.round(totalCommits / activeMonths) : 0;

  // Find peak month
  const peakEntry = entries.reduce(
    (max, [month, count]) => (count > max.count ? { month, count } : max),
    { month: "", count: 0 }
  );
  const peakMonthIndex = peakEntry.month ? parseInt(peakEntry.month.split("-")[1]) - 1 : 0;
  const peakMonthName = MONTH_FULL_NAMES[peakMonthIndex];

  // Calculate streak
  const getStreakInfo = () => {
    let maxStreak = 0;
    let currentStreak = 0;

    MONTH_FULL_NAMES.forEach((_, index) => {
      const monthKey = Object.keys(monthlyData).find((key) => {
        const monthNum = parseInt(key.split("-")[1]);
        return monthNum === index + 1;
      });
      const commits = monthKey ? monthlyData[monthKey] : 0;

      if (commits > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    return maxStreak;
  };

  const longestStreak = getStreakInfo();

  return (
    <PageContainer id="journey" className="bg-gradient-to-b from-background to-card/20">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Your Coding Journey Through 2025
          </h2>
          <p className="text-muted-foreground">
            A month-by-month breakdown of your commit activity
          </p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur text-center">
              <div className="text-3xl font-bold text-primary">
                <AnimatedNumber value={totalCommits} />
              </div>
              <p className="text-sm text-muted-foreground">Total Commits</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur text-center">
              <div className="text-3xl font-bold text-[#58a6ff]">
                <AnimatedNumber value={activeMonths} suffix="/12" />
              </div>
              <p className="text-sm text-muted-foreground">Active Months</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur text-center">
              <div className="text-3xl font-bold text-[#a371f7]">
                <AnimatedNumber value={avgPerMonth} />
              </div>
              <p className="text-sm text-muted-foreground">Avg per Month</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur text-center">
              <div className="flex items-center justify-center gap-1 text-3xl font-bold text-[#db6d28]">
                <Flame className="w-6 h-6" />
                <AnimatedNumber value={longestStreak} />
              </div>
              <p className="text-sm text-muted-foreground">Longest Streak</p>
            </Card>
          </motion.div>
        </div>

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <MonthlyBarChart data={monthlyData} />
        </motion.div>

        {/* Peak Month Highlight */}
        {peakEntry.count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center"
          >
            <Card className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-primary/30 max-w-md">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Peak Month</p>
                  <p className="text-2xl font-bold text-foreground">{peakMonthName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {peakEntry.count} commits
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      You were on fire!
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}
