'use client';

import { useState, useEffect } from 'react';
import {
  Video,
  Plus,
  Trash2,
  Edit,
  Save,
  Loader2,
  RefreshCw,
  Key,
  Server,
  Check,
  X,
  AlertCircle,
  Clock,
  Link
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface VideoSourceConfig {
  id: string;
  name: string;
  provider: string;
  apiKey: string | null;
  hasApiKey: boolean;
  apiEndpoint: string | null;
  isActive: boolean;
  settings: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ExpiringContent {
  id: string;
  title: string;
  sourceType: string | null;
  sourceExpiresAt: string | null;
}

export function VideoSourcesTab() {
  const [configs, setConfigs] = useState<VideoSourceConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expiringContent, setExpiringContent] = useState<{
    expiringMovies: ExpiringContent[];
    expiringEpisodes: ExpiringContent[];
  } | null>(null);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<VideoSourceConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'SAVEFILES',
    apiKey: '',
    apiEndpoint: '',
    isActive: true,
  });

  // Fetch configs
  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/video-source/config');
      const data = await res.json();
      setConfigs(data.configs || []);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Nie udało się pobrać konfiguracji');
    } finally {
      setLoading(false);
    }
  };

  // Fetch expiring content
  const fetchExpiringContent = async () => {
    try {
      const res = await fetch('/api/video-source/refresh');
      const data = await res.json();
      setExpiringContent(data);
    } catch (error) {
      console.error('Error fetching expiring content:', error);
    }
  };

  useEffect(() => {
    fetchConfigs();
    fetchExpiringContent();
  }, []);

  // Open dialog for new config
  const handleNew = () => {
    setEditingConfig(null);
    setFormData({
      name: '',
      provider: 'SAVEFILES',
      apiKey: '',
      apiEndpoint: '',
      isActive: true,
    });
    setDialogOpen(true);
  };

  // Open dialog for editing
  const handleEdit = (config: VideoSourceConfig) => {
    setEditingConfig(config);
    setFormData({
      name: config.name,
      provider: config.provider,
      apiKey: '', // Don't show existing key
      apiEndpoint: config.apiEndpoint || '',
      isActive: config.isActive,
    });
    setDialogOpen(true);
  };

  // Save config
  const handleSave = async () => {
    if (!formData.name || !formData.provider) {
      toast.error('Wypełnij wymagane pola');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/video-source/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingConfig?.id,
          ...formData,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingConfig ? 'Konfiguracja zaktualizowana' : 'Konfiguracja utworzona');
        setDialogOpen(false);
        fetchConfigs();
      } else {
        toast.error(data.error || 'Wystąpił błąd');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Nie udało się zapisać konfiguracji');
    } finally {
      setSaving(false);
    }
  };

  // Delete config
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/video-source/config?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Konfiguracja usunięta');
        fetchConfigs();
      }
    } catch (error) {
      console.error('Error deleting config:', error);
      toast.error('Nie udało się usunąć konfiguracji');
    }
  };

  // Bulk refresh
  const handleBulkRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/video-source/refresh?bulk=true');
      const data = await res.json();
      
      toast.success(`Odświeżono ${data.refreshed} URL-i${data.failed > 0 ? `, ${data.failed} nie powiodło się` : ''}`);
      
      if (data.errors?.length > 0) {
        console.warn('Refresh errors:', data.errors);
      }
      
      fetchExpiringContent();
    } catch (error) {
      console.error('Error bulk refreshing:', error);
      toast.error('Nie udało się odświeżyć URL-i');
    } finally {
      setRefreshing(false);
    }
  };

  // Get provider display name
  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      SAVEFILES: 'SaveFiles.com',
      DIRECT: 'Bezpośredni URL',
      M3U8: 'HLS Stream (m3u8)',
      MP4: 'MP4 Video',
      CUSTOM: 'Własny',
    };
    return names[provider] || provider;
  };

  // Format date
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Brak';
    return new Date(dateStr).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            Źródła Wideo
          </h2>
          <p className="text-muted-foreground">
            Konfiguracja automatycznego odświeżania wygasających linków
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleBulkRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Odśwież Wygasające
          </Button>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Dodaj Źródło
          </Button>
        </div>
      </div>

      {/* Expiring Content Alert */}
      {expiringContent && (expiringContent.expiringMovies.length > 0 || expiringContent.expiringEpisodes.length > 0) && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <AlertCircle className="h-5 w-5" />
              Wygasające Linki
            </CardTitle>
            <CardDescription>
              Te materiały wymagają odświeżenia URL w ciągu najbliższych 2 godzin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiringContent.expiringMovies.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Filmy ({expiringContent.expiringMovies.length})</h4>
                  <div className="space-y-1">
                    {expiringContent.expiringMovies.slice(0, 5).map((movie) => (
                      <div key={movie.id} className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span>{movie.title}</span>
                        <span className="text-muted-foreground text-xs">
                          ({movie.sourceType || 'brak typu'})
                        </span>
                      </div>
                    ))}
                    {expiringContent.expiringMovies.length > 5 && (
                      <p className="text-sm text-muted-foreground">
                        ... i {expiringContent.expiringMovies.length - 5} więcej
                      </p>
                    )}
                  </div>
                </div>
              )}
              {expiringContent.expiringEpisodes.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Odcinki ({expiringContent.expiringEpisodes.length})</h4>
                  <div className="space-y-1">
                    {expiringContent.expiringEpisodes.slice(0, 5).map((episode) => (
                      <div key={episode.id} className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span>{episode.title}</span>
                        <span className="text-muted-foreground text-xs">
                          ({episode.sourceType || 'brak typu'})
                        </span>
                      </div>
                    ))}
                    {expiringContent.expiringEpisodes.length > 5 && (
                      <p className="text-sm text-muted-foreground">
                        ... i {expiringContent.expiringEpisodes.length - 5} więcej
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configurations List */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : configs.length === 0 ? (
        <Card className="border-white/5 bg-white/5">
          <CardContent className="p-8 text-center">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Brak skonfigurowanych źródeł</h3>
            <p className="text-muted-foreground mb-4">
              Dodaj konfigurację źródła wideo, aby automatycznie odświeżać wygasające linki
            </p>
            <Button onClick={handleNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj Źródło
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {configs.map((config) => (
            <Card key={config.id} className="border-white/5 bg-white/5">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{config.name}</h3>
                      <Badge variant={config.isActive ? 'default' : 'secondary'}>
                        {config.isActive ? 'Aktywne' : 'Nieaktywne'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Server className="h-4 w-4" />
                        {getProviderName(config.provider)}
                      </span>
                      {config.hasApiKey && (
                        <span className="flex items-center gap-1">
                          <Key className="h-4 w-4" />
                          API Key skonfigurowany
                        </span>
                      )}
                      {config.apiEndpoint && (
                        <span className="flex items-center gap-1">
                          <Link className="h-4 w-4" />
                          {config.apiEndpoint}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ostatnia aktualizacja: {formatDate(config.updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(config)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Usunąć konfigurację?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Ta akcja jest nieodwracalna. Konfiguracja "{config.name}" zostanie trwale usunięta.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anuluj</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleDelete(config.id)}
                          >
                            Usuń
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Edytuj Źródło' : 'Dodaj Nowe Źródło'}
            </DialogTitle>
            <DialogDescription>
              Skonfiguruj źródło wideo do automatycznego odświeżania linków
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="np. SaveFiles Production"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Dostawca *</Label>
              <Select
                value={formData.provider}
                onValueChange={(value) => setFormData({ ...formData, provider: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz dostawcę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAVEFILES">SaveFiles.com</SelectItem>
                  <SelectItem value="DIRECT">Bezpośredni URL</SelectItem>
                  <SelectItem value="M3U8">HLS Stream (m3u8)</SelectItem>
                  <SelectItem value="MP4">MP4 Video</SelectItem>
                  <SelectItem value="CUSTOM">Własny</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.provider === 'SAVEFILES' && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder={editingConfig?.hasApiKey ? '•••••••• (zachowaj puste by nie zmieniać)' : 'Wpisz API key'}
                />
                {editingConfig?.hasApiKey && (
                  <p className="text-xs text-muted-foreground">
                    Zostaw puste aby zachować obecny klucz
                  </p>
                )}
              </div>
            )}

            {formData.provider === 'CUSTOM' && (
              <div className="space-y-2">
                <Label htmlFor="apiEndpoint">API Endpoint</Label>
                <Input
                  id="apiEndpoint"
                  value={formData.apiEndpoint}
                  onChange={(e) => setFormData({ ...formData, apiEndpoint: e.target.value })}
                  placeholder="https://api.example.com/refresh"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="font-medium">Aktywne</p>
                <p className="text-sm text-muted-foreground">
                  Włącz automatyczne odświeżanie dla tego źródła
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Zapisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info Card */}
      <Card className="border-blue-500/30 bg-blue-500/5">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-500">Jak to działa?</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>System automatycznie wykrywa wygasające linki (tokeny z datą ważności)</li>
                <li>Możesz ręcznie odświeżyć wszystkie wygasające linki przyciskiem powyżej</li>
                <li>SaveFiles.com wymaga API key do pobrania nowych linków</li>
                <li>Linki bez tokenów (bezpośrednie URL, m3u8) nie wymagają odświeżania</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
