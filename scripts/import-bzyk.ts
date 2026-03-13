import { PrismaClient } from '../src/generated/prisma'; // POPRAWIONA ŚCIEŻKA (zgodna z Twoim logiem generate)
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function importChannels() {
  console.log('🚀 Rozpoczynam import kanałów z listy Bzyk83...');

  // Bezpośredni link do pliku z listą kanałów (Polsat)
  const FILE_URL = 'https://enigma2.hswg.pl/listy-kanalow-e2-by-bzyk83/userbouquet.dvb-s.bzyk83__polsat.tv';

  try {
    console.log(`📥 Pobieranie pliku: ${FILE_URL}`);
    
    const response = await fetch(FILE_URL, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    });

    if (!response.ok) {
        throw new Error(`Błąd pobierania: ${response.status}`);
    }

    const content = await response.text();
    const lines = content.split('\n');

    console.log(`📺 Plik pobrany. Przetwarzanie ${lines.length} linii...`);

    let addedCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line.startsWith('#SERVICE')) {
            const parts = line.split(':');
            
            // Sprawdzamy czy to kanał TV (1:0:1)
            if (parts.length > 1 && parts[1] === '0' && parts[2] === '1') {
                
                // Pobieramy nazwę z kolejnej linii
                let name = `Channel_${i}`;
                const nextLine = lines[i + 1]?.trim();
                
                if (nextLine && nextLine.startsWith('#DESCRIPTION')) {
                    name = nextLine.replace('#DESCRIPTION: ', '').trim();
                }

                try {
                    await prisma.channel.upsert({
                        where: { name: name },
                        update: {
                            url: `enigma_ref:${line.split('#SERVICE: ')[1]}`,
                            category: 'Polsat Bzyk Import',
                            isActive: true,
                        },
                        create: {
                            name: name,
                            url: `enigma_ref:${line.split('#SERVICE: ')[1]}`,
                            logo: `https://logo.example.com/${name.toLowerCase().replace(/\s/g, '')}.png`,
                            category: 'Polsat Bzyk Import',
                            epgId: name.toLowerCase().replace(/\s/g, '-'),
                            isActive: true,
                        },
                    });
                    addedCount++;
                } catch (err) {
                    // Ignorujemy błędy pojedynczych kanałów
                }
            }
        }
    }

    console.log(`✅ SUKCES! Zaktualizowano/Dodano ${addedCount} kanałów do bazy.`);

  } catch (error) {
    console.error('❌ Błąd:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importChannels();
