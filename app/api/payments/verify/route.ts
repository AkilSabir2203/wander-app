import crypto from "crypto";
import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import { getCurrentUser } from "@/app/actions/getCurrentUser";

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
      reservationId,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    } = body;

    if (
      !reservationId ||
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { error: "Invalid payment data" },
        { status: 400 }
      );
    }

    // Get the order from OUR database
    const reservation =
      await prisma.reservation.findFirst({
        where: {
          id: reservationId,
          userId: currentUser.id,
        },
      });

    if (!reservation) {
      return NextResponse.json(
        { error: "Reservation not found" },
        { status: 404 }
      );
    }

    if (!reservation.razorpayOrderId) {
      return NextResponse.json(
        { error: "Razorpay order not found" },
        { status: 400 }
      );
    }

    // Make sure browser didn't switch order IDs
    if (
      reservation.razorpayOrderId !==
      razorpay_order_id
    ) {
      return NextResponse.json(
        { error: "Order mismatch" },
        { status: 400 }
      );
    }

    // Verify Razorpay signature using the documented HMAC approach
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${reservation.razorpayOrderId}|${razorpay_payment_id}`)
      .digest("hex");

    const providedSignature = razorpay_signature.trim();

    if (
      providedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(providedSignature)
      )
    ) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Idempotency
    if (reservation.status === "CONFIRMED") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
      });
    }

    // Mark reservation confirmed
    await prisma.reservation.update({
      where: {
        id: reservation.id,
      },
      data: {
        status: "CONFIRMED",
        razorpayPaymentId:
          razorpay_payment_id,
        razorpaySignature:
          razorpay_signature,
      },
    });

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error("PAYMENT_VERIFY_ERROR", error);

    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}