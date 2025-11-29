"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useCreateTrip, type TripFormValues } from "../hooks/use-trips";
import { TripForm } from "../_components/trip-form";

export default function NewTripPage() {
  const router = useRouter();
  const createTripMutation = useCreateTrip();

  async function handleSubmit(values: TripFormValues) {
    try {
      await createTripMutation.mutateAsync(values);
      router.push("/dashboard/trips");
      router.refresh();
    } catch (error) {
      // Error is already handled in the mutation's onError
      console.error(error);
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">New Trip Package</h2>
      </div>

      <div className="rounded-md border p-6 bg-card">
        <TripForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={createTripMutation.isPending}
        />
      </div>
    </div>
  );
}
