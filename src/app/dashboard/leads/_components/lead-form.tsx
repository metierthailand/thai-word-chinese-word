"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Lead } from "../hooks/use-leads";

const formSchema = z.object({
  customerId: z.string().min(1, { message: "Customer is required" }),
  source: z.string().min(1, { message: "Source is required" }),
  status: z.string().min(1, { message: "Status is required" }),
  destinationInterest: z.string().optional(),
  potentialValue: z.string().optional(),
  travelDateEstimate: z.string().optional(),
  notes: z.string().optional(),
});

interface CustomerOption {
  id: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
}

type LeadFormValues = z.infer<typeof formSchema>;

interface LeadFormProps {
  mode: "create" | "edit" | "view";
  initialData?: Lead | null;
  customers: CustomerOption[];
  onSubmit: (values: LeadFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function LeadForm({
  mode,
  initialData,
  customers,
  onSubmit,
  onCancel,
  isLoading,
}: LeadFormProps) {
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: initialData?.customerId ?? "",
      source: initialData?.source ?? "WEBSITE",
      status: initialData?.status ?? "NEW",
      destinationInterest: initialData?.destinationInterest ?? "",
      potentialValue:
        initialData?.potentialValue != null
          ? String(initialData.potentialValue)
          : "",
      travelDateEstimate: initialData?.travelDateEstimate
        ? initialData.travelDateEstimate.substring(0, 10)
        : "",
      notes: initialData?.notes ?? "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        customerId: initialData.customerId,
        source: initialData.source,
        status: initialData.status,
        destinationInterest: initialData.destinationInterest ?? "",
        potentialValue:
          initialData.potentialValue != null
            ? String(initialData.potentialValue)
            : "",
        travelDateEstimate: initialData.travelDateEstimate
          ? initialData.travelDateEstimate.substring(0, 10)
          : "",
        notes: initialData.notes ?? "",
      });
    }
  }, [initialData, form]);

  const disabled = mode === "view" || isLoading;

  const handleSubmit = async (values: LeadFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="customerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={disabled}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.firstNameTh} {customer.lastNameTh} (
                      {customer.firstNameEn} {customer.lastNameEn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="WEBSITE">Website</SelectItem>
                    <SelectItem value="WALKIN">Walk-in</SelectItem>
                    <SelectItem value="REFERRAL">Referral</SelectItem>
                    <SelectItem value="SOCIAL">Social Media</SelectItem>
                    <SelectItem value="LINE">LINE</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={disabled}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="QUOTED">Quoted</SelectItem>
                    <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
                    <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
                    <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="destinationInterest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Interest</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Japan, Europe"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="potentialValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Potential Value (THB)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    disabled={disabled}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="travelDateEstimate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Travel Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional details..."
                  className="resize-none"
                  {...field}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode !== "view" && (
          <div className="flex justify-end space-x-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? mode === "create"
                  ? "Creating..."
                  : "Saving..."
                : mode === "create"
                ? "Create Lead"
                : "Save Changes"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}


