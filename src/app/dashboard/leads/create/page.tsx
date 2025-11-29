"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { LeadForm } from "../_components/lead-form";

interface Customer {
  id: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
}

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
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

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create lead");
      }

      router.push("/dashboard/leads");
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
          isLoading={loading}
        />
      </div>
    </div>
  );
}
