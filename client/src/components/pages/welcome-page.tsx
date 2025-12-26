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
        className="text-center"
      >
        <p className="text-xs text-muted-foreground">
          Built with care for developers everywhere
        </p>
      </motion.div>
    </section>
  );
}
