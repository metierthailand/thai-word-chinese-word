"use client";

import { useListQueryParams } from "@/hooks/use-list-query-params";

export type ListQueryDefaults = Record<string, string | number>;

const familyDefaults = {
  page: 1,
  pageSize: 10,
  search: "",
} satisfies ListQueryDefaults;

export type FamilyListParams = typeof familyDefaults;
export function useFamilyParams() {
  return useListQueryParams(familyDefaults);
}

export function mapFamilyParamsToQuery(params: FamilyListParams) {
  const { page, pageSize, search } = params;

  return {
    page,
    pageSize,
    search: search || undefined,
  };
}
