import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma/client';

const db = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * GET /api/payments/cancel
 * Redirect after cancelled payment
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentId = searchParams.get('payment_id');

  const session = await auth();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const plansUrl = `${baseUrl}/dashboard/plans`;

  try {
    if (paymentId && session?.user?.id) {
      // Update payment status to cancelled
      await db.payment.updateMany({
        where: {
          id: paymentId,
          userId: session.user.id,
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
        },
      });
    }
  } catch (error) {
    console.error('Payment cancel handler error:', error);
  }

  // Redirect to plans page with cancel message
  return NextResponse.redirect(`${plansUrl}?payment=cancelled`);
}
