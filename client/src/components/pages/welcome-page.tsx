"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Github, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/page-container";

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

  return (
    <PageContainer id="welcome" className="bg-gradient-to-b from-background via-background to-card/20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#58a6ff]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-8">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-[0_0_40px_rgba(57,211,83,0.3)]">
            <Github className="w-12 h-12 text-primary" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-2 rounded-full border border-dashed border-primary/30"
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold">
            <span className="bg-gradient-to-r from-primary via-[#58a6ff] to-primary bg-clip-text text-transparent">
              CommitRecap
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-lg mx-auto">
            Your 2025 GitHub Journey Awaits
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center gap-2 text-muted-foreground"
        >
          <Sparkles className="w-5 h-5 text-primary" />
          <span>Discover your coding achievements, stats, and more</span>
          <Sparkles className="w-5 h-5 text-primary" />
        </motion.div>

        {/* Username Input Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-4"
        >
          <div className="relative">
            <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter your GitHub username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-12 h-14 text-lg bg-card/50 border-border focus:border-primary focus:ring-primary"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={!username.trim() || isLoading}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-primary-foreground border-t-transparent rounded-full"
              />
            ) : (
              <>
                Start Your Recap
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </Button>
        </motion.form>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-sm text-muted-foreground"
        >
          We only access public GitHub data
        </motion.p>
      </div>
    </PageContainer>
  );
}
