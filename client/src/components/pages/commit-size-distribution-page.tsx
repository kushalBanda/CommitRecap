"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useRecapStore } from "@/stores/recap-store";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { KeyboardHint } from "@/components/shared/keyboard-hint";

const STAT_ITEMS = [
  { key: "median", label: "Median" },
  { key: "average", label: "Average" },
  { key: "p90", label: "P90" },
  { key: "max", label: "Max" },
] as const;

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

export function CommitSizeDistributionPage() {
  const { recapData } = useRecapStore();

  if (!recapData) return null;

  const { commitSizes } = recapData;
  const { stats, story, per_repo_commit_counts: perRepoCounts } = commitSizes;

  const topRepos = useMemo(() => {
    return Object.entries(perRepoCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([repo, count]) => ({ repo, count }));
  }, [perRepoCounts]);

  const statValues = STAT_ITEMS.map((item) => ({
    label: item.label,
    value: stats[item.key],
  }));

  const totalRepos = Object.keys(perRepoCounts).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
  };

  return (
    <section className="relative min-h-screen w-full snap-start snap-always flex flex-col">
      <div className="flex-1 flex flex-col justify-between px-6 md:px-12 lg:px-24 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-6"
        >
          <motion.p variants={itemVariants} className="text-narrative">
            Your commits weren&apos;t all the same size.
          </motion.p>
          <motion.p variants={itemVariants} className="text-narrative-muted">
            {story}
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-6 text-muted-foreground">
            <div className="flex items-baseline gap-2">
              <span className="text-display-sm text-foreground font-serif">
                <AnimatedNumber value={stats.count} />
              </span>
              <span className="text-lg">commits sampled</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-display-sm text-foreground font-serif">
                <AnimatedNumber value={totalRepos} />
              </span>
              <span className="text-lg">repos scanned</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 my-10"
        >
          {statValues.map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="rounded-lg border border-border bg-card/60 p-4 md:p-5"
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                {stat.label} lines changed
              </p>
              <p className="text-2xl md:text-3xl font-serif text-foreground mt-2">
                {formatNumber(stat.value)}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="space-y-4"
        >
          <motion.p
            variants={itemVariants}
            className="text-xs text-muted-foreground uppercase tracking-wider"
          >
            Sampled commits per top repo
          </motion.p>
          <motion.div variants={itemVariants} className="space-y-3">
            {topRepos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No repo samples available.</p>
            ) : (
              topRepos.map((repo, index) => (
                <div key={repo.repo} className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground w-6 text-right">
                    {index + 1}
                  </span>
                  <span className="text-foreground font-medium truncate flex-1">
                    {repo.repo}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {formatNumber(repo.count)} commits
                  </span>
                </div>
              ))
            )}
          </motion.div>
        </motion.div>

        <div className="flex justify-center mt-8">
          <KeyboardHint />
        </div>
      </div>
    </section>
  );
}
