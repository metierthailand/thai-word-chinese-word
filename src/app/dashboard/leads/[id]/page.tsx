"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadForm } from "../_components/lead-form";
import { useLead } from "../hooks/use-leads";

interface Customer {
  id: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
}

export default function LeadViewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data: lead, isLoading, error } = useLead(typeof id === "string" ? id : undefined);
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

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading lead...</p>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-8 space-y-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Failed to load lead.</p>
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
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Lead Details</h2>
            <p className="text-muted-foreground">
              View lead information and status.
            </p>
          </div>
        </div>
        <Button
          variant="default"
          onClick={() => router.push(`/dashboard/leads/${lead.id}/edit`)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Lead
        </Button>
      </div>

      <div className="rounded-md border p-6 bg-card">
        <LeadForm
          mode="view"
          initialData={lead}
          customers={customers}
          onSubmit={async () => {}}
        />
      </div>
    </div>
  );
}


