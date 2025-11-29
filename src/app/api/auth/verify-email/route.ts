import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, email } = body;

    if (!token || !email) {
      return new NextResponse("Token and email are required", { status: 400 });
    }

    // Find user by reset token
    const user = await prisma.user.findUnique({
      where: {
        resetToken: token,
      },
    });

    if (!user) {
      return new NextResponse("Invalid or expired verification token", { status: 400 });
    }

    // Check if token is expired
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return new NextResponse("Verification token has expired", { status: 400 });
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser && existingUser.id !== user.id) {
      return new NextResponse("Email already in use", { status: 409 });
    }

    // Update user email and clear reset token
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: email,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: "Email verified and updated successfully" });
  } catch (error) {
    console.error("[VERIFY_EMAIL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

