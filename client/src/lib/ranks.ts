import type { RecapData } from "@/types/api";

export interface Rank {
  id: string;
  name: string;
  title: string;
  minScore: number;
  maxScore: number;
  icon: string;
  color: string;
  glowColor: string;
}

export const RANKS: Rank[] = [
  {
    id: "novice",
    name: "Novice",
    title: "Code Apprentice",
    minScore: 0,
    maxScore: 99,
    icon: "🌱",
    color: "text-gray-400",
    glowColor: "shadow-gray-500/30",
  },
  {
    id: "contributor",
    name: "Contributor",
    title: "Code Contributor",
    minScore: 100,
    maxScore: 299,
    icon: "⚡",
    color: "text-green-400",
    glowColor: "shadow-green-500/30",
  },
  {
    id: "developer",
    name: "Developer",
    title: "Active Developer",
    minScore: 300,
    maxScore: 599,
    icon: "💻",
    color: "text-blue-400",
    glowColor: "shadow-blue-500/30",
  },
  {
    id: "engineer",
    name: "Engineer",
    title: "Senior Engineer",
    minScore: 600,
    maxScore: 999,
    icon: "🔧",
    color: "text-cyan-400",
    glowColor: "shadow-cyan-500/30",
  },
  {
    id: "architect",
    name: "Architect",
    title: "Code Architect",
    minScore: 1000,
    maxScore: 1999,
    icon: "🏛️",
    color: "text-purple-400",
    glowColor: "shadow-purple-500/30",
  },
  {
    id: "wizard",
    name: "Wizard",
    title: "Code Wizard",
    minScore: 2000,
    maxScore: 4999,
    icon: "🧙",
    color: "text-orange-400",
    glowColor: "shadow-orange-500/30",
  },
  {
    id: "legend",
    name: "Legend",
    title: "GitHub Legend",
    minScore: 5000,
    maxScore: Infinity,
    icon: "👑",
    color: "text-yellow-400",
    glowColor: "shadow-yellow-500/50",
  },
];

// Score calculation:
// - Commits: 1 point each
// - PRs: 3 points each
// - Reviews: 2 points each
// - Issues: 1 point each
// - Unique repos: 5 points each
export function calculateScore(data: RecapData): number {
  return (
    data.year.commits * 1 +
    data.year.pull_requests * 3 +
    data.year.reviews * 2 +
    data.year.issues * 1 +
    data.repos.unique_repos * 5
  );
}

export function getRank(score: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (score >= RANKS[i].minScore) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

export function getNextRank(currentRank: Rank): Rank | null {
  const currentIndex = RANKS.findIndex((r) => r.id === currentRank.id);
  if (currentIndex < RANKS.length - 1) {
    return RANKS[currentIndex + 1];
  }
  return null;
}

export function getProgressToNextRank(score: number, currentRank: Rank): number {
  const nextRank = getNextRank(currentRank);
  if (!nextRank) return 100; // Max rank reached

  const rangeStart = currentRank.minScore;
  const rangeEnd = nextRank.minScore;
  const progress = ((score - rangeStart) / (rangeEnd - rangeStart)) * 100;
  return Math.min(Math.max(progress, 0), 100);
}

export function calculateRankData(data: RecapData) {
  const score = calculateScore(data);
  const rank = getRank(score);
  const nextRank = getNextRank(rank);
  const progress = getProgressToNextRank(score, rank);
  const pointsToNext = nextRank ? nextRank.minScore - score : 0;

  return {
    score,
    rank,
    nextRank,
    progress,
    pointsToNext,
  };
}
