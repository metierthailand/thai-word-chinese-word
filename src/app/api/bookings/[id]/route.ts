import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: id,
      },
      include: {
        customer: {
          select: {
            firstNameTh: true,
            lastNameTh: true,
            firstNameEn: true,
            lastNameEn: true,
            email: true,
          },
        },
        trip: {
          select: {
            name: true,
            destination: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!booking) {
      return new NextResponse("Booking not found", { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("[BOOKING_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const {
      customerId,
      tripId,
      totalAmount,
      paidAmount,
      status,
      visaStatus,
    } = body;

    const updateData: {
      customerId?: string;
      tripId?: string;
      totalAmount?: number;
      paidAmount?: number;
      status?: string;
      visaStatus?: string;
    } = {};

    if (customerId !== undefined && customerId !== "") updateData.customerId = customerId;
    if (tripId !== undefined && tripId !== "") updateData.tripId = tripId;
    if (totalAmount !== undefined) updateData.totalAmount = parseFloat(totalAmount);
    if (paidAmount !== undefined) updateData.paidAmount = parseFloat(paidAmount);
    if (status !== undefined && status !== "") updateData.status = status;
    if (visaStatus !== undefined && visaStatus !== "") updateData.visaStatus = visaStatus;

    const booking = await prisma.booking.update({
      where: {
        id: id,
      },
      data: updateData as {
        customerId?: string;
        tripId?: string;
        totalAmount?: number;
        paidAmount?: number;
        status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "REFUNDED";
        visaStatus?: "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";
      },
      include: {
        customer: {
          select: {
            firstNameTh: true,
            lastNameTh: true,
            firstNameEn: true,
            lastNameEn: true,
            email: true,
          },
        },
        trip: {
          select: {
            name: true,
            destination: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("[BOOKING_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

