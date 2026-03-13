import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createPaymentService } from '@/lib/payment';

export const dynamic = 'force-dynamic';

/**
 * GET /api/payments/history
 * Get payment history for current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Nie jesteś zalogowany' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const paymentService = createPaymentService();
    const result = await paymentService.getPaymentHistory(session.user.id, {
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      payments: result.payments,
      total: result.total,
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    return NextResponse.json(
      { success: false, error: 'Nie udało się pobrać historii płatności' },
      { status: 500 }
    );
  }
}
