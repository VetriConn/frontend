export default function SavedSearchesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-6 py-10 mobile:px-4 mobile:py-6">
        {/* Page Header */}
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-2">
            <div className="h-8 w-40 bg-gray-200 rounded-md" />
            <div className="h-4 w-28 bg-gray-200 rounded mt-2" />
          </div>
          <div className="h-4 w-80 bg-gray-200 rounded mb-8" />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8" />

        {/* Search Cards */}
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between gap-4 mobile:flex-col">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className="h-5 w-48 bg-gray-200 rounded" />
                  <div className="flex flex-wrap gap-2">
                    <div className="h-6 w-20 bg-gray-100 rounded-full" />
                    <div className="h-6 w-24 bg-gray-100 rounded-full" />
                    <div className="h-6 w-16 bg-gray-100 rounded-full" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-3 w-28 bg-gray-200 rounded" />
                    <div className="h-3 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <div className="h-10 w-28 bg-gray-200 rounded-lg" />
                  <div className="h-10 w-28 bg-gray-100 rounded-lg" />
                  <div className="h-10 w-20 bg-gray-50 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
