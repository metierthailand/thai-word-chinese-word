"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const passportSchema = z.object({
  id: z.string().optional(),
  customerId: z.string(),
  passportNumber: z.string().min(1, "Passport number is required"),
  issuingCountry: z.string().min(1, "Issuing country is required"),
  expiryDate: z.date(),
  isPrimary: z.boolean().default(false),
});

export type PassportFormValues = z.infer<typeof passportSchema>;

export async function upsertPassport(data: PassportFormValues) {
  const { id, customerId, ...rest } = passportSchema.parse(data);

  try {
    await prisma.$transaction(async (tx) => {
      // If setting as primary, unset others first
      if (rest.isPrimary) {
        await tx.passport.updateMany({
          where: { customerId, id: { not: id } },
          data: { isPrimary: false },
        });
      }

      if (id) {
        await tx.passport.update({
          where: { id },
          data: rest,
        });
      } else {
        await tx.passport.create({
          data: {
            customerId,
            ...rest,
          },
        });
      }
    });

    revalidatePath(`/dashboard/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to upsert passport:", error);
    return { success: false, error: "Failed to save passport" };
  }
}

export async function deletePassport(id: string, customerId: string) {
  try {
    await prisma.passport.delete({
      where: { id },
    });

    revalidatePath(`/dashboard/customers/${customerId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete passport:", error);
    return { success: false, error: "Failed to delete passport" };
  }
}
