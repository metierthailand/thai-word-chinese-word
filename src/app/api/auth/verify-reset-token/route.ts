import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse("Token is required", { status: 400 });
    }

    // Find user by reset token
    const user = await prisma.user.findUnique({
      where: {
        resetToken: token,
      },
      select: {
        id: true,
        email: true,
        name: true,
        resetTokenExpiry: true,
      },
    });

    if (!user) {
      return new NextResponse("Invalid reset token", { status: 400 });
    }

    // Check if token is expired
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return new NextResponse("Reset token has expired", { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("[VERIFY_RESET_TOKEN]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

