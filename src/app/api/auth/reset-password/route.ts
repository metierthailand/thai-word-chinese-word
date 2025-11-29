import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return new NextResponse("Token and password are required", { status: 400 });
    }

    if (password.length < 6) {
      return new NextResponse("Password must be at least 6 characters", { status: 400 });
    }

    // Find user by reset token
    const user = await prisma.user.findUnique({
      where: {
        resetToken: token,
      },
    });

    if (!user) {
      return new NextResponse("Invalid or expired reset token", { status: 400 });
    }

    // Check if token is expired
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return new NextResponse("Reset token has expired", { status: 400 });
    }

    // Hash password and update user
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("[RESET_PASSWORD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

