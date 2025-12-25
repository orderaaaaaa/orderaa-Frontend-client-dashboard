export default function IntegrationsLoading() {
  return (
    <div className="bg-gray-50 min-h-screen" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-9 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-6 w-64 bg-gray-200 rounded mr-6 animate-pulse"></div>
        </div>

        {/* Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-8 border border-gray-200"
            >
              {/* Logo Skeleton */}
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 bg-gray-200 rounded-full animate-pulse"></div>
              </div>

              {/* Title Skeleton */}
              <div className="h-6 w-32 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>

              {/* Description Skeleton */}
              <div className="h-4 w-40 bg-gray-200 rounded mx-auto mb-6 animate-pulse"></div>

              {/* Button Skeleton */}
              <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
