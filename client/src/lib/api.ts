import axios from "axios";
import type {
  UserSummary,
  YearSummary,
  MonthlyCommits,
  RepoFocus,
  ContributionHeatmap,
  Languages,
  TopLanguagesByStars,
  RecapData,
} from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 404) {
      throw new Error("User not found");
    }
    if (error.response?.status === 403) {
      throw new Error("API rate limit exceeded");
    }
    throw new Error(error.response?.data?.detail || "API Error");
  }
);

export const api = {
  fetchUserSummary: (username: string): Promise<UserSummary> =>
    apiClient.get(`/github/search/user-summary?username=${username}`),

  fetchYearSummary: (username: string): Promise<YearSummary> =>
    apiClient.get(`/github/search/year-summary?username=${username}`),

  fetchMonthlyCommits: (username: string): Promise<MonthlyCommits> =>
    apiClient.get(`/github/search/commit-count-monthly-2025?username=${username}`),

  fetchRepoFocus: (username: string): Promise<RepoFocus> =>
    apiClient.get(`/github/search/repo-focus?username=${username}`),

  fetchContributionHeatmap: (username: string): Promise<ContributionHeatmap> =>
    apiClient.get(`/github/search/contribution-heatmap?username=${username}`),

  fetchLanguages: (username: string): Promise<Languages> =>
    apiClient.get(`/github/search/languages?username=${username}`),

  fetchTopLanguagesByStars: (username: string): Promise<TopLanguagesByStars> =>
    apiClient.get(`/github/search/top-languages-by-stars?username=${username}`),
};

// Fetch all data in parallel
export async function fetchAllRecapData(username: string): Promise<RecapData> {
  const [user, year, monthly, repos, heatmap, languages, languageStars] =
    await Promise.all([
      api.fetchUserSummary(username),
      api.fetchYearSummary(username),
      api.fetchMonthlyCommits(username),
      api.fetchRepoFocus(username),
      api.fetchContributionHeatmap(username),
      api.fetchLanguages(username),
      api.fetchTopLanguagesByStars(username),
    ]);

  return { user, year, monthly, repos, heatmap, languages, languageStars };
}
