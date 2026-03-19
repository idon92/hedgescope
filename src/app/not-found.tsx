export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="text-6xl font-mono text-gray-700 mb-4">404</div>
      <h1 className="text-xl font-sans font-semibold text-white mb-2">
        Page Not Found
      </h1>
      <p className="text-sm font-mono text-gray-500 mb-6">
        The page you are looking for does not exist.
      </p>
      <a
        href="/"
        className="text-sm font-mono text-accent hover:underline transition-colors"
      >
        &larr; Back to Dashboard
      </a>
    </div>
  );
}
