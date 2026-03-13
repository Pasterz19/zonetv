"use server";

import { PrismaClient } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";

const db = new PrismaClient();

// ... existing createUser, deleteUser, updateUserRole, sendNotification ...

export async function createUser(formData: FormData) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "USER" | "ADMIN";

    const passwordHash = await hash(password, 10);

    await db.user.create({
        data: {
            email,
            passwordHash,
            role
        }
    });

    revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    await db.user.delete({ where: { id: userId } });
    revalidatePath("/admin/users");
}

export async function updateUserRole(userId: string, role: "USER" | "ADMIN") {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    await db.user.update({
        where: { id: userId },
        data: { role }
    });
    revalidatePath("/admin/users");
}

export async function updateSubscription(userId: string, planId: string) {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

    // Deactivate current active subscriptions
    await db.subscription.updateMany({
        where: { userId, active: true },
        data: { active: false, endsAt: new Date() }
    });

    if (planId) {
        // Create new subscription
        await db.subscription.create({
            data: {
                userId,
                planId,
                active: true,
                startedAt: new Date(),
                endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days default
            }
        });
    }

    revalidatePath("/admin/users");
}

export async function sendNotification(formData: FormData) {
    // Implementation placeholder
}
