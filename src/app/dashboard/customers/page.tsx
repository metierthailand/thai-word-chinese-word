"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface Customer {
  id: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  type: "INDIVIDUAL" | "CORPORATE";
  tags: { tag: { name: string; color: string | null } }[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await fetch("/api/customers");
        if (!res.ok) throw new Error("Failed to fetch customers");
        const data = await res.json();
        setCustomers(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">Manage your individual and corporate clients.</p>
        </div>
        <Link href="/dashboard/customers/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                >
                  <TableCell className="font-medium">
                    {`${customer.firstNameTh} ${customer.lastNameTh}`}
                    <span className="text-muted-foreground ml-2 text-sm">
                      ({customer.firstNameEn} {customer.lastNameEn})
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>
                    {customer.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.email || "-"}</TableCell>
                  <TableCell>{customer.phone || "-"}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Link href={`/dashboard/customers/${customer.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
