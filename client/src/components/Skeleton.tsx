/** Paper-toned skeletons — never a blank screen. */
export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-ink/10 ${className}`} aria-hidden />;
}

export function SkeletonCard() {
  return (
    <div className="paper-card p-5 space-y-3">
      <SkeletonBlock className="h-10 w-10" />
      <SkeletonBlock className="h-5 w-2/3" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-5/6" />
      <SkeletonBlock className="h-9 w-32" />
    </div>
  );
}
