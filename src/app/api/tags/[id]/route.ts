import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Tag name is required" }, { status: 400 });
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(tag);
  } catch (error: any) {
    console.error("Error updating tag:", error);
    
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Tag name already exists" }, { status: 409 });
    }
    
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Failed to update tag" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await prisma.tag.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting tag:", error);
    
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Failed to delete tag" }, { status: 500 });
  }
}
