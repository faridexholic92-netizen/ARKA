export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white rounded-2xl border p-5">
      <div className="h-10 w-10 bg-gray-200 rounded-xl mb-3" />
      <div className="h-7 bg-gray-200 rounded-lg w-16 mb-2" />
      <div className="h-4 bg-gray-100 rounded w-24" />
    </div>
  );
}

export function SkeletonList({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="animate-pulse bg-white rounded-2xl border p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-40" />
            <div className="h-3 bg-gray-100 rounded w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="p-4 border-b animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-32" />
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="animate-pulse px-5 py-4 flex gap-4">
            <div className="h-4 bg-gray-100 rounded w-24" />
            <div className="h-4 bg-gray-100 rounded w-16" />
            <div className="h-4 bg-gray-100 rounded w-16" />
            <div className="h-4 bg-gray-100 rounded w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
