"use client";

export default function ListingSkeleton() {
  return (
    <div className="col-span-1 cursor-pointer group">
      <div className="flex flex-col w-full gap-2 animate-pulse">
        {/* Image Placeholder */}
        <div className="relative w-full overflow-hidden rounded-xl bg-neutral-200 aspect-square"></div>
        
        {/* Title/Location Placeholder */}
        <div className="h-5 mt-2 rounded-md bg-neutral-200 w-3/4"></div>
        
        {/* Subtitle/Category Placeholder */}
        <div className="h-4 rounded-md bg-neutral-200 w-1/2"></div>
        
        {/* Price Placeholder */}
        <div className="h-5 mt-1 rounded-md bg-neutral-200 w-1/3"></div>
      </div>
    </div>
  );
}