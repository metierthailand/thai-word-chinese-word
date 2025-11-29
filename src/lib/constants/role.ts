// Role enum values - synced with prisma/schema.prisma
// Update this file when Role enum changes in schema

// Role enum values (must match prisma/schema.prisma)
export const ROLE_VALUES = ["ADMIN", "AGENT"] as const;

export type Role = (typeof ROLE_VALUES)[number];

// Role display labels mapping
export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  AGENT: "Agent",
};

// Helper function to get role label
export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role as Role] || role;
}

