import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/app/libs/prismadb";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    const signature =
      request.headers.get(
        "x-razorpay-signature"
      );

    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      );
    }

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_WEBHOOK_SECRET
        )
        .update(rawBody)
        .digest("hex");

    const providedSignature = signature.trim();

    if (
      providedSignature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(providedSignature)
      )
    ) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);

    if (event.event === "payment.captured") {
      const payment =
        event.payload.payment.entity;

      const razorpayOrderId =
        payment.order_id;

      const razorpayPaymentId =
        payment.id;

      await prisma.reservation.updateMany({
        where: {
          razorpayOrderId,
          status: {
            not: "CONFIRMED",
          },
        },
        data: {
          status: "CONFIRMED",
          razorpayPaymentId,
        },
      });
    }

    if (event.event === "payment.failed") {
      const payment =
        event.payload.payment.entity;

      await prisma.reservation.updateMany({
        where: {
          razorpayOrderId: payment.order_id,
        },
        data: {
          status: "FAILED",
        },
      });
    }

    return NextResponse.json({
      received: true,
    });

  } catch (error) {
    console.error("RAZORPAY_WEBHOOK_ERROR", error);

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}