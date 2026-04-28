import TableSkeleton from '@/components/shared/TableSkeleton';

export default function DashboardLoading() {
  return (
    <div>
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="w-40 h-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-24 h-4 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl p-4 bg-gray-100 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 rounded mb-2" />
            <div className="w-16 h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Table grid skeleton */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <TableSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
