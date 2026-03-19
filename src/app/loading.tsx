export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-800 rounded w-1/3" />
      <div className="h-4 bg-gray-800/50 rounded w-1/2" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-gray-800 rounded-xl p-5"
          >
            <div className="h-5 bg-gray-800 rounded w-2/3 mb-3" />
            <div className="h-4 bg-gray-800 rounded w-1/3 mb-4" />
            <div className="space-y-2">
              <div className="h-3 bg-gray-800 rounded w-full" />
              <div className="h-3 bg-gray-800 rounded w-5/6" />
              <div className="h-3 bg-gray-800 rounded w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
