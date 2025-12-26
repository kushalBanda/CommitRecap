"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Download, Share2, Twitter, Linkedin, Copy, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageContainer } from "@/components/layout/page-container";
import { useRecapStore } from "@/stores/recap-store";

export function BattleCardPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const {
    recapData,
    achievements,
    rank,
    score,
    username,
  } = useRecapStore();

  if (!recapData || !rank) return null;

  const { user, year, languages, repos } = recapData;

  // Get top 3 languages
  const topLanguages = Object.entries(languages.percentages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  // Get top achievements (max 4)
  const topAchievements = achievements
    .sort((a, b) => {
      const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
      return rarityOrder[b.rarity] - rarityOrder[a.rarity];
    })
    .slice(0, 4);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#0d1117",
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

  const handleShareTwitter = () => {
    const text = `Check out my GitHub 2025 Year Recap! ${year.commits} commits, ${year.pull_requests} PRs, and achieved ${rank.name} rank!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank");
  };

  const handleShareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank");
  };

  return (
    <PageContainer id="card" className="bg-gradient-to-b from-background to-card/30">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Your Battle Card
          </h2>
          <p className="text-muted-foreground">
            Share your 2025 GitHub achievements with the world
          </p>
        </motion.div>

        {/* Battle Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="flex justify-center"
        >
          <div
            ref={cardRef}
            className="w-full max-w-md p-6 rounded-2xl bg-gradient-to-br from-[#161b22] via-[#0d1117] to-[#161b22] border-2 border-primary/30 shadow-[0_0_40px_rgba(57,211,83,0.15)]"
          >
            {/* Card Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16 border-2 border-primary">
                  <AvatarImage src={user.avatar_url} alt={user.login} />
                  <AvatarFallback>{user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-lg text-foreground">
                    {user.name || user.login}
                  </p>
                  <p className="text-sm text-muted-foreground">@{user.login}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  2025
                </Badge>
              </div>
            </div>

            {/* Rank Section */}
            <div className="flex items-center justify-center gap-3 mb-6 p-4 rounded-xl bg-card/50">
              <span className="text-4xl">{rank.icon}</span>
              <div className="text-center">
                <p className={`text-xl font-bold ${rank.color}`}>{rank.name}</p>
                <p className="text-sm text-muted-foreground">{rank.title}</p>
                <p className="text-lg font-bold text-primary">{score.toLocaleString()} pts</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2 mb-6">
              <div className="text-center p-2 rounded-lg bg-card/30">
                <p className="text-xl font-bold text-primary">{year.commits}</p>
                <p className="text-xs text-muted-foreground">Commits</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-card/30">
                <p className="text-xl font-bold text-[#58a6ff]">{year.pull_requests}</p>
                <p className="text-xs text-muted-foreground">PRs</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-card/30">
                <p className="text-xl font-bold text-[#a371f7]">{year.reviews}</p>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-card/30">
                <p className="text-xl font-bold text-[#db6d28]">{repos.unique_repos}</p>
                <p className="text-xs text-muted-foreground">Repos</p>
              </div>
            </div>

            {/* Top Languages */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Top Languages</p>
              <div className="flex gap-2 flex-wrap">
                {topLanguages.map(([lang, percent]) => (
                  <Badge key={lang} variant="outline" className="text-xs">
                    {lang} ({percent.toFixed(0)}%)
                  </Badge>
                ))}
              </div>
            </div>

            {/* Achievements */}
            {topAchievements.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">Achievements</p>
                <div className="flex gap-2 justify-center">
                  {topAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="w-10 h-10 rounded-full bg-card flex items-center justify-center border border-border"
                      title={achievement.name}
                    >
                      <span className="text-lg">{achievement.icon}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                CommitRecap 2025
              </p>
            </div>
          </div>
        </motion.div>

        {/* Share Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3"
        >
          <Button onClick={handleDownload} className="gap-2">
            <Download className="w-4 h-4" />
            Download PNG
          </Button>
          <Button onClick={handleCopyLink} variant="outline" className="gap-2">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
          <Button onClick={handleShareTwitter} variant="outline" className="gap-2">
            <Twitter className="w-4 h-4" />
            Twitter
          </Button>
          <Button onClick={handleShareLinkedIn} variant="outline" className="gap-2">
            <Linkedin className="w-4 h-4" />
            LinkedIn
          </Button>
        </motion.div>

        {/* Thank You Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-2"
        >
          <p className="text-xl font-semibold text-foreground">
            Thank you for an amazing 2025!
          </p>
          <p className="text-muted-foreground">
            Keep coding, keep growing, and see you in 2026!
          </p>
        </motion.div>
      </div>
    </PageContainer>
  );
}
