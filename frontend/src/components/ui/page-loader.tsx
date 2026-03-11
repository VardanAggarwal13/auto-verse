import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  title?: string;
  subtitle?: string;
  variant?: "spinner" | "skeleton";
};

export default function PageLoader({ title = "Loading", subtitle = "Please wait...", variant = "skeleton" }: Props) {
  if (variant === "spinner") {
    return (
      <div className="min-h-[40vh] w-full flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-xl border bg-card px-5 py-4 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <div className="leading-tight">
            <div className="text-sm font-medium">{title}</div>
            <div className="text-xs text-muted-foreground">{subtitle}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[40vh] w-full">
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>

        <div className="mt-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid grid-cols-12 gap-3">
              <Skeleton className="col-span-5 h-10" />
              <Skeleton className="col-span-3 h-10" />
              <Skeleton className="col-span-2 h-10" />
              <Skeleton className="col-span-2 h-10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

