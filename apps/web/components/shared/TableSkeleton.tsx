export default function TableSkeleton() {
  return (
    <div className="bg-white rounded-[28px] overflow-hidden shadow-sm p-6 animate-pulse">
      {/* Status bar */}
      <div className="h-1.5 w-full bg-gray-200 rounded-full mb-5" />

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gray-200" />
          <div className="space-y-2">
            <div className="w-20 h-4 bg-gray-200 rounded" />
            <div className="w-12 h-3 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="w-16 h-6 bg-gray-200 rounded-full" />
      </div>

      {/* Timer circle */}
      <div className="flex justify-center py-3">
        <div className="w-[140px] h-[140px] rounded-full bg-gray-200" />
      </div>

      {/* Note */}
      <div className="h-10 bg-gray-200 rounded-2xl mb-4" />

      {/* Button */}
      <div className="h-12 bg-gray-200 rounded-2xl" />
    </div>
  );
}
