import { Skeleton } from '@/components/ui/skeleton';

export default function LoadingSkeleton() {
  return (
    <div className="border rounded-xl bg-card overflow-hidden mx-8">
      {/* Table skeleton rows */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[140px_1fr_2fr_120px_130px_140px_40px] gap-4 h-14 px-5 items-center border-b last:border-0"
        >
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-16 ml-auto" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <div />
        </div>
      ))}
    </div>
  );
}