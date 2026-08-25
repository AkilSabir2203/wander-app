"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import getListings, { IListingParams } from "@/app/actions/getListings";
import ListingCard from "../components/listings/ListingCard"; // Adjust this path if yours is different
import ListingSkeleton from "./ListingSkeleton"; // From previous step

interface LoadMoreProps {
  searchParams: IListingParams;
  currentUser: any; // Pass currentUser so ListingCard can render favorites correctly
}

export default function LoadMore({ searchParams, currentUser }: LoadMoreProps) {
  const { ref, inView } = useInView();
  const [listings, setListings] = useState<any[]>([]);
  const [page, setPage] = useState(2); // Start fetching from page 2
  const [hasMore, setHasMore] = useState(true);

  // Reset state if search filters change (like clicking a new category)
  useEffect(() => {
    setListings([]);
    setPage(2);
    setHasMore(true);
  }, [searchParams]);

  useEffect(() => {
    if (inView && hasMore) {
      loadMoreListings();
    }
  }, [inView, hasMore, searchParams]);

  const loadMoreListings = async () => {
    // Pass the existing filters + the new page number
    const newBatch = await getListings({ 
      ...searchParams, 
      page: page, 
      limit: 12 
    });
    
    if (newBatch.length === 0) {
      setHasMore(false); // End of list
    } else {
      setListings((prev) => [...prev, ...newBatch]);
      setPage((prev) => prev + 1);
    }
  };

  return (
    <>
      {listings.map((listing: any) => (
        <ListingCard 
          currentUser={currentUser} 
          key={listing.id} 
          data={listing} 
        />
      ))}

      {hasMore && (
        <div 
          ref={ref} 
          className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 2xl:col-span-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8 w-full mt-4"
        >
           {/* Render a few skeletons while loading */}
           <ListingSkeleton />
           <ListingSkeleton />
           <ListingSkeleton />
           <ListingSkeleton />
        </div>
      )}
    </>
  );
}