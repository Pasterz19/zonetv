import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query } from '@/server/db';
import { StripeProvider, Przelewy24Provider, PaymentConfig } from '@/lib/payment';

export const dynamic = 'force-dynamic';

/**
 * GET /api/payments/config/test?provider=STRIPE
 * Test payment provider connection
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const provider = searchParams.get('provider');

    if (!provider) {
      return NextResponse.json(
        { error: 'Missing provider parameter' },
        { status: 400 }
      );
    }

    // Get provider config
    const configs = await query<{
      provider: string;
      apiKey: string | null;
      apiSecret: string | null;
      merchantId: string | null;
      isTestMode: number;
    }>(
      'SELECT provider, apiKey, apiSecret, merchantId, isTestMode FROM PaymentConfig WHERE provider = ?',
      [provider]
    );

    if (configs.length === 0 || !configs[0].apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Provider not configured',
      });
    }

    const config = configs[0];

    try {
      switch (provider) {
        case 'STRIPE': {
          const stripeConfig: PaymentConfig = {
            provider: 'STRIPE',
            apiKey: config.apiKey!,
            apiSecret: config.apiSecret || '',
            isTestMode: Boolean(config.isTestMode),
          };
          const stripe = new StripeProvider(stripeConfig);
          
          // Test by listing balance (lightweight API call)
          const response = await fetch('https://api.stripe.com/v1/balance', {
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
            },
          });

          if (response.ok) {
            return NextResponse.json({ success: true, message: 'Stripe connection successful' });
          } else {
            const error = await response.json();
            return NextResponse.json({
              success: false,
              error: error.error?.message || 'Invalid API key',
            });
          }
        }

        case 'PRZELEWY24': {
          if (!config.merchantId) {
            return NextResponse.json({
              success: false,
              error: 'Missing Merchant ID',
            });
          }

          const p24Config: PaymentConfig = {
            provider: 'PRZELEWY24',
            apiKey: config.apiKey!,
            apiSecret: config.apiSecret || '',
            merchantId: config.merchantId,
            isTestMode: Boolean(config.isTestMode),
          };

          const auth = Buffer.from(`${config.merchantId}:${config.apiKey}`).toString('base64');
          const baseUrl = config.isTestMode
            ? 'https://sandbox.przelewy24.pl/api/v1'
            : 'https://secure.przelewy24.pl/api/v1';

          // Test by checking merchant info
          const response = await fetch(`${baseUrl}/merchant/info`, {
            headers: {
              'Authorization': `Basic ${auth}`,
            },
          });

          if (response.ok) {
            return NextResponse.json({ success: true, message: 'Przelewy24 connection successful' });
          } else {
            const error = await response.json();
            return NextResponse.json({
              success: false,
              error: error.error || 'Invalid credentials',
            });
          }
        }

        case 'PAYU':
          // PayU test implementation
          return NextResponse.json({
            success: true,
            message: 'PayU configuration found (manual test required)',
          });

        case 'PAYPAL':
          // PayPal test implementation
          return NextResponse.json({
            success: true,
            message: 'PayPal configuration found (manual test required)',
          });

        default:
          return NextResponse.json({
            success: false,
            error: `Unknown provider: ${provider}`,
          });
      }
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        error: error.message || 'Connection failed',
      });
    }
  } catch (error) {
    console.error('Error testing payment config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
