/**
 * API do importu kanałów do bazy danych ZONEtv
 * POST /api/e2-import/import
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseE2ZipFile, bouquetToDbChannels, categorizeBouquet } from '@/lib/e2-parser';
import { query, executeSql } from '@/server/db';
import { auth } from '@/lib/auth';

interface ImportRequest {
  sourceUrl?: string;
  selectedBouquets?: string[];
  defaultStatus?: 'active' | 'inactive';
  skipExisting?: boolean;
  createCategories?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // Sprawdź autoryzację
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sprawdź czy użytkownik jest adminem
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body: ImportRequest = await request.json();
    const { 
      sourceUrl,
      selectedBouquets,
      defaultStatus = 'active',
      skipExisting = true,
      createCategories = true 
    } = body;
    
    if (!sourceUrl) {
      return NextResponse.json({ error: 'Brak URL źródła' }, { status: 400 });
    }
    
    // Pobierz i parsuj plik
    const response = await fetch(sourceUrl);
    if (!response.ok) {
      return NextResponse.json({ error: 'Nie udało się pobrać pliku' }, { status: 400 });
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const zipBuffer = Buffer.from(arrayBuffer);
    const result = await parseE2ZipFile(zipBuffer);
    
    // Filtruj wybrane bukiety
    const filteredBouquets = selectedBouquets?.length
      ? result.bouquets.filter(b => selectedBouquets.includes(b.name))
      : result.bouquets;
    
    // Mapa kategorii (groupTitle -> istnieje w Channel)
    const categoryMap = new Map<string, boolean>();

    if (createCategories) {
      // Znajdź wszystkie unikalne kategorie (groupTitle)
      const categories = new Set(filteredBouquets.map(b => b.category));

      // Sprawdź które kategorie już istnieją w Channel
      for (const categoryName of categories) {
        const existing = await query<{ groupTitle: string }[]>(
          `SELECT DISTINCT groupTitle FROM Channel WHERE groupTitle = ? LIMIT 1`,
          [categoryName]
        );
        categoryMap.set(categoryName, existing.length > 0);
      }
    }
    
    const stats = {
      imported: 0,
      skipped: 0,
      errors: 0,
      categories: Array.from(categoryMap.keys()),
    };

    const isEnabled = defaultStatus === 'active' ? 1 : 0;

    for (const bouquet of filteredBouquets) {
      for (const channel of bouquet.channels) {
        try {
          // Sprawdź czy kanał już istnieje (po streamUrl)
          if (skipExisting) {
            const existing = await query<{ id: string }[]>(
              `SELECT id FROM Channel WHERE streamUrl = ? LIMIT 1`,
              [channel.url]
            );

            if (existing.length > 0) {
              stats.skipped++;
              continue;
            }
          }

          // Dodaj kanał używając modelu Channel
          await executeSql(
            `INSERT INTO Channel (
              id, name, streamUrl, imageUrl, groupTitle,
              tvgId, tvgName, tvgLogo, enabled, createdAt, updatedAt
            )
            VALUES (
              lower(hex(randomblob(16))),
              ?, ?, '', ?, '', '', '', ?, datetime('now'), datetime('now')
            )`,
            [
              channel.name,
              channel.url,
              bouquet.category,
              isEnabled
            ]
          );

          stats.imported++;

        } catch {
          stats.errors++;
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Zaimportowano ${stats.imported} kanałów`,
      stats,
    });
    
  } catch (error) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
