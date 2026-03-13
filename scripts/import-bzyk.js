const path = require('path');
// Ładujemy Prisma bezpośrednio z folderu wygenerowanego w src
const { PrismaClient } = require(path.join(process.cwd(), 'src', 'generated', 'prisma'));
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function importChannels() {
  console.log('🚀 Rozpoczynam import kanałów...');

  const FILE_URL = 'https://enigma2.hswg.pl/listy-kanalow-e2-by-bzyk83/userbouquet.dvb-s.bzyk83__polsat.tv';

  try {
    console.log(`📥 Pobieranie: ${FILE_URL}`);
    
    const response = await fetch(FILE_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });

    if (!response.ok) throw new Error(`Błąd HTTP: ${response.status}`);

    const content = await response.text();
    const lines = content.split('\n');
    console.log(`📺 Znaleziono ${lines.length} linii. Przetwarzanie...`);

    let addedCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#SERVICE')) {
            const parts = line.split(':');
            if (parts.length > 1 && parts[1] === '0' && parts[2] === '1') {
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
                            category: 'Import Bzyk'
                        },
                        create: {
                            name: name,
                            url: `enigma_ref:${line.split('#SERVICE: ')[1]}`,
                            logo: `https://via.placeholder.com/150?text=${encodeURIComponent(name)}`,
                            category: 'Import Bzyk',
                            epgId: name.toLowerCase().replace(/\s/g, '-'),
                            isActive: true,
                        },
                    });
                    addedCount++;
                } catch (e) { 
                    // Ignoruj błędy pojedynczych kanałów
                }
            }
        }
    }
    console.log(`✅ SUKCES! Dodano/Zaktualizowano: ${addedCount} kanałów.`);
  } catch (error) {
    console.error('❌ Błąd:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importChannels();
