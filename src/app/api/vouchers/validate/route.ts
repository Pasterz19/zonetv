import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';
import { VoucherService } from '@/lib/voucher';
import { auth } from '@/lib/auth';

const db = new PrismaClient();

export const dynamic = 'force-dynamic';

interface ValidateBody {
  code: string;
  planId: string;
}

/**
 * POST /api/vouchers/validate
 * Validate a voucher code
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Nie jesteś zalogowany' },
        { status: 401 }
      );
    }

    const body: ValidateBody = await request.json();

    if (!body.code) {
      return NextResponse.json(
        { success: false, error: 'Kod voucheru jest wymagany' },
        { status: 400 }
      );
    }

    // Get plan price
    let originalAmount = 0;
    if (body.planId) {
      const plan = await db.subscriptionPlan.findUnique({
        where: { id: body.planId },
      });
      if (plan) {
        originalAmount = Number(plan.price);
      }
    }

    const voucherService = new VoucherService();
    const result = await voucherService.validate({
      code: body.code,
      userId: session.user.id,
      originalAmount,
      planId: body.planId,
    });

    if (result.valid) {
      return NextResponse.json({
        success: true,
        valid: true,
        voucher: result.voucher,
      });
    } else {
      return NextResponse.json({
        success: true,
        valid: false,
        error: result.error,
      });
    }
  } catch (error) {
    console.error('Validate voucher error:', error);
    return NextResponse.json(
      { success: false, error: 'Wystąpił błąd podczas walidacji voucheru' },
      { status: 500 }
    );
  }
}
