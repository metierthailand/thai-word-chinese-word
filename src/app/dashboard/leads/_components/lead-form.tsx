"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchCustomers, useCustomer, Customer } from "@/app/dashboard/customers/hooks/use-customers";
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

type LeadFormValues = z.infer<typeof formSchema>;

interface LeadFormProps {
  mode: "create" | "edit" | "view";
  initialData?: Lead | null;
  onSubmit: (values: LeadFormValues) => Promise<void> | void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function LeadForm({ mode, initialData, onSubmit, onCancel, isLoading }: LeadFormProps) {
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerId: initialData?.customerId ?? "",
      source: initialData?.source ?? "WEBSITE",
      status: initialData?.status ?? "NEW",
      destinationInterest: initialData?.destinationInterest ?? "",
      potentialValue: initialData?.potentialValue != null ? String(initialData.potentialValue) : "",
      travelDateEstimate: initialData?.travelDateEstimate ? initialData.travelDateEstimate.substring(0, 10) : "",
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
        potentialValue: initialData.potentialValue != null ? String(initialData.potentialValue) : "",
        travelDateEstimate: initialData.travelDateEstimate ? initialData.travelDateEstimate.substring(0, 10) : "",
        notes: initialData.notes ?? "",
      });
    }
  }, [initialData, form]);

  const disabled = mode === "view" || isLoading;

  const customerId = form.watch("customerId");

  // Search customers
  const { data: searchResults = [], isLoading: isSearching } = useSearchCustomers(
    customerSearchQuery,
    10
  );

  // Fetch selected customer if not in search results
  const { data: selectedCustomerData } = useCustomer(
    customerId && !searchResults.find((c) => c.id === customerId) ? customerId : undefined
  );

  // Find selected customer to display name
  const selectedCustomer = useMemo(() => {
    if (!customerId) return null;
    // Try to find in search results first
    const found = searchResults.find((c) => c.id === customerId);
    if (found) return found;
    // If not found, use fetched customer data
    return selectedCustomerData || null;
  }, [customerId, searchResults, selectedCustomerData]);

  const handleSubmit = async (values: LeadFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Source</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
                  <FormControl>
                    <SelectTrigger className="w-full">
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={disabled}>
                  <FormControl>
                    <SelectTrigger className="w-full">
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
          name="customerId"
          render={({ field }) => (
            <FormItem className="col-span-2 flex flex-col">
              <FormLabel>Customer</FormLabel>
              {disabled ? (
                <FormControl>
                  <Input
                    value={
                      selectedCustomer
                        ? `${selectedCustomer.firstNameTh} ${selectedCustomer.lastNameTh} (${selectedCustomer.firstNameEn} ${selectedCustomer.lastNameEn})`
                        : ""
                    }
                    disabled
                  />
                </FormControl>
              ) : (
                <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {selectedCustomer
                          ? `${selectedCustomer.firstNameTh} ${selectedCustomer.lastNameTh} (${selectedCustomer.firstNameEn} ${selectedCustomer.lastNameEn})`
                          : "Search for a customer..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Search customers by name, email, or phone..."
                        value={customerSearchQuery}
                        onValueChange={setCustomerSearchQuery}
                      />
                      <CommandList>
                        {isSearching ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            Searching...
                          </div>
                        ) : searchResults.length === 0 ? (
                          <CommandEmpty>
                            {customerSearchQuery ? "No customers found." : "Start typing to search..."}
                          </CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {searchResults.map((customer) => (
                              <CommandItem
                                value={customer.id}
                                key={customer.id}
                                onSelect={() => {
                                  field.onChange(customer.id);
                                  setCustomerSearchOpen(false);
                                  setCustomerSearchQuery("");
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    customer.id === field.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {customer.firstNameTh} {customer.lastNameTh}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {customer.firstNameEn} {customer.lastNameEn}
                                    {customer.email && ` • ${customer.email}`}
                                    {customer.phone && ` • ${customer.phone}`}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="destinationInterest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Destination Interest</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Japan, Europe" {...field} disabled={disabled} />
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
                  <Input type="number" placeholder="0.00" {...field} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="travelDateEstimate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Estimated Travel Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                        disabled={disabled}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "dd MMM yyyy") : "Pick a date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      captionLayout="dropdown"
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
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
