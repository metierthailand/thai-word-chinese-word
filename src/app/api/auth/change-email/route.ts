import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmailVerificationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { newEmail } = body;

    if (!newEmail) {
      return new NextResponse("New email is required", { status: 400 });
    }

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      return new NextResponse("Email already in use", { status: 409 });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Generate reset token for email verification
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 24); // Token expires in 24 hours

    // Store reset token (we'll use this to verify email change)
    // The new email will be passed as query parameter in verification link
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send verification email to new email address
    const verifyUrl = await sendEmailVerificationEmail(
      user.email,
      user.name,
      resetToken,
      newEmail
    );

    return NextResponse.json({
      message: "Verification email sent to new email address",
      ...(process.env.NODE_ENV === "development" && { verificationUrl: verifyUrl }),
    });
  } catch (error) {
    console.error("[CHANGE_EMAIL]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

