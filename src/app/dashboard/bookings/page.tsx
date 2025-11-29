"use client";

import { useCallback, useEffect, useMemo } from "react";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { DataTable } from "@/components/data-table/data-table";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useBookings, type Booking } from "./hooks/use-bookings";

export default function BookingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get pagination from URL params
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

  // Function to update URL params
  const updateSearchParams = useCallback(
    (updates: { page?: number; pageSize?: number }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.page !== undefined) {
        if (updates.page === 1) {
          params.delete("page");
        } else {
          params.set("page", updates.page.toString());
        }
      }

      if (updates.pageSize !== undefined) {
        if (updates.pageSize === 10) {
          params.delete("pageSize");
        } else {
          params.set("pageSize", updates.pageSize.toString());
        }
      }

      const newUrl = params.toString() ? `?${params.toString()}` : "";
      router.push(`/dashboard/bookings${newUrl}`, { scroll: false });
    },
    [searchParams, router]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "CANCELLED":
        return "bg-red-500";
      case "COMPLETED":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getVisaStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "REJECTED":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const columns: ColumnDef<Booking>[] = useMemo(
    () => [
      {
        accessorKey: "customer",
        header: "Customer",
        cell: ({ row }) => (
          <div className="font-medium">
            {`${row.original.customer.firstNameTh} ${row.original.customer.lastNameTh}`}
          </div>
        ),
      },
      {
        accessorKey: "trip",
        header: "Trip",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{row.original.trip.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.trip.destination}</span>
          </div>
        ),
      },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => format(new Date(row.original.trip.startDate), "dd MMM yyyy"),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge className={getStatusColor(row.original.status)}>{row.original.status}</Badge>
        ),
      },
      {
        accessorKey: "visaStatus",
        header: "Visa",
        cell: ({ row }) => (
          <Badge variant="outline" className={getVisaStatusColor(row.original.visaStatus)}>
            {row.original.visaStatus.replace("_", " ")}
          </Badge>
        ),
      },
      {
        accessorKey: "payment",
        header: "Payment",
        cell: ({ row }) => (
          <div className="flex flex-col text-sm">
            <span>Total: {row.original.totalAmount.toLocaleString()}</span>
            <span
              className={
                row.original.paidAmount >= row.original.totalAmount
                  ? "text-green-600"
                  : "text-yellow-600"
              }
            >
              Paid: {row.original.paidAmount.toLocaleString()}
            </span>
          </div>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => (
          <div className="flex justify-end gap-2">
            <Link href={`/dashboard/bookings/${row.original.id}/edit`}>
              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                <Pencil className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  // Use TanStack Query to fetch bookings
  const { data: bookingsResponse, isLoading, error } = useBookings(page, pageSize);

  const bookings = useMemo(() => bookingsResponse?.data ?? [], [bookingsResponse?.data]);
  const total = bookingsResponse?.total ?? 0;

  // Calculate page count
  const pageCount = useMemo(() => {
    if (total > 0 && pageSize > 0) {
      return Math.ceil(total / pageSize);
    }
    return 0;
  }, [total, pageSize]);

  const table = useDataTableInstance({
    data: bookings,
    columns: columns,
    enableRowSelection: false,
    defaultPageSize: pageSize,
    defaultPageIndex: page - 1,
    getRowId: (row) => row.id,
  });

  // Set manual pagination mode
  useEffect(() => {
    table.setOptions((prev) => ({
      ...prev,
      manualPagination: true,
      pageCount,
      data: bookings,
    }));
  }, [pageCount, bookings, table]);

  // Handlers for pagination changes
  const handlePageChange = useCallback(
    (newPageIndex: number) => {
      updateSearchParams({ page: newPageIndex + 1 });
    },
    [updateSearchParams]
  );

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      updateSearchParams({ pageSize: newPageSize, page: 1 }); // Reset to page 1 when changing page size
    },
    [updateSearchParams]
  );

  if (isLoading) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Failed to load bookings. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
          <p className="text-muted-foreground">Manage trip bookings and visa statuses.</p>
        </div>
        <Link href="/dashboard/bookings/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Booking
          </Button>
        </Link>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-md border">
          <DataTable
            table={table}
            columns={columns}
            // onRowClick={(row) => router.push(`/dashboard/bookings/${row.id}`)}
          />
        </div>
        <DataTablePagination
          table={table}
          total={total}
          pageSize={pageSize}
          pageIndex={page - 1}
          pageCount={pageCount}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
