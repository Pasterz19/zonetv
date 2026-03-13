
"use server";

import { PrismaClient } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const db = new PrismaClient();

export async function updatePlan(id: string, data: { price: number, description: string, isPromoted: boolean, features: string[] }) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    await db.subscriptionPlan.update({
        where: { id },
        data: {
            price: data.price,
            description: data.description,
            isPromoted: data.isPromoted,
            features: JSON.stringify(data.features)
        }
    });

    revalidatePath("/admin/plans");
    revalidatePath("/"); // Update homepage pricing
}
