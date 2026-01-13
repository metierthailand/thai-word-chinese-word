import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";

export const familyFormSchema = z.object({
  name: z.string().min(1, {
    message: "Family name is required.",
  }),
  phoneNumber: z.string().optional(),
  lineId: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  note: z.string().optional(),
  customerIds: z.array(z.string()).min(1, {
    message: "At least one member is required.",
  }),
});

export type FamilyFormValues = z.infer<typeof familyFormSchema>;

export interface Family {
  id: string;
  name: string;
  phoneNumber: string | null;
  lineId: string | null;
  email: string | null;
  note: string | null;
  customers: Array<{
    customer: {
      id: string;
      firstNameEn: string;
      lastNameEn: string;
      firstNameTh: string | null;
      lastNameTh: string | null;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyDetail extends Family {
  customers: Array<{
    customer: {
      id: string;
      firstNameEn: string;
      lastNameEn: string;
      firstNameTh: string | null;
      lastNameTh: string | null;
      tags: Array<{
        tag: {
          id: string;
          name: string;
        };
      }>;
    };
  }>;
}

export interface FamiliesResponse {
  data: Family[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Query key factory
export const familyKeys = {
  all: ["families"] as const,
  lists: () => [...familyKeys.all, "list"] as const,
  list: (page: number, pageSize: number, search?: string) =>
    [...familyKeys.lists(), page, pageSize, search] as const,
  details: () => [...familyKeys.all, "detail"] as const,
  detail: (id: string) => [...familyKeys.details(), id] as const,
};

// Fetch families function
async function fetchFamilies(
  page: number = 1,
  pageSize: number = 10,
  search?: string,
): Promise<FamiliesResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });
  if (search && search.trim()) {
    params.set("search", search.trim());
  }

  const res = await fetch(`/api/families?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch families");
  }
  return res.json();
}

// Fetch single family function
async function fetchFamily(id: string): Promise<FamilyDetail> {
  const res = await fetch(`/api/families/${id}`);
  if (!res.ok) {
    throw new Error("Failed to fetch family");
  }
  return res.json();
}

// Create family function
async function createFamily(data: FamilyFormValues): Promise<Family> {
  const res = await fetch("/api/families", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create family");
  }

  return res.json();
}

// Update family function
async function updateFamily({ id, data }: { id: string; data: FamilyFormValues }): Promise<FamilyDetail> {
  const res = await fetch(`/api/families/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update family");
  }

  return res.json();
}

// Delete family function
async function deleteFamily(id: string): Promise<void> {
  const res = await fetch(`/api/families/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to delete family");
  }
}

// Hook to fetch families with pagination
export function useFamilies({
  page,
  pageSize,
  search,
}: {
  page: number;
  pageSize: number;
  search?: string;
}) {
  return useQuery({
    queryKey: familyKeys.list(page, pageSize, search),
    queryFn: () => fetchFamilies(page, pageSize, search),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to fetch single family
export function useFamily(id: string | undefined) {
  return useQuery({
    queryKey: familyKeys.detail(id!),
    queryFn: () => fetchFamily(id!),
    enabled: !!id, // Only fetch if id is provided
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Hook to create a family
export function useCreateFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFamily,
    onSuccess: () => {
      // Invalidate all family queries to refetch
      queryClient.invalidateQueries({ queryKey: familyKeys.all });
      toast.success("Family created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create family");
    },
  });
}

// Hook to update a family
export function useUpdateFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateFamily,
    onSuccess: (data) => {
      // Invalidate all family queries to refetch
      queryClient.invalidateQueries({ queryKey: familyKeys.all });
      queryClient.invalidateQueries({ queryKey: familyKeys.detail(data.id) });
      toast.success("Family updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update family");
    },
  });
}

// Hook to delete a family
export function useDeleteFamily() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFamily,
    onSuccess: () => {
      // Invalidate all family queries to refetch
      queryClient.invalidateQueries({ queryKey: familyKeys.all });
      toast.success("Family deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete family");
    },
  });
}
