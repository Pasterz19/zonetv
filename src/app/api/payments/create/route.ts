import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query, runQuery } from '@/server/db';
import { getPaymentManager, formatAmount } from '@/lib/payment';

export const dynamic = 'force-dynamic';

/**
 * POST /api/payments/create
 * Create a new payment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, provider = 'STRIPE' } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'Missing planId' },
        { status: 400 }
      );
    }

    // Get plan details
    const plans = await query<{
      id: string;
      name: string;
      price: number;
      currency: string;
      tier: number;
    }>(
      'SELECT id, name, price, currency, tier FROM SubscriptionPlan WHERE id = ?',
      [planId]
    );

    const plan = plans[0];
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check for existing active subscription
    const existingSubs = await query<{ id: string }>(
      `SELECT id FROM Subscription WHERE userId = ? AND active = 1 AND (endsAt IS NULL OR endsAt > datetime('now'))`,
      [session.user.id]
    );

    if (existingSubs.length > 0) {
      return NextResponse.json(
        { error: 'Masz już aktywną subskrypcję' },
        { status: 400 }
      );
    }

    // Create payment record
    const paymentId = crypto.randomUUID();
    const amount = Math.round(plan.price * 100); // Convert to grosze

    await runQuery(
      `INSERT INTO Payment (id, userId, amount, currency, provider, status, subscriptionId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'PENDING', NULL, datetime('now'), datetime('now'))`,
      [paymentId, session.user.id, amount, plan.currency || 'PLN', provider]
    );

    // Get payment manager
    const manager = await getPaymentManager();

    // Create checkout session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

    const result = await manager.createPayment(provider, {
      amount,
      currency: plan.currency || 'PLN',
      description: `Subskrypcja ${plan.name} - ZONEtv`,
      customerEmail: session.user.email,
      customerId: session.user.id,
      successUrl: `${baseUrl}/dashboard?payment=success&payment_id=${paymentId}`,
      cancelUrl: `${baseUrl}/dashboard/plans?payment=cancelled`,
      metadata: {
        planId,
        paymentId,
        userId: session.user.id,
      },
    });

    if (!result.success) {
      // Update payment status to failed
      await runQuery(
        `UPDATE Payment SET status = 'FAILED', metadata = ?, updatedAt = datetime('now') WHERE id = ?`,
        [JSON.stringify({ error: result.error }), paymentId]
      );

      return NextResponse.json(
        { error: result.error || 'Nie udało się utworzyć płatności' },
        { status: 400 }
      );
    }

    // Update payment with provider transaction ID
    await runQuery(
      `UPDATE Payment SET providerTxId = ?, updatedAt = datetime('now') WHERE id = ?`,
      [result.paymentId, paymentId]
    );

    return NextResponse.json({
      success: true,
      paymentId,
      providerTxId: result.paymentId,
      checkoutUrl: result.checkoutUrl,
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payments/create
 * Get payment history for user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (paymentId) {
      // Get specific payment
      const payments = await query<{
        id: string;
        amount: number;
        currency: string;
        provider: string;
        providerTxId: string | null;
        status: string;
        subscriptionId: string | null;
        createdAt: string;
      }>(
        `SELECT id, amount, currency, provider, providerTxId, status, subscriptionId, createdAt
         FROM Payment WHERE id = ? AND userId = ?`,
        [paymentId, session.user.id]
      );

      if (payments.length === 0) {
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      const payment = payments[0];

      return NextResponse.json({
        payment: {
          ...payment,
          formattedAmount: formatAmount(payment.amount, payment.currency),
        },
      });
    }

    // Get all payments for user
    const payments = await query<{
      id: string;
      amount: number;
      currency: string;
      provider: string;
      status: string;
      subscriptionId: string | null;
      createdAt: string;
    }>(
      `SELECT id, amount, currency, provider, status, subscriptionId, createdAt
       FROM Payment 
       WHERE userId = ?
       ORDER BY createdAt DESC
       LIMIT 50`,
      [session.user.id]
    );

    return NextResponse.json({
      payments: payments.map(p => ({
        ...p,
        formattedAmount: formatAmount(p.amount, p.currency),
      })),
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
