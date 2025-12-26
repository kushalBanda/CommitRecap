import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="relative">
          <div className="w-24 h-24 mx-auto rounded-full bg-card border-2 border-primary flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Loading Your Recap...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we prepare your journey
          </p>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
        </div>
      </div>
    </div>
  );
}
