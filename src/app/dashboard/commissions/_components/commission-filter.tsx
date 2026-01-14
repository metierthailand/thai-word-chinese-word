"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface CommissionFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  createdAtFrom: string;
  createdAtTo: string;
  onCreatedAtFromChange: (value: string) => void;
  onCreatedAtToChange: (value: string) => void;
}

export function CommissionFilter({
  search,
  onSearchChange,
  createdAtFrom,
  createdAtTo,
  onCreatedAtFromChange,
  onCreatedAtToChange,
}: CommissionFilterProps) {
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  const handleClearFilters = () => {
    onSearchChange("");
    onCreatedAtFromChange("");
    onCreatedAtToChange("");
  };

  const hasActiveFilters = search || createdAtFrom || createdAtTo;

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by sales user name..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Date Range From */}
      <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !createdAtFrom && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {createdAtFrom ? format(new Date(createdAtFrom), "PPP") : "From date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={createdAtFrom ? new Date(createdAtFrom) : undefined}
            onSelect={(date) => {
              if (date) {
                onCreatedAtFromChange(format(date, "yyyy-MM-dd"));
                setFromDateOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Date Range To */}
      <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !createdAtTo && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {createdAtTo ? format(new Date(createdAtTo), "PPP") : "To date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={createdAtTo ? new Date(createdAtTo) : undefined}
            onSelect={(date) => {
              if (date) {
                onCreatedAtToChange(format(date, "yyyy-MM-dd"));
                setToDateOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={handleClearFilters} className="h-10">
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
