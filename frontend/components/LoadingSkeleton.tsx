export default function LoadingSkeleton() {
  return (
    <div className="border border-default rounded-xl bg-surface overflow-hidden mx-8">
      {/* Header */}
      <div className="h-11 px-5 border-b border-default" />

      {/* Skeleton Rows */}
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[140px_1fr_2fr_120px_130px_140px_40px] gap-4 h-14 px-5 items-center border-b border-subtle last:border-0"
        >
          <div className="h-4 bg-[color:var(--border-subtle)] rounded animate-pulse" />
          <div className="h-4 bg-[color:var(--border-subtle)] rounded animate-pulse w-3/4" />
          <div className="h-4 bg-[color:var(--border-subtle)] rounded animate-pulse w-5/6" />
          <div className="h-4 bg-[color:var(--border-subtle)] rounded animate-pulse ml-auto w-16" />
          <div className="h-6 bg-[color:var(--border-subtle)] rounded-full animate-pulse w-20" />
          <div className="h-4 bg-[color:var(--border-subtle)] rounded animate-pulse w-24" />
          <div />
        </div>
      ))}
    </div>
  );
}