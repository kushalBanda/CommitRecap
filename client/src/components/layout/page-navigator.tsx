"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRecapStore } from "@/stores/recap-store";

export function PageNavigator() {
  const { currentPage, totalPages, nextPage } = useRecapStore();
  const isLastPage = currentPage === totalPages - 1;

  if (isLastPage) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        onClick={nextPage}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50
          flex flex-col items-center gap-2
          text-muted-foreground hover:text-primary
          transition-colors duration-200"
        aria-label="Scroll to next page"
      >
        <span className="text-sm font-medium">Scroll Down</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </motion.button>
    </AnimatePresence>
  );
}
