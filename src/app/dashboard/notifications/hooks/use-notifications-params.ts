"use client";

import { useListQueryParams } from "@/hooks/use-list-query-params";

export type ListQueryDefaults = Record<string, string | number>;

const notificationsDefaults = {
  page: 1,
  pageSize: 20,
  isRead: "", // "" (all) | "false" | "true"
} satisfies ListQueryDefaults;

export type NotificationsListParams = typeof notificationsDefaults;
export function useNotificationsParams() {
  return useListQueryParams(notificationsDefaults);
}

export function mapNotificationsParamsToQuery(params: NotificationsListParams) {
  const { page, pageSize, isRead } = params;

  return {
    page,
    pageSize,
    isRead: isRead || undefined,
  };
}

