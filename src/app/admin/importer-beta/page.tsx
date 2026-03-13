'use client';

import { useRef, useState } from 'react';
import {
  UploadCloud,
  Film,
  MonitorPlay,
  Radio,
  List,
  Check,
  Loader2,
  Search,
  AlertCircle,
  Zap,
  Server,
  PlayCircle,
  XCircle,
  CheckCircle2,
  HardDrive,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  fetchM3UFromXtream,
  importContent,
  fetchM3U,
  importEpgFromXtream,
  importEpgFromUrl,
} from './actions';
import { M3UEntry, parseM3U } from '@/lib/m3u-parser'; // Ensure parseM3U is imported

export default function ImporterBetaPage() {
  const [items, setItems] = useState<M3UEntry[]>([]);
  const [allItems, setAllItems] = useState<M3UEntry[]>([]);
  const [displayLimit, setDisplayLimit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importType, setImportType] = useState<'CHANNEL' | 'MOVIE' | 'SERIES'>('CHANNEL');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [activeTab, setActiveTab] = useState('m3u');

  // Xtream Form State
  const [xtreamHost, setXtreamHost] = useState('');
  const [xtreamUser, setXtreamUser] = useState('');
  const [xtreamPass, setXtreamPass] = useState('');
  const [xtreamOutput, setXtreamOutput] = useState<'ts' | 'm3u8'>('ts');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [polishOnly, setPolishOnly] = useState(true);
  const [filterStats, setFilterStats] = useState({ total: 0, kept: 0 });
  const [downloadBytes, setDownloadBytes] = useState(0);
  const [downloadStartedAt, setDownloadStartedAt] = useState<number | null>(null);
  const [downloadRateBps, setDownloadRateBps] = useState(0);
  const downloadAbortRef = useRef<AbortController | null>(null);
  const stopRequestedRef = useRef(false);

  // M3U Form State
  const [m3uUrl, setM3uUrl] = useState('');
  const [epgUrl, setEpgUrl] = useState('');
  const [error, setError] = useState('');

  // Bunny.net / Storage Form State
  const [bunnyUrl, setBunnyUrl] = useState('');
  const [bunnyAccessKey, setBunnyAccessKey] = useState(''); // Optional, for private files

  // M3U File Upload State
  const [m3uFile, setM3uFile] = useState<File | null>(null);
  // EPG File Upload State
  const [epgFile, setEpgFile] = useState<File | null>(null);

  const handleFileUpload = async (e: React.FormEvent) => {
    if (!m3uFile) {
      setError('Wybierz plik M3U');
      return;
    }

    setLoading(true);
    setConnectionStatus('Parsowanie pliku M3U...');
    setError('');

    try {
      const text = await m3uFile.text();
      const parsed = parseM3U(text);
      const filtered = polishOnly ? parsed.filter(isPolishChannel) : parsed;
      setAllItems(filtered);
      setItems(filtered.slice(0, displayLimit));
      setFilterStats({ total: parsed.length, kept: filtered.length });
      setConnectionStatus(`Załadowano ${filtered.length} kanałów z pliku`);
    } catch (err) {
      setError('Błąd parsowania pliku: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleEpgFileUpload = async () => {
    if (!epgFile) {
      setError('Wybierz plik EPG (XMLTV)');
      return;
    }

    setLoading(true);
    setConnectionStatus('Importowanie EPG z pliku...');
    setError('');

    try {
      const text = await epgFile.text();
      const res = await importEpgFromUrl('data:text/xml;base64,' + btoa(unescape(encodeURIComponent(text))));
      if ('success' in res && res.success) {
        alert(`Zaimportowano ${res.count} programów EPG z pliku!`);
      } else if ('error' in res) {
        setError(res.error || 'Błąd importu EPG z pliku');
      }
    } catch (err) {
      setError('Błąd: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleM3UOrFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (m3uFile) {
      await handleFileUpload(e);
    } else {
      await handleM3USubmit(e);
    }
  };

  const handleBunnySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bunnyUrl) {
      setError('Podaj URL do pliku');
      return;
    }

    // Check extension
    if (bunnyUrl.endsWith('.ts')) {
      setItems([
        {
          name: 'Imported TS Stream',
          groupTitle: 'Imported',
          url: bunnyUrl,
          tvgId: '',
          tvgName: '',
          tvgLogo: '',
          raw: '',
        },
      ]);
      return;
    }

    await downloadWithProgress(bunnyUrl);
  };

  const handleM3USubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!m3uUrl) {
      setError('Podaj URL');
      return;
    }
    await downloadWithProgress(m3uUrl);
  };

  const handleEpgUrlImport = async () => {
    if (!epgUrl) {
      setError('Podaj URL EPG');
      return;
    }

    setLoading(true);
    setConnectionStatus('Pobieranie EPG...');

    try {
      const res = await importEpgFromUrl(epgUrl);
      if ('success' in res && res.success) {
        alert(`Zaimportowano ${res.count} programów EPG!`);
      } else if ('error' in res) {
        setError(res.error || 'Błąd importu EPG');
      }
    } catch (err) {
      setError('Błąd: ' + (err as Error).message);
    }

    setLoading(false);
    setConnectionStatus('');
  };

  // M3U parser helper locally to avoid importing from deleted file if not present
  // But wait, user said "M3U parser is in src/lib/m3u-parser.ts", which IS present.
  // We need to import it.

  const stopDownload = () => {
    stopRequestedRef.current = true;
    const ctrl = downloadAbortRef.current;
    if (ctrl) {
      try {
        ctrl.abort();
      } catch {
        // ignore
      }
    }
    downloadAbortRef.current = null;
    setConnectionStatus('Przerwano.');
  };

  const isPolishChannel = (entry: Pick<M3UEntry, 'name' | 'groupTitle' | 'tvgName'>) => {
    const name = entry.name?.toLowerCase() ?? '';
    const group = entry.groupTitle?.toLowerCase() ?? '';
    const tvgName = entry.tvgName?.toLowerCase() ?? '';
    const primary = group || name;
    const secondary = `${name} ${tvgName}`;

    const shortTokenRegex = /(^|[^a-z0-9])(pl|pol)([^a-z0-9]|$)/i;
    if (shortTokenRegex.test(primary) || shortTokenRegex.test(secondary)) return true;

    if (primary.includes('polska') || primary.includes('polish') || primary.includes('poland')) return true;

    if (/(^|\s)(tvp\s?1|tvp\s?2|tvp\s?info|polsat|tvn|tvn24|ttv)(\s|$)/i.test(secondary)) return true;

    return false;
  };

  const formatBytes = (bytes: number) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let v = bytes;
    let i = 0;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  };

  const downloadWithProgress = async (url: string) => {
    stopRequestedRef.current = false;
    setLoading(true);
    setConnectionStatus('Łączenie...');
    setDownloadProgress(0);
    setError('');
    setAllItems([]); // Reset list
    setDisplayLimit(2000); // Start with 2000
    setFilterStats({ total: 0, kept: 0 });
    setDownloadBytes(0);
    setDownloadRateBps(0);
    const start = performance.now();
    setDownloadStartedAt(start);

    const abortController = new AbortController();
    downloadAbortRef.current = abortController;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'VLC/3.0.0 LibVLC/3.0.0',
          'Referer': '',
        },
        signal: abortController.signal,
      });

      if (!response.ok) {
        const details = await response.text().catch(() => '');
        throw new Error(`Error: ${response.status}${details ? `\n${details}` : ''}`);
      }

      // Mark as started so the progress/status panel is visible
      setDownloadProgress(1);

      setConnectionStatus('Pobieranie danych...');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      // Streaming M3U Parser with buffer
      const decoder = new TextDecoder();
      let pendingData = '';
      let currentEntry: Partial<M3UEntry> = {};
      let buffer: M3UEntry[] = [];
      const FLUSH_THRESHOLD = 500; // Update state every 500 items to avoid UI freeze

      let total = 0;
      let kept = 0;

      while (true) {
        if (stopRequestedRef.current) {
          throw new DOMException('Aborted', 'AbortError');
        }
        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          const bytes = value.byteLength;
          setDownloadBytes((prev) => {
            const next = prev + bytes;
            const elapsedSec = Math.max((performance.now() - start) / 1000, 0.001);
            setDownloadRateBps(next / elapsedSec);
            return next;
          });
        }

        const chunk = decoder.decode(value, { stream: true });
        pendingData += chunk;

        let startIndex = 0;
        let endIndex = 0;

        while ((endIndex = pendingData.indexOf('\n', startIndex)) !== -1) {
          const line = pendingData.substring(startIndex, endIndex).trim();
          startIndex = endIndex + 1;

          if (!line) continue;

          if (line.startsWith('#EXTINF:')) {
            const getAttr = (key: string) => {
              const keyStr = key + '="';
              const idx = line.indexOf(keyStr);
              if (idx === -1) return '';
              const endIdx = line.indexOf('"', idx + keyStr.length);
              if (endIdx === -1) return '';
              return line.substring(idx + keyStr.length, endIdx);
            };

            const lastComma = line.lastIndexOf(',');
            const name = lastComma !== -1 ? line.substring(lastComma + 1).trim() : 'Unknown';

            currentEntry = {
              tvgId: getAttr('tvg-id'),
              tvgName: getAttr('tvg-name'),
              tvgLogo: getAttr('tvg-logo'),
              groupTitle: getAttr('group-title') || 'Uncategorized',
              name: name,
              raw: line,
            };
          } else if (line.startsWith('http') || line.startsWith('rtmp') || line.startsWith('mms')) {
            if (currentEntry.name) {
              const newEntry: M3UEntry = {
                tvgId: currentEntry.tvgId || '',
                tvgName: currentEntry.tvgName || '',
                tvgLogo: currentEntry.tvgLogo || '',
                groupTitle: currentEntry.groupTitle || 'Uncategorized',
                name: currentEntry.name || 'Unknown',
                url: line,
                raw: currentEntry.raw || '',
              };

              total++;
              const shouldKeep = !polishOnly || isPolishChannel(newEntry);
              if (shouldKeep) {
                kept++;
                buffer.push(newEntry);
              }

              currentEntry = {};
            }
          }
        }

        // Flush buffer to state if threshold reached
        if (buffer.length >= FLUSH_THRESHOLD) {
          const itemsToAdd = [...buffer];
          buffer = []; // Clear local buffer

          // Use functional update to append
          setAllItems((prev) => [...prev, ...itemsToAdd]);
          setFilterStats({ total, kept });
          setDownloadProgress((p) => p + 1);
          // Yield to main thread to allow UI render
          await new Promise((resolve) => setTimeout(resolve, 0));
        }

        pendingData = pendingData.substring(startIndex);
      }

      // Flush remaining items
      if (buffer.length > 0) {
        setAllItems((prev) => [...prev, ...buffer]);
      }

      setFilterStats({ total, kept });

      setConnectionStatus('Zakończono pobieranie.');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Expected when user clicks STOP
        setError('Pobieranie przerwane.');
      } else {
        console.error(err);
        setError('Błąd pobierania: ' + (err as Error).message);
      }
    } finally {
      setLoading(false);
      setConnectionStatus('');
      downloadAbortRef.current = null;
      setDownloadProgress(0);
      setDownloadStartedAt(null);
    }
  };

  const handleXtreamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!xtreamHost || !xtreamUser || !xtreamPass) {
      setError('Wypełnij wszystkie pola');
      return;
    }

    // Construct proper host URL if protocol missing
    let host = xtreamHost;
    if (!host.startsWith('http')) host = `http://${host}`;

    const m3uLink = `${host}/get.php?username=${xtreamUser}&password=${xtreamPass}&type=m3u_plus&output=${xtreamOutput}`;

    // Use client-side download with progress
    await downloadWithProgress(m3uLink);
  };

  const handleEpgImport = async () => {
    if (!xtreamHost || !xtreamUser || !xtreamPass) {
      setError('Wypełnij wszystkie pola');
      return;
    }

    setLoading(true);
    setConnectionStatus('Pobieranie EPG...');

    try {
      const res = await importEpgFromXtream(xtreamHost, xtreamUser, xtreamPass);
      if (res.success) {
        alert(`Zaimportowano ${res.count} programów EPG!`);
      } else {
        setError(res.error || 'Błąd importu EPG');
      }
    } catch (err) {
      setError('Błąd: ' + (err as Error).message);
    }

    setLoading(false);
    setConnectionStatus('');
  };

  const handleSelectAll = () => {
    if (selected.size === filteredItems.length) {
      setSelected(new Set());
    } else {
      const newSelected = new Set(filteredItems.map((i) => i.url));
      setSelected(newSelected);
    }
  };

  const handleImport = async () => {
    if (selected.size === 0) return;
    setLoading(true);

    stopRequestedRef.current = false;

    // Find actual objects for selected URLs from the FULL list
    const toImport = allItems.filter((i) => selected.has(i.url));

    // Chunk import to avoid payload limits
    const CHUNK_SIZE = 200;
    let successCount = 0;
    let failCount = 0;

    const chunks = [];
    for (let i = 0; i < toImport.length; i += CHUNK_SIZE) {
      chunks.push(toImport.slice(i, i + CHUNK_SIZE));
    }

    for (const chunk of chunks) {
      if (stopRequestedRef.current) {
        setLoading(false);
        setConnectionStatus('');
        alert(`Import przerwany. Zaimportowano: ${successCount} elementów.`);
        return;
      }
      const res = await importContent(chunk, importType);
      if (res.success && res.count) {
        successCount += res.count;
      } else {
        failCount += chunk.length; // Assume whole chunk failed or partially
      }
      // Update progress if we want?
    }

    if (successCount > 0) {
      alert(
        `Pomyślnie zaimportowano ${successCount} elementów! ${failCount > 0 ? `(${failCount} błędów)` : ''}`
      );
      setSelected(new Set());
    } else {
      alert('Wystąpił błąd podczas importu. Sprawdź konsolę serwera.');
    }
    setLoading(false);
  };

  // Check Stream Status
  const [checkingStream, setCheckingStream] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<Record<string, boolean>>({});
  const [checkingVisible, setCheckingVisible] = useState(false);

  const checkStream = async (url: string) => {
    setCheckingStream(url);
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000);
      const res = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'VLC/3.0.0 LibVLC/3.0.0',
          'Referer': '',
        },
        redirect: 'follow',
      });
      clearTimeout(id);
      // Treat 200 OK and 3xx redirects as "working"
      const isWorking = res.ok || (res.status >= 300 && res.status < 400);
      setStreamStatus((prev) => ({ ...prev, [url]: isWorking }));
    } catch {
      setStreamStatus((prev) => ({ ...prev, [url]: false }));
    }
    setCheckingStream(null);
  };

  const checkAllVisibleStreams = async () => {
    const toCheck = filteredItems.filter((i) => streamStatus[i.url] === undefined);
    if (toCheck.length === 0) return;

    setCheckingVisible(true);
    setConnectionStatus(`Sprawdzanie ${toCheck.length} przefiltrowanych strumieni...`);

    // Concurrency limit
    const limit = 5;
    let index = 0;
    let active = 0;

    const results: Promise<void>[] = [];

    // Simple batch processing
    const processBatch = async () => {
      while (index < toCheck.length) {
        const item = toCheck[index++];
        await checkStream(item.url);
      }
    };

    const workers = Array(limit)
      .fill(null)
      .map(() => processBatch());
    await Promise.all(workers);

    setCheckingVisible(false);
    setConnectionStatus('');
  };

  const importSingleItem = async (item: M3UEntry) => {
    // Optimistic UI or just simple import
    const res = await importContent([item], importType);
    if (res.success) {
      alert(`Pomyślnie zaimportowano: ${item.name}`);
    } else {
      alert('Błąd importu');
    }
  };

  const verifyAndImportWorking = async () => {
    const itemsToCheck =
      selected.size > 0 ? allItems.filter((i) => selected.has(i.url)) : visibleItems;

    if (itemsToCheck.length === 0) return;

    setLoading(true);
    setConnectionStatus(`Weryfikacja ${itemsToCheck.length} strumieni...`);

    // Local status tracker
    const workingItems: M3UEntry[] = [];

    // Concurrency limit
    const limit = 5;
    let index = 0;
    let completed = 0;

    const processItem = async (item: M3UEntry) => {
      try {
        // Check if we already have a valid status cached
        if (streamStatus[item.url] === true) {
          workingItems.push(item);
          return;
        }

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(item.url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'VLC/3.0.0 LibVLC/3.0.0',
            'Referer': '',
          },
          redirect: 'follow',
        });
        clearTimeout(id);

        const isWorking = res.ok || (res.status >= 300 && res.status < 400);
        if (isWorking) {
          workingItems.push(item);
          setStreamStatus((prev) => ({ ...prev, [item.url]: true }));
        } else {
          setStreamStatus((prev) => ({ ...prev, [item.url]: false }));
        }
      } catch {
        setStreamStatus((prev) => ({ ...prev, [item.url]: false }));
      } finally {
        completed++;
        if (completed % 10 === 0) {
          // Optional: update progress UI
        }
      }
    };

    const processBatch = async () => {
      while (index < itemsToCheck.length) {
        const item = itemsToCheck[index++];
        await processItem(item);
      }
    };

    const workers = Array(limit)
      .fill(null)
      .map(() => processBatch());
    await Promise.all(workers);

    if (workingItems.length > 0) {
      setConnectionStatus(`Importowanie ${workingItems.length} działających strumieni...`);
      const res = await importContent(workingItems, importType);
      if (res.success) {
        alert(`Sukces! Zaimportowano ${res.count} działających strumieni.`);
        setSelected(new Set());
      } else {
        alert('Błąd importu: ' + (res.error || 'Nieznany błąd'));
      }
    } else {
      alert('Nie znaleziono działających strumieni w wybranej grupie.');
    }

    setLoading(false);
    setConnectionStatus('');
  };

  const uniqueGroups = Array.from(new Set(allItems.map((i) => i.groupTitle))).sort();

  const filteredItems = allItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = groupFilter ? item.groupTitle === groupFilter : true;
    return matchesSearch && matchesGroup;
  });

  const visibleItems = filteredItems.slice(0, displayLimit);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-black tracking-tighter uppercase">
            Importer <span className="text-primary">BETA</span>
          </h1>
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/20 animate-pulse">
            Experimental
          </span>
        </div>
        <p className="text-muted-foreground">
          Zaawansowany importer z obsługą Xtream Codes API i weryfikacją strumieni.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_1fr] xl:grid-cols-[minmax(0,380px)_1fr]">
        {/* Source Configuration */}
        <Card className="lg:col-span-1 border-primary/20 bg-primary/5 h-fit sticky top-8 min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" /> Konfiguracja Źródła
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="m3u" onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-4 bg-black/20">
                <TabsTrigger value="m3u">Link M3U</TabsTrigger>
                <TabsTrigger value="xtream">Xtream API</TabsTrigger>
                <TabsTrigger value="storage">Bunny / FTP</TabsTrigger>
              </TabsList>

              {loading && downloadProgress > 0 && (
                <div className="mb-4 space-y-2 p-4 rounded-lg bg-black/20 border border-white/5">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <span>{connectionStatus}</span>
                    {/* Remove percentage or keep item count? */}
                    <span className="text-primary">
                      {allItems.length > 0 ? `${allItems.length} items` : '...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      {polishOnly ? `Filtr PL: ${filterStats.kept}/${filterStats.total}` : `Bez filtra: ${filterStats.total}`}
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={stopDownload}
                      className="font-bold uppercase tracking-tight"
                    >
                      <Square className="mr-2 h-4 w-4" />
                      Stop
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <HardDrive className="h-3 w-3" />
                      {formatBytes(downloadBytes)}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Server className="h-3 w-3" />
                      {downloadRateBps > 0 ? `${formatBytes(downloadRateBps)}/s` : '...'}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <List className="h-3 w-3" />
                      Przetworzono: {filterStats.total}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3" />
                      Zachowano: {filterStats.kept}
                    </span>
                  </div>
                  {/* Hide progress bar as requested or make it indeterminate */}
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary animate-progress-indeterminate"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}

              <TabsContent value="m3u">
                <form onSubmit={handleM3UOrFileSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      URL Playlisty (M3U)
                    </label>
                    <Input
                      value={m3uUrl}
                      onChange={(e) => setM3uUrl(e.target.value)}
                      placeholder="http://example.com/playlist.m3u"
                      className="bg-background/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      URL EPG (XMLTV) lub wgraj plik
                    </label>
                    <Input
                      value={epgUrl}
                      onChange={(e) => setEpgUrl(e.target.value)}
                      placeholder="http://example.com/epg.xml"
                      className="bg-background/50 border-white/10"
                    />
                    <Input
                      type="file"
                      accept=".xml,.xmltv"
                      onChange={(e) => setEpgFile(e.target.files?.[0] || null)}
                      className="bg-background/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Wgraj plik M3U z dysku (lub URL wyżej)
                    </label>
                    <Input
                      type="file"
                      accept=".m3u,.m3u8"
                      onChange={(e) => setM3uFile(e.target.files?.[0] || null)}
                      className="bg-background/50 border-white/10"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="font-bold uppercase tracking-tight"
                    >
                      {loading && connectionStatus !== 'Pobieranie EPG...' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        m3uFile ? 'Wgraj M3U' : 'Pobierz Listę'
                      )}
                    </Button>
                    <Button
                      type="button"
                      onClick={epgFile ? handleEpgFileUpload : handleEpgUrlImport}
                      disabled={loading}
                      variant="outline"
                      className="font-bold uppercase tracking-tight"
                    >
                      {loading && connectionStatus === 'Pobieranie EPG...' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        epgFile ? 'Wgraj EPG' : 'Pobierz EPG'
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="xtream">
                <form onSubmit={handleXtreamSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Host / URL Serwera
                    </label>
                    <Input
                      value={xtreamHost}
                      onChange={(e) => setXtreamHost(e.target.value)}
                      placeholder="http://server.dns:8080"
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Username
                      </label>
                      <Input
                        value={xtreamUser}
                        onChange={(e) => setXtreamUser(e.target.value)}
                        placeholder="user123"
                        className="bg-background/50 border-white/10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Password
                      </label>
                      <Input
                        type="password"
                        value={xtreamPass}
                        onChange={(e) => setXtreamPass(e.target.value)}
                        placeholder="pass123"
                        className="bg-background/50 border-white/10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Format Wyjściowy
                    </label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background/50 px-3 py-2 text-sm"
                      value={xtreamOutput}
                      onChange={(e) => setXtreamOutput(e.target.value as any)}
                    >
                      <option value="ts">MPEG-TS (.ts)</option>
                      <option value="m3u8">HLS (.m3u8)</option>
                    </select>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full font-bold uppercase tracking-tight"
                  >
                    {loading && connectionStatus !== 'Pobieranie EPG...' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Połącz z API'
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleEpgImport}
                    disabled={loading}
                    variant="outline"
                    className="w-full font-bold uppercase tracking-tight mt-2"
                  >
                    {loading && connectionStatus === 'Pobieranie EPG...' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Pobierz EPG (XMLTV)'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="storage">
                <form onSubmit={handleBunnySubmit} className="space-y-4">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs mb-4">
                    <div className="flex items-center gap-2 font-bold text-blue-500 mb-1">
                      <HardDrive className="h-4 w-4" /> Bunny.net / External Storage
                    </div>
                    <p className="text-muted-foreground">
                      Użyj bezpośredniego linku do pliku M3U przechowywanego na BunnyCDN lub innym
                      serwerze. Jeśli plik jest prywatny, upewnij się, że link zawiera token
                      autoryzacyjny.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      URL do pliku (M3U/M3U8)
                    </label>
                    <Input
                      value={bunnyUrl}
                      onChange={(e) => setBunnyUrl(e.target.value)}
                      placeholder="https://storage.bunnycdn.com/my-zone/playlist.m3u"
                      className="bg-background/50 border-white/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Access Key (Opcjonalne)
                    </label>
                    <Input
                      type="password"
                      value={bunnyAccessKey}
                      onChange={(e) => setBunnyAccessKey(e.target.value)}
                      placeholder="Jeśli wymagane przez API Storage..."
                      className="bg-background/50 border-white/10"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Dla Bunny Storage API, podaj klucz API jeśli używasz linku do Storage Zone, a
                      nie Pull Zone.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-tight shadow-lg shadow-emerald-900/20"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      'Pobierz z Magazynu'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
                <XCircle className="h-4 w-4" /> {error}
              </div>
            )}

            {(items.length > 0 || allItems.length > 0) && (
              <div className="pt-6 border-t border-white/10 space-y-4 animate-in fade-in slide-in-from-top-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Typ Importu
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={importType === 'CHANNEL' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImportType('CHANNEL')}
                      className="text-xs"
                    >
                      <Radio className="mr-1 h-3 w-3" /> TV
                    </Button>
                    <Button
                      variant={importType === 'MOVIE' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImportType('MOVIE')}
                      className="text-xs"
                    >
                      <Film className="mr-1 h-3 w-3" /> Film
                    </Button>
                    <Button
                      variant={importType === 'SERIES' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setImportType('SERIES')}
                      className="text-xs"
                    >
                      <MonitorPlay className="mr-1 h-3 w-3" /> Serial
                    </Button>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm">
                  <div className="flex items-center gap-2 font-bold text-emerald-500 mb-1">
                    <CheckCircle2 className="h-4 w-4" /> Gotowe do importu
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Znaleziono <span className="text-white font-bold">{allItems.length}</span>{' '}
                    elementów.
                    <br />
                    Zaznaczono: <span className="text-white font-bold">{selected.size}</span>
                  </p>
                </div>

                <Button
                  onClick={handleImport}
                  disabled={loading || selected.size === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-tight shadow-lg shadow-emerald-900/20"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  Importuj ({selected.size})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="min-w-0 w-full space-y-6">
          {allItems.length > 0 ? (
            <div className="space-y-4 min-w-0">
              {/* Advanced Toolbar - układ pionowy na małych ekranach, filtry w jednym rzędzie z ograniczeniem szerokości */}
              <div className="flex flex-col gap-4 bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md shadow-xl">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Akcje masowe
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSelectAll}
                      className="text-[10px] h-9 border-white/10 bg-background/40 hover:bg-white/10 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-[0.98] transition"
                    >
                      <Check className="mr-2 h-3 w-3" />
                      {selected.size === filteredItems.length && filteredItems.length > 0
                        ? 'Odznacz wszystko'
                        : 'Zaznacz wszystko'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(new Set(visibleItems.map((i) => i.url)))}
                      className="text-[10px] h-9 border-white/10 bg-background/40 hover:bg-white/10 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-[0.98] transition"
                    >
                      <Check className="mr-2 h-3 w-3" />
                      Zaznacz widoczne
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelected(new Set())}
                      className="text-[10px] h-9 border-white/10 bg-background/40 hover:bg-white/10 hover:border-white/20 focus-visible:ring-2 focus-visible:ring-primary/60 active:scale-[0.98] transition"
                    >
                      <XCircle className="mr-2 h-3 w-3" />
                      Odznacz
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={handleImport}
                      disabled={loading || selected.size === 0}
                      className="text-[10px] h-9 font-bold uppercase tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 focus-visible:ring-2 focus-visible:ring-emerald-300/60 active:scale-[0.98] transition disabled:shadow-none"
                      title={selected.size === 0 ? 'Najpierw zaznacz elementy' : undefined}
                    >
                      <Zap className="mr-2 h-3 w-3" />
                      Importuj wybrane ({selected.size})
                    </Button>
                    <Button
                      size="sm"
                      variant="default"
                      onClick={checkAllVisibleStreams}
                      className="text-[10px] h-9 font-bold uppercase tracking-wide bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 focus-visible:ring-2 focus-visible:ring-emerald-300/60 active:scale-[0.98] transition"
                      disabled={checkingVisible}
                    >
                      {checkingVisible ? (
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      ) : (
                        <PlayCircle className="mr-2 h-3 w-3" />
                      )}
                      Sprawdź przefiltrowane ({filteredItems.length})
                    </Button>
                    <Button
                      size="sm"
                      className="text-[10px] h-9 font-bold uppercase tracking-wide bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20 focus-visible:ring-2 focus-visible:ring-blue-300/60 active:scale-[0.98] transition"
                      onClick={verifyAndImportWorking}
                      disabled={loading}
                    >
                      <Zap className="mr-2 h-3 w-3" />
                      Sprawdź i importuj działające
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Filtrowanie
                    </label>
                    {(searchTerm || groupFilter) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[10px] h-7 text-muted-foreground hover:text-foreground"
                        onClick={() => {
                          setSearchTerm('');
                          setGroupFilter('');
                        }}
                      >
                        Wyczyść filtry
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 max-w-full sm:max-w-md">
                    <div className="flex items-center gap-2">
                      <select
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                        className="h-10 rounded-md border border-white/10 bg-background/50 px-3 text-sm"
                      >
                        <option value="">Wszystkie grupy</option>
                        {uniqueGroups.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 rounded-md border border-white/10 bg-background/50 px-3 h-10">
                      <Checkbox
                        checked={polishOnly}
                        onCheckedChange={(v) => setPolishOnly(Boolean(v))}
                      />
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Tylko PL
                      </span>
                    </div>

                    <div className="relative min-w-0 flex-1 sm:max-w-[220px]">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="Szukaj kanału..."
                        className="pl-9 h-9 w-full min-w-0 bg-background/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Card className="border-white/5 bg-white/5 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0 overflow-x-auto">
                  <div className="flex items-center p-3 border-b border-white/10 bg-black/40 text-xs font-bold uppercase tracking-widest text-muted-foreground sticky top-0 backdrop-blur-md z-10 min-w-[600px]">
                    <div className="w-10 shrink-0 text-center">
                      <Checkbox
                        checked={selected.size === filteredItems.length && filteredItems.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </div>
                    <div className="flex-1 min-w-0 px-4">Nazwa</div>
                    <div className="w-28 sm:w-32 shrink-0 px-4">Grupa</div>
                    <div className="w-20 sm:w-24 shrink-0 px-4 text-center">Status</div>
                    <div className="w-14 shrink-0 px-2 text-center">Import</div>
                    <div className="w-14 shrink-0 px-2 text-right">Logo</div>
                  </div>
                  <div className="max-h-[600px] overflow-y-auto">
                    {visibleItems.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        Brak wyników dla wybranych filtrów.
                      </div>
                    ) : (
                      <>
                        {visibleItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="group flex items-center p-2 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 min-w-[600px]"
                          >
                            <div className="w-10 shrink-0 text-center">
                              <Checkbox
                                checked={selected.has(item.url)}
                                onCheckedChange={(checked) => {
                                  const newSelected = new Set(selected);
                                  if (checked) newSelected.add(item.url);
                                  else newSelected.delete(item.url);
                                  setSelected(newSelected);
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0 px-4 font-medium truncate flex items-center gap-2">
                              <span title={item.name}>{item.name}</span>
                            </div>
                            <div
                              className="w-28 sm:w-32 shrink-0 px-4 text-xs text-muted-foreground truncate"
                              title={item.groupTitle}
                            >
                              {item.groupTitle}
                            </div>
                            <div className="w-20 sm:w-24 shrink-0 px-4 flex justify-center">
                              {streamStatus[item.url] === undefined ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 w-6 p-0 rounded-full hover:bg-white/10 opacity-60 hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                                  onClick={() => checkStream(item.url)}
                                  disabled={checkingStream === item.url}
                                  title="Sprawdź status"
                                >
                                  {checkingStream === item.url ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <PlayCircle className="h-4 w-4" />
                                  )}
                                </Button>
                              ) : streamStatus[item.url] ? (
                                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" /> OK
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                                  <XCircle className="h-3 w-3" /> Error
                                </span>
                              )}
                            </div>
                            <div className="w-14 shrink-0 px-2 flex justify-center">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 rounded-full hover:bg-emerald-500/20 text-emerald-500 opacity-60 hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                                onClick={() => importSingleItem(item)}
                                title="Importuj ten element"
                              >
                                <Zap className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="w-14 shrink-0 px-2 text-right">
                              {item.tvgLogo ? (
                                <img
                                  src={item.tvgLogo}
                                  alt=""
                                  className="h-6 w-auto ml-auto object-contain rounded-sm"
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </div>
                          </div>
                        ))}
                        {filteredItems.length > displayLimit && (
                          <div className="p-4 text-center border-t border-white/5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDisplayLimit((prev) => prev + 2000)}
                              className="text-xs font-bold uppercase tracking-widest"
                            >
                              Załaduj więcej (2000)
                            </Button>
                          </div>
                        )}

                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/5 rounded-2xl border-2 border-dashed border-white/5 h-full min-h-[400px]">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <Zap className="relative h-16 w-16 text-primary mb-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Importer BETA</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                Skonfiguruj połączenie Xtream lub podaj link M3U po lewej stronie, aby rozpocząć.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
