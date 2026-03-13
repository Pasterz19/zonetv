'use client';

import { useState, useEffect } from 'react';
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
  XCircle,
  CheckCircle,
  CheckCircle2,
  Circle,
  HardDrive,
  Square,
  Filter,
  Globe,
  Flag,
  Link,
  RefreshCw,
  Save,
  Play,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface M3UEntry {
  name: string;
  url: string;
  groupTitle?: string;
  tvgLogo?: string;
  tvgId?: string;
}

interface XtreamCategory {
  category_id: string;
  category_name: string;
  parent_id: number;
}

interface XtreamChannel {
  num: number;
  name: string;
  stream_icon: string;
  stream_url?: string;
  category_id: string;
  category_name?: string;
  epg_channel_id?: string;
}

interface XtreamConfig {
  host: string;
  port: string;
  username: string;
  password: string;
}

interface ImportStats {
  total: number;
  imported: number;
  skipped: number;
  updated: number;
}

export default function ImporterPage() {
  // M3U State
  const [items, setItems] = useState<M3UEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importType, setImportType] = useState<'CHANNEL' | 'MOVIE' | 'SERIES'>('CHANNEL');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [activeTab, setActiveTab] = useState('m3u');
  const [filterPolish, setFilterPolish] = useState(true);
  const [m3uUrl, setM3uUrl] = useState('');

  // Xtream State
  const [xtreamConfig, setXtreamConfig] = useState<XtreamConfig>({
    host: '',
    port: '80',
    username: '',
    password: ''
  });
  const [xtreamConnected, setXtreamConnected] = useState(false);
  const [xtreamCategories, setXtreamCategories] = useState<XtreamCategory[]>([]);
  const [xtreamChannels, setXtreamChannels] = useState<XtreamChannel[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [xtreamLoading, setXtreamLoading] = useState(false);
  const [xtreamImporting, setXtreamImporting] = useState(false);
  const [xtreamStats, setXtreamStats] = useState<ImportStats | null>(null);
  const [savedConfigs, setSavedConfigs] = useState<XtreamConfig[]>([]);
  const [showPreview, setShowPreview] = useState<string | null>(null);

  // Load saved Xtream configs on mount
  useEffect(() => {
    fetchSavedConfigs();
  }, []);

  const fetchSavedConfigs = async () => {
    try {
      const response = await fetch('/api/xtream/configs');
      if (response.ok) {
        const data = await response.json();
        setSavedConfigs(data.configs || []);
      }
    } catch (error) {
      console.error('Failed to fetch saved configs:', error);
    }
  };

  // M3U Functions
  const handleFetchM3U = async () => {
    if (!m3uUrl.trim()) {
      setConnectionStatus('Wprowadź URL playlisty M3U');
      return;
    }

    setLoading(true);
    setConnectionStatus('Pobieranie playlisty...');

    try {
      const response = await fetch('/api/importer/parse-m3u', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: m3uUrl, filterPolish })
      });

      const result = await response.json();

      if (result.success) {
        setItems(result.entries || []);
        setSelected(new Set());
        setConnectionStatus(`Znaleziono ${result.entries?.length || 0} pozycji`);
      } else {
        setConnectionStatus(result.error || 'Błąd pobierania playlisty');
      }
    } catch (error) {
      setConnectionStatus(`Błąd: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (selected.size === 0) {
      setConnectionStatus('Zaznacz pozycje do importu');
      return;
    }

    setImporting(true);
    setConnectionStatus('Importowanie...');

    try {
      const selectedItems = items.filter(item => selected.has(item.url));
      const response = await fetch('/api/importer/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: selectedItems, type: importType })
      });

      const result = await response.json();

      if (result.success) {
        setConnectionStatus(`Zaimportowano ${result.importedCount} pozycji`);
        setSelected(new Set());
      } else {
        setConnectionStatus(result.error || 'Błąd importu');
      }
    } catch (error) {
      setConnectionStatus(`Błąd importu: ${(error as Error).message}`);
    } finally {
      setImporting(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm ||
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.groupTitle?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGroup = !groupFilter ||
      item.groupTitle?.toLowerCase().includes(groupFilter.toLowerCase());

    return matchesSearch && matchesGroup;
  });

  const toggleSelect = (url: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(url)) {
      newSelected.delete(url);
    } else {
      newSelected.add(url);
    }
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredItems.map(item => item.url)));
    }
  };

  const groups = [...new Set(items.map(i => i.groupTitle).filter(Boolean))];

  // Xtream Functions
  const handleXtreamConnect = async () => {
    const { host, port, username, password } = xtreamConfig;
    
    if (!host || !username || !password) {
      setConnectionStatus('Wypełnij wszystkie pola');
      return;
    }

    setXtreamLoading(true);
    setConnectionStatus('Łączenie z serwerem...');

    try {
      const response = await fetch('/api/xtream/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(xtreamConfig)
      });

      const result = await response.json();

      if (result.success) {
        setXtreamConnected(true);
        setXtreamCategories(result.categories || []);
        setXtreamChannels(result.channels || []);
        setConnectionStatus(`Połączono! ${result.channels?.length || 0} kanałów w ${result.categories?.length || 0} kategoriach`);
        
        // Save config
        fetch('/api/xtream/save-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(xtreamConfig)
        });
      } else {
        setConnectionStatus(result.error || 'Błąd połączenia');
      }
    } catch (error) {
      setConnectionStatus(`Błąd: ${(error as Error).message}`);
    } finally {
      setXtreamLoading(false);
    }
  };

  const handleXtreamImport = async () => {
    const channelsToImport = xtreamChannels.filter(ch => selectedChannels.has(ch.num.toString()));
    
    if (channelsToImport.length === 0) {
      setConnectionStatus('Zaznacz kanały do importu');
      return;
    }

    setXtreamImporting(true);
    setConnectionStatus(`Importowanie ${channelsToImport.length} kanałów...`);
    setXtreamStats({ total: channelsToImport.length, imported: 0, skipped: 0, updated: 0 });

    try {
      const response = await fetch('/api/xtream/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: xtreamConfig,
          channels: channelsToImport
        })
      });

      const result = await response.json();

      if (result.success) {
        setXtreamStats(result.stats);
        setConnectionStatus(`Zaimportowano ${result.stats.imported} kanałów (${result.stats.updated} zaktualizowanych, ${result.stats.skipped} pominiętych)`);
        setSelectedChannels(new Set());
      } else {
        setConnectionStatus(result.error || 'Błąd importu');
      }
    } catch (error) {
      setConnectionStatus(`Błąd importu: ${(error as Error).message}`);
    } finally {
      setXtreamImporting(false);
    }
  };

  const loadSavedConfig = (config: XtreamConfig) => {
    setXtreamConfig(config);
    handleXtreamConnect();
  };

  const filteredXtreamChannels = xtreamChannels.filter(ch => {
    const matchesCategory = selectedCategories.size === 0 || selectedCategories.has(ch.category_id);
    const matchesSearch = !searchTerm || ch.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Importer <span className="text-primary">Treści</span>
          </h1>
          <p className="text-muted-foreground">
            Importuj kanały TV, filmy i seriale z M3U lub Xtream API
          </p>
        </div>

        {/* Polish Filter Toggle */}
        <div className="flex items-center space-x-2 bg-white/5 rounded-lg px-4 py-2">
          <Flag className="h-4 w-4 text-red-500" />
          <Switch
            checked={filterPolish}
            onCheckedChange={setFilterPolish}
            id="polish-filter"
          />
          <label htmlFor="polish-filter" className="text-sm font-medium">
            Tylko polskie
          </label>
        </div>
      </div>

      {/* Status Card */}
      {connectionStatus && (
        <Card className={cn(
          "border-l-4",
          connectionStatus.includes('Znaleziono') || connectionStatus.includes('Zaimportowano') || connectionStatus.includes('Połączono')
            ? "border-l-emerald-500"
            : connectionStatus.includes('Błąd') || connectionStatus.includes('Wypełnij')
            ? "border-l-red-500"
            : "border-l-amber-500"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {connectionStatus.includes('Błąd') || connectionStatus.includes('Wypełnij') ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : connectionStatus.includes('Znaleziono') || connectionStatus.includes('Zaimportowano') || connectionStatus.includes('Połączono') ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                )}
                <p className="text-sm">{connectionStatus}</p>
              </div>
              {(loading || importing || xtreamLoading || xtreamImporting) && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setLoading(false);
                    setImporting(false);
                    setXtreamLoading(false);
                    setXtreamImporting(false);
                    setConnectionStatus('Anulowano');
                  }}
                  className="flex items-center gap-2"
                >
                  <Square className="h-4 w-4" />
                  STOP
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/5 rounded-xl h-12">
          <TabsTrigger value="m3u" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
            <Link className="h-4 w-4 mr-2" />
            M3U URL
          </TabsTrigger>
          <TabsTrigger value="xtream" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
            <Server className="h-4 w-4 mr-2" />
            Xtream API
          </TabsTrigger>
        </TabsList>

        {/* M3U Import Tab */}
        <TabsContent value="m3u" className="mt-6">
          <Card className="border-white/5 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-primary" />
                Import z URL M3U
              </CardTitle>
              <CardDescription>
                Wklej URL do playlisty M3U aby pobrać listę kanałów
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/playlist.m3u"
                  value={m3uUrl}
                  onChange={(e) => setM3uUrl(e.target.value)}
                  className="flex-1 bg-white/5 border-white/10"
                />
                <Button
                  onClick={handleFetchM3U}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Pobierz
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Xtream API Tab */}
        <TabsContent value="xtream" className="mt-6 space-y-6">
          {/* Connection Form */}
          <Card className="border-white/5 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                Połączenie Xtream Codes
              </CardTitle>
              <CardDescription>
                Wprowadź dane połączenia z serwerem IPTV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="xtream-host">Host</Label>
                  <Input
                    id="xtream-host"
                    placeholder="np. example.com"
                    value={xtreamConfig.host}
                    onChange={(e) => setXtreamConfig(prev => ({ ...prev, host: e.target.value }))}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="xtream-port">Port</Label>
                  <Input
                    id="xtream-port"
                    placeholder="80 lub 8080"
                    value={xtreamConfig.port}
                    onChange={(e) => setXtreamConfig(prev => ({ ...prev, port: e.target.value }))}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="xtream-username">Username</Label>
                  <Input
                    id="xtream-username"
                    placeholder="Nazwa użytkownika"
                    value={xtreamConfig.username}
                    onChange={(e) => setXtreamConfig(prev => ({ ...prev, username: e.target.value }))}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="xtream-password">Password</Label>
                  <Input
                    id="xtream-password"
                    type="password"
                    placeholder="Hasło"
                    value={xtreamConfig.password}
                    onChange={(e) => setXtreamConfig(prev => ({ ...prev, password: e.target.value }))}
                    className="bg-white/5 border-white/10"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handleXtreamConnect}
                  disabled={xtreamLoading || !xtreamConfig.host || !xtreamConfig.username || !xtreamConfig.password}
                  className="gap-2"
                >
                  {xtreamLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Połącz
                </Button>

                {xtreamConnected && (
                  <Badge className="bg-emerald-500/10 text-emerald-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Połączono
                  </Badge>
                )}
              </div>

              {/* Saved Configs */}
              {savedConfigs.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Zapisane konfiguracje</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {savedConfigs.map((config, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => loadSavedConfig(config)}
                        className="text-xs"
                      >
                        <HardDrive className="h-3 w-3 mr-1" />
                        {config.host}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Categories & Channels */}
          {xtreamConnected && xtreamCategories.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Categories */}
              <Card className="border-white/5 bg-white/5">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <List className="h-5 w-5 text-amber-500" />
                      Kategorie ({xtreamCategories.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedCategories.size === xtreamCategories.length) {
                          setSelectedCategories(new Set());
                        } else {
                          setSelectedCategories(new Set(xtreamCategories.map(c => c.category_id)));
                        }
                      }}
                      className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
                    >
                      {selectedCategories.size === xtreamCategories.length ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="hidden sm:inline">
                        {selectedCategories.size === xtreamCategories.length 
                          ? 'Odznacz wszystkie' 
                          : 'Zaznacz wszystkie'}
                      </span>
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-1 pr-4">
                      {xtreamCategories.map((category) => {
                        const isSelected = selectedCategories.has(category.category_id);
                        const channelCount = xtreamChannels.filter(ch => ch.category_id === category.category_id).length;
                        
                        return (
                          <div
                            key={category.category_id}
                            onClick={() => {
                              const newSelected = new Set(selectedCategories);
                              if (isSelected) {
                                newSelected.delete(category.category_id);
                              } else {
                                newSelected.add(category.category_id);
                              }
                              setSelectedCategories(newSelected);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer",
                              isSelected
                                ? "bg-primary/10 border border-primary/30"
                                : "hover:bg-white/5 border border-transparent"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-input bg-background"
                              )}>
                                {isSelected && <Check className="h-3 w-3" />}
                              </div>
                              <span className="font-medium text-sm">{category.category_name}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {channelCount}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Channels */}
              <Card className="border-white/5 bg-white/5 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Radio className="h-5 w-5 text-emerald-500" />
                      Kanały ({filteredXtreamChannels.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Szukaj..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-40 h-8 bg-white/5 border-white/10"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedChannels.size === filteredXtreamChannels.length) {
                            setSelectedChannels(new Set());
                          } else {
                            setSelectedChannels(new Set(filteredXtreamChannels.map(ch => ch.num.toString())));
                          }
                        }}
                        className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
                      >
                        {selectedChannels.size === filteredXtreamChannels.length ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span>{selectedChannels.size}/{filteredXtreamChannels.length}</span>
                      </button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pr-4">
                      {filteredXtreamChannels.slice(0, 100).map((channel) => {
                        const isSelected = selectedChannels.has(channel.num.toString());
                        
                        return (
                          <div
                            key={channel.num}
                            onClick={() => {
                              const newSelected = new Set(selectedChannels);
                              if (isSelected) {
                                newSelected.delete(channel.num.toString());
                              } else {
                                newSelected.add(channel.num.toString());
                              }
                              setSelectedChannels(newSelected);
                            }}
                            className={cn(
                              "flex items-center gap-2 p-2 rounded-lg transition-colors group cursor-pointer",
                              isSelected
                                ? "bg-primary/10 border border-primary/30"
                                : "hover:bg-white/5 border border-transparent"
                            )}
                          >
                            <div className={cn(
                              "h-4 w-4 rounded border flex items-center justify-center transition-colors flex-shrink-0",
                              isSelected
                                ? "bg-primary border-primary text-primary-foreground"
                                : "border-input bg-background"
                            )}>
                              {isSelected && <Check className="h-3 w-3" />}
                            </div>
                            {channel.stream_icon ? (
                              <img
                                src={channel.stream_icon}
                                alt=""
                                className="h-6 w-6 rounded object-contain flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <Radio className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            )}
                            <span className="text-xs font-medium truncate text-left flex-1">
                              {channel.name}
                            </span>
                            <button
                              type="button"
                              className="h-6 w-6 p-0 ml-auto opacity-0 group-hover:opacity-100 rounded hover:bg-white/10 flex items-center justify-center transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowPreview(showPreview === channel.num.toString() ? null : channel.num.toString());
                              }}
                            >
                              {showPreview === channel.num.toString() ? (
                                <EyeOff className="h-3 w-3 text-muted-foreground" />
                              ) : (
                                <Eye className="h-3 w-3 text-muted-foreground" />
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  
                  {/* Import Footer */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                    <span className="text-sm text-muted-foreground">
                      Wybrano {selectedChannels.size} z {filteredXtreamChannels.length} kanałów
                    </span>
                    <Button
                      onClick={handleXtreamImport}
                      disabled={xtreamImporting || selectedChannels.size === 0}
                      className="gap-2"
                    >
                      {xtreamImporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <UploadCloud className="h-4 w-4" />
                      )}
                      Importuj {selectedChannels.size} kanałów
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Import Stats */}
          {xtreamStats && (
            <Card className="border-white/5 bg-white/5">
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{xtreamStats.total}</p>
                    <p className="text-xs text-muted-foreground">Razem</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-500">{xtreamStats.imported}</p>
                    <p className="text-xs text-muted-foreground">Zaimportowano</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-500">{xtreamStats.updated}</p>
                    <p className="text-xs text-muted-foreground">Zaktualizowano</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-500">{xtreamStats.skipped}</p>
                    <p className="text-xs text-muted-foreground">Pominięto</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Content Selection (M3U) */}
      {activeTab === 'm3u' && items.length > 0 && (
        <Card className="border-white/5 bg-white/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {importType === 'CHANNEL' && <Radio className="h-5 w-5 text-amber-500" />}
                {importType === 'MOVIE' && <Film className="h-5 w-5 text-red-500" />}
                {importType === 'SERIES' && <MonitorPlay className="h-5 w-5 text-purple-500" />}
                Wybierz Treści do Importu
              </span>
              <Badge variant="outline">
                {selected.size} z {filteredItems.length} zaznaczonych
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-4">
              <div 
                className="flex items-center gap-2 cursor-pointer"
                onClick={toggleSelectAll}
              >
                <div className={cn(
                  "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                  selected.size === filteredItems.length && filteredItems.length > 0
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-input bg-background"
                )}>
                  {selected.size === filteredItems.length && filteredItems.length > 0 && <Check className="h-3 w-3" />}
                </div>
                <span className="text-sm">Zaznacz wszystkie</span>
              </div>

              <select
                value={importType}
                onChange={(e) => setImportType(e.target.value as 'CHANNEL' | 'MOVIE' | 'SERIES')}
                className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm"
              >
                <option value="CHANNEL">Kanały TV</option>
                <option value="MOVIE">Filmy</option>
                <option value="SERIES">Seriale</option>
              </select>

              <Input
                placeholder="Szukaj..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-40 bg-white/5 border-white/10"
              />

              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm"
              >
                <option value="">Wszystkie grupy</option>
                {groups.map(g => (
                  <option key={g} value={g as string}>{g as string}</option>
                ))}
              </select>
            </div>

            {/* Items List */}
            <div className="border border-white/5 rounded-lg max-h-96 overflow-y-auto">
              {filteredItems.slice(0, 200).map((item, index) => (
                <div
                  key={item.url + index}
                  className="flex items-center gap-3 p-3 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => toggleSelect(item.url)}
                >
                  <div className={cn(
                    "h-4 w-4 rounded border flex items-center justify-center transition-colors",
                    selected.has(item.url)
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-input bg-background"
                  )}>
                    {selected.has(item.url) && <Check className="h-3 w-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{item.name}</div>
                    {item.groupTitle && (
                      <div className="text-sm text-muted-foreground truncate">
                        {item.groupTitle}
                      </div>
                    )}
                  </div>
                  {item.tvgLogo && (
                    <img
                      src={item.tvgLogo}
                      alt=""
                      className="h-8 w-8 rounded object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Import Button */}
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <span className="text-sm text-muted-foreground">
                Wyświetlanie {Math.min(filteredItems.length, 200)} z {filteredItems.length} pozycji
              </span>
              <Button
                onClick={handleImport}
                disabled={importing || selected.size === 0}
                className="gap-2"
              >
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                Importuj {selected.size} pozycji
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
