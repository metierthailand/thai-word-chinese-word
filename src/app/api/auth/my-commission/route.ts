import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        commissionRate: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Query bookings that are directly linked to leads owned by this user
    // Only count bookings that have a leadId matching one of the user's leads
    const bookings = await prisma.booking.findMany({
      where: {
        AND: [
          {
            lead: {
              agentId: session.user.id,
            },
          },
          {
            status: {
              in: ["CONFIRMED", "COMPLETED"] as BookingStatus[],
            },
          },
        ],
      },
      select: {
        id: true,
        totalAmount: true,
        paidAmount: true,
        createdAt: true,
        customer: {
          select: {
            firstNameTh: true,
            lastNameTh: true,
            firstNameEn: true,
            lastNameEn: true,
          },
        },
        trip: {
          select: {
            name: true,
            destination: true,
          },
        },
      },
    });

    // Calculate commission
    const totalSales = bookings.reduce((sum, booking) => {
      return sum + Number(booking.totalAmount);
    }, 0);

    const commissionRate = user.commissionRate ? Number(user.commissionRate) : 0;
    const totalCommission = (totalSales * commissionRate) / 100;

    // Get completed bookings with details
    const completedBookings = bookings.map((booking) => ({
      id: booking.id,
      customerName: `${booking.customer.firstNameTh} ${booking.customer.lastNameTh}`,
      tripName: booking.trip.name,
      destination: booking.trip.destination,
      totalAmount: Number(booking.totalAmount),
      paidAmount: Number(booking.paidAmount),
      commission: (Number(booking.totalAmount) * commissionRate) / 100,
      createdAt: booking.createdAt,
    }));

    // Sort by date (newest first)
    completedBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      commissionRate,
      totalSales,
      totalCommission,
      totalBookings: completedBookings.length,
      bookings: completedBookings,
    });
  } catch (error) {
    console.error("[MY_COMMISSION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

