"use client";

import { motion } from "framer-motion";
import { GitCommit, GitPullRequest, Eye, AlertCircle, Star, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/page-container";
import { StatCounter } from "@/components/gamification/stat-counter";
import { AchievementBadge } from "@/components/gamification/achievement-badge";
import { RankDisplay } from "@/components/gamification/rank-display";
import { useRecapStore } from "@/stores/recap-store";

export function YearStatsPage() {
  const {
    recapData,
    achievements,
    rank,
    score,
    nextRank,
    progressToNextRank,
    pointsToNextRank,
  } = useRecapStore();

  if (!recapData || !rank) return null;

  const { user, year } = recapData;
  const topAchievements = achievements.slice(0, 6);

  return (
    <PageContainer id="stats" className="bg-gradient-to-b from-card/20 to-background">
      <div className="space-y-12">
        {/* Header with Avatar and Rank */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-primary shadow-[0_0_30px_rgba(57,211,83,0.3)]">
                <AvatarImage src={user.avatar_url} alt={user.login} />
                <AvatarFallback>{user.login.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-2 -right-2 bg-card rounded-full p-2 border-2 border-primary"
              >
                <span className="text-2xl">{rank.icon}</span>
              </motion.div>
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground">
                {user.name || user.login}
              </h2>
              <p className="text-muted-foreground">@{user.login}</p>
              <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {user.followers.toLocaleString()} followers
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {user.public_repos} repos
                </span>
              </div>
            </div>
          </motion.div>

          {/* Rank Display */}
          <RankDisplay
            rank={rank}
            score={score}
            nextRank={nextRank}
            progress={progressToNextRank}
            pointsToNext={pointsToNextRank}
          />
        </div>

        {/* Year Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <Badge variant="outline" className="text-lg px-4 py-2 border-primary text-primary">
            2025 Year in Review
          </Badge>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCounter
            label="Commits"
            value={year.commits}
            icon={<GitCommit className="w-8 h-8" />}
            delay={0}
            color="text-primary"
          />
          <StatCounter
            label="Pull Requests"
            value={year.pull_requests}
            icon={<GitPullRequest className="w-8 h-8" />}
            delay={0.1}
            color="text-[#58a6ff]"
          />
          <StatCounter
            label="Code Reviews"
            value={year.reviews}
            icon={<Eye className="w-8 h-8" />}
            delay={0.2}
            color="text-[#a371f7]"
          />
          <StatCounter
            label="Issues"
            value={year.issues}
            icon={<AlertCircle className="w-8 h-8" />}
            delay={0.3}
            color="text-[#db6d28]"
          />
        </div>

        {/* Achievements */}
        {topAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <h3 className="text-xl font-semibold text-center text-foreground">
              Achievements Unlocked
              <span className="ml-2 text-muted-foreground">
                ({achievements.length} total)
              </span>
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              {topAchievements.map((achievement, index) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                  index={index}
                  size="md"
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </PageContainer>
  );
}
