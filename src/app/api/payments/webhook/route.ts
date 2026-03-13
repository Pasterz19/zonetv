import { NextRequest, NextResponse } from 'next/server';
import { query, runQuery } from '@/server/db';
import { createHmac, timingSafeEqual } from 'crypto';

export const dynamic = 'force-dynamic';

// Webhook secrets from environment
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const PRZELEWY24_WEBHOOK_TOKEN = process.env.PRZELEWY24_WEBHOOK_TOKEN;

/**
 * Verify Stripe webhook signature
 */
function verifyStripeSignature(payload: string, signature: string | null): boolean {
  if (!STRIPE_WEBHOOK_SECRET || !signature) {
    console.error('Missing Stripe webhook secret or signature');
    return false;
  }

  const expectedSignature = createHmac('sha256', STRIPE_WEBHOOK_SECRET)
    .update(payload, 'utf8')
    .digest('hex');

  try {
    return timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Verify Przelewy24 webhook (via token or IP whitelist)
 */
function verifyPrzelewy24Webhook(request: NextRequest): boolean {
  // Check for webhook token in header
  const token = request.headers.get('x-webhook-token');
  if (PRZELEWY24_WEBHOOK_TOKEN && token === PRZELEWY24_WEBHOOK_TOKEN) {
    return true;
  }

  // For production, you should also verify source IP
  // const clientIp = request.headers.get('x-forwarded-for') || request.ip;
  // return PRZELEWY24_IPS.includes(clientIp);

  console.warn('Przelewy24 webhook token verification failed or not configured');
  // Allow in development, block in production
  return process.env.NODE_ENV !== 'production';
}

/**
 * POST /api/payments/webhook
 * Handle payment webhooks from various providers
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const contentType = request.headers.get('content-type') || '';

    // Parse body based on content type
    let data: any;
    let provider: string;

    if (contentType.includes('application/json')) {
      data = JSON.parse(body);
      provider = data.object ? 'STRIPE' : 'PRZELEWY24';
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const params = new URLSearchParams(body);
      data = Object.fromEntries(params.entries());
      provider = 'PRZELEWY24';
    } else {
      console.error('Unknown content type:', contentType);
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    console.log('Webhook received:', { provider, type: data.type || 'unknown' });

    // Handle Stripe webhook
    if (provider === 'STRIPE') {
      const signature = request.headers.get('stripe-signature');
      if (!verifyStripeSignature(body, signature)) {
        console.error('Invalid Stripe webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
      return await handleStripeWebhook(data);
    }

    // Handle Przelewy24 webhook
    if (provider === 'PRZELEWY24') {
      if (!verifyPrzelewy24Webhook(request)) {
        console.error('Invalid Przelewy24 webhook verification');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return await handlePrzelewy24Webhook(data);
    }

    return NextResponse.json({ error: 'Unknown provider' }, { status: 400 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle Stripe webhook events
 */
async function handleStripeWebhook(data: any): Promise<NextResponse> {
  const eventType = data.type;

  switch (eventType) {
    case 'checkout.session.completed': {
      const session = data.data?.object;
      const metadata = session?.metadata || {};
      const planId = metadata.planId;
      const paymentId = metadata.paymentId;
      const userId = metadata.userId;

      if (!userId || !planId) {
        console.error('Missing metadata in Stripe webhook');
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
      }

      // Update payment status
      if (paymentId) {
        await runQuery(
          `UPDATE Payment SET status = 'COMPLETED', providerTxId = ?, updatedAt = datetime('now') WHERE id = ?`,
          [session.id, paymentId]
        );
      }

      // Create or update subscription
      const subId = crypto.randomUUID();
      const startsAt = new Date().toISOString();
      const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

      // Deactivate any existing subscriptions
      await runQuery(
        `UPDATE Subscription SET active = 0 WHERE userId = ?`,
        [userId]
      );

      // Create new subscription
      await runQuery(
        `INSERT INTO Subscription (id, userId, planId, active, startedAt, endsAt)
         VALUES (?, ?, ?, 1, ?, ?)`,
        [subId, userId, planId, startsAt, endsAt]
      );

      // Update payment with subscription ID
      if (paymentId) {
        await runQuery(
          `UPDATE Payment SET subscriptionId = ? WHERE id = ?`,
          [subId, paymentId]
        );
      }

      console.log('Subscription created:', { subId, userId, planId, endsAt });

      return NextResponse.json({ success: true, subscriptionId: subId });
    }

    case 'checkout.session.expired': {
      const session = data.data?.object;
      const paymentId = session?.metadata?.paymentId;

      if (paymentId) {
        await runQuery(
          `UPDATE Payment SET status = 'CANCELLED', updatedAt = datetime('now') WHERE id = ?`,
          [paymentId]
        );
      }

      return NextResponse.json({ success: true });
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = data.data?.object;
      console.log('Payment failed:', paymentIntent?.id);
      return NextResponse.json({ success: true });
    }

    default:
      console.log('Unhandled Stripe event:', eventType);
      return NextResponse.json({ received: true });
  }
}

/**
 * Handle Przelewy24 webhook events
 */
async function handlePrzelewy24Webhook(data: any): Promise<NextResponse> {
  const sessionId = data.p24_session_id || data.sessionId;
  const orderId = data.p24_order_id || data.orderId;
  const amount = data.p24_amount || data.amount;
  const currency = data.p24_currency || data.currency || 'PLN';

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
  }

  // Find payment by session ID
  const payments = await query<{ id: string; userId: string }>(
    `SELECT id, userId FROM Payment WHERE providerTxId = ? OR metadata LIKE ?`,
    [sessionId, `%"sessionId":"${sessionId}"%`]
  );

  if (payments.length === 0) {
    console.error('Payment not found for session:', sessionId);
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  const payment = payments[0];

  // Update payment status
  await runQuery(
    `UPDATE Payment SET status = 'COMPLETED', metadata = ?, updatedAt = datetime('now') WHERE id = ?`,
    [JSON.stringify({ sessionId, orderId, amount, currency }), payment.id]
  );

  // Get plan from payment metadata
  const paymentDetails = await query<{ metadata: string | null }>(
    'SELECT metadata FROM Payment WHERE id = ?',
    [payment.id]
  );

  const metadata = paymentDetails[0]?.metadata 
    ? JSON.parse(paymentDetails[0].metadata) 
    : {};

  const planId = metadata.planId;

  if (planId) {
    // Create subscription
    const subId = crypto.randomUUID();
    const startsAt = new Date().toISOString();
    const endsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await runQuery(
      `UPDATE Subscription SET active = 0 WHERE userId = ?`,
      [payment.userId]
    );

    await runQuery(
      `INSERT INTO Subscription (id, userId, planId, active, startedAt, endsAt)
       VALUES (?, ?, ?, 1, ?, ?)`,
      [subId, payment.userId, planId, startsAt, endsAt]
    );

    await runQuery(
      `UPDATE Payment SET subscriptionId = ? WHERE id = ?`,
      [subId, payment.id]
    );

    console.log('Przelewy24 subscription created:', { subId, userId: payment.userId, planId });
  }

  return NextResponse.json({ success: true });
}

/**
 * GET /api/payments/webhook
 * Health check for webhook endpoint
 */
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Payment webhook endpoint is ready' 
  });
}
