import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@/generated/prisma/client';

const db = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * GET /api/payments/success
 * Redirect after successful payment
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const paymentId = searchParams.get('payment_id');
  const sessionId = searchParams.get('session_id'); // Stripe

  const session = await auth();

  // Build redirect URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const dashboardUrl = `${baseUrl}/dashboard/plans`;

  if (!session?.user) {
    // Redirect to login with return URL
    return NextResponse.redirect(
      `${baseUrl}/auth/login?callbackUrl=${encodeURIComponent(dashboardUrl)}`
    );
  }

  try {
    // If we have payment ID, update status
    if (paymentId) {
      const payment = await db.payment.findUnique({
        where: { id: paymentId },
      });

      if (payment && payment.userId === session.user.id && payment.status === 'PENDING') {
        // Update payment status
        await db.payment.update({
          where: { id: paymentId },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
          },
        });

        // Get plan info and activate subscription
        const activeSub = await db.subscription.findFirst({
          where: { userId: session.user.id, active: true },
          include: { plan: true },
        });

        if (activeSub) {
          // Extend subscription
          const newEndsAt = new Date(activeSub.endsAt || new Date());
          newEndsAt.setDate(newEndsAt.getDate() + 30);

          await db.subscription.update({
            where: { id: activeSub.id },
            data: { endsAt: newEndsAt, active: true },
          });
        }
      }
    }

    // Create notification
    if (session.user.id) {
      await db.notification.create({
        data: {
          userId: session.user.id,
          title: 'Płatność zakończona',
          message: 'Twoja płatność została pomyślnie zrealizowana. Dziękujemy!',
          type: 'payment_success',
        },
      });
    }

    // Redirect to success page
    return NextResponse.redirect(`${dashboardUrl}?payment=success`);
  } catch (error) {
    console.error('Payment success handler error:', error);
    return NextResponse.redirect(`${dashboardUrl}?payment=error`);
  }
}
