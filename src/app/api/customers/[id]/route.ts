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
    const customer = await prisma.customer.findUnique({
      where: {
        id: id,
      },
      include: {
        tags: { include: { tag: true } },
        passports: true,
        interactions: {
          orderBy: { date: "desc" },
          include: { agent: { select: { name: true } } },
        },
        leads: {
          orderBy: { updatedAt: "desc" },
        },
        bookings: {
          orderBy: { createdAt: "desc" },
          include: {
            trip: true,
          },
        },
      },
    });

    if (!customer) {
      return new NextResponse("Customer not found", { status: 404 });
    }

    // Also fetch tasks related to this customer
    const tasks = await prisma.task.findMany({
      where: {
        relatedCustomerId: id,
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return NextResponse.json({ ...customer, tasks });
  } catch (error) {
    console.error("[CUSTOMER_GET]", error);
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
      firstNameTh,
      lastNameTh,
      firstNameEn,
      lastNameEn,
      title,
      nickname,
      email,
      phone,
      lineId,
      nationality,
      dateOfBirth,
      preferences,
      type,
      tagIds,
    } = body;

    if (!firstNameTh || !lastNameTh || !firstNameEn || !lastNameEn) {
      return new NextResponse("First name and last name (both Thai and English) are required", { status: 400 });
    }

    // Use transaction to update customer and tags atomically
    const customer = await prisma.$transaction(async (tx) => {
      // Update customer data
      const updatedCustomer = await tx.customer.update({
        where: { id },
        data: {
          firstNameTh,
          lastNameTh,
          firstNameEn,
          lastNameEn,
          title: title || null,
          nickname: nickname || null,
          email: email || null,
          phone: phone || null,
          lineId: lineId || null,
          nationality: nationality || null,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          preferences: preferences || null,
          type: type || "INDIVIDUAL",
        },
      });

      // Handle tag updates if tagIds is provided
      if (tagIds !== undefined) {
        // Delete existing tags
        await tx.customerTag.deleteMany({
          where: { customerId: id },
        });

        // Create new tags
        if (tagIds.length > 0) {
          await tx.customerTag.createMany({
            data: tagIds.map((tagId: string) => ({
              customerId: id,
              tagId,
            })),
          });
        }
      }

      // Fetch updated customer with tags
      return await tx.customer.findUnique({
        where: { id },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
        },
      });
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("[CUSTOMER_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
