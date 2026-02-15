export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[800px] mx-auto px-6 py-10 mobile:px-4 mobile:py-6">
        {/* Page Header */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 w-36 bg-gray-200 rounded-md mb-2" />
          <div className="h-4 w-72 bg-gray-200 rounded" />
        </div>

        {/* Notification List Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-4 w-36 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="h-4 w-16 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Notification Items */}
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div
              key={i}
              className="flex items-start gap-4 px-6 py-5 border-b border-gray-100 last:border-b-0"
            >
              {/* Dot */}
              <div className="pt-2 shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
              </div>
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />
              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 w-44 bg-gray-200 rounded" />
                <div className="h-3 w-full max-w-[320px] bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="h-3 w-64 bg-gray-200 rounded mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
