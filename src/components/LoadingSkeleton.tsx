export function CardSkeleton() {
  return (
    <div className="bg-surface border border-gray-800 rounded-xl p-5 animate-pulse">
      <div className="h-5 bg-gray-800 rounded w-2/3 mb-3" />
      <div className="h-4 bg-gray-800 rounded w-1/3 mb-4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-5/6" />
        <div className="h-3 bg-gray-800 rounded w-4/6" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-8 bg-gray-800 rounded w-full mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-6 bg-gray-800/50 rounded w-full" />
      ))}
    </div>
  );
}
