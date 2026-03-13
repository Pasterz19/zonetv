import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { VoucherService } from '@/lib/voucher';

export const dynamic = 'force-dynamic';

interface BulkGenerateBody {
  count: number;
  prefix?: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL';
  value: number;
  maxUses?: number;
  maxPerUser?: number;
  validUntil?: string;
  planId?: string;
  description?: string;
}

/**
 * POST /api/vouchers/bulk
 * Generate multiple vouchers at once (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Brak uprawnień' },
        { status: 403 }
      );
    }

    const body: BulkGenerateBody = await request.json();

    // Validation
    if (!body.count || body.count < 1 || body.count > 100) {
      return NextResponse.json(
        { success: false, error: 'Liczba musi być między 1 a 100' },
        { status: 400 }
      );
    }

    if (!body.type || !body.value) {
      return NextResponse.json(
        { success: false, error: 'Brak typu lub wartości' },
        { status: 400 }
      );
    }

    const voucherService = new VoucherService();
    const result = await voucherService.createBulk({
      count: body.count,
      prefix: body.prefix || 'ZONE',
      type: body.type,
      value: body.value,
      maxUses: body.maxUses,
      maxPerUser: body.maxPerUser,
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
      planId: body.planId,
      description: body.description,
      createdBy: session.user.id,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        codes: result.codes,
        count: result.codes.length,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Bulk generate vouchers error:', error);
    return NextResponse.json(
      { success: false, error: 'Nie udało się wygenerować voucherów' },
      { status: 500 }
    );
  }
}
