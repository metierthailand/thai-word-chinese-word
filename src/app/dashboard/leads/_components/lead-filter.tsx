"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface LeadFilterProps {
  onFilterChange?: () => void;
}

type UpdateParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  source?: string;
  minPotential?: string;
  maxPotential?: string;
};

export function LeadFilter({ onFilterChange }: LeadFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initial values from URL
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "ALL";
  const sourceFilter = searchParams.get("source") || "ALL";
  const minPotentialQuery = searchParams.get("minPotential") || "";
  const maxPotentialQuery = searchParams.get("maxPotential") || "";

  // Local state
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [status, setStatus] = useState(statusFilter || "ALL");
  const [source, setSource] = useState(sourceFilter || "ALL");
  const [minPotential, setMinPotential] = useState(minPotentialQuery);
  const [maxPotential, setMaxPotential] = useState(maxPotentialQuery);

  // Debounced values
  const debouncedSearch = useDebounce(searchInput, 500);
  const debouncedMinPotential = useDebounce(minPotential, 500);
  const debouncedMaxPotential = useDebounce(maxPotential, 500);

  // Helper: build query string from current params + updates
  const buildQueryString = (updates: UpdateParams) => {
    const params = new URLSearchParams(searchParams.toString());

    const setParam = (key: string, value: string | undefined, defaultValue?: string) => {
      if (value === undefined) return;

      if (value === "" || (defaultValue !== undefined && value === defaultValue)) {
        params.delete(key);
        return;
      }

      params.set(key, value);
    };

    setParam("page", updates.page?.toString(), "1");
    setParam("pageSize", updates.pageSize?.toString(), "10");
    setParam("search", updates.search);
    setParam("status", updates.status, "ALL");
    setParam("source", updates.source, "ALL");
    setParam("minPotential", updates.minPotential);
    setParam("maxPotential", updates.maxPotential);

    const qs = params.toString();
    return qs ? `?${qs}` : "";
  };

  const pushWithParams = (updates: UpdateParams) => {
    const newQuery = buildQueryString(updates);
    router.push(`/dashboard/leads${newQuery}`, { scroll: false });
    onFilterChange?.();
  };

  // 🔹 1) Sync debounced search → URL
  useEffect(() => {
    if (debouncedSearch === searchQuery) return;
    pushWithParams({ search: debouncedSearch, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, searchQuery]);

  // 🔹 2) Sync debounced budget range → URL
  useEffect(() => {
    const sameMin = debouncedMinPotential === minPotentialQuery;
    const sameMax = debouncedMaxPotential === maxPotentialQuery;
    if (sameMin && sameMax) return;

    pushWithParams({
      minPotential: debouncedMinPotential || undefined,
      maxPotential: debouncedMaxPotential || undefined,
      page: 1,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedMinPotential, debouncedMaxPotential, minPotentialQuery, maxPotentialQuery]);

  // 🔹 3) Sync URL → local state (รองรับ back/forward / external change)
  useEffect(() => {
    setSearchInput(searchQuery);
    setStatus(statusFilter || "ALL");
    setSource(sourceFilter || "ALL");
    setMinPotential(minPotentialQuery);
    setMaxPotential(maxPotentialQuery);
     
  }, [searchQuery, statusFilter, sourceFilter, minPotentialQuery, maxPotentialQuery]);

  const handleClearSearch = () => {
    setSearchInput("");
    // ไม่ต้อง push ตรง ๆ ปล่อยให้ debounced effect จัดการ
  };

  return (
    <div className="flex items-center justify-end gap-4">
      {/* Status filter */}
      <Select
        value={status}
        onValueChange={(value) => {
          setStatus(value);
          pushWithParams({ status: value, page: 1 });
        }}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Status</SelectItem>
          <SelectItem value="NEW">New</SelectItem>
          <SelectItem value="QUOTED">Quoted</SelectItem>
          <SelectItem value="FOLLOW_UP">Follow Up</SelectItem>
          <SelectItem value="CLOSED_WON">Closed Won</SelectItem>
          <SelectItem value="CLOSED_LOST">Closed Lost</SelectItem>
        </SelectContent>
      </Select>

      {/* Source filter */}
      <Select
        value={source}
        onValueChange={(value) => {
          setSource(value);
          pushWithParams({ source: value, page: 1 });
        }}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Sources</SelectItem>
          <SelectItem value="WEBSITE">Website</SelectItem>
          <SelectItem value="WALKIN">Walk-in</SelectItem>
          <SelectItem value="REFERRAL">Referral</SelectItem>
          <SelectItem value="SOCIAL">Social Media</SelectItem>
          <SelectItem value="LINE">LINE</SelectItem>
          <SelectItem value="OTHER">Other</SelectItem>
        </SelectContent>
      </Select>

      {/* Budget range filter (potentialValue) */}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          className="w-24"
          placeholder="Min ฿"
          value={minPotential}
          onChange={(e) => setMinPotential(e.target.value)}
        />
        <span className="text-muted-foreground text-sm">-</span>
        <Input
          type="number"
          className="w-24"
          placeholder="Max ฿"
          value={maxPotential}
          onChange={(e) => setMaxPotential(e.target.value)}
        />
      </div>

      {/* Search by customer name */}
      <div className="relative w-80">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Search customer name (TH/EN)..."
          className="pr-9 pl-9"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        {searchInput && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2"
            onClick={handleClearSearch}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
