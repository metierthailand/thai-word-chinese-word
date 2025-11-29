import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("Lead ID is required", { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id },
      include: {
        customer: true,
        agent: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!lead) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error("[LEAD_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    if (!id) {
      return new NextResponse("Lead ID is required", { status: 400 });
    }

    const body = await request.json();
    const {
      customerId,
      source,
      status,
      potentialValue,
      destinationInterest,
      travelDateEstimate,
      notes,
    } = body;

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        customerId: customerId || undefined,
        source: source || undefined,
        status: status || undefined,
        potentialValue:
          typeof potentialValue === "number"
            ? potentialValue
            : potentialValue
            ? parseFloat(potentialValue)
            : undefined,
        destinationInterest:
          destinationInterest !== undefined ? destinationInterest : undefined,
        travelDateEstimate: travelDateEstimate
          ? new Date(travelDateEstimate)
          : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    });

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("[LEAD_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


