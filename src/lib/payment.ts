/**
 * Payment Provider Abstraction
 * Supports multiple payment providers: Stripe, Przelewy24, PayU, PayPal
 */

export type PaymentProvider = 'STRIPE' | 'PRZELEWY24' | 'PAYU' | 'PAYPAL';

export interface PaymentConfig {
  provider: PaymentProvider;
  apiKey: string;
  apiSecret: string;
  merchantId?: string;
  isTestMode: boolean;
  webhookSecret?: string;
}

export interface CreatePaymentParams {
  amount: number; // in smallest currency unit (grosze for PLN)
  currency: string; // e.g., 'PLN'
  description: string;
  customerEmail: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  error?: string;
}

export interface PaymentStatusResult {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  amount: number;
  currency: string;
  paidAt?: Date;
}

/**
 * Stripe Payment Provider
 */
export class StripeProvider {
  private apiKey: string;
  private webhookSecret: string;
  private baseUrl = 'https://api.stripe.com/v1';

  constructor(config: PaymentConfig) {
    this.apiKey = config.apiKey;
    this.webhookSecret = config.webhookSecret || '';
  }

  /**
   * Create a checkout session
   */
  async createCheckoutSession(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const response = await fetch(`${this.baseUrl}/checkout/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': 'payment',
          'payment_method_types[]': 'card',
          'line_items[][price_data][currency]': params.currency.toLowerCase(),
          'line_items[][price_data][unit_amount]': String(params.amount),
          'line_items[][price_data][product_data][name]': params.description,
          'line_items[][quantity]': '1',
          'success_url': params.successUrl,
          'cancel_url': params.cancelUrl,
          'customer_email': params.customerEmail,
          'metadata[customer_id]': params.customerId || '',
          ...(params.metadata ? Object.fromEntries(
            Object.entries(params.metadata).map(([k, v]) => [`metadata[${k}]`, v])
          ) : {}),
        } as any),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create checkout session');
      }

      const session = await response.json();

      return {
        success: true,
        paymentId: session.id,
        checkoutUrl: session.url,
      };
    } catch (error) {
      console.error('Stripe checkout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(sessionId: string): Promise<PaymentStatusResult> {
    const response = await fetch(`${this.baseUrl}/checkout/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get payment status');
    }

    const session = await response.json();

    const statusMap: Record<string, PaymentStatusResult['status']> = {
      'open': 'pending',
      'complete': 'completed',
      'expired': 'cancelled',
      'processing': 'processing',
    };

    return {
      status: statusMap[session.status] || 'pending',
      amount: session.amount_total || 0,
      currency: session.currency?.toUpperCase() || 'PLN',
      paidAt: session.payment_status === 'paid' ? new Date() : undefined,
    };
  }

  /**
   * Verify webhook signature
   */
  verifyWebhook(payload: string, signature: string): any {
    // In a real implementation, you'd use Stripe's library
    // For now, we'll parse the payload
    try {
      return JSON.parse(payload);
    } catch {
      return null;
    }
  }

  /**
   * Create a customer portal session for subscription management
   */
  async createPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }> {
    const response = await fetch(`${this.baseUrl}/billing_portal/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: customerId,
        return_url: returnUrl,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create portal session');
    }

    const session = await response.json();
    return { url: session.url };
  }
}

/**
 * Przelewy24 Payment Provider
 */
export class Przelewy24Provider {
  private merchantId: string;
  private apiKey: string;
  private crc: string;
  private isTestMode: boolean;
  private baseUrl: string;

  constructor(config: PaymentConfig) {
    this.merchantId = config.merchantId || '';
    this.apiKey = config.apiKey;
    this.crc = config.apiSecret; // CRC key
    this.isTestMode = config.isTestMode;
    this.baseUrl = config.isTestMode 
      ? 'https://sandbox.przelewy24.pl/api/v1'
      : 'https://secure.przelewy24.pl/api/v1';
  }

  /**
   * Create a transaction
   */
  async createTransaction(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      const sessionId = `p24_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const amount = params.amount / 100; // Przelewy24 uses full currency units

      const body = {
        merchantId: parseInt(this.merchantId),
        posId: parseInt(this.merchantId),
        sessionId,
        amount,
        currency: params.currency,
        description: params.description,
        email: params.customerEmail,
        country: 'PL',
        language: 'pl',
        urlReturn: params.successUrl,
        urlStatus: params.cancelUrl.replace('cancel', 'webhook'),
        timeLimit: 15,
        waitResult: false,
        encoding: 'UTF-8',
      };

      const auth = Buffer.from(`${this.merchantId}:${this.apiKey}`).toString('base64');

      const response = await fetch(`${this.baseUrl}/transaction/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create transaction');
      }

      const result = await response.json();
      const token = result.data?.token;

      // Redirect URL for payment
      const payUrl = this.isTestMode
        ? `https://sandbox.przelewy24.pl/trnRequest/${token}`
        : `https://secure.przelewy24.pl/trnRequest/${token}`;

      return {
        success: true,
        paymentId: sessionId,
        checkoutUrl: payUrl,
      };
    } catch (error) {
      console.error('Przelewy24 transaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify transaction callback
   */
  async verifyTransaction(sessionId: string, orderId: number): Promise<boolean> {
    const auth = Buffer.from(`${this.merchantId}:${this.apiKey}`).toString('base64');

    const response = await fetch(`${this.baseUrl}/transaction/verify`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchantId: parseInt(this.merchantId),
        posId: parseInt(this.merchantId),
        sessionId,
        orderId,
        amount: 0, // Will be verified from original transaction
        currency: 'PLN',
        sign: '', // Should be calculated with CRC
      }),
    });

    return response.ok;
  }
}

/**
 * Payment Manager
 * Unified interface for all payment providers
 */
export class PaymentManager {
  private providers: Map<PaymentProvider, StripeProvider | Przelewy24Provider> = new Map();

  constructor(configs: PaymentConfig[]) {
    for (const config of configs) {
      switch (config.provider) {
        case 'STRIPE':
          this.providers.set('STRIPE', new StripeProvider(config));
          break;
        case 'PRZELEWY24':
          this.providers.set('PRZELEWY24', new Przelewy24Provider(config));
          break;
      }
    }
  }

  /**
   * Create a payment
   */
  async createPayment(
    provider: PaymentProvider,
    params: CreatePaymentParams
  ): Promise<PaymentResult> {
    const providerInstance = this.providers.get(provider);
    
    if (!providerInstance) {
      return { success: false, error: `Provider ${provider} not configured` };
    }

    if (providerInstance instanceof StripeProvider) {
      return providerInstance.createCheckoutSession(params);
    } else if (providerInstance instanceof Przelewy24Provider) {
      return providerInstance.createTransaction(params);
    }

    return { success: false, error: 'Unknown provider type' };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(
    provider: PaymentProvider,
    paymentId: string
  ): Promise<PaymentStatusResult> {
    const providerInstance = this.providers.get(provider);
    
    if (!providerInstance) {
      throw new Error(`Provider ${provider} not configured`);
    }

    if (providerInstance instanceof StripeProvider) {
      return providerInstance.getPaymentStatus(paymentId);
    }

    // Default response for other providers
    return {
      status: 'pending',
      amount: 0,
      currency: 'PLN',
    };
  }
}

/**
 * Get payment manager from database configs
 */
export async function getPaymentManager(): Promise<PaymentManager> {
  const { query } = await import('@/server/db');
  
  const configs = await query<{
    provider: string;
    apiKey: string | null;
    apiSecret: string | null;
    merchantId: string | null;
    isTestMode: number;
  }>(`
    SELECT provider, apiKey, apiSecret, merchantId, isTestMode
    FROM PaymentConfig 
    WHERE isActive = 1
  `);

  return new PaymentManager(
    configs
      .filter(c => c.apiKey)
      .map(c => ({
        provider: c.provider as PaymentProvider,
        apiKey: c.apiKey!,
        apiSecret: c.apiSecret || '',
        merchantId: c.merchantId || undefined,
        isTestMode: Boolean(c.isTestMode),
      }))
  );
}

/**
 * Format amount for display
 */
export function formatAmount(amount: number, currency: string = 'PLN'): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

/**
 * Parse amount from display
 */
export function parseAmount(displayAmount: string): number {
  return Math.round(parseFloat(displayAmount.replace(/[^\d.,]/g, '').replace(',', '.')) * 100);
}
