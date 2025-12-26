// API Response Types based on ENDPOINTS.md

export interface UserSummary {
  login: string;
  name: string | null;
  company: string | null;
  blog: string | null;
  location: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface YearSummary {
  username: string;
  since: string;
  until: string;
  commits: number;
  issues: number;
  pull_requests: number;
  reviews: number;
  source: string;
}

export interface MonthlyCommits {
  username: string;
  year: number;
  monthly_counts: Record<string, number>;
  source: string;
}

export interface TopRepo {
  repo: string;
  commit_count: number;
}

export interface RepoFocus {
  username: string;
  since: string;
  until: string;
  total_commits: number;
  unique_repos: number;
  top_repos: TopRepo[];
  source: string;
  per_page: number;
  max_pages: number;
  max_workers: number;
  incomplete_results: boolean;
  truncated: boolean;
}

export interface ContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionHeatmap {
  username: string;
  since: string;
  until: string;
  total_contributions: number;
  weeks: ContributionWeek[];
  source: string;
}

export interface Languages {
  username: string;
  since: string;
  until: string;
  page: number;
  per_page: number;
  total_bytes: number;
  languages: Record<string, number>;
  percentages: Record<string, number>;
  source: string;
}

export interface LanguageStar {
  language: string;
  stars: number;
  repo_count: number;
}

export interface TopLanguagesByStars {
  username: string;
  page: number;
  per_page: number;
  languages: LanguageStar[];
}

export interface RepoCount {
  username: string;
  page: number;
  per_page: number;
  repo_count: number;
}

// Combined data for the recap
export interface RecapData {
  user: UserSummary;
  year: YearSummary;
  monthly: MonthlyCommits;
  repos: RepoFocus;
  heatmap: ContributionHeatmap;
  languages: Languages;
  languageStars: TopLanguagesByStars;
}
