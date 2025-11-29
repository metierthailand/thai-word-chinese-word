import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
        leads: {
          select: {
            bookings: {
              where: {
                status: "COMPLETED",
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
            },
          },
        },
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Calculate commission
    const totalSales = user.leads.reduce((acc, lead) => {
      const leadTotal = lead.bookings.reduce((sum, booking) => {
        return sum + Number(booking.totalAmount);
      }, 0);
      return acc + leadTotal;
    }, 0);

    const commissionRate = user.commissionRate ? Number(user.commissionRate) : 0;
    const totalCommission = (totalSales * commissionRate) / 100;

    // Get completed bookings with details
    const completedBookings = user.leads.flatMap((lead) =>
      lead.bookings.map((booking) => ({
        id: booking.id,
        customerName: `${booking.customer.firstNameTh} ${booking.customer.lastNameTh}`,
        tripName: booking.trip.name,
        destination: booking.trip.destination,
        totalAmount: Number(booking.totalAmount),
        paidAmount: Number(booking.paidAmount),
        commission: (Number(booking.totalAmount) * commissionRate) / 100,
        createdAt: booking.createdAt,
      }))
    );

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

