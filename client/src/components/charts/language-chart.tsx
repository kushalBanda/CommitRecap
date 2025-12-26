"use client";

import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LanguageChartProps {
  languages: Record<string, number>;
  percentages: Record<string, number>;
  maxItems?: number;
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "bg-yellow-400",
  TypeScript: "bg-blue-500",
  Python: "bg-green-500",
  Java: "bg-orange-500",
  "C++": "bg-pink-500",
  C: "bg-gray-500",
  "C#": "bg-purple-500",
  Ruby: "bg-red-500",
  Go: "bg-cyan-500",
  Rust: "bg-orange-600",
  PHP: "bg-indigo-500",
  Swift: "bg-orange-400",
  Kotlin: "bg-purple-400",
  Scala: "bg-red-400",
  HTML: "bg-orange-600",
  CSS: "bg-blue-400",
  Shell: "bg-green-600",
  Dart: "bg-teal-500",
  Vue: "bg-emerald-500",
  Svelte: "bg-orange-500",
};

function getSkillLevel(percentage: number): { level: string; color: string } {
  if (percentage >= 50) return { level: "Expert", color: "text-yellow-400" };
  if (percentage >= 30) return { level: "Advanced", color: "text-purple-400" };
  if (percentage >= 15) return { level: "Intermediate", color: "text-blue-400" };
  return { level: "Beginner", color: "text-gray-400" };
}

export function LanguageChart({
  languages,
  percentages,
  maxItems = 6,
}: LanguageChartProps) {
  // Sort by percentage and take top items
  const sortedLanguages = Object.entries(percentages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxItems);

  return (
    <div className="space-y-4">
      {sortedLanguages.map(([language, percentage], index) => {
        const skillLevel = getSkillLevel(percentage);
        const colorClass = LANGUAGE_COLORS[language] || "bg-primary";

        return (
          <motion.div
            key={language}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", colorClass)} />
                <span className="font-medium text-foreground">{language}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("text-xs", skillLevel.color)}>
                  {skillLevel.level}
                </Badge>
                <span className="text-sm text-muted-foreground font-mono">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress
              value={percentage}
              className="h-2"
            />
          </motion.div>
        );
      })}
    </div>
  );
}
