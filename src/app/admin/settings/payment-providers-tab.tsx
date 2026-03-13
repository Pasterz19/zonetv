'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit,
  Save,
  Loader2,
  Key,
  Building,
  Check,
  X,
  AlertCircle,
  TestTube
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

interface PaymentProviderConfig {
  id: string;
  provider: string;
  apiKey: string | null;
  hasApiKey: boolean;
  apiSecret: string | null;
  hasApiSecret: boolean;
  merchantId: string | null;
  isTestMode: boolean;
  isActive: boolean;
  settings: string | null;
  createdAt: string;
  updatedAt: string;
}

export function PaymentProvidersTab() {
  const [configs, setConfigs] = useState<PaymentProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PaymentProviderConfig | null>(null);
  const [formData, setFormData] = useState({
    provider: 'STRIPE',
    apiKey: '',
    apiSecret: '',
    merchantId: '',
    isTestMode: true,
    isActive: true,
  });

  // Fetch configs
  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/payments/config');
      const data = await res.json();
      setConfigs(data.configs || []);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast.error('Nie udało się pobrać konfiguracji');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  // Open dialog for new config
  const handleNew = () => {
    setEditingConfig(null);
    setFormData({
      provider: 'STRIPE',
      apiKey: '',
      apiSecret: '',
      merchantId: '',
      isTestMode: true,
      isActive: true,
    });
    setDialogOpen(true);
  };

  // Open dialog for editing
  const handleEdit = (config: PaymentProviderConfig) => {
    setEditingConfig(config);
    setFormData({
      provider: config.provider,
      apiKey: '', // Don't show existing key
      apiSecret: '', // Don't show existing secret
      merchantId: config.merchantId || '',
      isTestMode: config.isTestMode,
      isActive: config.isActive,
    });
    setDialogOpen(true);
  };

  // Save config
  const handleSave = async () => {
    if (!formData.provider) {
      toast.error('Wybierz dostawcę');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/payments/config', {
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
      const res = await fetch(`/api/payments/config?id=${id}`, {
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

  // Test connection
  const handleTest = async (config: PaymentProviderConfig) => {
    try {
      setTesting(config.id);
      const res = await fetch(`/api/payments/config/test?provider=${config.provider}`);
      const data = await res.json();
      
      if (data.success) {
        toast.success(`Połączenie z ${config.provider} działa poprawnie`);
      } else {
        toast.error(data.error || 'Nie udało się połączyć');
      }
    } catch (error) {
      console.error('Error testing config:', error);
      toast.error('Nie udało się przetestować połączenia');
    } finally {
      setTesting(null);
    }
  };

  // Get provider display name
  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      STRIPE: 'Stripe',
      PRZELEWY24: 'Przelewy24',
      PAYU: 'PayU',
      PAYPAL: 'PayPal',
    };
    return names[provider] || provider;
  };

  // Get provider icon color
  const getProviderColor = (provider: string) => {
    const colors: Record<string, string> = {
      STRIPE: 'text-purple-500 bg-purple-500/10',
      PRZELEWY24: 'text-blue-500 bg-blue-500/10',
      PAYU: 'text-green-500 bg-green-500/10',
      PAYPAL: 'text-blue-600 bg-blue-600/10',
    };
    return colors[provider] || 'text-gray-500 bg-gray-500/10';
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
            <CreditCard className="h-6 w-6 text-primary" />
            Dostawcy Płatności
          </h2>
          <p className="text-muted-foreground">
            Konfiguracja bramek płatności online
          </p>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Dodaj Dostawcę
        </Button>
      </div>

      {/* Configurations List */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : configs.length === 0 ? (
        <Card className="border-white/5 bg-white/5">
          <CardContent className="p-8 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Brak skonfigurowanych dostawców</h3>
            <p className="text-muted-foreground mb-4">
              Dodaj konfigurację dostawcy płatności, aby umożliwić użytkownikom zakup subskrypcji
            </p>
            <Button onClick={handleNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj Dostawcę
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
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getProviderColor(config.provider)}`}>
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <h3 className="font-semibold">{getProviderName(config.provider)}</h3>
                      <Badge variant={config.isActive ? 'default' : 'secondary'}>
                        {config.isActive ? 'Aktywny' : 'Nieaktywny'}
                      </Badge>
                      {config.isTestMode && (
                        <Badge variant="outline" className="text-amber-500 border-amber-500/30">
                          Test Mode
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {config.hasApiKey && (
                        <span className="flex items-center gap-1">
                          <Key className="h-4 w-4" />
                          API Key skonfigurowany
                        </span>
                      )}
                      {config.hasApiSecret && (
                        <span className="flex items-center gap-1">
                          <Key className="h-4 w-4" />
                          Secret skonfigurowany
                        </span>
                      )}
                      {config.merchantId && (
                        <span className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          {config.merchantId}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ostatnia aktualizacja: {formatDate(config.updatedAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(config)}
                      disabled={testing === config.id}
                      className="gap-1"
                    >
                      {testing === config.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                      Test
                    </Button>
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
                            Ta akcja jest nieodwracalna. Konfiguracja {getProviderName(config.provider)} zostanie trwale usunięta.
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
              {editingConfig ? 'Edytuj Dostawcę' : 'Dodaj Nowego Dostawcę'}
            </DialogTitle>
            <DialogDescription>
              Skonfiguruj dostawcę płatności
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Dostawca *</Label>
              <Select
                value={formData.provider}
                onValueChange={(value) => setFormData({ ...formData, provider: value })}
                disabled={!!editingConfig}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz dostawcę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STRIPE">Stripe</SelectItem>
                  <SelectItem value="PRZELEWY24">Przelewy24</SelectItem>
                  <SelectItem value="PAYU">PayU</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.provider === 'STRIPE' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key (Secret Key)</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder={editingConfig?.hasApiKey ? '•••••••• (zachowaj puste by nie zmieniać)' : 'sk_test_... lub sk_live_...'}
                  />
                  {editingConfig?.hasApiKey && (
                    <p className="text-xs text-muted-foreground">
                      Zostaw puste aby zachować obecny klucz
                    </p>
                  )}
                </div>
              </>
            )}

            {formData.provider === 'PRZELEWY24' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="merchantId">Merchant ID (posId)</Label>
                  <Input
                    id="merchantId"
                    value={formData.merchantId}
                    onChange={(e) => setFormData({ ...formData, merchantId: e.target.value })}
                    placeholder="np. 123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key (Reports Key)</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder={editingConfig?.hasApiKey ? '••••••••' : 'Wpisz API key'}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiSecret">CRC Key</Label>
                  <Input
                    id="apiSecret"
                    type="password"
                    value={formData.apiSecret}
                    onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                    placeholder={editingConfig?.hasApiSecret ? '••••••••' : 'Wpisz CRC key'}
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="font-medium">Tryb Testowy</p>
                <p className="text-sm text-muted-foreground">
                  Użyj środowiska testowego dostawcy
                </p>
              </div>
              <Switch
                checked={formData.isTestMode}
                onCheckedChange={(checked) => setFormData({ ...formData, isTestMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="font-medium">Aktywny</p>
                <p className="text-sm text-muted-foreground">
                  Włącz tego dostawcę płatności
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
              <p className="font-medium text-blue-500">Konfiguracja webhook</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Stripe:</strong> Ustaw webhook URL na: <code className="text-xs bg-white/10 px-1 rounded">/api/payments/webhook</code></li>
                <li><strong>Przelewy24:</strong> Dodaj URL powrotu w panelu merchanta</li>
                <li>W trybie testowym używaj testowych kluczy API</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
