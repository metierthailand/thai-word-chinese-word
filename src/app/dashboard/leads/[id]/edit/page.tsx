"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadForm } from "../../_components/lead-form";
import { useLead, useUpdateLead } from "../../hooks/use-leads";

interface Customer {
  id: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
}

export default function LeadEditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data: lead, isLoading } = useLead(typeof id === "string" ? id : undefined);
  const updateLeadMutation = useUpdateLead();
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const res = await fetch("/api/customers?page=1&pageSize=1000");
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      setCustomers(data.data ?? []);
    };
    fetchCustomers();
  }, []);

  async function handleSubmit(values: {
    customerId: string;
    source: string;
    status: string;
    destinationInterest?: string;
    potentialValue?: string;
    travelDateEstimate?: string;
    notes?: string;
  }) {
    if (!id || typeof id !== "string") return;

    const payload = {
      customerId: values.customerId,
      source: values.source,
      status: values.status,
      destinationInterest: values.destinationInterest || null,
      potentialValue: values.potentialValue
        ? Number(values.potentialValue)
        : null,
      travelDateEstimate: values.travelDateEstimate || null,
      notes: values.notes || null,
    };

    await updateLeadMutation.mutateAsync({ id, data: payload });
    router.push(`/dashboard/leads/${id}`);
    router.refresh();
  }

  if (isLoading || !lead) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading lead...</p>
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
        <h2 className="text-3xl font-bold tracking-tight">Edit Lead</h2>
      </div>

      <div className="rounded-md border p-6 bg-card">
        <LeadForm
          mode="edit"
          initialData={lead}
          customers={customers}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={updateLeadMutation.isPending}
        />
      </div>
    </div>
  );
}


