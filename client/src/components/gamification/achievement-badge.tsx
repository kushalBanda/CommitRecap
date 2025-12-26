"use client";

import { motion } from "framer-motion";
import type { Achievement } from "@/lib/achievements";
import { getRarityColor, getRarityGlow } from "@/lib/achievements";
import { cn } from "@/lib/utils";

interface AchievementBadgeProps {
  achievement: Achievement;
  index?: number;
  size?: "sm" | "md" | "lg";
  showDescription?: boolean;
}

export function AchievementBadge({
  achievement,
  index = 0,
  size = "md",
  showDescription = true,
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: "w-12 h-12 text-xl",
    md: "w-16 h-16 text-2xl",
    lg: "w-20 h-20 text-3xl",
  };

  const rarityColor = getRarityColor(achievement.rarity);
  const rarityGlow = getRarityGlow(achievement.rarity);

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
        delay: index * 0.1,
      }}
      className="flex flex-col items-center gap-2"
    >
      <div
        className={cn(
          "rounded-full flex items-center justify-center",
          "bg-card border-2",
          sizeClasses[size],
          rarityColor,
          rarityGlow
        )}
      >
        <span role="img" aria-label={achievement.name}>
          {achievement.icon}
        </span>
      </div>
      {showDescription && (
        <div className="text-center">
          <p className={cn("font-semibold text-sm", rarityColor.split(" ")[0])}>
            {achievement.name}
          </p>
          <p className="text-xs text-muted-foreground max-w-[120px]">
            {achievement.description}
          </p>
        </div>
      )}
    </motion.div>
  );
}
