"use client";

import { useState } from "react";
import { importE2FromUrl, importE2Preset, E2_PRESETS } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Download, Satellite, CheckCircle, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export function E2Importer() {
  const [url, setUrl] = useState("");
  const [satellite, setSatellite] = useState("");
  const [autoEnable, setAutoEnable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    stats?: {
      total: number;
      imported: number;
      skipped: number;
      errors: string[];
    };
    error?: string;
  } | null>(null);

  const handleImport = async () => {
    if (!url) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await importE2FromUrl({
        url,
        satellite: satellite || "Imported",
        autoEnable,
      });
      
      setResult(response);
    } catch (error) {
      setResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handlePresetImport = async (presetKey: keyof typeof E2_PRESETS) => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await importE2Preset(presetKey);
      setResult(response);
      
      // Pre-fill form with preset data if successful
      const preset = E2_PRESETS[presetKey];
      if (preset) {
        setUrl(preset.url);
        setSatellite(preset.satellite);
      }
    } catch (error) {
      setResult({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Preset Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(E2_PRESETS).map(([key, preset]) => (
          <Card key={key} className="cursor-pointer hover:border-primary transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Satellite className="h-4 w-4" />
                {preset.name}
              </CardTitle>
              <CardDescription className="text-xs">
                {preset.satellite}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handlePresetImport(key as keyof typeof E2_PRESETS)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Importuj
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom URL Form */}
      <Card>
        <CardHeader>
          <CardTitle>Własny URL</CardTitle>
          <CardDescription>
            Importuj listę kanałów z dowolnego URL (ZIP, M3U, lub plik E2)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL listy kanałów</Label>
            <Input
              id="url"
              placeholder="https://example.com/channels.zip"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="satellite">Satelita / Grupa</Label>
            <Input
              id="satellite"
              placeholder="np. 13°E - Hot Bird"
              value={satellite}
              onChange={(e) => setSatellite(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="autoEnable"
              checked={autoEnable}
              onCheckedChange={(checked) => setAutoEnable(checked as boolean)}
            />
            <Label htmlFor="autoEnable" className="text-sm">
              Automatycznie włącz zaimportowane kanały
            </Label>
          </div>

          <Button
            onClick={handleImport}
            disabled={loading || !url}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importowanie...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Importuj z URL
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Wynik importu
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.error ? (
              <Alert variant="destructive">
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            ) : result.stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{result.stats.total}</div>
                    <div className="text-xs text-muted-foreground">Znaleziono</div>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{result.stats.imported}</div>
                    <div className="text-xs text-muted-foreground">Zaimportowano</div>
                  </div>
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{result.stats.skipped}</div>
                    <div className="text-xs text-muted-foreground">Pominięto</div>
                  </div>
                </div>

                {result.stats.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      <div className="font-medium mb-2">Błędy ({result.stats.errors.length}):</div>
                      <ul className="text-sm space-y-1 max-h-40 overflow-auto">
                        {result.stats.errors.map((err, i) => (
                          <li key={i} className="text-xs">• {err}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
