import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BookingStatus, Prisma, VisaStatus } from "@prisma/client";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const visaStatus = searchParams.get("visaStatus") || "";
    const tripStartDateFrom = searchParams.get("tripStartDateFrom") || "";
    const tripStartDateTo = searchParams.get("tripStartDateTo") || "";
    const skip = (page - 1) * pageSize;

    // Build where clause for optional customer name search
    const searchFilter: Prisma.BookingWhereInput =
      search.trim().length > 0
        ? {
            customer: {
              is: {
                OR: [
                  {
                    firstNameTh: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    lastNameTh: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    firstNameEn: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    lastNameEn: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            },
          }
        : {};

    // Build where clause for status filter
    const statusFilter: Prisma.BookingWhereInput = status
      ? { status: status as BookingStatus }
      : {};

    // Build where clause for visa status filter
    const visaStatusFilter: Prisma.BookingWhereInput = visaStatus
      ? { visaStatus: visaStatus as VisaStatus }
      : {};

    // Build where clause for trip start date range filter
    const tripDateFilter: Prisma.BookingWhereInput =
      tripStartDateFrom || tripStartDateTo
        ? {
            trip: {
              is: {
                startDate: {
                  ...(tripStartDateFrom ? { gte: new Date(tripStartDateFrom) } : {}),
                  ...(tripStartDateTo ? { lte: new Date(tripStartDateTo) } : {}),
                },
              },
            },
          }
        : {};

    // Combine all filters
    const where: Prisma.BookingWhereInput = {
      AND: [searchFilter, statusFilter, visaStatusFilter, tripDateFilter],
    };

    // Get total count for pagination
    const total = await prisma.booking.count({
      where,
    });

    // Fetch paginated bookings
    const bookings = await prisma.booking.findMany({
      skip,
      take: pageSize,
      where,
      orderBy: {
        createdAt: "desc",
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

    return NextResponse.json({
      data: bookings,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[BOOKINGS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      customerId,
      tripId,
      leadId,
      totalAmount,
      paidAmount,
      status,
      visaStatus,
    } = body;

    let finalCustomerId = customerId;

    // If leadId is provided but customerId is missing, try to find customer from lead
    if (leadId && !finalCustomerId) {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        select: { customerId: true },
      });

      if (lead) {
        finalCustomerId = lead.customerId;
      } else {
        return new NextResponse("Invalid Lead ID", { status: 400 });
      }
    }

    if (!finalCustomerId || !tripId) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Get trip to use its price if totalAmount is not provided
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { price: true },
    });

    if (!trip) {
      return new NextResponse("Trip not found", { status: 404 });
    }

    // Use trip.price if totalAmount is not provided or is 0
    let finalTotalAmount: number;
    if (totalAmount && parseFloat(totalAmount) > 0) {
      finalTotalAmount = parseFloat(totalAmount);
    } else if (trip.price) {
      finalTotalAmount = Number(trip.price);
    } else {
      return new NextResponse("Total amount is required (trip has no price)", { status: 400 });
    }

    const booking = await prisma.booking.create({
      data: {
        customerId: finalCustomerId,
        tripId,
        leadId,
        totalAmount: finalTotalAmount,
        paidAmount: parseFloat(paidAmount || 0),
        status: status || "PENDING",
        visaStatus: visaStatus || "NOT_REQUIRED",
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("[BOOKINGS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
