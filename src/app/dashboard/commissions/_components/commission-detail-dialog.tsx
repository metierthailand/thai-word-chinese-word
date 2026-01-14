"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCommissionDetails, type CommissionDetail } from "../hooks/use-commissions";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface CommissionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string;
  agentName: string;
  createdAtFrom?: string;
  createdAtTo?: string;
}

export function CommissionDetailDialog({
  open,
  onOpenChange,
  agentId,
  agentName,
  createdAtFrom,
  createdAtTo,
}: CommissionDetailDialogProps) {
  const { data: details, isLoading, error } = useCommissionDetails(
    agentId,
    createdAtFrom,
    createdAtTo
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Commission Details - {agentName}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="py-8 text-center text-destructive">
            Failed to load commission details. Please try again.
          </div>
        ) : !details || details.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No commission details found for this sales user.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md border">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left text-sm font-semibold">Trip Code</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Customer Name</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Total People</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Commission Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((detail) => (
                    <tr key={detail.id} className="border-b last:border-0">
                      <td className="px-4 py-3 text-sm">{detail.tripCode}</td>
                      <td className="px-4 py-3 text-sm">{detail.customerName}</td>
                      <td className="px-4 py-3 text-right text-sm">{detail.totalPeople}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        {detail.commissionAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        THB
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-muted/50 font-semibold">
                    <td colSpan={2} className="px-4 py-3 text-sm">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {details.reduce((sum, d) => sum + d.totalPeople, 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm">
                      {details
                        .reduce((sum, d) => sum + d.commissionAmount, 0)
                        .toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                      THB
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
