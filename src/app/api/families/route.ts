import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    // Fetch families with customers count
    const [families, total] = await Promise.all([
      prisma.family.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          customers: {
            include: {
              customer: {
                select: {
                  id: true,
                  firstNameEn: true,
                  lastNameEn: true,
                  firstNameTh: true,
                  lastNameTh: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.family.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      data: families,
      total,
      page,
      pageSize,
      totalPages,
    });
  } catch (error) {
    console.error("[FAMILIES_GET]", error);
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
    const { name, phoneNumber, lineId, email, note, customerIds } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const family = await prisma.family.create({
      data: {
        name,
        phoneNumber: phoneNumber || null,
        lineId: lineId || null,
        email: email || null,
        note: note || null,
        customers:
          customerIds && customerIds.length > 0
            ? {
                create: customerIds.map((customerId: string) => ({
                  customerId,
                })),
              }
            : undefined,
      },
      include: {
        customers: {
          include: {
            customer: {
              select: {
                id: true,
                firstNameEn: true,
                lastNameEn: true,
                firstNameTh: true,
                lastNameTh: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(family);
  } catch (error) {
    console.error("[FAMILIES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
