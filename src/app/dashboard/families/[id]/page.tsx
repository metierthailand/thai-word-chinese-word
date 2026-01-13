"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone, FileText, Users } from "lucide-react";
import Link from "next/link";
import { useFamily } from "@/app/dashboard/families/hooks/use-families";
import { Loading } from "@/components/page/loading";

export default function FamilyDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { data: family, isLoading, error } = useFamily(id);

  if (isLoading) {
    return <Loading />;
  }

  if (error || !family) {
    return (
      <div className="space-y-8 p-8">
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Failed to load family. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/families">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{family.name}</h2>
            <p className="text-muted-foreground mt-1 text-sm">
              {family.customers?.length || 0} {family.customers?.length === 1 ? "member" : "members"}
            </p>
          </div>
        </div>
        <Link href={`/dashboard/families/${family.id}/edit`}>
          <Button>Edit Family</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column: Family Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {family.email && (
                <div className="flex items-center gap-3">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span>{family.email}</span>
                </div>
              )}
              {family.phoneNumber && (
                <div className="flex items-center gap-3">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <span>{family.phoneNumber}</span>
                </div>
              )}
              {family.lineId && (
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground w-4 text-center text-xs font-bold">L</span>
                  <span>{family.lineId}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {family.note && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{family.note}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Members */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Family Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              {family.customers && family.customers.length > 0 ? (
                <div className="space-y-4">
                  {family.customers.map(({ customer }) => (
                    <Link
                      key={customer.id}
                      href={`/dashboard/customers/${customer.id}`}
                      className="hover:bg-accent block rounded-lg border p-4 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {customer.firstNameTh && customer.lastNameTh
                              ? `${customer.firstNameTh} ${customer.lastNameTh}`
                              : `${customer.firstNameEn} ${customer.lastNameEn}`}
                          </p>
                          {(customer.firstNameEn || customer.lastNameEn) &&
                            (customer.firstNameTh || customer.lastNameTh) && (
                              <p className="text-muted-foreground text-sm">
                                {customer.firstNameTh && customer.lastNameTh
                                  ? `${customer.firstNameEn} ${customer.lastNameEn}`
                                  : `${customer.firstNameTh} ${customer.lastNameTh}`}
                              </p>
                            )}
                          {customer.tags && customer.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {customer.tags.map(({ tag }) => (
                                <Badge key={tag.id} variant="outline" className="bg-blue-100 text-blue-800">
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No members in this family yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
