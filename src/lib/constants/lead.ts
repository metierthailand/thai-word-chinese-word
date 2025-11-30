// Lead enum values - synced with prisma/schema.prisma
// Update this file when LeadStatus or LeadSource enum changes in schema

// LeadStatus enum values (must match prisma/schema.prisma)
export const LEAD_STATUS_VALUES = ["NEW", "QUOTED", "FOLLOW_UP", "CLOSED_WON", "CLOSED_LOST"] as const;

export type LeadStatus = (typeof LEAD_STATUS_VALUES)[number];

// LeadStatus display labels mapping
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  QUOTED: "Quoted",
  FOLLOW_UP: "Follow Up",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
};

// Helper function to get lead status label
export function getLeadStatusLabel(status: string): string {
  return LEAD_STATUS_LABELS[status as LeadStatus] || status.replace("_", " ");
}

// LeadSource enum values (must match prisma/schema.prisma)
export const LEAD_SOURCE_VALUES = ["WEBSITE", "WALKIN", "REFERRAL", "SOCIAL", "LINE", "OTHER"] as const;

export type LeadSource = (typeof LEAD_SOURCE_VALUES)[number];

// LeadSource display labels mapping
export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  WEBSITE: "Website",
  WALKIN: "Walk-in",
  REFERRAL: "Referral",
  SOCIAL: "Social Media",
  LINE: "LINE",
  OTHER: "Other",
};

// Helper function to get lead source label
export function getLeadSourceLabel(source: string): string {
  return LEAD_SOURCE_LABELS[source as LeadSource] || source;
}

