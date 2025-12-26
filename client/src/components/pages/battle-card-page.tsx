"use client";

import { useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Download, Copy, Check, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRecapStore } from "@/stores/recap-store";
import { ContributionDotsCompact } from "@/components/charts/contribution-dots";

export function BattleCardPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const { recapData, username } = useRecapStore();

  if (!recapData) return null;

  const { user, year, languages, repos, heatmap } = recapData;

  // Calculate days since account creation
  const daysSinceJoined = useMemo(() => {
    const created = new Date(user.created_at);
    const now = new Date();
    const diff = now.getTime() - created.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [user.created_at]);

  // Get top 3 languages
  const topLanguages = useMemo(() => {
    return Object.entries(languages.percentages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, percentage]) => ({ name, percentage }));
  }, [languages]);

  // Calculate longest streak from heatmap
  const longestStreak = useMemo(() => {
    let maxStreak = 0;
    let currentStreak = 0;

    heatmap.weeks.forEach((week) => {
      week.contributionDays.forEach((day) => {
        if (day.contributionCount > 0) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      });
    });

    return maxStreak;
  }, [heatmap]);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.download = `${username}-commitrecap-2025.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const handleCopyLink = async () => {
    const url = window.location.href;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-screen w-full snap-start snap-always flex flex-col items-center justify-center px-6 py-12">
      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <div
          ref={cardRef}
          className="relative bg-[#141414] border border-border rounded-xl overflow-hidden"
        >
          {/* Card content */}
          <div className="flex">
            {/* Left side - Stats */}
            <div className="flex-1 p-6 space-y-6">
              {/* Joined info */}
              <p className="text-sm text-muted-foreground">
                Joined {daysSinceJoined} Days Ago
              </p>

              {/* Top Languages */}
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                  Languages
                </p>
                <div className="space-y-2">
                  {topLanguages.map((lang, index) => (
                    <div key={lang.name} className="flex items-baseline gap-3">
                      <span className="text-sm text-muted-foreground w-4">
                        {index + 1}
                      </span>
                      <span className="text-lg font-medium text-foreground">
                        {lang.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Commits</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {year.commits.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">PRs</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {year.pull_requests.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reviews</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {year.reviews.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {longestStreak}d
                  </p>
                </div>
              </div>

              {/* Branding */}
              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <Github className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  commitrecap.com/2025
                </span>
              </div>
            </div>

            {/* Right side - Contribution dots */}
            <div className="flex items-center justify-center p-4 bg-[#0a0a0a]">
              <ContributionDotsCompact heatmap={heatmap} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="flex gap-3 mt-8"
      >
        <Button
          onClick={handleDownload}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
        <Button
          onClick={handleCopyLink}
          variant="outline"
          className="gap-2 border-border text-foreground hover:bg-secondary"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </motion.div>

      {/* Closing message */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="text-center mt-12 space-y-2"
      >
        <p className="text-xl font-serif text-foreground">
          Thank you for an amazing 2025!
        </p>
        <p className="text-muted-foreground">
          Keep coding, keep growing, and see you in 2026.
        </p>
      </motion.div>
    </section>
  );
}
