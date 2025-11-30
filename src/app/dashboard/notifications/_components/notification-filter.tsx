"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams, useRouter } from "next/navigation";
import { useCallback } from "react";

interface NotificationFilterProps {
  isRead: string;
  onFilterChange?: () => void;
}

export function NotificationFilter({ isRead, onFilterChange }: NotificationFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildQueryString = useCallback(
    (updates: { isRead?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.isRead !== undefined) {
        if (updates.isRead === "") {
          params.delete("isRead");
        } else {
          params.set("isRead", updates.isRead);
        }
      }

      const qs = params.toString();
      return qs ? `?${qs}` : "";
    },
    [searchParams]
  );

  const pushWithParams = useCallback(
    (updates: { isRead?: string }) => {
      const newQuery = buildQueryString(updates);
      router.push(`/dashboard/notifications${newQuery}`, { scroll: false });
      onFilterChange?.();
    },
    [buildQueryString, router, onFilterChange]
  );

  const handleFilterChange = useCallback(
    (value: string) => {
      const isReadValue = value === "all" ? "" : value;
      pushWithParams({ isRead: isReadValue });
    },
    [pushWithParams]
  );

  return (
    <Select value={isRead || "all"} onValueChange={handleFilterChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Notifications</SelectItem>
        <SelectItem value="false">Unread Only</SelectItem>
        <SelectItem value="true">Read Only</SelectItem>
      </SelectContent>
    </Select>
  );
}

