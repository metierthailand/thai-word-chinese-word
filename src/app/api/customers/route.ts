import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        passports: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("[CUSTOMERS_GET]", error);
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

    const customer = await prisma.customer.create({
      data: {
        firstNameTh,
        lastNameTh,
        firstNameEn,
        lastNameEn,
        title: title || undefined,
        nickname: nickname || undefined,
        email: email || undefined,
        phone: phone || undefined,
        lineId: lineId || undefined,
        nationality: nationality || undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        preferences: preferences || undefined,
        type: type || "INDIVIDUAL",
        tags: tagIds && tagIds.length > 0 ? {
          create: tagIds.map((tagId: string) => ({
            tagId,
          })),
        } : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("[CUSTOMERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
