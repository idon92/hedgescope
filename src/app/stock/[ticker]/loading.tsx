export default function StockLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-800/50 rounded w-20 mb-4" />
      <div className="h-8 bg-gray-800 rounded w-24 mb-2" />
      <div className="h-4 bg-gray-800/50 rounded w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-2">
          <div className="h-8 bg-gray-800 rounded w-full" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-6 bg-gray-800/40 rounded w-full" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-gray-800/50 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
