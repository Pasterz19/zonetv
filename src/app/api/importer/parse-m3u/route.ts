import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SESSION_COOKIE_NAME = "zonetv_session";
const secretKey = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-secret-zonetv-change-me",
);

interface M3UEntry {
  name: string;
  url: string;
  groupTitle?: string;
  tvgLogo?: string;
  tvgId?: string;
}

// Polish channel detection patterns
const polishPatterns = [
  'polsat', 'tvn', 'tvp', 'telewizja', 'polska', 'polish', 'polski',
  'kino', 'film', 'sport', 'news', 'discovery', 'national geographic',
  'animal planet', 'history', 'bbc', 'cnbc', 'euronews', 'eska',
  'rmf', 'zet', 'radio', 'info', 'lokalne', 'regionalna', 'hbo',
  'axn', 'fox', 'comedy', 'nova', 'polska'
];

function parseM3U(content: string): M3UEntry[] {
  const lines = content.split('\n');
  const entries: M3UEntry[] = [];
  let currentEntry: Partial<M3UEntry> = {};

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('#EXTINF:')) {
      const nameMatch = trimmed.match(/,(.+)$/);
      const groupMatch = trimmed.match(/group-title="([^"]+)"/);
      const logoMatch = trimmed.match(/tvg-logo="([^"]+)"/);
      const idMatch = trimmed.match(/tvg-id="([^"]+)"/);

      currentEntry = {
        name: nameMatch ? nameMatch[1].trim() : 'Unknown',
        groupTitle: groupMatch ? groupMatch[1] : undefined,
        tvgLogo: logoMatch ? logoMatch[1] : undefined,
        tvgId: idMatch ? idMatch[1] : undefined,
      };
    } else if (trimmed && !trimmed.startsWith('#') && currentEntry.name) {
      currentEntry.url = trimmed;
      entries.push(currentEntry as M3UEntry);
      currentEntry = {};
    }
  }

  return entries;
}

function isPolishChannel(entry: M3UEntry): boolean {
  const searchText = `${entry.name} ${entry.groupTitle || ''}`.toLowerCase();
  return polishPatterns.some(pattern => searchText.includes(pattern));
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      await jwtVerify(token, secretKey);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { url, filterPolish } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch: ${response.status}` }, { status: 400 });
    }

    const content = await response.text();
    let entries = parseM3U(content);

    if (filterPolish) {
      entries = entries.filter(isPolishChannel);
    }

    return NextResponse.json({
      success: true,
      entries,
      totalFound: entries.length
    });
  } catch (error) {
    console.error('M3U parse error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to parse M3U'
    }, { status: 500 });
  }
}
