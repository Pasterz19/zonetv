import { Skeleton } from "./ui/skeleton"

export function HomeLoading() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-12 space-y-16 md:px-8">
      {/* Hero section skeleton */}
      <div className="relative h-[60vh] w-full rounded-3xl bg-muted/20 lg:h-[75vh]">
        <div className="absolute bottom-16 left-16 space-y-6 w-full max-w-xl">
           <Skeleton className="h-4 w-24 rounded-full" />
           <Skeleton className="h-16 w-3/4 rounded-xl" />
           <Skeleton className="h-6 w-1/2 rounded-lg" />
           <div className="flex gap-4">
              <Skeleton className="h-14 w-40 rounded-full" />
              <Skeleton className="h-14 w-32 rounded-full" />
           </div>
        </div>
      </div>

      {/* Content sections skeleton */}
      <div className="space-y-8">
        <div className="flex items-end justify-between px-2">
           <div className="space-y-2">
              <Skeleton className="h-8 w-48 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-md" />
           </div>
           <Skeleton className="h-10 w-32 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 aspect-[2/3] w-full">
              <Skeleton className="h-full w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
