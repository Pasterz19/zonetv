"use client";

import { useState, useEffect } from "react";
import { 
  getLocalBzyk83Bouquets, 
  importLocalBouquet, 
  importAllLocalBouquets,
  generateLocalM3U,
  importM3UContent
} from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Download, CheckCircle, AlertCircle, FileText, Radio, Save, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BouquetInfo {
  filename: string;
  name: string;
  channelCount: number;
  iptvChannels: number;
  preview: string[];
}

export function Bzyk83LocalImporter() {
  const [bouquets, setBouquets] = useState<BouquetInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBouquets, setSelectedBouquets] = useState<Set<string>>(new Set());
  const [autoEnable, setAutoEnable] = useState(true);
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
    stats?: any;
  } | null>(null);
  const [importing, setImporting] = useState(false);
  const [forceImport, setForceImport] = useState(false);
  const [m3uContent, setM3uContent] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadBouquets();
  }, []);

  async function loadBouquets() {
    const response = await getLocalBzyk83Bouquets();
    if ('error' in response && response.error) {
      setResult({ type: 'error', message: response.error || 'Failed to load bouquets' });
    } else if ('bouquets' in response && response.bouquets) {
      setBouquets(response.bouquets);
    }
    setLoading(false);
  }

  async function handleImportSingle(filename: string) {
    setImporting(true);
    setResult(null);
    
    const response = await importLocalBouquet(filename, { 
      autoEnable,
      forceImport 
    });
    
    if ('error' in response && response.error) {
      setResult({ type: 'error', message: response.error || 'Unknown error' });
    } else if ('imported' in response) {
      setResult({
        type: 'success',
        message: `Zaimportowano ${response.imported} kanałów z ${response.total}`,
        stats: { imported: response.imported, total: response.total },
      });
    }
    
    setImporting(false);
  }

  async function handleImportAll() {
    setImporting(true);
    setResult(null);
    
    const response = await importAllLocalBouquets({
      autoEnable,
      forceImport,
      excludePatterns: ['xxx', 'adult', 'porn'], // Exclude adult content by default
    });
    
    if ('error' in response && response.error) {
      setResult({ type: 'error', message: response.error || 'Unknown error' });
    } else if ('totalImported' in response) {
      setResult({
        type: 'success',
        message: `Zaimportowano ${response.totalImported} kanałów z ${response.bouquetsCount} bukietów`,
        stats: { imported: response.totalImported, total: response.totalImported + response.totalSkipped },
      });
    }
    
    setImporting(false);
  }

  async function handleGenerateM3U() {
    setImporting(true);
    const response = await generateLocalM3U(
      selectedBouquets.size > 0 ? Array.from(selectedBouquets) as string[] : undefined
    );
    
    if ('error' in response && response.error) {
      setResult({ type: 'error', message: response.error || 'Unknown error' });
    } else if ('m3uContent' in response && response.m3uContent) {
      setM3uContent(response.m3uContent || null);
      setResult({
        type: 'success',
        message: `Wygenerowano playlistę M3U z ${response.totalChannels} kanałami`,
      });
    }
    
    setImporting(false);
  }

  async function handleImportM3U() {
    if (!m3uContent) return;
    
    setImporting(true);
    setResult(null);
    
    const response = await importM3UContent(m3uContent, { 
      autoEnable: true,
      categoryPrefix: 'Bzyk83',
      forceImport: forceImport
    });
    
    if ('error' in response && response.error) {
      setResult({ type: 'error', message: response.error || 'Unknown error' });
    } else if ('imported' in response) {
      setResult({
        type: 'success',
        message: `Zaimportowano ${response.imported} kanałów z M3U do playera (pominięto ${response.skipped} duplikatów)`,
        stats: { imported: response.imported, total: response.total },
      });
    }
    
    setImporting(false);
  }

  async function handleUpload() {
    if (!uploadedFile) {
      setResult({ type: 'error', message: 'Wybierz plik do załadowania' });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('autoEnable', autoEnable.toString());
      formData.append('forceImport', forceImport.toString());
      formData.append('categoryPrefix', 'Upload');

      const response = await fetch('/admin/bzyk83-import/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({ type: 'error', message: data.error || 'Upload failed' });
      } else if ('error' in data && data.error) {
        setResult({ type: 'error', message: data.error });
      } else if ('imported' in data) {
        setResult({
          type: 'success',
          message: `Zaimportowano ${data.imported} kanałów z pliku ${uploadedFile.name} (pominięto ${data.skipped} duplikatów)`,
          stats: { imported: data.imported, total: data.total },
        });
        setUploadedFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }
    } catch (error) {
      setResult({ type: 'error', message: 'Upload failed' });
    }

    setUploading(false);
  }

  function downloadM3U() {
    if (!m3uContent) return;
    
    const blob = new Blob([m3uContent], { type: 'application/vnd.apple.mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bzyk83-channels.m3u';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Wczytywanie list kanałów...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{bouquets.length}</CardTitle>
            <CardDescription>Bukietów</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">
              {bouquets.reduce((sum, b) => sum + b.channelCount, 0)}
            </CardTitle>
            <CardDescription>Kanałów IPTV</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Radio className="h-5 w-5 text-green-500" />
              gotowych
            </CardTitle>
            <CardDescription>Do oglądania przez internet</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Upload M3U/M3U8 */}
      <Card>
        <CardHeader>
          <CardTitle>Import z pliku M3U/M3U8</CardTitle>
          <CardDescription>
            Załaduj plik playlisty M3U lub M3U8 z komputera
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <input
              id="file-upload"
              type="file"
              accept=".m3u,.m3u8"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadedFile(file);
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploadedFile && (
              <div className="text-sm text-gray-600">
                Wybrano: <span className="font-medium">{uploadedFile.name}</span>
                <span className="ml-2 text-gray-400">
                  ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="forceImportUpload"
              checked={forceImport}
              onCheckedChange={(checked) => setForceImport(checked as boolean)}
            />
            <label htmlFor="forceImportUpload" className="text-sm">
              Importuj wszystko (ignoruj duplikaty)
            </label>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!uploadedFile || uploading}
            className="w-full"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Importuj plik M3U/M3U8
          </Button>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Opcje importu</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoEnable"
              checked={autoEnable}
              onCheckedChange={(checked) => setAutoEnable(checked as boolean)}
            />
            <label htmlFor="autoEnable" className="text-sm">
              Automatycznie włącz zaimportowane kanały
            </label>
          </div>

          {m3uContent && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="forceImport"
                checked={forceImport}
                onCheckedChange={(checked) => setForceImport(checked as boolean)}
              />
              <label htmlFor="forceImport" className="text-sm">
                Importuj wszystko (ignoruj duplikaty)
              </label>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleImportAll}
              disabled={importing || bouquets.length === 0}
              className="flex-1"
            >
              {importing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Importuj wszystkie kanały
            </Button>

            <Button
              onClick={handleGenerateM3U}
              disabled={importing || bouquets.length === 0}
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              Generuj M3U
            </Button>
          </div>

          {m3uContent && (
            <div className="flex gap-2">
              <Button
                onClick={downloadM3U}
                variant="secondary"
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Pobierz M3U
              </Button>
              <Button
                onClick={handleImportM3U}
                variant="default"
                className="flex-1"
                disabled={importing}
              >
                {importing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Importuj M3U do playera
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Alert variant={result.type === 'success' ? 'default' : 'destructive'}>
          {result.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}

      {/* Bouquets List */}
      <Card>
        <CardHeader>
          <CardTitle>Dostępne bukiety</CardTitle>
          <CardDescription>
            Wybierz konkretne bukiety do importu lub zaznacz wszystkie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {bouquets.map((bouquet) => (
                <div
                  key={bouquet.filename}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedBouquets.has(bouquet.filename)}
                      onCheckedChange={(checked) => {
                        const newSet = new Set(selectedBouquets);
                        if (checked) {
                          newSet.add(bouquet.filename);
                        } else {
                          newSet.delete(bouquet.filename);
                        }
                        setSelectedBouquets(newSet);
                      }}
                    />
                    <div>
                      <div className="font-medium">{bouquet.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {bouquet.channelCount} kanałów IPTV
                      </div>
                      {bouquet.preview.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Przykłady: {bouquet.preview.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleImportSingle(bouquet.filename)}
                    disabled={importing}
                  >
                    {importing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
