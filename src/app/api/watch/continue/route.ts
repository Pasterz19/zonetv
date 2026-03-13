import { NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma/client';

const db = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    // Fetch top 10 most recently updated watch progress items
    const history = await db.watchProgress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      include: {
        movie: true,
        series: true,
        episode: {
          include: {
            season: true
          }
        }
      }
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Continue watching fetch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}