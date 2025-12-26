"use client";

import { cn } from "@/lib/utils";
import { useRecapStore } from "@/stores/recap-store";

const PAGE_LABELS = [
  "Stats",
  "Journey",
  "Universe",
  "Card",
];

export function PageIndicator() {
  const { currentPage, totalPages, setCurrentPage } = useRecapStore();

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {Array.from({ length: totalPages }).map((_, index) => (
        <button
          key={index}
          onClick={() => setCurrentPage(index)}
          className="group flex items-center gap-2"
          aria-label={`Go to ${PAGE_LABELS[index]} page`}
        >
          <span
            className={cn(
              "text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity",
              "text-muted-foreground",
              currentPage === index && "text-primary"
            )}
          >
            {PAGE_LABELS[index]}
          </span>
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-200",
              "border border-muted-foreground/50",
              currentPage === index
                ? "bg-primary border-primary w-3 h-3"
                : "bg-transparent hover:bg-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  );
}
