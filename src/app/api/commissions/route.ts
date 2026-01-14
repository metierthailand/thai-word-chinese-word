import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Only ADMIN and SUPER_ADMIN can access
  if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const createdAtFrom = searchParams.get("createdAtFrom") || "";
    const createdAtTo = searchParams.get("createdAtTo") || "";

    // Build where clause for date range filter
    // Filter commissions by createdAt within the date range
    // Commission is only created when booking paymentStatus is FULLY_PAID
    const dateFilter: { gte?: Date; lte?: Date } = {};
    
    if (createdAtFrom) {
      dateFilter.gte = new Date(createdAtFrom);
    }
    
    if (createdAtTo) {
      const endDate = new Date(createdAtTo);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      dateFilter.lte = endDate;
    }

    // Build where clause
    const where: Prisma.CommissionWhereInput = {
      ...(Object.keys(dateFilter).length > 0 && {
        createdAt: dateFilter,
      }),
      ...(search.trim().length > 0 && {
        agent: {
          OR: [
            {
              firstName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
      }),
    };

    // Fetch commissions with related data
    const commissions = await prisma.commission.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        booking: {
          include: {
            trip: {
              select: {
                id: true,
                startDate: true,
              },
            },
            customer: {
              select: {
                id: true,
              },
            },
            companionCustomers: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // Group by agent (sales user)
    const groupedByAgent = new Map<
      string,
      {
        agentId: string;
        agentName: string;
        totalTrips: number;
        totalPeople: number;
        totalCommissionAmount: number;
      }
    >();

    for (const commission of commissions) {
      const agentId = commission.agentId;
      const agentName = `${commission.agent.firstName} ${commission.agent.lastName}`;

      if (!groupedByAgent.has(agentId)) {
        groupedByAgent.set(agentId, {
          agentId,
          agentName,
          totalTrips: 0,
          totalPeople: 0,
          totalCommissionAmount: 0,
        });
      }

      const group = groupedByAgent.get(agentId)!;
      group.totalTrips += 1;
      // Total people = 1 (customer) + companionCustomers.length
      group.totalPeople += 1 + commission.booking.companionCustomers.length;
      group.totalCommissionAmount += Number(commission.amount);
    }

    // Convert map to array and sort by agent name
    const result = Array.from(groupedByAgent.values()).sort((a, b) =>
      a.agentName.localeCompare(b.agentName)
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[COMMISSIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
