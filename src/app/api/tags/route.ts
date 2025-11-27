import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { customers: true },
        },
      },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(tag, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tag:", error);
    
    // Handle unique constraint violation
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Tag name already exists" }, { status: 409 });
    }
    
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 });
  }
}
