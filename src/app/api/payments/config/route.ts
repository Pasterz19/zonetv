import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query, runQuery } from '@/server/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/payments/config
 * List all payment provider configurations
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const configs = await query<{
      id: string;
      provider: string;
      apiKey: string | null;
      apiSecret: string | null;
      merchantId: string | null;
      isTestMode: number;
      isActive: number;
      settings: string | null;
      createdAt: string;
      updatedAt: string;
    }>(`
      SELECT id, provider, apiKey, apiSecret, merchantId, isTestMode, isActive, settings, createdAt, updatedAt
      FROM PaymentConfig
      ORDER BY provider ASC
    `);

    // Mask sensitive data
    const maskedConfigs = configs.map(c => ({
      ...c,
      apiKey: c.apiKey ? `${c.apiKey.slice(0, 8)}...${c.apiKey.slice(-4)}` : null,
      hasApiKey: !!c.apiKey,
      apiSecret: c.apiSecret ? '••••••••' : null,
      hasApiSecret: !!c.apiSecret,
      isTestMode: Boolean(c.isTestMode),
      isActive: Boolean(c.isActive),
    }));

    return NextResponse.json({ configs: maskedConfigs });
  } catch (error) {
    console.error('Error fetching payment configs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments/config
 * Create or update payment provider configuration
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, provider, apiKey, apiSecret, merchantId, isTestMode, isActive } = body;

    if (!provider) {
      return NextResponse.json(
        { error: 'Missing required field: provider' },
        { status: 400 }
      );
    }

    const validProviders = ['STRIPE', 'PRZELEWY24', 'PAYU', 'PAYPAL'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { error: `Invalid provider. Must be one of: ${validProviders.join(', ')}` },
        { status: 400 }
      );
    }

    if (id) {
      // Update existing config
      // Check if we need to update secrets or keep existing
      let finalApiKey = apiKey;
      let finalApiSecret = apiSecret;
      
      if (!apiKey || apiKey.includes('...')) {
        const existing = await query<{ apiKey: string | null; apiSecret: string | null }>(
          'SELECT apiKey, apiSecret FROM PaymentConfig WHERE id = ?',
          [id]
        );
        finalApiKey = existing[0]?.apiKey;
        finalApiSecret = apiSecret || existing[0]?.apiSecret;
      } else if (!apiSecret || apiSecret === '••••••••') {
        const existing = await query<{ apiSecret: string | null }>(
          'SELECT apiSecret FROM PaymentConfig WHERE id = ?',
          [id]
        );
        finalApiSecret = existing[0]?.apiSecret;
      }

      await runQuery(
        `UPDATE PaymentConfig SET 
          apiKey = ?,
          apiSecret = ?,
          merchantId = ?,
          isTestMode = ?,
          isActive = ?,
          updatedAt = datetime('now')
        WHERE id = ?`,
        [
          finalApiKey || null,
          finalApiSecret || null,
          merchantId || null,
          isTestMode ? 1 : 0,
          isActive ? 1 : 0,
          id,
        ]
      );

      return NextResponse.json({ success: true, id });
    } else {
      // Check if provider already exists
      const existing = await query<{ id: string }>(
        'SELECT id FROM PaymentConfig WHERE provider = ?',
        [provider]
      );

      if (existing.length > 0) {
        return NextResponse.json(
          { error: `Provider ${provider} already exists. Edit the existing configuration.` },
          { status: 400 }
        );
      }

      // Create new config
      const newId = crypto.randomUUID();
      
      await runQuery(
        `INSERT INTO PaymentConfig (id, provider, apiKey, apiSecret, merchantId, isTestMode, isActive)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          provider,
          apiKey || null,
          apiSecret || null,
          merchantId || null,
          isTestMode !== false ? 1 : 0,
          isActive !== false ? 1 : 0,
        ]
      );

      return NextResponse.json({ success: true, id: newId });
    }
  } catch (error) {
    console.error('Error saving payment config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payments/config?id=xxx
 * Delete a payment provider configuration
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      );
    }

    await runQuery('DELETE FROM PaymentConfig WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
