import { Skeleton } from "@/components/ui/skeleton";

export default function TvLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-64 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
        <div className="flex items-center gap-2 px-6 py-3 overflow-x-auto">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex p-4">
        {/* Player skeleton */}
        <div className="w-full lg:w-[60%] xl:w-[70%]">
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <Skeleton className="mt-4 h-40 w-full rounded-2xl" />
        </div>

        {/* Grid skeleton */}
        <div className="hidden lg:block flex-1 lg:w-[40%] xl:w-[30%] pl-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
