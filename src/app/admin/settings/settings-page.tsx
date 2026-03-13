'use client';

import { useState } from 'react';
import {
  Settings,
  Globe,
  Palette,
  Bell,
  Shield,
  Database,
  Server,
  Mail,
  Key,
  Save,
  Loader2,
  RefreshCw,
  Trash2,
  AlertCircle,
  Video
} from 'lucide-react';
import { VideoSourcesTab } from './video-sources-tab';
import { PaymentProvidersTab } from './payment-providers-tab';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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

export function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Ustawienia <span className="text-primary">Systemu</span>
          </h1>
          <p className="text-muted-foreground">
            Konfiguracja platformy ZoneTV
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Zapisz Zmiany
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white/5 border border-white/5 rounded-xl h-12 flex-wrap">
          <TabsTrigger value="general" className="rounded-lg">Ogólne</TabsTrigger>
          <TabsTrigger value="video-sources" className="rounded-lg">Źródła Wideo</TabsTrigger>
          <TabsTrigger value="payments" className="rounded-lg">Płatności</TabsTrigger>
          <TabsTrigger value="appearance" className="rounded-lg">Wygląd</TabsTrigger>
          <TabsTrigger value="notifications" className="rounded-lg">Powiadomienia</TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg">Bezpieczeństwo</TabsTrigger>
          <TabsTrigger value="maintenance" className="rounded-lg">Utrzymanie</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card className="border-white/5 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Ustawienia Ogólne
              </CardTitle>
              <CardDescription>Podstawowa konfiguracja platformy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nazwa Platformy</label>
                  <Input defaultValue="ZoneTV" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Platformy</label>
                  <Input defaultValue="https://zonetv.pl" className="bg-white/5 border-white/10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Opis Platformy</label>
                <textarea
                  className="w-full rounded-md bg-white/5 border border-white/10 p-3 text-sm min-h-[80px]"
                  defaultValue="Twoja platforma VOD i TV Live"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="font-medium">Tryb Przeglądarki</p>
                  <p className="text-sm text-muted-foreground">Włącz interfejs zoptymalizowany pod telewizory</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Ustawienia Email
              </CardTitle>
              <CardDescription>Konfiguracja wysyłki powiadomień email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">SMTP Server</label>
                  <Input placeholder="smtp.example.com" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Port</label>
                  <Input placeholder="587" className="bg-white/5 border-white/10" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <Input placeholder="username" className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Sources Settings */}
        <TabsContent value="video-sources" className="space-y-6 mt-6">
          <VideoSourcesTab />
        </TabsContent>

        {/* Payment Providers Settings */}
        <TabsContent value="payments" className="space-y-6 mt-6">
          <PaymentProvidersTab />
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card className="border-white/5 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Wygląd i Motyw
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-primary/10 border-2 border-primary cursor-pointer">
                  <div className="h-8 w-full rounded bg-primary mb-2" />
                  <p className="text-sm font-medium text-center">Czerwony</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-white/30">
                  <div className="h-8 w-full rounded bg-blue-500 mb-2" />
                  <p className="text-sm font-medium text-center">Niebieski</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:border-white/30">
                  <div className="h-8 w-full rounded bg-purple-500 mb-2" />
                  <p className="text-sm font-medium text-center">Fioletowy</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="font-medium">Ciemny Motyw</p>
                  <p className="text-sm text-muted-foreground">Domyślny tryb ciemny</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="font-medium">Animacje</p>
                  <p className="text-sm text-muted-foreground">Włącz animacje interfejsu</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card className="border-white/5 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Powiadomienia Systemowe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { title: 'Nowi użytkownicy', desc: 'Powiadomienia o nowych rejestracjach' },
                { title: 'Nowe subskrypcje', desc: 'Powiadomienia o nowych subskrypcjach' },
                { title: 'Błędy systemowe', desc: 'Alerty o błędach i problemach' },
                { title: 'Raporty dzienne', desc: 'Codzienne podsumowanie aktywności' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={i < 3} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card className="border-white/5 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Bezpieczeństwo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="font-medium">Dwuskładnikowe Uwierzytelnianie</p>
                  <p className="text-sm text-muted-foreground">Wymagaj 2FA dla administratorów</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <p className="font-medium">Sesja Wygasa Po</p>
                  <p className="text-sm text-muted-foreground">Automatyczne wylogowanie po nieaktywności</p>
                </div>
                <select className="h-9 rounded-md border border-white/10 bg-white/5 px-3 text-sm">
                  <option>1 godzina</option>
                  <option>24 godziny</option>
                  <option selected>7 dni</option>
                  <option>30 dni</option>
                </select>
              </div>

              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-500">Zalecenie Bezpieczeństwa</p>
                    <p className="text-sm text-muted-foreground">
                      Zalecamy włączenie 2FA dla wszystkich kont administratorów.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Settings */}
        <TabsContent value="maintenance" className="space-y-6 mt-6">
          <Card className="border-white/5 bg-white/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Utrzymanie Bazy Danych
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Rozmiar bazy</p>
                  <p className="text-2xl font-bold">-- MB</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg">
                  <p className="text-sm text-muted-foreground">Ostatnia kopia</p>
                  <p className="text-2xl font-bold">--</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Wyczyść Cache
                </Button>
                <Button variant="outline" className="gap-2">
                  <Database className="h-4 w-4" />
                  Utwórz Kopię
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-red-500/5">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Strefa Zagrożenia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Te akcje są nieodwracalne. Proszę zachować ostrożność.
              </p>

              <div className="flex flex-wrap gap-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Wyczyść Wszystkie Dane
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Czy jesteś absolutnie pewien?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ta akcja trwale usunie wszystkie dane z platformy, w tym użytkowników,
                        filmy, seriale i kanały. Tej operacji nie można cofnąć.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-500 hover:bg-red-600">
                        Tak, usuń wszystko
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
