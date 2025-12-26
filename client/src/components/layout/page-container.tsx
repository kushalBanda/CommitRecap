"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  id: string;
  fullBleed?: boolean;
}

export function PageContainer({ 
  children, 
  className, 
  id, 
  fullBleed = false 
}: PageContainerProps) {
  return (
    <section
      id={id}
      className={cn(
        "min-h-screen w-full snap-start snap-always",
        "flex flex-col",
        !fullBleed && "px-6 md:px-12 lg:px-24 py-12",
        "relative overflow-hidden",
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "flex-1 flex flex-col",
          !fullBleed && "w-full"
        )}
      >
        {children}
      </motion.div>
    </section>
  );
}
