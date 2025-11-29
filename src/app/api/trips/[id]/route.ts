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
    const trip = await prisma.trip.findUnique({
      where: {
        id: id,
      },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!trip) {
      return new NextResponse("Trip not found", { status: 404 });
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error("[TRIP_GET]", error);
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
    const { name, destination, startDate, endDate, maxCapacity, description, price } = body;

    if (!name || !destination || !startDate || !endDate || !maxCapacity) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const trip = await prisma.trip.update({
      where: {
        id: id,
      },
      data: {
        name,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxCapacity: parseInt(maxCapacity),
        description: description || null,
        price: price ? parseFloat(price) : null,
      },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return NextResponse.json(trip);
  } catch (error) {
    console.error("[TRIP_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

