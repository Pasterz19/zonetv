import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { VoucherService } from '@/lib/voucher';

export const dynamic = 'force-dynamic';

/**
 * GET /api/vouchers
 * List vouchers (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Brak uprawnień' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const active = searchParams.get('active');
    const type = searchParams.get('type') as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL' | null;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const voucherService = new VoucherService();
    const result = await voucherService.list({
      active: active === 'true' ? true : active === 'false' ? false : undefined,
      type: type || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      vouchers: result.vouchers,
      total: result.total,
    });
  } catch (error) {
    console.error('List vouchers error:', error);
    return NextResponse.json(
      { success: false, error: 'Nie udało się pobrać voucherów' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/vouchers
 * Create voucher (admin only)
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

    const body = await request.json();

    const voucherService = new VoucherService();
    const result = await voucherService.create({
      code: body.code,
      type: body.type,
      value: parseFloat(body.value),
      maxUses: body.maxUses ? parseInt(body.maxUses, 10) : undefined,
      maxPerUser: body.maxPerUser ? parseInt(body.maxPerUser, 10) : undefined,
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
      planId: body.planId || undefined,
      description: body.description || undefined,
      createdBy: session.user.id,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        voucher: result.voucher,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Create voucher error:', error);
    return NextResponse.json(
      { success: false, error: 'Nie udało się utworzyć voucheru' },
      { status: 500 }
    );
  }
}
