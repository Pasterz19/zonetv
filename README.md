# Konwerter Enigma2 → IPTV/M3U dla ZONEtv

## 📦 Zawartość

```
src/
├── lib/
│   └── e2-parser.ts              # Parser plików Enigma2
├── app/
│   └── api/
│       └── e2-import/
│           ├── route.ts           # API do podglądu/listy źródeł
│           ├── import/
│           │   └── route.ts       # API do importu do bazy
│           └── export/
│               └── route.ts       # API do eksportu M3U
└── components/
    └── admin/
        └── e2-import-tab.tsx      # Komponent UI dla panelu admina
```

## 🚀 Instalacja

### 1. Skopiuj pliki

Skopiuj folder `src/` do głównego katalogu projektu ZONEtv:

```bash
# Jeśli ZONEtv jest w ~/projekty/zonetv/
cp -r src/* ~/projekty/zonetv/src/
```

### 2. Zainstaluj zależności

```bash
cd ~/projekty/zonetv/
npm install jszip
```

### 3. Dodaj zakładkę w panelu admina

W pliku `src/app/admin/settings/page.tsx` dodaj nową zakładkę:

```tsx
import { E2ImportTab } from '@/components/admin/e2-import-tab';

// W sekcji tabs dodaj:
<TabsContent value="e2-import">
  <E2ImportTab />
</TabsContent>

// W sekcji TabList dodaj:
<TabsTrigger value="e2-import">
  📥 Import E2
</TabsTrigger>
```

### 4. Utwórz tabelę kategorii (jeśli nie istnieje)

```sql
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'channel',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 📺 Użycie

### Z poziomu panelu admina:

1. Przejdź do **Panel Admina → Ustawienia → Import E2**
2. Wybierz źródło z listy (np. Bzyk83 - Hot Bird 13E)
3. Kliknij **Podgląd** aby zobaczyć dostępne bukiety
4. Zaznacz bukiety do importu
5. Kliknij **Importuj**

### API Endpoints:

| Endpoint | Metoda | Opis |
|----------|--------|------|
| `/api/e2-import?action=sources` | GET | Lista dostępnych źródeł |
| `/api/e2-import?action=preview&url=...` | GET | Podgląd listy kanałów |
| `/api/e2-import` | POST | Upload pliku ZIP |
| `/api/e2-import/import` | POST | Import do bazy danych |
| `/api/e2-import/export` | GET | Eksport do M3U |

### Eksport do M3U:

```bash
# Wszystkie aktywne kanały
curl http://localhost:3000/api/e2-import/export > channels.m3u

# Tylko kategoria Sport
curl "http://localhost:3000/api/e2-import/export?category=Sport" > sport.m3u

# Format JSON
curl "http://localhost:3000/api/e2-import/export?format=json" > channels.json
```

## 📊 Kategorie automatyczne

Konwerter automatycznie kategoryzuje kanały na podstawie nazwy bukietu:

| Kategoria | Słowa kluczowe |
|-----------|---------------|
| Sport | `sport` |
| Muzyka | `muzyk`, `music` |
| Kamery | `webcam`, `kamer` |
| Pluto TV | `pluto` |
| Samsung TV Plus | `samsung` |
| Rakuten TV | `rakuten` |
| Polska | `polska`, `polish` |
| Sweet TV | `swee` |
| LG Channels | `lg_` |
| Plex | `plex` |
| Canal+ | `canal` |
| Polsat Box | `polsat` |
| XXX | `xxx`, `adult` |

## 🔧 Format danych

### Wejście (Enigma2 bouquet):
```
#NAME IPTV Polska
#SERVICE 4097:0:1:SID:TSID:ONID:NS:http%3a//example.com/stream.m3u8:TVP 1 HD
#DESCRIPTION TVP 1 HD
```

### Wyjście (M3U):
```m3u
#EXTM3U
#EXTINF:-1 tvg-name="TVP 1 HD" group-title="Polska",TVP 1 HD
http://example.com/stream.m3u8
```

## ✅ Testowane źródła

- **Bzyk83** - Hot Bird 13E (9,278 kanałów)
- **Bzyk83** - Dual 13E + 19.2E
- **Bzyk83** - 5x1 Multi-satellite

## 📝 Uwagi

1. **Prefiks proxy**: Kanały z `http://127.0.0.1:8088/` są automatycznie konwertowane
2. **Duplikaty**: Opcja "Pomiń istniejące" sprawdza po nazwie i URL
3. **Kategorie**: Tworzone automatycznie na podstawie nazw bukietów
4. **Kraje**: Wykrywane automatycznie (PL, UK, US, DE, FR, ES, IT, NL, RO, NO)
