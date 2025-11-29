import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const notification = await prisma.notification.findUnique({
      where: {
        id,
      },
    });

    if (!notification) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if (notification.userId !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedNotification = await prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json(updatedNotification);
  } catch (error) {
    console.error("[NOTIFICATION_READ_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
