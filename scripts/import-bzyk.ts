import { PrismaClient } from '../src/generated/prisma'; // POPRAWIONA ŚCIEŻKA
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

async function importChannels() {
  console.log('🚀 Rozpoczynam import kanałów...');

  // URL do listy kanałów na stronie Bzyk
  const LIST_URL = 'https://enigma2.hswg.pl/listy-kanalow-e2-by-bzyk83/';

  try {
    // 1. Pobieramy stronę główną, aby znaleźć link do pliku
    console.log(`📥 Pobieranie listy plików z: ${LIST_URL}`);
    const indexRes = await fetch(LIST_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const indexHtml = await indexRes.text();
    const $ = cheerio.load(indexHtml);

    // Szukamy linku do pliku .tv (np. pakiet Polsat lub podobny)
    // Bierzemy pierwszy znaleziony link do pliku .tv
    const fileLink = $('a[href$=".tv"]').first();
    const fileName = fileLink.text();
    const fileHref = fileLink.attr('href');

    if (!fileHref) {
        console.error('❌ Nie znaleziono żadnych plików .tv na stronie.');
        return;
    }

    // Budujemy pełny URL do pliku
    const fileUrl = new URL(fileHref, LIST_URL).href;
    console.log(`📂 Znaleziono plik: ${fileName} -> Pobieranie...`);

    // 2. Pobieramy treść pliku z kanałami
    const fileRes = await fetch(fileUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const content = await fileRes.text();
    const lines = content.split('\n');

    console.log(`📺 Znaleziono ${lines.length} linii w pliku. Przetwarzanie...`);

    let addedCount = 0;

    // 3. Parsowanie formatu Enigma2
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Szukamy linii z usługą (kanałem)
        if (line.startsWith('#SERVICE')) {
            const parts = line.split(':');
            // Sprawdzamy czy to kanał TV (zazwyczaj 1:0:1)
            if (parts.length > 10 && parts[1] === '0' && parts[2] === '1') {
                
                // Nazwa kanału jest zazwyczaj w następnej linii (#DESCRIPTION)
                let name = `Channel_${addedCount}`;
                const nextLine = lines[i+1]?.trim();
                
                if (nextLine && nextLine.startsWith('#DESCRIPTION')) {
                    name = nextLine.replace('#DESCRIPTION: ', '').trim();
                }

                // Tworzymy dane do bazy
                // UWAGA: To są dane satelitarne. URL to tylko referencja.
                const channelData = {
                    name: name,
                    url: `enigma2_ref_${parts.join('_')}`, // Placeholder
                    logo: `https://via.placeholder.com/150?text=${encodeURIComponent(name)}`, 
                    category: fileName.replace('.tv', ''), // Używamy nazwy pliku jako kategorii
                    epgId: name.toLowerCase().replace(/\s/g, '-'),
                    isActive: true,
                };

                try {
                    await prisma.channel.upsert({
                        where: { name: name },
                        update: channelData,
                        create: channelData,
                    });
                    addedCount++;
                } catch (err) {
                    // Ignorujemy błędy pojedynczych wpisów
                }
            }
        }
    }

    console.log(`✅ Sukces! Dodano/Zaktualizowano: ${addedCount} kanałów do bazy danych.`);

  } catch (error) {
    console.error('❌ Błąd podczas importu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importChannels();
