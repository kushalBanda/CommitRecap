"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useGitHubData } from "@/hooks/use-github-data";
import { usePageNavigation } from "@/hooks/use-page-navigation";
import { useRecapStore } from "@/stores/recap-store";
import { PageNavigator } from "@/components/layout/page-navigator";
import { PageIndicator } from "@/components/layout/page-indicator";
import { YearStatsPage } from "@/components/pages/year-stats-page";
import { MonthlyJourneyPage } from "@/components/pages/monthly-journey-page";
import { CodeUniversePage } from "@/components/pages/code-universe-page";
import { BattleCardPage } from "@/components/pages/battle-card-page";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function LoadingState() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-full bg-card border-2 border-primary flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Generating Your Recap...
          </h2>
          <p className="text-muted-foreground">
            Fetching your GitHub data and calculating achievements
          </p>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, username }: { error: string; username: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Oops! Something went wrong
          </h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={() => window.location.reload()}>Try Again</Button>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Go Back Home
            </Button>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Username: @{username}
        </p>
      </Card>
    </div>
  );
}

export default function RecapPage() {
  const params = useParams();
  const username = params.username as string;

  const { isLoading, isError, error } = useGitHubData(username);
  const { containerRef, handleScroll } = usePageNavigation();
  const { recapData, reset } = useRecapStore();

  // Reset store when username changes
  useEffect(() => {
    return () => {
      reset();
    };
  }, [username, reset]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError || !recapData) {
    return (
      <ErrorState
        error={error instanceof Error ? error.message : "Failed to load data"}
        username={username}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
    >
      {/* Page 1: Year Stats */}
      <YearStatsPage />

      {/* Page 2: Monthly Journey */}
      <MonthlyJourneyPage />

      {/* Page 3: Code Universe */}
      <CodeUniversePage />

      {/* Page 4: Battle Card */}
      <BattleCardPage />

      {/* Navigation UI */}
      <PageNavigator />
      <PageIndicator />
    </div>
  );
}
