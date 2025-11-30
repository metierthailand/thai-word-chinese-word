"use client";

import { useListQueryParams } from "@/hooks/use-list-query-params";

export type ListQueryDefaults = Record<string, string | number>;

const leadsDefaults = {
  page: 1,
  pageSize: 10,
  search: "",
  status: "ALL", // ALL | NEW | QUOTED | FOLLOW_UP | CLOSED_WON | CLOSED_LOST
  source: "ALL", // ALL | WEBSITE | WALKIN | REFERRAL | SOCIAL | LINE | OTHER
  minPotential: "",
  maxPotential: "",
  customerId: "",
} satisfies ListQueryDefaults;

export type LeadsListParams = typeof leadsDefaults;
export function useLeadsParams() {
  return useListQueryParams(leadsDefaults);
}

export function mapLeadsParamsToQuery(params: LeadsListParams) {
  const { page, pageSize, search, status, source, minPotential, maxPotential, customerId } = params;

  return {
    page,
    pageSize,
    search: search || undefined,
    status: status === "ALL" ? undefined : status,
    source: source === "ALL" ? undefined : source,
    minPotential: minPotential || undefined,
    maxPotential: maxPotential || undefined,
    customerId: customerId || undefined,
  };
}
