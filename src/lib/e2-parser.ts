/**
 * Parser plików Enigma2 bouquet do formatu IPTV/M3U
 * 
 * Obsługuje:
 * - Pliki userbouquet z rozszerzeniem .tv
 * - Dekodowanie URL-encoded stringów
 * - Usuwanie prefiksów proxy (http://127.0.0.1:8088/)
 * - Automatyczną kategoryzację kanałów
 */

export interface E2Channel {
  name: string;
  url: string;
  serviceRef: string;
  description?: string;
}

export interface E2Bouquet {
  name: string;
  filename: string;
  channels: E2Channel[];
  category: string;
  country?: string;
}

export interface E2ParseResult {
  bouquets: E2Bouquet[];
  stats: {
    totalBouquets: number;
    totalChannels: number;
    categories: Record<string, number>;
  };
}

/**
 * Dekoduje URL-encoded string i usuwa prefiksy proxy
 */
export function decodeServiceUrl(encoded: string): string {
  try {
    let decoded = decodeURIComponent(encoded);
    
    // Usuń prefiksy proxy Enigma2 (stosowane przez serviceapp/ytdl)
    const proxyPatterns = [
      /^https?:\/\/127\.0\.0\.1:\d+\//,
      /^https?:\/\/localhost:\d+\//,
    ];
    
    for (const pattern of proxyPatterns) {
      if (pattern.test(decoded)) {
        decoded = decoded.replace(pattern, '');
        // Dodaj protokół jeśli brakuje
        if (!decoded.startsWith('http://') && !decoded.startsWith('https://')) {
          decoded = 'https://' + decoded;
        }
        break;
      }
    }
    
    return decoded;
  } catch {
    return encoded;
  }
}

/**
 * Parsuje linię #SERVICE z pliku bouquet
 * Format: #SERVICE SERVICEREF:URL:NAME
 */
function parseServiceLine(line: string): { serviceRef: string; url: string; name: string } | null {
  // Pełny format E2: #SERVICE TYPE:FLAGS:STYPE:SID:TSID:ONID:NS:RES:RES:RES:URL:NAME
  const fullMatch = line.match(/^#SERVICE\s+([\dA-Fa-f:]+):([^:]+):(.+)$/);
  
  if (fullMatch) {
    return {
      serviceRef: fullMatch[1],
      url: fullMatch[2],
      name: fullMatch[3].trim()
    };
  }
  
  return null;
}

/**
 * Kategoryzuje bukiet na podstawie nazwy
 */
export function categorizeBouquet(bouquetName: string): { category: string; country?: string } {
  const nameLower = bouquetName.toLowerCase();
  
  // Wykryj kraj
  let country: string | undefined;
  const countryPatterns: Record<string, string[]> = {
    'PL': ['polska', 'polish', '_pl', 'pl_'],
    'UK': ['_uk', 'united kingdom', 'british'],
    'US': ['_us', 'usa', '_usa', 'united states'],
    'DE': ['_de', 'deutschland', 'german', 'dach'],
    'FR': ['_fr', 'france', 'french'],
    'ES': ['_es', 'spain', 'spanish'],
    'IT': ['_it', 'italy', 'italian'],
    'NL': ['_nl', 'netherlands', 'dutch'],
    'RO': ['_ro', 'romania', 'romanian'],
    'NO': ['_no', 'norway', 'norwegian'],
    'KR': ['_kr', 'korea', 'korean'],
    'CA': ['_ca', 'canada'],
    'IN': ['_in', 'india'],
    'AT': ['_at', 'austria'],
  };
  
  for (const [code, patterns] of Object.entries(countryPatterns)) {
    if (patterns.some(p => nameLower.includes(p))) {
      country = code;
      break;
    }
  }
  
  // Wykryj kategorię
  let category = 'Inne';
  
  if (nameLower.includes('sport')) category = 'Sport';
  else if (nameLower.includes('muzyk') || nameLower.includes('music')) category = 'Muzyka';
  else if (nameLower.includes('webcam') || nameLower.includes('kamer')) category = 'Kamery';
  else if (nameLower.includes('pluto')) category = 'Pluto TV';
  else if (nameLower.includes('samsung')) category = 'Samsung TV Plus';
  else if (nameLower.includes('rakuten')) category = 'Rakuten TV';
  else if (nameLower.includes('xxx') || nameLower.includes('adult')) category = 'XXX';
  else if (nameLower.includes('polska') || nameLower.includes('polish')) category = 'Polska';
  else if (nameLower.includes('swee')) category = 'Sweet TV';
  else if (nameLower.includes('lg_') || nameLower.includes('lgchannels')) category = 'LG Channels';
  else if (nameLower.includes('plex')) category = 'Plex';
  else if (nameLower.includes('wedo')) category = 'WEDO TV';
  else if (nameLower.includes('canal')) category = 'Canal+';
  else if (nameLower.includes('polsat')) category = 'Polsat Box';
  else if (nameLower.includes('tnk') || nameLower.includes('telewizja na kart')) category = 'Telewizja na Kartę';
  else if (nameLower.includes('radio')) category = 'Radio';
  
  return { category, country };
}

/**
 * Sprawdza czy URL to streaming URL
 */
function isStreamingUrl(url: string): boolean {
  return /^(https?|rtmp|rtsp):\/\//i.test(url);
}

/**
 * Parsuje zawartość pliku userbouquet
 */
export function parseBouquetContent(content: string, filename: string): E2Bouquet {
  const lines = content.split('\n');
  const channels: E2Channel[] = [];
  let bouquetName = 'Unknown';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Pomiń puste linie i komentarze
    if (!line || line.startsWith('#Created')) continue;
    
    // Nazwa bukietu
    if (line.startsWith('#NAME')) {
      bouquetName = line.replace('#NAME', '').trim();
      continue;
    }
    
    // Pomiń separatory sekcji (#SERVICE 1:64:...)
    if (/^#SERVICE\s+1:64:/.test(line)) continue;
    
    // Parsuj kanał
    if (line.startsWith('#SERVICE')) {
      const parsed = parseServiceLine(line);
      
      if (parsed && parsed.url && parsed.name) {
        const decodedUrl = decodeServiceUrl(parsed.url);
        
        // Tylko streaming URLs (http/https/rtmp/rtsp)
        if (isStreamingUrl(decodedUrl)) {
          const channel: E2Channel = {
            name: parsed.name,
            url: decodedUrl,
            serviceRef: parsed.serviceRef,
          };
          
          // Sprawdź czy następna linia to opis
          const nextLine = lines[i + 1]?.trim();
          if (nextLine?.startsWith('#DESCRIPTION')) {
            channel.description = nextLine.replace('#DESCRIPTION', '').trim();
            i++; // Pomiń linię opisu
          }
          
          channels.push(channel);
        }
      }
    }
  }
  
  const { category, country } = categorizeBouquet(bouquetName);
  
  return {
    name: bouquetName,
    filename: filename.split('/').pop() || filename,
    channels,
    category,
    country,
  };
}

/**
 * Parsuje plik ZIP z listami kanałów E2
 */
export async function parseE2ZipFile(zipBuffer: Buffer | ArrayBuffer): Promise<E2ParseResult> {
  // Dynamic import dla JSZip
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(zipBuffer);
  
  const bouquets: E2Bouquet[] = [];
  const stats = {
    totalBouquets: 0,
    totalChannels: 0,
    categories: {} as Record<string, number>,
  };
  
  // Iteruj przez pliki w ZIP
  for (const [filename, zipEntry] of Object.entries(zip.files)) {
    if (zipEntry.dir) continue;
    
    // Szukaj plików userbouquet z rozszerzeniem .tv
    if (!filename.includes('userbouquet') || !filename.endsWith('.tv')) continue;
    
    const content = await zipEntry.async('string');
    const bouquet = parseBouquetContent(content, filename);
    
    if (bouquet.channels.length > 0) {
      bouquets.push(bouquet);
      stats.totalBouquets++;
      stats.totalChannels += bouquet.channels.length;
      stats.categories[bouquet.category] = (stats.categories[bouquet.category] || 0) + bouquet.channels.length;
    }
  }
  
  return { bouquets, stats };
}

/**
 * Konwertuje bukiety na format M3U
 */
export function bouquetsToM3U(bouquets: E2Bouquet[], options?: {
  includeXXX?: boolean;
}): string {
  const lines: string[] = [
    '#EXTM3U url-tvg="https://raw.githubusercontent.com/iptv-org/epg/master/guide/pl/tvp.pl.guide.xml"',
    '',
  ];
  
  const includeXXX = options?.includeXXX ?? false;
  
  for (const bouquet of bouquets) {
    // Pomiń XXX jeśli wyłączone
    if (!includeXXX && bouquet.category === 'XXX') continue;
    
    for (const channel of bouquet.channels) {
      const escapedName = channel.name.replace(/"/g, '\\"').replace(/\n/g, ' ');
      const groupTitle = bouquet.category;
      
      lines.push(`#EXTINF:-1 tvg-name="${escapedName}" group-title="${groupTitle}",${escapedName}`);
      lines.push(channel.url);
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

/**
 * Konwertuje bukiet na dane dla bazy danych
 */
export function bouquetToDbChannels(bouquet: E2Bouquet, options?: {
  defaultStatus?: 'active' | 'inactive';
  categoryId?: number;
}): Array<{
  name: string;
  url: string;
  status: string;
  category_id?: number;
  country?: string;
}> {
  return bouquet.channels.map(channel => ({
    name: channel.name,
    url: channel.url,
    status: options?.defaultStatus || 'active',
    category_id: options?.categoryId,
    country: bouquet.country,
  }));
}
