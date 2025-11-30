"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LeadForm } from "../_components/lead-form";
import { useCreateLead } from "../hooks/use-leads";
import { toast } from "sonner";

export default function NewLeadPage() {
  const router = useRouter();
  const createLeadMutation = useCreateLead();

  async function handleSubmit(values: {
    customerId: string;
    source: string;
    status: string;
    destinationInterest?: string;
    potentialValue?: string;
    travelDateEstimate?: string;
    notes?: string;
  }) {
    const payload = {
      customerId: values.customerId,
      source: values.source,
      status: values.status,
      destinationInterest: values.destinationInterest || undefined,
      potentialValue: values.potentialValue ? Number(values.potentialValue) : undefined,
      travelDateEstimate: values.travelDateEstimate || undefined,
      notes: values.notes || undefined,
    };

    try {
      await createLeadMutation.mutateAsync(payload);
      router.push("/dashboard/leads");
      router.refresh();
    } catch {
      toast.error("Failed to create lead");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">New Lead</h2>
      </div>

      <div className="bg-card rounded-md border p-6">
        <LeadForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={createLeadMutation.isPending}
        />
      </div>
    </div>
  );
}
