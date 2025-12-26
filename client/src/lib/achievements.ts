import type { RecapData } from "@/types/api";

export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  condition: (data: RecapData) => boolean;
}

// Helper functions
function countActiveMonths(data: RecapData): number {
  const counts = Object.values(data.monthly.monthly_counts);
  return counts.filter((count) => count > 0).length;
}

function getAccountAgeYears(data: RecapData): number {
  const created = new Date(data.user.created_at);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

export const ACHIEVEMENTS: Achievement[] = [
  // Commit-based achievements
  {
    id: "first_steps",
    name: "First Steps",
    description: "Made your first commit this year",
    icon: "👣",
    rarity: "common",
    condition: (data) => data.year.commits >= 1,
  },
  {
    id: "century_maker",
    name: "Century Maker",
    description: "100+ commits this year",
    icon: "💯",
    rarity: "common",
    condition: (data) => data.year.commits >= 100,
  },
  {
    id: "commit_machine",
    name: "Commit Machine",
    description: "500+ commits this year",
    icon: "🤖",
    rarity: "rare",
    condition: (data) => data.year.commits >= 500,
  },
  {
    id: "thousand_club",
    name: "Thousand Club",
    description: "1000+ commits this year",
    icon: "🏆",
    rarity: "epic",
    condition: (data) => data.year.commits >= 1000,
  },
  {
    id: "commit_legend",
    name: "Commit Legend",
    description: "2500+ commits this year",
    icon: "👑",
    rarity: "legendary",
    condition: (data) => data.year.commits >= 2500,
  },

  // PR-based achievements
  {
    id: "team_player",
    name: "Team Player",
    description: "10+ pull requests",
    icon: "🤝",
    rarity: "common",
    condition: (data) => data.year.pull_requests >= 10,
  },
  {
    id: "pr_warrior",
    name: "PR Warrior",
    description: "50+ pull requests",
    icon: "⚔️",
    rarity: "rare",
    condition: (data) => data.year.pull_requests >= 50,
  },
  {
    id: "merge_master",
    name: "Merge Master",
    description: "100+ pull requests",
    icon: "🎯",
    rarity: "epic",
    condition: (data) => data.year.pull_requests >= 100,
  },

  // Review-based achievements
  {
    id: "code_reviewer",
    name: "Code Reviewer",
    description: "25+ code reviews",
    icon: "🔍",
    rarity: "common",
    condition: (data) => data.year.reviews >= 25,
  },
  {
    id: "review_master",
    name: "Review Master",
    description: "100+ code reviews",
    icon: "👁️",
    rarity: "epic",
    condition: (data) => data.year.reviews >= 100,
  },

  // Language-based achievements
  {
    id: "bilingual",
    name: "Bilingual",
    description: "Used 2+ programming languages",
    icon: "🗣️",
    rarity: "common",
    condition: (data) => Object.keys(data.languages.languages).length >= 2,
  },
  {
    id: "polyglot",
    name: "Polyglot",
    description: "Used 5+ programming languages",
    icon: "🌐",
    rarity: "rare",
    condition: (data) => Object.keys(data.languages.languages).length >= 5,
  },
  {
    id: "multilingual",
    name: "Language Master",
    description: "Used 10+ programming languages",
    icon: "🏅",
    rarity: "epic",
    condition: (data) => Object.keys(data.languages.languages).length >= 10,
  },

  // Consistency-based achievements
  {
    id: "streak_starter",
    name: "Streak Starter",
    description: "Active for 3+ months",
    icon: "🔥",
    rarity: "common",
    condition: (data) => countActiveMonths(data) >= 3,
  },
  {
    id: "half_year_hero",
    name: "Half Year Hero",
    description: "Active for 6+ months",
    icon: "⭐",
    rarity: "rare",
    condition: (data) => countActiveMonths(data) >= 6,
  },
  {
    id: "year_rounder",
    name: "Year Rounder",
    description: "Active all 12 months",
    icon: "📅",
    rarity: "legendary",
    condition: (data) => countActiveMonths(data) === 12,
  },

  // Repo-based achievements
  {
    id: "explorer",
    name: "Explorer",
    description: "Contributed to 5+ repos",
    icon: "🧭",
    rarity: "common",
    condition: (data) => data.repos.unique_repos >= 5,
  },
  {
    id: "repo_ranger",
    name: "Repo Ranger",
    description: "Contributed to 10+ repos",
    icon: "🏕️",
    rarity: "rare",
    condition: (data) => data.repos.unique_repos >= 10,
  },
  {
    id: "open_source_hero",
    name: "Open Source Hero",
    description: "Contributed to 20+ repos",
    icon: "🦸",
    rarity: "epic",
    condition: (data) => data.repos.unique_repos >= 20,
  },

  // Issue-based achievements
  {
    id: "bug_reporter",
    name: "Bug Reporter",
    description: "Created 10+ issues",
    icon: "🐛",
    rarity: "common",
    condition: (data) => data.year.issues >= 10,
  },
  {
    id: "issue_hunter",
    name: "Issue Hunter",
    description: "Created 25+ issues",
    icon: "🎯",
    rarity: "rare",
    condition: (data) => data.year.issues >= 25,
  },

  // Account-based achievements
  {
    id: "veteran",
    name: "Veteran",
    description: "GitHub account 3+ years old",
    icon: "🎖️",
    rarity: "rare",
    condition: (data) => getAccountAgeYears(data) >= 3,
  },
  {
    id: "early_adopter",
    name: "Early Adopter",
    description: "GitHub account 5+ years old",
    icon: "🌟",
    rarity: "epic",
    condition: (data) => getAccountAgeYears(data) >= 5,
  },
  {
    id: "og_developer",
    name: "OG Developer",
    description: "GitHub account 10+ years old",
    icon: "💎",
    rarity: "legendary",
    condition: (data) => getAccountAgeYears(data) >= 10,
  },

  // Social achievements
  {
    id: "influencer",
    name: "Influencer",
    description: "100+ GitHub followers",
    icon: "📢",
    rarity: "rare",
    condition: (data) => data.user.followers >= 100,
  },
  {
    id: "celebrity",
    name: "Celebrity",
    description: "1000+ GitHub followers",
    icon: "🌟",
    rarity: "legendary",
    condition: (data) => data.user.followers >= 1000,
  },
];

export function calculateAchievements(data: RecapData): Achievement[] {
  return ACHIEVEMENTS.filter((achievement) => achievement.condition(data));
}

export function getRarityColor(rarity: AchievementRarity): string {
  switch (rarity) {
    case "common":
      return "text-gray-400 border-gray-500";
    case "rare":
      return "text-blue-400 border-blue-500";
    case "epic":
      return "text-purple-400 border-purple-500";
    case "legendary":
      return "text-yellow-400 border-yellow-500";
  }
}

export function getRarityGlow(rarity: AchievementRarity): string {
  switch (rarity) {
    case "common":
      return "";
    case "rare":
      return "shadow-[0_0_10px_rgba(59,130,246,0.5)]";
    case "epic":
      return "shadow-[0_0_15px_rgba(168,85,247,0.5)]";
    case "legendary":
      return "shadow-[0_0_20px_rgba(234,179,8,0.6)]";
  }
}
