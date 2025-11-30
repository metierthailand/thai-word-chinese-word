"use client";

import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  CheckCircle2,
  Circle,
  XCircle,
  FileText,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLead } from "../hooks/use-leads";
import { format } from "date-fns";
import { formatDecimal, cn } from "@/lib/utils";
import Link from "next/link";
import { Loading } from "@/components/page/loading";

const LEAD_STATUSES = [
  { value: "NEW", label: "New", icon: Circle },
  { value: "QUOTED", label: "Quoted", icon: FileText },
  { value: "FOLLOW_UP", label: "Follow Up", icon: Calendar },
  { value: "CLOSED_WON", label: "Closed Won", icon: CheckCircle2 },
  { value: "CLOSED_LOST", label: "Closed Lost", icon: XCircle },
] as const;

const getStatusIndex = (status: string): number => {
  return LEAD_STATUSES.findIndex((s) => s.value === status);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "NEW":
      return "bg-blue-500";
    case "QUOTED":
      return "bg-yellow-500";
    case "FOLLOW_UP":
      return "bg-purple-500";
    case "CLOSED_WON":
      return "bg-green-500";
    case "CLOSED_LOST":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};


export default function LeadViewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data: lead, isLoading, error } = useLead(typeof id === "string" ? id : undefined);

  if (isLoading) {
    return <Loading />;
  }

  if (error || !lead) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Failed to load lead.</p>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(lead.status);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Lead Details</h2>
            <p className="text-muted-foreground">View lead information and status.</p>
          </div>
        </div>
        <Button variant="default" onClick={() => router.push(`/dashboard/leads/${lead.id}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Lead
        </Button>
      </div>

      {/* Status Pipeline */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Status</CardTitle>
          <CardDescription>Current progress in the sales pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {LEAD_STATUSES.map((status, index) => {
              const StatusIcon = status.icon;
              const isActive = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isLast = index === LEAD_STATUSES.length - 1;
              const isClosedLost = lead.status === "CLOSED_LOST";

              // Determine colors based on status
              let iconBgColor = "bg-muted text-muted-foreground";
              let lineColor = "bg-muted";
              
              if (isActive) {
                if (isCurrent) {
                  // Current status
                  if (isClosedLost) {
                    iconBgColor = "bg-red-500 text-white";
                  } else {
                    iconBgColor = "bg-primary text-primary-foreground";
                  }
                } else {
                  // Past status - always green (completed)
                  iconBgColor = "bg-green-500 text-white";
                }
              }

              // Line color logic
              if (index < currentStatusIndex) {
                // If the next status is CLOSED_LOST, make the line red
                if (isClosedLost && index === currentStatusIndex - 1) {
                  lineColor = "bg-red-500";
                } else {
                  lineColor = "bg-green-500";
                }
              }

              return (
                <div key={status.value} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "rounded-full p-3 transition-colors",
                        iconBgColor,
                      )}
                    >
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-center text-xs font-medium",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {status.label}
                    </span>
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "mx-2 -mt-8 h-1 flex-1 transition-colors",
                        lineColor,
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Lead Details */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Source</p>
              <Badge variant="outline" className="mt-1">
                {getLeadSourceLabel(lead.source)}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Status</p>
              <Badge className={cn("mt-1", getStatusColor(lead.status))}>
                {getLeadStatusLabel(lead.status)}
              </Badge>
            </div>
            {lead.potentialValue && (
              <div>
                <p className="text-muted-foreground text-sm font-medium">Potential Value</p>
                <p className="mt-1 text-lg font-semibold">{formatDecimal(lead.potentialValue)}</p>
              </div>
            )}
            {lead.destinationInterest && (
              <div>
                <p className="text-muted-foreground text-sm font-medium">Destination Interest</p>
                <p className="mt-1 text-base">{lead.destinationInterest}</p>
              </div>
            )}
            {lead.travelDateEstimate && (
              <div>
                <p className="text-muted-foreground text-sm font-medium">Estimated Travel Date</p>
                <p className="mt-1 text-base">{format(new Date(lead.travelDateEstimate), "dd MMM yyyy")}</p>
              </div>
            )}
            {lead.agent && (
              <div>
                <p className="text-muted-foreground text-sm font-medium">Assigned Agent</p>
                <p className="mt-1 text-base">{lead.agent.name}</p>
                <p className="text-muted-foreground text-sm">{lead.agent.email}</p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground text-sm font-medium">Created</p>
              <p className="mt-1 text-sm">{format(new Date(lead.createdAt), "dd MMM yyyy, HH:mm")}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Last Updated</p>
              <p className="mt-1 text-sm">{format(new Date(lead.updatedAt), "dd MMM yyyy, HH:mm")}</p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Name (Thai)</p>
              <p className="text-base font-semibold">
                {lead.customer.firstNameTh} {lead.customer.lastNameTh}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Name (English)</p>
              <p className="text-base font-semibold">
                {lead.customer.firstNameEn} {lead.customer.lastNameEn}
              </p>
            </div>
            {lead.customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="text-muted-foreground h-4 w-4" />
                <a href={`mailto:${lead.customer.email}`} className="text-primary text-sm hover:underline">
                  {lead.customer.email}
                </a>
              </div>
            )}
            {lead.customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="text-muted-foreground h-4 w-4" />
                <a href={`tel:${lead.customer.phone}`} className="text-primary text-sm hover:underline">
                  {lead.customer.phone}
                </a>
              </div>
            )}
            <Separator />
            <Link href={`/dashboard/customers/${lead.customer.id}`}>
              <Button variant="outline" className="w-full">
                View Customer Profile
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{lead.notes ?? "No notes"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Bookings */}
      {lead.bookings && lead.bookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Related Bookings
            </CardTitle>
            <CardDescription>
              {lead.bookings.length} {lead.bookings.length === 1 ? "booking" : "bookings"} associated with this lead
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lead.bookings.map((booking) => (
                <Link key={booking.id} href={`/dashboard/bookings/${booking.id}`}>
                  <Card className="hover:bg-muted/50 cursor-pointer transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <MapPin className="text-muted-foreground h-4 w-4" />
                            <h4 className="font-semibold">{booking.trip.name}</h4>
                          </div>
                          <p className="text-muted-foreground text-sm">{booking.trip.destination}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="text-muted-foreground h-4 w-4" />
                              <span>
                                {format(new Date(booking.trip.startDate), "dd MMM yyyy")} -{" "}
                                {format(new Date(booking.trip.endDate), "dd MMM yyyy")}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 pt-2">
                            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                            <Badge variant="outline">{booking.visaStatus.replace("_", " ")}</Badge>
                          </div>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-muted-foreground text-sm font-medium">Total</p>
                          <p className="text-lg font-semibold">{formatDecimal(booking.totalAmount)}</p>
                          <p className="text-muted-foreground text-sm">Paid: {formatDecimal(booking.paidAmount)}</p>
                          {booking.paidAmount < booking.totalAmount && (
                            <p className="text-sm text-yellow-600">
                              Remaining: {formatDecimal(booking.totalAmount - booking.paidAmount)}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
