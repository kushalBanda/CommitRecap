"use client";

import { motion } from "framer-motion";

interface KeyboardHintProps {
  className?: string;
}

export function KeyboardHint({ className = "" }: KeyboardHintProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5, duration: 0.5 }}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      <kbd className="kbd">space</kbd>
      <span className="text-muted-foreground text-sm">,</span>
      <kbd className="kbd">return</kbd>
      <span className="text-muted-foreground text-sm">, or</span>
      <motion.span
        animate={{ y: [0, 4, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="text-muted-foreground"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </svg>
      </motion.span>
    </motion.div>
  );
}

