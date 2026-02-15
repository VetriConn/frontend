export default function JobsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8 animate-pulse">
            <div className="h-7 w-64 bg-gray-200 rounded-md mb-2" />
            <div className="h-4 w-80 bg-gray-200 rounded" />
          </div>

          {/* Search Bar */}
          <div className="mb-6 sm:mb-8 animate-pulse">
            <div className="h-12 w-full bg-gray-200 rounded-lg" />
          </div>

          {/* Grid: Filter Panel + Job Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Filter Panel */}
            <aside className="lg:col-span-1 animate-pulse">
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
                <div className="h-5 w-20 bg-gray-200 rounded" />
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                    <div className="h-10 w-full bg-gray-100 rounded-lg" />
                  </div>
                ))}
                <div className="flex gap-3">
                  <div className="h-10 flex-1 bg-gray-200 rounded-lg" />
                  <div className="h-10 flex-1 bg-gray-100 rounded-lg" />
                </div>
              </div>
            </aside>

            {/* Job Results */}
            <div className="lg:col-span-3 animate-pulse">
              {/* Results count */}
              <div className="h-4 w-32 bg-gray-200 rounded mb-4" />

              {/* Job cards */}
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-gray-200 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex gap-2">
                          <div className="h-5 w-16 bg-gray-200 rounded-full" />
                          <div className="h-5 w-14 bg-gray-200 rounded-full" />
                        </div>
                        <div className="h-5 w-52 bg-gray-200 rounded" />
                        <div className="h-4 w-36 bg-gray-200 rounded" />
                        <div className="flex gap-4">
                          <div className="h-4 w-28 bg-gray-200 rounded" />
                          <div className="h-4 w-20 bg-gray-200 rounded" />
                          <div className="h-4 w-32 bg-gray-200 rounded" />
                        </div>
                      </div>
                      <div className="h-10 w-24 bg-gray-200 rounded-lg shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
