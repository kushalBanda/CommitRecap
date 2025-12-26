"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  id: string;
}

export function PageContainer({ children, className, id }: PageContainerProps) {
  return (
    <section
      id={id}
      className={cn(
        "min-h-screen w-full snap-start snap-always",
        "flex flex-col items-center justify-center",
        "px-4 py-8 md:px-8 lg:px-16",
        "relative overflow-hidden",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-6xl mx-auto"
      >
        {children}
      </motion.div>
    </section>
  );
}
