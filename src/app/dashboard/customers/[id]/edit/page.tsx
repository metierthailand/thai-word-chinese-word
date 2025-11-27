"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { CustomerForm, type CustomerFormValues } from "../../_components/customer-form";
import { Spinner } from "@/components/ui/spinner";

interface Tag {
  id: string;
  name: string;
}

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string>("");
  const [initialData, setInitialData] = useState<Partial<CustomerFormValues>>();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        setCustomerId(id);

        // Fetch customer and tags in parallel
        const [customerRes, tagsRes] = await Promise.all([
          fetch(`/api/customers/${id}`),
          fetch("/api/tags"),
        ]);

        if (!customerRes.ok) {
          throw new Error("Failed to load customer");
        }

        const customer = await customerRes.json();
        
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setTags(tagsData);
        }

        // Extract tag IDs from customer
        const customerTagIds = customer.tags?.map((ct: any) => ct.tagId) || [];
        setSelectedTagIds(customerTagIds);

        // Format dateOfBirth for the form
        const dateOfBirth = customer.dateOfBirth ? format(new Date(customer.dateOfBirth), "yyyy-MM-dd") : "";

        setInitialData({
          firstNameTh: customer.firstNameTh || "",
          lastNameTh: customer.lastNameTh || "",
          firstNameEn: customer.firstNameEn || "",
          lastNameEn: customer.lastNameEn || "",
          title: customer.title || undefined,
          nickname: customer.nickname || "",
          email: customer.email || "",
          phone: customer.phone || "",
          lineId: customer.lineId || "",
          nationality: customer.nationality || "",
          dateOfBirth: dateOfBirth,
          preferences: customer.preferences || "",
          type: customer.type || "INDIVIDUAL",
          tagIds: customerTagIds,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setInitialLoading(false);
      }
    }

    loadData();
  }, [params]);

  async function handleSubmit(values: CustomerFormValues) {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        throw new Error("Failed to update customer");
      }

      router.push(`/dashboard/customers/${customerId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      // You might want to show a toast here
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <Spinner className="size-16" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-8">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Edit Customer</h2>
      </div>

      <div className="bg-card rounded-md border p-6">
        {initialData && (
          <CustomerForm
            mode="edit"
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isLoading={loading}
            availableTags={tags}
            selectedTagIds={selectedTagIds}
          />
        )}
      </div>
    </div>
  );
}
