"use client";

import { motion } from "framer-motion";
import { useRecapStore } from "@/stores/recap-store";
import { KeyboardHint } from "@/components/shared/keyboard-hint";
import { ActivityBarsBackground } from "@/components/charts/activity-bars";

export function OpeningPage() {
  const { recapData } = useRecapStore();

  if (!recapData) return null;

  const { user, year, repos, languages } = recapData;
  const firstName = user.name?.split(" ")[0] || user.login;
  const languageCount = Object.keys(languages.languages).length;

  // Animation variants for staggered text
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const lineVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section className="relative min-h-screen w-full snap-start snap-always flex flex-col">
      {/* Background activity bars */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
        <div className="w-full px-4">
          <ActivityBarsBackground 
            heatmap={recapData.heatmap} 
            className="w-full"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-6 md:px-12 lg:px-24 py-12">
        {/* Narrative text - top left */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          <motion.p variants={lineVariants} className="text-narrative">
            {firstName},
          </motion.p>
          
          <motion.p variants={lineVariants} className="text-narrative mt-6">
            2025 was a big year.
          </motion.p>
          
          <motion.p variants={lineVariants} className="text-narrative-muted mt-2">
            {year.commits.toLocaleString()} commits, {repos.unique_repos} repositories, and {languageCount} languages.
          </motion.p>
          
          <motion.p variants={lineVariants} className="text-narrative mt-8">
            Ready to take a look back?
          </motion.p>
        </motion.div>

        {/* Navigation hint - bottom center */}
        <div className="flex justify-center">
          <KeyboardHint />
        </div>
      </div>
    </section>
  );
}

