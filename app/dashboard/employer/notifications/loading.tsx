export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[680px] mx-auto px-6 py-8">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-6" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-gray-200 px-5 py-4 animate-pulse"
            >
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gray-200 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                  <div className="h-3 w-64 bg-gray-100 rounded" />
                </div>
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
