"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Github, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WelcomePage() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoading(true);
      router.push(`/recap/${username.trim()}`);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const lineVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const },
    },
  };

  return (
    <section className="min-h-screen w-full flex flex-col justify-between px-6 md:px-12 lg:px-24 py-12">
      {/* Main content */}
      <div className="flex-1 flex flex-col justify-center max-w-2xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Title */}
          <motion.div variants={lineVariants}>
            <h1 className="text-5xl md:text-7xl font-serif text-foreground tracking-tight">
              CommitRecap
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.div variants={lineVariants} className="space-y-2">
            <p className="text-narrative">
              Your 2025 GitHub journey,
            </p>
            <p className="text-narrative-muted">
              told through commits, code, and contributions.
            </p>
          </motion.div>

          {/* Input form */}
          <motion.form
            variants={lineVariants}
            onSubmit={handleSubmit}
            className="space-y-4 pt-4"
          >
            <div className="relative max-w-md">
              <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your GitHub username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-12 h-14 text-lg bg-secondary border-border focus:border-primary focus:ring-primary placeholder:text-muted-foreground"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="h-14 px-8 text-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!username.trim() || isLoading}
            >
              {isLoading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                />
              ) : (
                <>
                  Start Your Recap
                  <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
          </motion.form>

          {/* Privacy note */}
          <motion.p
            variants={lineVariants}
            className="text-sm text-muted-foreground"
          >
            We only access public GitHub data.
          </motion.p>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="flex flex-col items-center gap-4"
      >
        {/* Social Links */}
        <div className="flex items-center gap-4">
          <a
            href="https://www.producthunt.com/products/commitrecap?launch=commitrecap"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors border border-border"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-foreground"
            >
              <path
                d="M20 0C8.954 0 0 8.954 0 20s8.954 20 20 20 20-8.954 20-20S31.046 0 20 0zm0 36c-8.837 0-16-7.163-16-16S11.163 4 20 4s16 7.163 16 16-7.163 16-16 16z"
                fill="currentColor"
              />
              <path
                d="M22 14h-8v12h8c3.314 0 6-2.686 6-6s-2.686-6-6-6zm0 8h-4v-4h4c1.105 0 2 .895 2 2s-.895 2-2 2z"
                fill="currentColor"
              />
            </svg>
            <span className="text-sm font-medium text-foreground">ProductHunt</span>
          </a>
          <a
            href="https://www.linkedin.com/in/kushalbanda/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors border border-border"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-foreground"
            >
              <path
                d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                fill="currentColor"
              />
            </svg>
            <span className="text-sm font-medium text-foreground">LinkedIn</span>
          </a>
        </div>
        <p className="text-xs text-muted-foreground">
          Built with care for developers everywhere
        </p>
      </motion.div>
    </section>
  );
}
