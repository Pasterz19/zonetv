/**
 * API do importu kanałów z list Enigma2
 * 
 * GET /api/e2-import?action=sources - Lista dostępnych źródeł
 * GET /api/e2-import?action=preview&url=... - Podgląd listy kanałów
 * POST /api/e2-import - Upload pliku ZIP
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseE2ZipFile } from '@/lib/e2-parser';

// Dozwolone źródła download
const ALLOWED_SOURCES = [
  { id: 'bzyk83-hb', name: 'Bzyk83 - Hot Bird 13E', url: 'https://enigma2.hswg.pl/wp-content/uploads/2026/03/Lista-bzyk83-hb-13E-11.03.2026.zip' },
  { id: 'bzyk83-dual', name: 'Bzyk83 - Dual (13E + 19.2E)', url: 'https://enigma2.hswg.pl/wp-content/uploads/2026/02/Lista-bzyk83-dual-13E-192E-24.02.2026.zip' },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  // Lista dostępnych źródeł
  if (action === 'sources') {
    return NextResponse.json({
      sources: ALLOWED_SOURCES.map(s => ({
        id: s.id,
        name: s.name,
        url: s.url,
      }))
    });
  }
  
  // Podgląd listy kanałów z URL
  if (action === 'preview' && searchParams.get('url')) {
    const url = searchParams.get('url')!;
    
    try {
      // Pobierz plik
      const response = await fetch(url);
      if (!response.ok) {
        return NextResponse.json({ error: 'Nie udało się pobrać pliku' }, { status: 400 });
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Parsuj
      const result = await parseE2ZipFile(buffer);
      
      return NextResponse.json({
        success: true,
        source: url.split('/').pop(),
        totalBouquets: result.stats.totalBouquets,
        totalChannels: result.stats.totalChannels,
        categories: result.stats.categories,
        bouquets: result.bouquets.map(b => ({
          name: b.name,
          filename: b.filename,
          category: b.category,
          country: b.country,
          channelCount: b.channels.length,
          sampleChannels: b.channels.slice(0, 3).map(c => ({
            name: c.name,
            url: c.url.substring(0, 80) + '...',
          })),
        })),
      });
      
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
  return NextResponse.json({ error: 'Nieznana akcja' }, { status: 400 });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const sourceUrl = formData.get('sourceUrl') as string;
    
    let zipBuffer: Buffer;
    
    if (sourceUrl) {
      // Pobierz z URL
      const response = await fetch(sourceUrl);
      if (!response.ok) {
        return NextResponse.json({ error: 'Nie udało się pobrać pliku' }, { status: 400 });
      }
      const arrayBuffer = await response.arrayBuffer();
      zipBuffer = Buffer.from(arrayBuffer);
    } else if (file) {
      // Upload pliku
      const arrayBuffer = await file.arrayBuffer();
      zipBuffer = Buffer.from(arrayBuffer);
    } else {
      return NextResponse.json({ error: 'Brak pliku lub URL' }, { status: 400 });
    }
    
    // Parsuj
    const result = await parseE2ZipFile(zipBuffer);
    
    return NextResponse.json({
      success: true,
      stats: result.stats,
      bouquets: result.bouquets.map(b => ({
        name: b.name,
        filename: b.filename,
        category: b.category,
        country: b.country,
        channelCount: b.channels.length,
        channels: b.channels,
      })),
    });
    
  } catch (error: any) {
    console.error('E2 import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
