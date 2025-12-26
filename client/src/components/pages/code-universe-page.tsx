"use client";

import { motion } from "framer-motion";
import { Code2, GitFork, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageContainer } from "@/components/layout/page-container";
import { LanguageChart } from "@/components/charts/language-chart";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { useRecapStore } from "@/stores/recap-store";

export function CodeUniversePage() {
  const { recapData } = useRecapStore();

  if (!recapData) return null;

  const { languages, repos } = recapData;
  const topLanguage = Object.entries(languages.percentages).sort(
    ([, a], [, b]) => b - a
  )[0];
  const languageCount = Object.keys(languages.languages).length;

  return (
    <PageContainer id="universe" className="bg-gradient-to-b from-card/20 to-background">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Your Code Universe
          </h2>
          <p className="text-muted-foreground">
            Languages mastered and repositories explored
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur text-center">
              <div className="text-3xl font-bold text-primary">
                <AnimatedNumber value={languageCount} />
              </div>
              <p className="text-sm text-muted-foreground">Languages</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur text-center">
              <div className="text-3xl font-bold text-[#58a6ff]">
                <AnimatedNumber value={repos.unique_repos} />
              </div>
              <p className="text-sm text-muted-foreground">Repositories</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 bg-card/50 backdrop-blur text-center">
              <div className="text-3xl font-bold text-[#a371f7]">
                <AnimatedNumber value={repos.total_commits} />
              </div>
              <p className="text-sm text-muted-foreground">Total Commits</p>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Languages Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="h-full bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-primary" />
                  Language Mastery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LanguageChart
                  languages={languages.languages}
                  percentages={languages.percentages}
                  maxItems={6}
                />
                {topLanguage && (
                  <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm text-muted-foreground">Top Language</p>
                    <p className="text-xl font-bold text-foreground">{topLanguage[0]}</p>
                    <p className="text-sm text-primary">
                      {topLanguage[1].toFixed(1)}% of your code
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Repositories Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="h-full bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitFork className="w-5 h-5 text-[#58a6ff]" />
                  Top Repositories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {repos.top_repos.slice(0, 5).map((repo, index) => (
                    <motion.div
                      key={repo.repo}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">
                            {repo.repo.split("/")[1] || repo.repo}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {repo.repo}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="shrink-0">
                        {repo.commit_count} commits
                      </Badge>
                    </motion.div>
                  ))}
                </div>

                {repos.top_repos.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <GitFork className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No repository data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}
