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
        role: true,
        commissionRate: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    return NextResponse.json({
      ...user,
      role: user.role.toString(),
      commissionRate: user.commissionRate ? Number(user.commissionRate) : null,
    });
  } catch (error) {
    console.error("[ME_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

