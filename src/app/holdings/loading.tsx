export default function HoldingsLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-800 rounded w-1/3 mb-2" />
      <div className="h-4 bg-gray-800/50 rounded w-1/2 mb-8" />
      <div className="space-y-2">
        <div className="h-8 bg-gray-800 rounded w-full" />
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="h-6 bg-gray-800/40 rounded w-full" />
        ))}
      </div>
    </div>
  );
}
