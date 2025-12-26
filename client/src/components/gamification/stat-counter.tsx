"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { cn } from "@/lib/utils";

interface StatCounterProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  delay?: number;
  color?: string;
  suffix?: string;
}

export function StatCounter({
  label,
  value,
  icon,
  delay = 0,
  color = "text-primary",
  suffix = "",
}: StatCounterProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="p-6 bg-card/50 backdrop-blur border-border hover:border-primary/50 transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className={cn("text-3xl", color)}>{icon}</div>
          <AnimatedNumber
            value={value}
            delay={delay * 1000}
            duration={2000}
            suffix={suffix}
            className={cn("text-4xl font-bold", color)}
          />
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
        </div>
      </Card>
    </motion.div>
  );
}
