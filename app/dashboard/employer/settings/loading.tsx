export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[600px] mx-auto px-6 py-8">
        <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse mb-6" />
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
            >
              <div className="h-5 w-48 bg-gray-200 rounded mb-5" />
              <div className="space-y-4">
                <div className="h-10 bg-gray-100 rounded-lg" />
                <div className="h-10 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
