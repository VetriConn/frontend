export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-5 w-80 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse h-[300px]" />
      </div>
    </div>
  );
}
