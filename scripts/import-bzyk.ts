import { PrismaClient } from '@prisma/client';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

const TARGET_URL = 'https://enigma2.hswg.pl/listy-kanalow-e2-by-bzyk83/';

async function importChannels() {
  console.log(`Rozpoczynam pobieranie listy kanałów z: ${TARGET_URL}`);

  try {
    // Ważne: Ustawiamy nagłówki, aby udawać przeglądarkę, inaczej serwer może zablokować bota
    const response = await fetch(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });

    if (!response.ok) {
      throw new Error(`Błąd HTTP: ${response.status}`);
    }

    const html = await response.text();
    console.log('Pobrano treść strony, rozpoczynam parsowanie...');

    const $ = cheerio.load(html);
    
    // Tutaj musimy znaleźć odpowiedni selektor na stronie.
    // Strona z listami kanałów zazwyczaj ma linki bezpośrednie do plików .tv lub listy <table>/<ul>.
    // Poniższy selektor szuka linków do plików z listami (często .tv lub .zip)
    
    let channelsAdded = 0;
    const links = $('a[href$=".tv"], a[href$=".zip"]'); // Szuka linków kończących się na .tv lub .zip

    console.log(`Znaleziono ${links.length} potencjalnych źródeł list.`);

    // UWAGA: To jest parser listy plików. 
    // Jeśli potrzebujesz sparsować SAMĄ listę kanałów z pliku, musimy pobrać ten plik.
    // Przyjmuję strategię: Pobieramy linki do list, a następnie (opcjonalnie) je otwieramy.
    // Na potrzeby dema, zapiszmy te listy jako "Pakiety" w bazie, jeśli masz taki model, lub po prostu wyświetlmy.

    // Jeśli Twoim celem jest wgranie kanałów do modelu 'Channel', musimy pobrać treść pliku, np. userbouquet.
    // To wymaga drugiego kroku (pobranie pliku, parsowanie linii #SERVICE).

    // NA RAZIE: Wyświetlmy co znaleźliśmy, żeby potwierdzić, że działa:
    
    links.each((index, element) => {
      const href = $(element).attr('href');
      const title = $(element).text().trim();
      console.log(`- Znaleziono: ${title} (${href})`);
      channelsAdded++;
    });

    // --- WŁAŚCIWE PARSOWANIE KANAŁÓW (SYMULACJA) ---
    // Strona hswg udostępnia pliki. Aby pobrać konkretne kanały, musimy pobrać jeden z tych plików.
    // Przykład pobrania pierwszego pliku z listy i sparsowania kanałów:
    
    /* 
    const firstFileUrl = new URL(links.first().attr('href')!, TARGET_URL).href;
    console.log(`Pobieranie pliku listy: ${firstFileUrl}`);
    const fileRes = await fetch(firstFileUrl);
    const fileContent = await fileRes.text();
    
    // Parsowanie formatu Enigma2 (#SERVICE: 1:0:1:...)
    const lines = fileContent.split('\n');
    for (const line of lines) {
        if (line.startsWith('#SERVICE')) {
            // Logika wyciągania nazwy i ID kanału
            // await prisma.channel.create({ ... })
        }
    }
    */

    console.log(`\nZakończono. Znaleziono ${channelsAdded} elementów na stronie.`);
    
  } catch (error) {
    console.error('Wystąpił błąd podczas importu:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importChannels();
