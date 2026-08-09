import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import { getCurrentUser } from "@/app/actions/getCurrentUser";
import razorpay from "@/app/libs/razorpay";
import { differenceInCalendarDays } from "date-fns";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      listingId,
      startDate,
      endDate,
    } = body;

    if (!listingId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const listing = await prisma.listing.findUnique({
      where: {
        id: listingId,
      },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const dayCount = differenceInCalendarDays(end, start);

    if (dayCount <= 0) {
      return NextResponse.json(
        { error: "Invalid date range" },
        { status: 400 }
      );
    }

    // Check whether dates are already booked
    const existingReservation =
      await prisma.reservation.findFirst({
        where: {
          listingId,
          status: "CONFIRMED",
          startDate: {
            lte: end,
          },
          endDate: {
            gte: start,
          },
        },
      });

    if (existingReservation) {
      return NextResponse.json(
        { error: "Listing is already booked for these dates" },
        { status: 409 }
      );
    }

    // SERVER calculates the price
    const totalPrice = dayCount * listing.price;

    // Razorpay expects paise as an integer
    const amountInPaise = Math.round(totalPrice * 100);

    if (amountInPaise <= 0) {
      return NextResponse.json(
        { error: "Invalid payment amount" },
        { status: 400 }
      );
    }

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `reservation_${Date.now()}`,
      notes: {
        listingId,
        userId: currentUser.id,
      },
    });

    // Create PENDING reservation
    const reservation = await prisma.reservation.create({
      data: {
        userId: currentUser.id,
        listingId,
        startDate: start,
        endDate: end,
        totalPrice,
        status: "PENDING",
        razorpayOrderId: razorpayOrder.id,
      },
    });

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      reservationId: reservation.id,
    });

  } catch (error) {
    console.error("CREATE_ORDER_ERROR", error);

    return NextResponse.json(
      { error: "Unable to create payment order" },
      { status: 500 }
    );
  }
}