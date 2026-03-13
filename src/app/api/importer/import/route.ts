import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { runQuery } from '@/server/db';

const SESSION_COOKIE_NAME = "zonetv_session";
const secretKey = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-zonetv-change-me",
);

interface ImportItem {
  name: string;
  url: string;
  groupTitle?: string;
  tvgLogo?: string;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let userRole: string;
    try {
      const { payload } = await jwtVerify(token, secretKey);
      userRole = payload.role as string;
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { items, type } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items to import' }, { status: 400 });
    }

    let importedCount = 0;

    if (type === 'CHANNEL') {
      for (const item of items) {
        try {
          await runQuery(
            `INSERT INTO Channel (id, name, imageUrl, streamUrl, groupTitle, tvgLogo, enabled, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
            [
              crypto.randomUUID(),
              item.name,
              item.tvgLogo || '',
              item.url,
              item.groupTitle || null,
              item.tvgLogo || null
            ]
          );
          importedCount++;
        } catch (error) {
          console.error('Failed to import channel:', item.name, error);
        }
      }
    } else if (type === 'MOVIE') {
      for (const item of items) {
        try {
          await runQuery(
            `INSERT INTO Movie (id, title, category, description, imageUrl, externalUrl, isPublished, createdAt, updatedAt)
             VALUES (?, ?, ?, '', ?, ?, 1, datetime('now'), datetime('now'))`,
            [
              crypto.randomUUID(),
              item.name,
              item.groupTitle || 'Inne',
              item.tvgLogo || '',
              item.url
            ]
          );
          importedCount++;
        } catch (error) {
          console.error('Failed to import movie:', item.name, error);
        }
      }
    } else if (type === 'SERIES') {
      for (const item of items) {
        try {
          await runQuery(
            `INSERT INTO Series (id, title, category, description, imageUrl, isPublished, createdAt, updatedAt)
             VALUES (?, ?, '', ?, ?, 1, datetime('now'), datetime('now'))`,
            [
              crypto.randomUUID(),
              item.name,
              item.groupTitle || 'Inne',
              item.tvgLogo || ''
            ]
          );
          importedCount++;
        } catch (error) {
          console.error('Failed to import series:', item.name, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      message: `Successfully imported ${importedCount} items`
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Import failed'
    }, { status: 500 });
  }
}
