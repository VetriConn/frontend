"use client";
import React from "react";
import clsx from "clsx";

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width = "100%", height = "20px", borderRadius = "4px", className = "" }) => {
  return <div className={clsx("inline-block animate-shimmer bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200px_100%]", className)} style={{ width, height, borderRadius }} />;
};

export const ProfileHeaderSkeleton: React.FC = () => (
  <div className="flex items-center justify-between gap-6 p-8 bg-white tablet:flex-col tablet:gap-6 tablet:px-6 sm:p-5 sm:gap-2">
    <div className="flex items-center gap-6 flex-1 tablet:w-full tablet:gap-6 sm:gap-2">
      <div className="relative shrink-0"><Skeleton width="120px" height="120px" borderRadius="50%" /></div>
      <div className="flex-1 flex flex-col gap-2 tablet:items-start tablet:text-left tablet:gap-1.5 sm:gap-1">
        <Skeleton width="200px" height="28px" borderRadius="6px" />
        <Skeleton width="150px" height="20px" borderRadius="4px" />
        <Skeleton width="180px" height="16px" borderRadius="4px" />
        <div className="flex gap-2 mt-2">
          <Skeleton width="24px" height="24px" borderRadius="4px" />
          <Skeleton width="24px" height="24px" borderRadius="4px" />
          <Skeleton width="24px" height="24px" borderRadius="4px" />
        </div>
      </div>
    </div>
    <div className="shrink-0 tablet:w-full"><Skeleton width="100%" height="36px" borderRadius="6px" /></div>
  </div>
);

export const ProfileStatsSkeleton: React.FC = () => (
  <div className="grid grid-cols-4 bg-white border border-gray-200 rounded-lg mx-8 my-6 overflow-hidden lg:mx-6 lg:my-7 md:grid-cols-2 md:mx-4 md:my-6 tablet:mx-3 tablet:my-3 sm:mx-2 sm:my-2 xs:grid-cols-1 xs:mx-1.5">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="p-6 border-r border-gray-200 flex flex-col gap-1.5 last:border-r-0 md:border-b md:border-gray-200 md:[&:nth-child(2n)]:border-r-0 md:[&:nth-child(3)]:border-b-0 md:[&:nth-child(4)]:border-b-0 tablet:p-3 sm:p-2.5 xs:border-r-0 xs:border-b xs:last:border-b-0">
        <Skeleton width="80px" height="16px" borderRadius="4px" />
        <Skeleton width={i === 4 ? "80px" : "100px"} height="20px" borderRadius={i === 4 ? "12px" : "4px"} />
      </div>
    ))}
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
        <div className="h-5 w-80 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Find Your Next Opportunity Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="h-6 w-60 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-72 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="min-w-[150px]">
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-10 w-36 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-10 w-44 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="min-w-[140px]">
            <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-10 w-36 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-gray-300 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Complete Your Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
          <div className="flex-1">
            <div className="h-6 w-44 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="flex items-center justify-between mb-2">
              <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-10 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full animate-pulse mb-4" />
            <div className="h-10 w-40 bg-gray-300 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Recommended Jobs Skeleton */}
      <RecommendedJobsSkeleton />
    </div>
  </div>
);

export const RecommendedJobsSkeleton: React.FC = () => (
  <div className="rounded-xl py-6">
    {/* Header */}
    <div className="flex items-center gap-3 mb-1">
      <Skeleton width="40px" height="40px" borderRadius="50%" />
      <Skeleton width="180px" height="24px" borderRadius="4px" />
    </div>
    <div className="ml-[52px] mb-6">
      <Skeleton width="280px" height="16px" borderRadius="4px" />
    </div>
    
    {/* Job Cards Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col justify-between">
          <div>
            <Skeleton width="90%" height="20px" borderRadius="4px" className="mb-3" />
            <Skeleton width="70%" height="16px" borderRadius="4px" className="mb-2" />
            <Skeleton width="50%" height="16px" borderRadius="4px" className="mb-2" />
            <Skeleton width="60%" height="16px" borderRadius="4px" className="mb-2" />
            <Skeleton width="55%" height="16px" borderRadius="4px" className="mb-4" />
          </div>
          <Skeleton width="100%" height="40px" borderRadius="8px" />
        </div>
      ))}
    </div>
  </div>
);

