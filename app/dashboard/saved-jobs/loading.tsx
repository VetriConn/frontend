export default function SavedJobsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-6 py-10 mobile:px-4 mobile:py-6">
        {/* Page Header */}
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-2">
            <div className="h-8 w-36 bg-gray-200 rounded-md" />
            <div className="h-4 w-20 bg-gray-200 rounded mt-2" />
          </div>
          <div className="h-4 w-72 bg-gray-200 rounded mb-8" />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8" />

        {/* Job Cards */}
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between gap-4 mobile:flex-col">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="h-5 w-56 bg-gray-200 rounded" />
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <div className="h-4 w-40 bg-gray-200 rounded" />
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <div className="h-4 w-28 bg-gray-200 rounded" />
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </div>
                  <div className="h-3 w-36 bg-gray-200 rounded" />
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="h-10 w-28 bg-gray-200 rounded-lg" />
                  <div className="h-10 w-36 bg-gray-100 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
