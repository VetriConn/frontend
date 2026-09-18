import { CardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="w-full">
      <div className="h-8 w-60 bg-gray-200 rounded animate-pulse mb-2" />
      <div className="h-5 w-80 bg-gray-200 rounded animate-pulse mb-8" />
      <CardSkeleton className="p-6 h-[300px]" />
    </div>
  );
}
