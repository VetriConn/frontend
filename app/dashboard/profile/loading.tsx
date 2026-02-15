export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main content */}
          <div className="space-y-6">
            {/* Profile Header skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-6 tablet:flex-col">
                <div className="w-[120px] h-[120px] rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-7 w-48 bg-gray-200 rounded-md" />
                  <div className="h-5 w-36 bg-gray-200 rounded" />
                  <div className="h-4 w-44 bg-gray-200 rounded" />
                  <div className="flex gap-2 mt-1">
                    <div className="w-6 h-6 bg-gray-200 rounded" />
                    <div className="w-6 h-6 bg-gray-200 rounded" />
                    <div className="w-6 h-6 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-9 w-32 bg-gray-200 rounded-lg shrink-0 tablet:w-full" />
              </div>
            </div>

            {/* Professional Info skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-5 w-48 bg-gray-200 rounded" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-5 w-40 bg-gray-200 rounded" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <div className="h-4 w-40 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Skills skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-5 w-20 bg-gray-200 rounded" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[80, 60, 100, 70, 50, 90].map((w, i) => (
                  <div
                    key={i}
                    className="h-7 bg-gray-200 rounded-full"
                    style={{ width: `${w}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Work Experience skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-5 w-40 bg-gray-200 rounded" />
              </div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="border-l-2 border-gray-200 pl-4">
                    <div className="h-4 w-36 bg-gray-200 rounded mb-2" />
                    <div className="h-3 w-28 bg-gray-200 rounded mb-1" />
                    <div className="h-3 w-24 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Education skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-5 w-28 bg-gray-200 rounded" />
              </div>
              <div className="border-l-2 border-gray-200 pl-4">
                <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-32 bg-gray-200 rounded mb-1" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Documents skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gray-200 rounded" />
                <div className="h-5 w-28 bg-gray-200 rounded" />
              </div>
              <div className="h-4 w-52 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 hidden lg:block">
            {/* Profile Completion skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
              <div className="h-2 w-full bg-gray-200 rounded-full mb-3" />
              <div className="h-4 w-16 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded-full" />
                    <div className="h-3 w-28 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions skeleton */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
