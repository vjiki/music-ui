/**
 * Loading fallback component for Suspense boundaries
 */
export default function SuspenseFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-black">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-white border-opacity-20 border-t-white rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

