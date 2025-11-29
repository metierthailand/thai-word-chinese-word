"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LeadForm } from "../_components/lead-form";
import { useCreateLead } from "../hooks/use-leads";
import { useCustomers } from "@/app/dashboard/customers/hooks/use-customers";
import { useMemo } from "react";

export default function NewLeadPage() {
  const router = useRouter();
  const createLeadMutation = useCreateLead();

  // Fetch customers using TanStack Query
  const { data: customersResponse, isLoading: isLoadingCustomers } = useCustomers(
    1,
    1000 // Fetch a large number of customers for the dropdown
  );

  const customers = useMemo(() => {
    if (!customersResponse?.data) return [];
    return customersResponse.data.map((customer) => ({
      id: customer.id,
      firstNameTh: customer.firstNameTh,
      lastNameTh: customer.lastNameTh,
      firstNameEn: customer.firstNameEn,
      lastNameEn: customer.lastNameEn,
    }));
  }, [customersResponse]);

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
      potentialValue: values.potentialValue
        ? Number(values.potentialValue)
        : undefined,
      travelDateEstimate: values.travelDateEstimate || undefined,
      notes: values.notes || undefined,
    };

    try {
      await createLeadMutation.mutateAsync(payload);
      router.push("/dashboard/leads");
      router.refresh();
    } catch (error) {
      // Error is already handled by the mutation hook (toast notification)
      console.error(error);
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-2xl mx-auto">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">New Lead</h2>
      </div>

      <div className="rounded-md border p-6 bg-card">
        <LeadForm
          mode="create"
          customers={customers}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={createLeadMutation.isPending || isLoadingCustomers}
        />
      </div>
    </div>
  );
}
