export default function DashboardLayoutLoading() {
  return (
    <div className="min-h-screen bg-tz-cream flex">
      {/* Sidebar skeleton */}
      <div className="w-64 bg-white border-l border-tz-cream-dark p-4 space-y-4">
        <div className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
      {/* Main content skeleton */}
      <div className="flex-1 p-8">
        <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
