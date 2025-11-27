"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { CustomerForm, type CustomerFormValues } from "../_components/customer-form";

interface Tag {
  id: string;
  name: string;
}

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags");
        if (res.ok) {
          const data = await res.json();
          setTags(data);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, []);

  async function handleSubmit(values: CustomerFormValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Failed to create customer");
      }

      router.push("/dashboard/customers");
      router.refresh();
    } catch (error) {
      console.error(error);
      // You might want to show a toast here
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">New Customer</h2>
      </div>

      <div className="bg-card rounded-md border p-6">
        <CustomerForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isLoading={loading}
          availableTags={tags}
        />
      </div>
    </div>
  );
}
