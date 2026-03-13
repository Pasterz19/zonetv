"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma/client";
import { redirect } from "next/navigation";
import { VouchersManager } from './vouchers-manager';

const db = new PrismaClient();

export const dynamic = 'force-dynamic';

export default async function AdminVouchersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Get vouchers
  const vouchers = await db.voucher.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      code: true,
      type: true,
      value: true,
      isActive: true,
      currentUses: true,
      maxUses: true,
      maxPerUser: true,
      validFrom: true,
      validUntil: true,
      description: true,
      planId: true,
      createdAt: true,
    },
  });

  // Get plans for dropdown
  const plans = await db.subscriptionPlan.findMany({
    select: { id: true, name: true },
    orderBy: { tier: 'asc' },
  });

  const formattedVouchers = vouchers.map((v) => ({
    ...v,
    value: Number(v.value),
    validFrom: v.validFrom.toISOString(),
    validUntil: v.validUntil?.toISOString() || null,
    createdAt: v.createdAt.toISOString(),
  }));

  return (
    <VouchersManager
      initialVouchers={formattedVouchers}
      plans={plans}
    />
  );
}
