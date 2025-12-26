"use client";

import { useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { useGitHubData } from "@/hooks/use-github-data";
import { useRecapStore } from "@/stores/recap-store";
import { OpeningPage } from "@/components/pages/opening-page";
import { ActivityTimelinePage } from "@/components/pages/activity-timeline-page";
import { MonthlyJourneyPage } from "@/components/pages/monthly-journey-page";
import { CommitSizeDistributionPage } from "@/components/pages/commit-size-distribution-page";
import { TopLanguagesPage } from "@/components/pages/top-languages-page";
import { BattleCardPage } from "@/components/pages/battle-card-page";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function LoadingState() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-serif text-foreground">
            Generating Your Recap...
          </h2>
          <p className="text-muted-foreground">
            Fetching your GitHub data
          </p>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full bg-secondary" />
          <Skeleton className="h-4 w-3/4 mx-auto bg-secondary" />
          <Skeleton className="h-4 w-1/2 mx-auto bg-secondary" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, username }: { error: string; username: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <Card className="max-w-md w-full p-8 text-center space-y-6 bg-card border-border">
        <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-serif text-foreground">
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
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  const { isLoading, isError, error } = useGitHubData(username);
  const { recapData, reset, setCurrentPage, currentPage, totalPages } = useRecapStore();

  // Reset store when username changes
  useEffect(() => {
    return () => {
      reset();
    };
  }, [username, reset]);

  // Scroll to specific page
  const scrollToPage = useCallback((pageIndex: number) => {
    if (isScrollingRef.current) return;
    
    const container = containerRef.current;
    if (!container) return;

    isScrollingRef.current = true;
    const pageHeight = window.innerHeight;
    
    container.scrollTo({
      top: pageIndex * pageHeight,
      behavior: "smooth",
    });

    // Reset scrolling flag after animation
    setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  }, []);

  // Handle scroll to update current page
  const handleScroll = useCallback(() => {
    if (isScrollingRef.current) return;
    
    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const pageHeight = window.innerHeight;
    const newPage = Math.round(scrollTop / pageHeight);
    
    if (newPage !== currentPage && newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  }, [currentPage, totalPages, setCurrentPage]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (isScrollingRef.current) return;

    if (e.key === " " || e.key === "Enter" || e.key === "ArrowDown") {
      e.preventDefault();
      if (currentPage < totalPages - 1) {
        const nextPageIndex = currentPage + 1;
        setCurrentPage(nextPageIndex);
        scrollToPage(nextPageIndex);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (currentPage > 0) {
        const prevPageIndex = currentPage - 1;
        setCurrentPage(prevPageIndex);
        scrollToPage(prevPageIndex);
      }
    }
  }, [currentPage, totalPages, setCurrentPage, scrollToPage]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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
      className="h-screen overflow-y-auto snap-y snap-mandatory scrollbar-hide overscroll-none"
    >
      {/* Page 1: Opening Hook */}
      <OpeningPage />

      {/* Page 2: Activity Timeline */}
      <ActivityTimelinePage />

      {/* Page 3: Monthly Journey */}
      <MonthlyJourneyPage />

      {/* Page 4: Commit Size Distribution */}
      <CommitSizeDistributionPage />

      {/* Page 5: Top Languages */}
      <TopLanguagesPage />

      {/* Page 6: Summary Card */}
      <BattleCardPage />
    </div>
  );
}
