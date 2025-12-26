"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import type { Rank } from "@/lib/ranks";
import { cn } from "@/lib/utils";

interface RankDisplayProps {
  rank: Rank;
  score: number;
  nextRank: Rank | null;
  progress: number;
  pointsToNext: number;
  showProgress?: boolean;
}

export function RankDisplay({
  rank,
  score,
  nextRank,
  progress,
  pointsToNext,
  showProgress = true,
}: RankDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col items-center gap-4"
    >
      {/* Rank Icon and Title */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
          className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center",
            "bg-card border-2 border-primary",
            "shadow-[0_0_30px_rgba(57,211,83,0.3)]",
            rank.glowColor
          )}
        >
          <span className="text-5xl" role="img" aria-label={rank.name}>
            {rank.icon}
          </span>
        </motion.div>

        <div className="text-center">
          <p className={cn("text-2xl font-bold", rank.color)}>{rank.name}</p>
          <p className="text-muted-foreground">{rank.title}</p>
        </div>
      </div>

      {/* Score */}
      <div className="text-center">
        <p className="text-4xl font-bold text-primary">{score.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">Total Score</p>
      </div>

      {/* Progress to Next Rank */}
      {showProgress && nextRank && (
        <div className="w-full max-w-xs space-y-2">
          <div className="flex justify-between text-sm">
            <span className={rank.color}>{rank.name}</span>
            <span className={nextRank.color}>{nextRank.name}</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-center text-xs text-muted-foreground">
            {pointsToNext.toLocaleString()} points to {nextRank.name}
          </p>
        </div>
      )}

      {/* Max Rank */}
      {showProgress && !nextRank && (
        <p className="text-sm text-yellow-400 font-medium">
          Maximum Rank Achieved!
        </p>
      )}
    </motion.div>
  );
}
