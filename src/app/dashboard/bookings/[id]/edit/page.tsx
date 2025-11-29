"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { BookingForm, BookingFormValues } from "../../_components/booking-form";
import { useBooking, useUpdateBooking } from "../../hooks/use-bookings";

export default function EditBookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const bookingId = resolvedParams.id;

  const { data: booking, isLoading: isLoadingBooking, error: bookingError } = useBooking(bookingId);
  const updateBookingMutation = useUpdateBooking();

  // Format initial data for the form
  const initialData: Partial<BookingFormValues> | undefined = booking
    ? {
        customerId: booking.customerId || "",
        tripId: booking.tripId || "",
        totalAmount: booking.totalAmount.toString(),
        paidAmount: booking.paidAmount.toString(),
        status: booking.status || "PENDING",
        visaStatus: booking.visaStatus || "NOT_REQUIRED",
      }
    : undefined;

  async function handleSubmit(values: BookingFormValues) {
    try {
      const updateData: {
        customerId?: string;
        tripId?: string;
        totalAmount?: number;
        paidAmount?: number;
        status?: string;
        visaStatus?: string;
      } = {
        customerId: values.customerId,
        tripId: values.tripId,
        totalAmount: parseFloat(values.totalAmount),
        paidAmount: parseFloat(values.paidAmount || "0"),
      };

      // Only include status and visaStatus if they have valid values (not empty string)
      if (values.status && values.status.trim() !== "") {
        updateData.status = values.status;
      }
      if (values.visaStatus && values.visaStatus.trim() !== "") {
        updateData.visaStatus = values.visaStatus;
      }

      await updateBookingMutation.mutateAsync({
        id: bookingId,
        data: updateData,
      });
      router.push("/dashboard/bookings");
      router.refresh();
    } catch (error) {
      // Error is already handled in the mutation's onError
      console.error(error);
    }
  }

  if (isLoadingBooking) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading booking data...</p>
        </div>
      </div>
    );
  }

  if (bookingError) {
    return (
      <div className="mx-auto max-w-2xl space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Failed to load booking. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Edit Booking</h2>
      </div>

      <div className="rounded-md border p-6 bg-card">
        {initialData && (
          <BookingForm
            mode="edit"
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isLoading={updateBookingMutation.isPending}
            booking={booking}
          />
        )}
      </div>
    </div>
  );
}

