"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRecapStore } from "@/stores/recap-store";

export function usePageNavigation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentPage, totalPages, setCurrentPage, nextPage, prevPage } = useRecapStore();

  // Scroll to page when currentPage changes
  useEffect(() => {
    if (containerRef.current) {
      const pageHeight = window.innerHeight;
      containerRef.current.scrollTo({
        top: currentPage * pageHeight,
        behavior: "smooth",
      });
    }
  }, [currentPage]);

  // Handle scroll to detect current page
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const pageHeight = window.innerHeight;
      const newPage = Math.round(scrollTop / pageHeight);
      if (newPage !== currentPage && newPage >= 0 && newPage < totalPages) {
        setCurrentPage(newPage);
      }
    }
  }, [currentPage, totalPages, setCurrentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        nextPage();
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        prevPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextPage, prevPage]);

  // Scroll to specific page
  const scrollToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, [setCurrentPage]);

  return {
    containerRef,
    handleScroll,
    currentPage,
    totalPages,
    scrollToPage,
    nextPage,
    prevPage,
    isLastPage: currentPage === totalPages - 1,
    isFirstPage: currentPage === 0,
  };
}
