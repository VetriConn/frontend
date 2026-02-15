export default function AppliedJobsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-6 py-10 mobile:px-4 mobile:py-6">
        {/* Page Header */}
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-2 mobile:flex-col mobile:gap-3">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded-md mb-2" />
              <div className="h-4 w-64 bg-gray-200 rounded" />
            </div>
            <div className="h-10 w-36 bg-gray-200 rounded-lg shrink-0" />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-6" />

        {/* Stats Row */}
        <div className="flex gap-3 mb-6 overflow-x-auto mobile:gap-2 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 py-5 px-6 text-center flex-1 min-w-[120px]"
            >
              <div className="h-7 w-8 bg-gray-200 rounded mx-auto mb-2" />
              <div className="h-4 w-16 bg-gray-200 rounded mx-auto" />
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 animate-pulse">
          {[48, 52, 64, 48, 52].map((w, i) => (
            <div
              key={i}
              className="h-9 bg-gray-200 rounded-lg"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>

        {/* Application Cards */}
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between gap-4 mobile:flex-col">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="h-5 w-48 bg-gray-200 rounded" />
                  <div className="flex gap-3">
                    <div className="h-6 w-20 bg-gray-100 rounded-full" />
                    <div className="h-6 w-24 bg-gray-100 rounded-full" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </div>
                  <div className="h-3 w-28 bg-gray-200 rounded" />
                </div>
                <div className="flex flex-col gap-2 shrink-0 items-end">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-20 bg-gray-200 rounded" />
                  <div className="h-4 w-28 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
