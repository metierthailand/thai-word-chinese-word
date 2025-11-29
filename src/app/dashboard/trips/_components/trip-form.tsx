"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";
import { tripFormSchema, type TripFormValues } from "../hooks/use-trips";

interface TripFormProps {
  mode: "create" | "edit" | "view";
  initialData?: Partial<TripFormValues>;
  onSubmit?: (values: TripFormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function TripForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: TripFormProps) {
  const readOnly = mode === "view";

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      name: "",
      destination: "",
      startDate: "",
      endDate: "",
      maxCapacity: "",
      price: "",
      description: "",
    },
  });

  // Sync initial data into the form (for edit/view)
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name ?? "",
        destination: initialData.destination ?? "",
        startDate: initialData.startDate ?? "",
        endDate: initialData.endDate ?? "",
        maxCapacity: initialData.maxCapacity ?? "",
        price: initialData.price ?? "",
        description: initialData.description ?? "",
      });
    }
  }, [initialData, form]);

  async function handleSubmit(values: TripFormValues) {
    if (!onSubmit || readOnly) return;
    await onSubmit(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trip Name</FormLabel>
                <FormControl>
                  <Input placeholder="Autumn in Japan" {...field} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination</FormLabel>
                <FormControl>
                  <Input placeholder="Tokyo, Kyoto" {...field} disabled={readOnly} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => {
            const startDate = field.value ? new Date(field.value) : undefined;
            const endDateValue = form.watch("endDate");
            const endDate = endDateValue ? new Date(endDateValue) : undefined;

            const dateRange: DateRange | undefined = startDate && endDate
              ? { from: startDate, to: endDate }
              : startDate
              ? { from: startDate, to: undefined }
              : undefined;

            // Calculate date range limits (±1 year from today)
            const today = new Date();
            const oneYearAgo = new Date(today);
            oneYearAgo.setFullYear(today.getFullYear() - 1);
            const oneYearFromNow = new Date(today);
            oneYearFromNow.setFullYear(today.getFullYear() + 1);

            const handleSelect = (range: DateRange | undefined) => {
              if (readOnly) return;
              if (range?.from) {
                field.onChange(format(range.from, "yyyy-MM-dd"));
                if (range.to) {
                  form.setValue("endDate", format(range.to, "yyyy-MM-dd"));
                } else {
                  form.setValue("endDate", "");
                }
              } else {
                field.onChange("");
                form.setValue("endDate", "");
              }
            };

            return (
              <FormItem className="flex flex-col">
                <FormLabel>Trip Dates</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                        disabled={readOnly}
                      >
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      captionLayout="dropdown"
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={handleSelect}
                      numberOfMonths={2}
                      disabled={(date) => {
                        return date < oneYearAgo || date > oneYearFromNow;
                      }}
                      fromYear={oneYearAgo.getFullYear()}
                      toYear={oneYearFromNow.getFullYear()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        {/* Hidden field for endDate to maintain form structure */}
        <FormField
          control={form.control}
          name="endDate"
          render={() => <></>}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="maxCapacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Capacity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="20"
                    {...field}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price (THB)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    {...field}
                    disabled={readOnly}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Trip details..."
                  className="resize-none"
                  {...field}
                  disabled={readOnly}
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
                  : "Updating..."
                : mode === "create"
                ? "Create Trip"
                : "Update Trip"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}


