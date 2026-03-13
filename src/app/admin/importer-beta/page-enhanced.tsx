'use client';

import { useState } from 'react';
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
  Filter,
  Globe,
  Flag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  fetchM3UFromXtreamWithControl,
  importContentWithControl,
  fetchM3UWithControl,
  importEpgFromUrlWithControl,
  stopImport,
  resetImportState,
} from './actions-enhanced';
import { M3UEntry } from '@/lib/m3u-parser';

export default function ImporterEnhancedPage() {
  const [items, setItems] = useState<M3UEntry[]>([]);
  const [allItems, setAllItems] = useState<M3UEntry[]>([]);
  const [displayLimit, setDisplayLimit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importType, setImportType] = useState<'CHANNEL' | 'MOVIE' | 'SERIES'>('CHANNEL');
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [activeTab, setActiveTab] = useState('m3u');
  const [filterPolish, setFilterPolish] = useState(true);
  const [importStats, setImportStats] = useState({
    totalFound: 0,
    filteredCount: 0,
    wasFiltered: false
  });

  // Xtream Form State
  const [xtreamHost, setXtreamHost] = useState('');
  const [xtreamUser, setXtreamUser] = useState('');
  const [xtreamPass, setXtreamPass] = useState('');
  const [xtreamType, setXtreamType] = useState<'m3u_plus' | 'm3u'>('m3u_plus');
  const [xtreamOutput, setXtreamOutput] = useState<'ts' | 'hls'>('ts');

  // M3U URL Form State
  const [m3uUrl, setM3uUrl] = useState('');

  // EPG Form State
  const [epgUrl, setEpgUrl] = useState('');
  const [epgLoading, setEpgLoading] = useState(false);

  const handleStopImport = async () => {
    const result = await stopImport();
    if (result.success) {
      setConnectionStatus('Import stopped by user');
      setLoading(false);
      setImporting(false);
      setEpgLoading(false);
    }
  };

  const handleFetchM3U = async () => {
    if (!m3uUrl.trim()) {
      setConnectionStatus('Please enter M3U URL');
      return;
    }

    setLoading(true);
    setConnectionStatus('Fetching M3U...');
    resetImportState();

    try {
      const result = await fetchM3UWithControl(m3uUrl, filterPolish);
      
      if (result.stopped) {
        setConnectionStatus('Fetch stopped by user');
        return;
      }

      if (result.success) {
        setItems(result.entries || []);
        setAllItems(result.entries || []);
        setSelected(new Set());
        setImportStats({
          totalFound: result.totalFound || 0,
          filteredCount: result.filteredCount || 0,
          wasFiltered: result.wasFiltered || false
        });
        
        const statusMsg = result.wasFiltered 
          ? `Found ${result.totalFound} total entries, filtered to ${result.filteredCount} Polish channels`
          : `Found ${result.entries?.length || 0} entries`;
        
        setConnectionStatus(statusMsg);
      } else {
        setConnectionStatus(result.error || 'Failed to fetch M3U');
      }
    } catch (error) {
      setConnectionStatus(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchXtream = async () => {
    if (!xtreamHost.trim() || !xtreamUser.trim() || !xtreamPass.trim()) {
      setConnectionStatus('Please fill all Xtream fields');
      return;
    }

    setLoading(true);
    setConnectionStatus('Connecting to Xtream API...');
    resetImportState();

    try {
      const result = await fetchM3UFromXtreamWithControl(
        xtreamHost, 
        xtreamUser, 
        xtreamPass, 
        xtreamType, 
        xtreamOutput,
        filterPolish
      );
      
      if (result.stopped) {
        setConnectionStatus('Fetch stopped by user');
        return;
      }

      if (result.success) {
        setItems(result.entries || []);
        setAllItems(result.entries || []);
        setSelected(new Set());
        setImportStats({
          totalFound: result.totalFound || 0,
          filteredCount: result.filteredCount || 0,
          wasFiltered: result.wasFiltered || false
        });
        
        const statusMsg = result.wasFiltered 
          ? `Found ${result.totalFound} total entries, filtered to ${result.filteredCount} Polish channels`
          : `Found ${result.entries?.length || 0} entries`;
        
        setConnectionStatus(statusMsg);
      } else {
        setConnectionStatus(result.error || 'Failed to connect to Xtream API');
      }
    } catch (error) {
      setConnectionStatus(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (selected.size === 0) {
      setConnectionStatus('Please select items to import');
      return;
    }

    setImporting(true);
    setConnectionStatus('Importing selected items...');
    resetImportState();

    try {
      const selectedItems = allItems.filter(item => selected.has(item.url));
      const result = await importContentWithControl(selectedItems, importType);
      
      if (result.stopped) {
        setConnectionStatus(`Import stopped. Imported ${result.importedCount} items.`);
        return;
      }

      if (result.success) {
        setConnectionStatus(`Successfully imported ${result.importedCount} items`);
        setSelected(new Set());
      } else {
        setConnectionStatus(result.error || 'Import failed');
      }
    } catch (error) {
      setConnectionStatus(`Import error: ${(error as Error).message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleImportEpg = async () => {
    if (!epgUrl.trim()) {
      setConnectionStatus('Please enter EPG URL');
      return;
    }

    setEpgLoading(true);
    setConnectionStatus('Fetching EPG data...');
    resetImportState();

    try {
      const result = await importEpgFromUrlWithControl(epgUrl);
      
      if (result.stopped) {
        setConnectionStatus('EPG import stopped by user');
        return;
      }

      if (result.success && 'count' in result) {
        setConnectionStatus(`Successfully imported ${result.count} EPG programs`);
      } else {
        setConnectionStatus(result.error || 'EPG import failed');
      }
    } catch (error) {
      setConnectionStatus(`EPG error: ${(error as Error).message}`);
    } finally {
      setEpgLoading(false);
    }
  };

  const handleImportEpgFromXtream = async () => {
    setConnectionStatus('EPG import from Xtream is not available in this enhanced flow. Use the EPG URL import.');
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.groupTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGroup = !groupFilter || 
      item.groupTitle?.toLowerCase().includes(groupFilter.toLowerCase());
    
    return matchesSearch && matchesGroup;
  });

  const displayedItems = filteredItems.slice(0, displayLimit);
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
    if (selected.size === displayedItems.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(displayedItems.map(item => item.url)));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Enhanced IPTV Importer</h1>
            <p className="text-muted-foreground">Import content with Polish filter and stop control</p>
          </div>
          
          {/* Polish Filter Toggle */}
          <div className="flex items-center space-x-2">
            <Flag className="h-4 w-4" />
            <Switch
              checked={filterPolish}
              onCheckedChange={setFilterPolish}
              id="polish-filter"
            />
            <label htmlFor="polish-filter" className="text-sm font-medium">
              Polish Channels Only
            </label>
          </div>
        </div>

        {/* Status Card */}
        {connectionStatus && (
          <Card className={cn(
            "border-l-4",
            connectionStatus.includes('success') || connectionStatus.includes('Found') 
              ? "border-l-green-500" 
              : connectionStatus.includes('stopped')
              ? "border-l-yellow-500"
              : "border-l-red-500"
          )}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm">{connectionStatus}</p>
                {(loading || importing || epgLoading) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleStopImport}
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

        {/* Import Stats */}
        {importStats.wasFiltered && (
          <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Filter className="h-4 w-4" />
                <span className="text-sm">
                  Filter applied: {importStats.totalFound} total → {importStats.filteredCount} Polish channels
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="m3u">M3U Import</TabsTrigger>
            <TabsTrigger value="xtream">Xtream API</TabsTrigger>
            <TabsTrigger value="epg">EPG Import</TabsTrigger>
          </TabsList>

          {/* M3U Import Tab */}
          <TabsContent value="m3u" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UploadCloud className="h-5 w-5" />
                  M3U URL Import
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/playlist.m3u"
                    value={m3uUrl}
                    onChange={(e) => setM3uUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleFetchM3U} 
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    Fetch
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Xtream API Tab */}
          <TabsContent value="xtream" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Xtream API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Host: example.com"
                    value={xtreamHost}
                    onChange={(e) => setXtreamHost(e.target.value)}
                  />
                  <Input
                    placeholder="Username"
                    value={xtreamUser}
                    onChange={(e) => setXtreamUser(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={xtreamPass}
                    onChange={(e) => setXtreamPass(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <select
                      value={xtreamType}
                      onChange={(e) => setXtreamType(e.target.value as 'm3u_plus' | 'm3u')}
                      className="flex-1 px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="m3u_plus">M3U Plus</option>
                      <option value="m3u">M3U</option>
                    </select>
                    <select
                      value={xtreamOutput}
                      onChange={(e) => setXtreamOutput(e.target.value as 'ts' | 'hls')}
                      className="flex-1 px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="ts">TS</option>
                      <option value="hls">HLS</option>
                    </select>
                  </div>
                </div>
                <Button 
                  onClick={handleFetchXtream} 
                  disabled={loading}
                  className="w-full flex items-center gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Connect to Xtream
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* EPG Import Tab */}
          <TabsContent value="epg" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  EPG Program Guide
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/epg.xml"
                      value={epgUrl}
                      onChange={(e) => setEpgUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleImportEpg} 
                      disabled={epgLoading}
                      className="flex items-center gap-2"
                    >
                      {epgLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                      Import EPG
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Or use Xtream credentials from API tab</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleImportEpgFromXtream}
                      disabled={epgLoading || !xtreamHost}
                      className="flex items-center gap-2"
                    >
                      {epgLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Server className="h-4 w-4" />}
                      Import from Xtream
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Content Selection */}
        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {importType === 'CHANNEL' && <Radio className="h-5 w-5" />}
                  {importType === 'MOVIE' && <Film className="h-5 w-5" />}
                  {importType === 'SERIES' && <MonitorPlay className="h-5 w-5" />}
                  Select Content to Import
                </span>
                <span className="text-sm text-muted-foreground">
                  {selected.size} of {displayedItems.length} selected
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Controls */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selected.size === displayedItems.length}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm">Select All</span>
                </div>
                
                <select
                  value={importType}
                  onChange={(e) => setImportType(e.target.value as 'CHANNEL' | 'MOVIE' | 'SERIES')}
                  className="px-3 py-1 border rounded-md bg-background text-sm"
                >
                  <option value="CHANNEL">Channels</option>
                  <option value="MOVIE">Movies</option>
                  <option value="SERIES">Series</option>
                </select>

                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48"
                />

                <Input
                  placeholder="Filter group..."
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="w-48"
                />

                <select
                  value={displayLimit}
                  onChange={(e) => setDisplayLimit(Number(e.target.value))}
                  className="px-3 py-1 border rounded-md bg-background text-sm"
                >
                  <option value={50}>50 items</option>
                  <option value={100}>100 items</option>
                  <option value={200}>200 items</option>
                  <option value={500}>500 items</option>
                </select>
              </div>

              {/* Items List */}
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {displayedItems.map((item, index) => (
                  <div
                    key={item.url}
                    className="flex items-center gap-3 p-3 border-b hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      checked={selected.has(item.url)}
                      onCheckedChange={() => toggleSelect(item.url)}
                    />
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
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Showing {displayedItems.length} of {filteredItems.length} items
                  {filteredItems.length < items.length && ` (filtered from ${items.length} total)`}
                </span>
                <Button
                  onClick={handleImport}
                  disabled={importing || selected.size === 0}
                  className="flex items-center gap-2"
                >
                  {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  Import {selected.size} Items
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
