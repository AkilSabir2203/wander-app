/**
 * React functional component that renders a listing page.
 *
 * @component
 * @example
 * const listing = {
 *   // listing data
 * };
 *
 * const currentUser = {
 *   // current user data
 * };
 *
 * const reservations = [
 *   // list of reservations
 * ];
 *
 * <ListingClient listing={listing} currentUser={currentUser} reservations={reservations} />
 *
 * @param {Object} listing - An object containing the details of the listing.
 * @param {Object} currentUser - An object representing the currently logged-in user.
 * @param {Array} reservations - An array of objects representing existing reservations for the listing.
 *
 * @returns {JSX.Element} - The rendered listing page with the listing details, date range picker, and reservation button.
 */
"use client";
import Script from "next/script";
import Container from "@/app/components/Container";
import ListingHead from "@/app/components/listings/ListingHead";
import ListingInfo from "@/app/components/listings/ListingInfo";
import ListingReservation from "@/app/components/listings/ListingReservation";
import { categories } from "@/app/components/navbar/Categories";
import useLoginModal from "@/app/hooks/useLoginModel";
import { SafeListing, SafeReservation, SafeUser } from "@/app/types";
import axios from "axios";
import { differenceInCalendarDays, eachDayOfInterval } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Range } from "react-date-range"
import { toast } from "react-hot-toast";

const initialDateRange = {
   startDate: new Date(),
   endDate: new Date(),
   key: "selection",
};

interface RazorpayPaymentResponse {
   razorpay_payment_id?: string;
   razorpay_order_id?: string;
   razorpay_signature?: string;
}

interface RazorpayOptions {
   key: string;
   amount: number;
   currency: string;
   name: string;
   description: string;
   order_id: string;
   handler: (paymentResponse: RazorpayPaymentResponse) => void;
   modal: {
      ondismiss: () => void;
   };
   theme: {
      color: string;
   };
}

declare global {
   interface Window {
      Razorpay: {
         new (options: RazorpayOptions): {
            open: () => void;
         };
      };
   }
}

interface ListingClientProps {
   reservations?: SafeReservation[];
   listing: SafeListing & {
      user: SafeUser;
   };
   currentUser?: SafeUser | null;
}

const ListingClient: React.FunctionComponent<ListingClientProps> = ({
   listing,
   currentUser,
   reservations = [],
}) => {
   const loginModal = useLoginModal();
   const router = useRouter();

   const disabledDates = useMemo(() => {
      let dates: Date[] = [];
      reservations.forEach((reservation) => {
         const range = eachDayOfInterval({
            start: new Date(reservation.startDate),
            end: new Date(reservation.endDate),
         });

         dates = [...dates, ...range];
      });
      return dates;
   }, [reservations]);

   const [isLoading, setIsLoading] = useState(false);
   const [totalPrice, setTotalPrice] = useState(listing.price);
   const [dateRange, setDateRange] = useState<Range>(initialDateRange);

   const onCreateReservation = useCallback(async () => {
   if (!currentUser) {
      return loginModal.onOpen();
   }

   if (!dateRange.startDate || !dateRange.endDate) {
      toast.error("Please select your dates");
      return;
   }

   try {
      setIsLoading(true);

      // 1. Ask our backend to create a Razorpay order
      const response = await axios.post("/api/payments/create-order", {
         listingId: listing.id,
         startDate: dateRange.startDate,
         endDate: dateRange.endDate,
      });

      const {
         orderId,
         amount,
         currency,
         reservationId,
      } = response.data;

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      // 2. Make sure Razorpay Checkout has loaded
      if (!window.Razorpay) {
         toast.error("Payment system is not ready. Please try again.");
         return;
      }

      if (!razorpayKey) {
         toast.error("Razorpay is not configured. Please contact support.");
         return;
      }

      // 3. Configure Razorpay Checkout
      const options: RazorpayOptions = {
         key: razorpayKey,

         amount: Number(amount),
         currency: String(currency),

         name: "Wander",
         description: `Reservation for ${listing.title}`,

         order_id: String(orderId),

         handler: async function (paymentResponse: RazorpayPaymentResponse) {
         try {
            // 4. Send payment details to our backend
            //    so the backend can verify the signature
            await axios.post("/api/payments/verify", {
               reservationId,

               razorpay_payment_id:
               paymentResponse.razorpay_payment_id,

               razorpay_order_id:
               paymentResponse.razorpay_order_id,

               razorpay_signature:
               paymentResponse.razorpay_signature,
            });

            toast.success("Payment successful!");

            setDateRange(initialDateRange);

            router.push("/trips");
            router.refresh();

         } catch (error) {
            console.error("Payment verification failed:", error);

            toast.error(
               "Payment verification failed. Please contact support."
            );
         }
         },

         modal: {
         ondismiss: function () {
            toast.error("Payment cancelled");
         },
         },

         theme: {
         color: "#000000",
         },
      };

      // 5. Create Razorpay instance
      const razorpay = new window.Razorpay(options);

      // 6. Open Razorpay Checkout
      razorpay.open();

   } catch (error) {
      console.error("Payment error:", error);

      toast.error("Unable to start payment");
   } finally {
      setIsLoading(false);
   }
   }, [
   currentUser,
   loginModal,
   dateRange,
   listing.id,
   listing.title,
   router,
   ]);

   // const onCreateReservation = useCallback(() => {
   //    if (!currentUser) {
   //       return loginModal.onOpen();
   //    }

   //    setIsLoading(true);

   //    axios
   //       .post("/api/reservations", {
   //          totalPrice,
   //          startDate: dateRange.startDate,
   //          endDate: dateRange.endDate,
   //          listingId: listing?.id,
   //       })
   //       .then(() => {
   //          toast.success("Listing Reserved");
   //          setDateRange(initialDateRange);
   //          // Redirect to  /trips
   //          router.push("/trips");
   //          router.refresh();
   //       })
   //       .catch(() => {
   //          toast.error("Something went wrong");
   //       })
   //       .finally(() => {
   //          setIsLoading(false);
   //       });
   // }, [totalPrice, dateRange, listing?.id, router, currentUser, loginModal]);

   useEffect(() => {
      if (dateRange.startDate && dateRange.endDate) {
         const dayCount = differenceInCalendarDays(dateRange.endDate, dateRange.startDate);

         if (dayCount && listing.price) {
            setTotalPrice(dayCount * listing.price);
         } else {
            setTotalPrice(listing.price);
         }
      }
   }, [dateRange, listing.price]);

   const category = useMemo(() => {
      return categories.find((item) => item.label === listing.category);
   }, [listing.category]);
   return (
      <>
      <Script
         src="https://checkout.razorpay.com/v1/checkout.js"
         strategy="afterInteractive"
         />
      <Container>
         <div className="max-w-screen-lg mx-auto">
            <div className="flex flex-col gap-6">
               <ListingHead
                  title={listing.title}
                  imageSrc={listing.imageSrc}
                  locationValue={listing.locationValue}
                  id={listing.id}
                  currentUser={currentUser}
               />
               <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
                  <ListingInfo
                     user={listing.user}
                     category={category}
                     description={listing.description}
                     roomCount={listing.roomCount}
                     guestCount={listing.guestCount}
                     bathroomCount={listing.bathroomCount}
                     locationValue={listing.locationValue}
                     />
                  <div className="order-first  mb-10 md:order-last md:col-span-3">
                     <ListingReservation
                        price={listing.price}
                        totalPrice={totalPrice}
                        onChangeDate={(value) => setDateRange(value)}
                        dateRange={dateRange}
                        onSubmit={onCreateReservation}
                        disabled={isLoading}
                        disabledDates={disabledDates}
                     />
                  </div>
               </div>
            </div>
         </div>
      </Container>
      </>
   );
};

export default ListingClient;