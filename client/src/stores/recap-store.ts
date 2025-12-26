import { create } from "zustand";
import type { RecapData } from "@/types/api";
import type { Achievement } from "@/lib/achievements";
import type { Rank } from "@/lib/ranks";
import { calculateAchievements } from "@/lib/achievements";
import { calculateRankData } from "@/lib/ranks";

interface RecapState {
  // Navigation
  currentPage: number;
  totalPages: number;

  // Loading
  isLoading: boolean;
  error: string | null;

  // Data
  username: string | null;
  recapData: RecapData | null;

  // Computed (cached)
  achievements: Achievement[];
  rank: Rank | null;
  score: number;
  nextRank: Rank | null;
  progressToNextRank: number;
  pointsToNextRank: number;

  // Actions
  setCurrentPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRecapData: (username: string, data: RecapData) => void;
  reset: () => void;
}

const initialState = {
  currentPage: 0,
  totalPages: 4,
  isLoading: false,
  error: null,
  username: null,
  recapData: null,
  achievements: [],
  rank: null,
  score: 0,
  nextRank: null,
  progressToNextRank: 0,
  pointsToNextRank: 0,
};

export const useRecapStore = create<RecapState>((set, get) => ({
  ...initialState,

  setCurrentPage: (page) => {
    const { totalPages } = get();
    if (page >= 0 && page < totalPages) {
      set({ currentPage: page });
    }
  },

  nextPage: () => {
    const { currentPage, totalPages } = get();
    if (currentPage < totalPages - 1) {
      set({ currentPage: currentPage + 1 });
    }
  },

  prevPage: () => {
    const { currentPage } = get();
    if (currentPage > 0) {
      set({ currentPage: currentPage - 1 });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  setRecapData: (username, data) => {
    const achievements = calculateAchievements(data);
    const rankData = calculateRankData(data);

    set({
      username,
      recapData: data,
      achievements,
      rank: rankData.rank,
      score: rankData.score,
      nextRank: rankData.nextRank,
      progressToNextRank: rankData.progress,
      pointsToNextRank: rankData.pointsToNext,
    });
  },

  reset: () => set(initialState),
}));
