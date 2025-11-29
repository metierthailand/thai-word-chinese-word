"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { useTrip } from "../hooks/use-trips";
import { TripForm } from "../_components/trip-form";
import Link from "next/link";

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: tripId } = use(params);
  const { data: trip, isLoading: initialLoading } = useTrip(tripId);

  if (initialLoading) {
    return (
      <div className="p-8 space-y-8 max-w-2xl mx-auto">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="p-8 space-y-8 max-w-2xl mx-auto">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Trip not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Trip Details</h2>
        </div>
        <Link href={`/dashboard/trips/${tripId}/edit`}>
          <Button>
            <Pencil className="mr-2 h-4 w-4" /> Edit Trip
          </Button>
        </Link>
      </div>

      <div className="rounded-md border p-6 bg-card">
        <TripForm
          mode="view"
          initialData={{
            name: trip.name,
            destination: trip.destination,
            startDate: trip.startDate.split("T")[0],
            endDate: trip.endDate.split("T")[0],
            maxCapacity: trip.maxCapacity.toString(),
            price: trip.price || "",
            description: trip.description || "",
          }}
        />
      </div>
    </div>
  );
}

