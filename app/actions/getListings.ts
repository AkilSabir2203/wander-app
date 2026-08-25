"use server"

import prisma from "@/app/libs/prismadb";

export interface IListingParams {
   userId?: string;
   guestCount?: number;
   roomCount?: number;
   bathroomCount?: number;
   startDate?: string;
   endDate?: string;
   locationValue?: string;
   category?: string;

   page?: number;
   limit?: number;
}

export default async function getListings(params: IListingParams) {
   try {
      const {
         userId,
         roomCount,
         guestCount,
         bathroomCount,
         startDate,
         endDate,
         locationValue,
         category,
         page = 1, // Default to page 1
         limit = 12, // Default to 12 listings per page
      } = params;
      const query: any = {};

      if (userId) {
         query.userId = userId;
      }
      if (category) {
         query.category = category;
      }

      if (roomCount) {
         query.roomCount = {
            gte: +roomCount,
         };
      }
      if (guestCount) {
         query.guestCount = {
            gte: +guestCount,
         };
      }

      if (bathroomCount) {
         query.bathroomCount = {
            gte: +bathroomCount,
         };
      }
      if (locationValue) {
         query.locationValue = locationValue;
      }

      if (startDate && endDate) {
         query.NOT = {
            reservations: {
               some: {
                  OR: [
                     {
                        endDate: { gte: startDate },
                        startDate: { lte: startDate },
                     },
                     {
                        startDate: { lte: endDate },
                        endDate: { gte: endDate },
                     },
                  ],
               },
            },
         };
      }

      const skip = (page - 1) * limit;

      const listings = await prisma.listing.findMany({
         where: query,
         orderBy: { createdAt: "desc" },
         skip: skip, // Skip previous pages
         take: limit, // Only take the limit (12)
      });
      const safeListings = listings.map((listing) => ({
         ...listing,
         createdAt: listing.createdAt.toISOString(),
      }));

      return safeListings;
   } catch (error: any) {
      throw new Error(error);
   }
}