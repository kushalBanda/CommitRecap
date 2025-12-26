"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { useRecapStore } from "@/stores/recap-store";
import { KeyboardHint } from "@/components/shared/keyboard-hint";

export function TopLanguagesPage() {
  const { recapData } = useRecapStore();

  if (!recapData) return null;

  const { languages } = recapData;

  // Get top 5 languages sorted by percentage
  const topLanguages = useMemo(() => {
    return Object.entries(languages.percentages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, percentage]) => ({
        name,
        percentage,
        bytes: languages.languages[name] || 0,
      }));
  }, [languages]);

  const totalLanguages = Object.keys(languages.languages).length;

  // Animation variants
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

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <section className="relative min-h-screen w-full snap-start snap-always flex flex-col">
      <div className="flex-1 flex flex-col justify-between px-6 md:px-12 lg:px-24 py-12">
        {/* Narrative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-narrative">
            Of the {totalLanguages} languages you used,
          </p>
          <p className="text-narrative">
            you had a couple favorites.
          </p>
        </motion.div>

        {/* Languages list */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex-1 flex flex-col justify-center py-8"
        >
          {/* Section label */}
          <motion.p 
            variants={itemVariants}
            className="text-xs text-muted-foreground uppercase tracking-wider mb-8"
          >
            Favorite Languages
          </motion.p>

          {/* Language items */}
          <div className="space-y-6 md:space-y-8">
            {topLanguages.map((lang, index) => {
              const isTop = index === 0;

              return (
                <motion.div
                  key={lang.name}
                  variants={itemVariants}
                  className="flex items-baseline gap-4 md:gap-8"
                >
                  {/* Rank number */}
                  <span className="text-sm text-muted-foreground w-6 text-right">
                    {index + 1}
                  </span>

                  {/* Language name - massive typography */}
                  <span 
                    className={`text-4xl md:text-6xl lg:text-7xl font-serif tracking-tight ${isTop ? "text-primary" : "text-foreground"}`}
                    style={{ 
                      fontSize: `clamp(2rem, ${8 - index}vw, ${5 - index * 0.5}rem)` 
                    }}
                  >
                    {lang.name}
                  </span>

                  {/* Percentage */}
                  <span className={`text-sm md:text-base ${isTop ? "text-primary" : "text-muted-foreground"}`}>
                    {lang.percentage.toFixed(0)}%
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Navigation hint */}
        <div className="flex justify-center">
          <KeyboardHint />
        </div>
      </div>
    </section>
  );
}
