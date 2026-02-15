export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-6 py-10 mobile:px-4 mobile:py-6">
        {/* Page Header */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-44 bg-gray-200 rounded-md mb-2" />
          <div className="h-4 w-72 bg-gray-200 rounded" />
        </div>

        {/* Section Cards */}
        {[
          { titleW: 44, rows: 2 },
          { titleW: 48, rows: 2 },
          { titleW: 36, rows: 4 },
          { titleW: 32, rows: 3 },
          { titleW: 52, rows: 2 },
          { titleW: 36, rows: 3 },
        ].map((section, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-gray-200 p-6 mobile:p-5 mb-5 animate-pulse"
          >
            <div
              className="h-5 bg-gray-200 rounded mb-2"
              style={{ width: `${section.titleW * 4}px` }}
            />
            <div className="h-4 w-56 bg-gray-200 rounded mb-6" />
            <div className="space-y-5">
              {Array.from({ length: section.rows }).map((_, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-36 bg-gray-200 rounded" />
                    <div className="h-3 w-64 bg-gray-200 rounded" />
                    {i === 0 && (
                      <div className="h-10 w-36 bg-gray-200 rounded-lg mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
