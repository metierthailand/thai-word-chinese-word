import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Update user name
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name.trim(),
      },
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

    return NextResponse.json({
      ...user,
      role: user.role.toString(),
      commissionRate: user.commissionRate ? Number(user.commissionRate) : null,
    });
  } catch (error) {
    console.error("[UPDATE_PROFILE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

