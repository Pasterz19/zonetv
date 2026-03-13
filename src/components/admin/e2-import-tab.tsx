'use client';

import { useState, useEffect } from 'react';

interface Bouquet {
  name: string;
  filename: string;
  category: string;
  country?: string;
  channelCount: number;
  channels: Array<{ name: string; url: string }>;
  selected?: boolean;
}

interface Source {
  id: string;
  name: string;
  url: string;
}

interface ImportStats {
  imported: number;
  skipped: number;
  errors: number;
  categories: string[];
}

export function E2ImportTab() {
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [customUrl, setCustomUrl] = useState<string>('');
  const [bouquets, setBouquets] = useState<Bouquet[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [skipExisting, setSkipExisting] = useState(true);
  const [createCategories, setCreateCategories] = useState(true);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/e2-import?action=sources');
      const data = await response.json();
      if (data.sources) {
        setSources(data.sources);
      }
    } catch (err) {
      console.error('Error fetching sources:', err);
    }
  };

  const previewSource = async (url: string) => {
    setLoading(true);
    setError(null);
    setBouquets([]);
    setImportStats(null);
    
    try {
      const response = await fetch(`/api/e2-import?action=preview&url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Błąd podczas pobierania podglądu');
      }
      
      setBouquets(data.bouquets.map((b: Bouquet) => ({ ...b, selected: true })));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSourceSelect = (sourceId: string) => {
    setSelectedSource(sourceId);
    const source = sources.find(s => s.id === sourceId);
    if (source) {
      setCustomUrl(source.url);
      previewSource(source.url);
    }
  };

  const toggleBouquet = (index: number) => {
    setBouquets(prev => prev.map((b, i) => 
      i === index ? { ...b, selected: !b.selected } : b
    ));
  };

  const selectAllBouquets = (select: boolean) => {
    setBouquets(prev => prev.map(b => ({ ...b, selected: select })));
  };

  const startImport = async () => {
    const selectedBouquets = bouquets.filter(b => b.selected).map(b => b.name);
    if (selectedBouquets.length === 0) {
      setError('Wybierz co najmniej jeden bukiet do importu');
      return;
    }

    setImporting(true);
    setError(null);
    setImportStats(null);

    try {
      const url = selectedSource 
        ? sources.find(s => s.id === selectedSource)?.url 
        : customUrl;

      const response = await fetch('/api/e2-import/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl: url,
          selectedBouquets,
          skipExisting,
          createCategories,
          defaultStatus: 'active',
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Błąd podczas importu');
      }

      setImportStats(data.stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Sport': 'bg-green-600',
      'Muzyka': 'bg-purple-600',
      'Kamery': 'bg-blue-600',
      'Polska': 'bg-red-600',
      'Pluto TV': 'bg-yellow-600',
      'Samsung TV Plus': 'bg-cyan-600',
      'Rakuten TV': 'bg-pink-600',
      'XXX': 'bg-rose-900',
    };
    return colors[category] || 'bg-gray-600';
  };

  const totalSelectedChannels = bouquets.filter(b => b.selected).reduce((sum, b) => sum + b.channelCount, 0);

  return (
    <div className="space-y-6">
      {/* Nagłówek */}
      <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800 rounded-lg p-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          📥 Import Kanałów IPTV z List Enigma2
        </h2>
        <p className="text-gray-400 mt-1">
          Importuj kanały IPTV z list kanałów Bzyk83 i innych źródeł Enigma2
        </p>
      </div>

      {/* Źródła */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">📁 Źródło</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {sources.map(source => (
            <button
              key={source.id}
              onClick={() => handleSourceSelect(source.id)}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedSource === source.id
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800'
              }`}
            >
              <div className="font-medium">{source.name}</div>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Własny URL do pliku ZIP z listą kanałów..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:border-red-500 outline-none"
          />
          <button
            onClick={() => previewSource(customUrl)}
            disabled={loading || !customUrl}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50"
          >
            {loading ? '⏳' : '🔍'} Podgląd
          </button>
        </div>
      </div>

      {/* Ładowanie */}
      {loading && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 flex items-center justify-center">
          <div className="animate-spin mr-3">⏳</div>
          <span>Analizowanie listy kanałów...</span>
        </div>
      )}

      {/* Błąd */}
      {error && (
        <div className="border border-red-500 bg-red-500/10 rounded-lg p-4 flex items-center gap-3">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Bukiet do importu */}
      {bouquets.length > 0 && !importing && !importStats && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              📋 Bukiety do importu ({bouquets.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => selectAllBouquets(true)}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
              >
                Zaznacz wszystkie
              </button>
              <button
                onClick={() => selectAllBouquets(false)}
                className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
              >
                Odznacz wszystkie
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-400 mb-4">
            Wybrano kanałów: <span className="text-white font-medium">{totalSelectedChannels}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-2">
            {bouquets.map((bouquet, index) => (
              <div
                key={index}
                onClick={() => toggleBouquet(index)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  bouquet.selected
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={bouquet.selected}
                    onChange={() => toggleBouquet(index)}
                    className="w-4 h-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{bouquet.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(bouquet.category)}`}>
                        {bouquet.category}
                      </span>
                      <span className="text-xs text-gray-400">
                        {bouquet.channelCount} kanałów
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opcje importu */}
      {bouquets.length > 0 && !importing && !importStats && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">⚙️ Opcje importu</h3>
          <div className="space-y-3 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={skipExisting}
                onChange={(e) => setSkipExisting(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Pomiń istniejące kanały (sprawdź po nazwie i URL)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={createCategories}
                onChange={(e) => setCreateCategories(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm">Utwórz kategorie automatycznie na podstawie bukietów</span>
            </label>
          </div>
          <button
            onClick={startImport}
            disabled={importing || totalSelectedChannels === 0}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 py-3 rounded-lg font-medium"
          >
            📤 Importuj {totalSelectedChannels} kanałów
          </button>
        </div>
      )}

      {/* Postęp */}
      {importing && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="animate-spin">⏳</span>
            <span>Importowanie kanałów...</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div className="bg-red-600 h-3 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      )}

      {/* Wyniki */}
      {importStats && (
        <div className="border border-green-500 bg-green-500/10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-500 mb-4">
            ✅ Import zakończony
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-green-500">{importStats.imported}</div>
              <div className="text-sm text-gray-400">Zaimportowano</div>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-yellow-500">{importStats.skipped}</div>
              <div className="text-sm text-gray-400">Pominięto</div>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-red-500">{importStats.errors}</div>
              <div className="text-sm text-gray-400">Błędy</div>
            </div>
          </div>
          
          {importStats.categories.length > 0 && (
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Utworzone kategorie:</div>
              <div className="flex flex-wrap gap-2">
                {importStats.categories.map((cat, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-700 rounded text-sm">{cat}</span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setBouquets([]);
              setImportStats(null);
              setCustomUrl('');
              setSelectedSource('');
            }}
            className="w-full bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
          >
            Nowy import
          </button>
        </div>
      )}
    </div>
  );
}
