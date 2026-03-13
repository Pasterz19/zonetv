'use client';

import { useState, useTransition } from 'react';
import {
  Tag,
  Plus,
  Search,
  Loader2,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Percent,
  DollarSign,
  Gift,
  Sparkles,
  Copy,
  Download,
  Calendar,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Voucher {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL';
  value: number;
  isActive: boolean;
  currentUses: number;
  maxUses: number | null;
  maxPerUser: number;
  validFrom: string;
  validUntil: string | null;
  description: string | null;
  planId: string | null;
  createdAt: string;
}

interface VouchersManagerProps {
  initialVouchers: Voucher[];
  plans: Array<{ id: string; name: string }>;
}

const typeStyles = {
  PERCENTAGE: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: Percent, label: 'Procent' },
  FIXED_AMOUNT: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: DollarSign, label: 'Kwota' },
  FREE_TRIAL: { bg: 'bg-purple-500/10', text: 'text-purple-500', icon: Gift, label: 'Darmowy okres' },
};

function CreateVoucherDialog({
  plans,
  onCreate,
  trigger,
}: {
  plans: Array<{ id: string; name: string }>;
  onCreate: (data: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [voucherType, setVoucherType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL'>('PERCENTAGE');
  const { toast } = useToast();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const data = {
        code: formData.get('code'),
        type: voucherType,
        value: parseFloat(formData.get('value') as string),
        maxUses: formData.get('maxUses') ? parseInt(formData.get('maxUses') as string, 10) : null,
        maxPerUser: parseInt(formData.get('maxPerUser') as string, 10) || 1,
        validUntil: formData.get('validUntil') || null,
        planId: formData.get('planId') || null,
        description: formData.get('description') || null,
      };

      const result = await onCreate(data);

      if (result.success) {
        toast({ title: 'Voucher utworzony', description: 'Kod został dodany do systemu' });
        setOpen(false);
      } else {
        toast({ title: 'Błąd', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Utwórz Voucher
          </DialogTitle>
          <DialogDescription>
            Dodaj nowy kod promocyjny do systemu
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="code">Kod</Label>
            <Input
              id="code"
              name="code"
              placeholder="np. ZONE2024"
              className="uppercase bg-background border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Typ zniżki</Label>
            <Select
              name="type"
              value={voucherType}
              onValueChange={(v) => setVoucherType(v as typeof voucherType)}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Procent zniżki</SelectItem>
                <SelectItem value="FIXED_AMOUNT">Stała kwota</SelectItem>
                <SelectItem value="FREE_TRIAL">Darmowy okres próbny</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">
              {voucherType === 'PERCENTAGE' ? 'Procent (%)' : 
               voucherType === 'FIXED_AMOUNT' ? 'Kwota (PLN)' : 'Dni'}
            </Label>
            <Input
              id="value"
              name="value"
              type="number"
              placeholder={voucherType === 'PERCENTAGE' ? '20' : 
                           voucherType === 'FIXED_AMOUNT' ? '10' : '7'}
              className="bg-background border-border"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxUses">Max użyć (ogółem)</Label>
              <Input
                id="maxUses"
                name="maxUses"
                type="number"
                placeholder="∞"
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPerUser">Max na użytkownika</Label>
              <Input
                id="maxPerUser"
                name="maxPerUser"
                type="number"
                defaultValue="1"
                className="bg-background border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="validUntil">Ważny do</Label>
            <Input
              id="validUntil"
              name="validUntil"
              type="date"
              className="bg-background border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="planId">Dotyczy planu (opcjonalnie)</Label>
            <Select name="planId">
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Wszystkie plany" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Wszystkie plany</SelectItem>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis (opcjonalnie)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Opis voucheru..."
              className="bg-background border-border"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Utwórz Voucher
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function BulkVoucherDialog({
  plans,
  onGenerate,
  trigger,
}: {
  plans: Array<{ id: string; name: string }>;
  onGenerate: (data: Record<string, unknown>) => Promise<{ success: boolean; codes?: string[]; error?: string }>;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [voucherType, setVoucherType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL'>('PERCENTAGE');
  const { toast } = useToast();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const data = {
        count: parseInt(formData.get('count') as string, 10),
        prefix: formData.get('prefix') || 'ZONE',
        type: voucherType,
        value: parseFloat(formData.get('value') as string),
        maxUses: formData.get('maxUses') ? parseInt(formData.get('maxUses') as string, 10) : null,
        validUntil: formData.get('validUntil') || null,
        description: formData.get('description') || null,
      };

      const result = await onGenerate(data);

      if (result.success && result.codes) {
        setGeneratedCodes(result.codes);
        toast({ title: 'Vouchery utworzone', description: `Wygenerowano ${result.codes.length} kodów` });
      } else {
        toast({ title: 'Błąd', description: result.error, variant: 'destructive' });
      }
    });
  };

  const copyAllCodes = () => {
    navigator.clipboard.writeText(generatedCodes.join('\n'));
    toast({ title: 'Skopiowano', description: 'Kody zostały skopiowane do schowka' });
  };

  const downloadCodes = () => {
    const blob = new Blob([generatedCodes.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vouchery.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Masowe Generowanie Voucherów
          </DialogTitle>
        </DialogHeader>

        {generatedCodes.length === 0 ? (
          <form action={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="count">Ilość</Label>
                <Input
                  id="count"
                  name="count"
                  type="number"
                  defaultValue="10"
                  min={1}
                  max={100}
                  className="bg-background border-border"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prefix">Prefiks</Label>
                <Input
                  id="prefix"
                  name="prefix"
                  placeholder="ZONE"
                  defaultValue="ZONE"
                  className="bg-background border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Typ zniżki</Label>
              <Select
                name="type"
                value={voucherType}
                onValueChange={(v) => setVoucherType(v as typeof voucherType)}
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Procent zniżki</SelectItem>
                  <SelectItem value="FIXED_AMOUNT">Stała kwota</SelectItem>
                  <SelectItem value="FREE_TRIAL">Darmowy okres próbny</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">
                {voucherType === 'PERCENTAGE' ? 'Procent (%)' : 
                 voucherType === 'FIXED_AMOUNT' ? 'Kwota (PLN)' : 'Dni'}
              </Label>
              <Input
                id="value"
                name="value"
                type="number"
                className="bg-background border-border"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxUses">Max użyć</Label>
                <Input
                  id="maxUses"
                  name="maxUses"
                  type="number"
                  placeholder="∞"
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validUntil">Ważny do</Label>
                <Input
                  id="validUntil"
                  name="validUntil"
                  type="date"
                  className="bg-background border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Input
                id="description"
                name="description"
                placeholder="Opis..."
                className="bg-background border-border"
              />
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generuj Vouchery
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-sm text-emerald-500 font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Wygenerowano {generatedCodes.length} voucherów!
              </p>
            </div>

            <div className="max-h-60 overflow-y-auto bg-background rounded-lg p-3 border border-border">
              {generatedCodes.map((code, i) => (
                <div key={i} className="text-sm font-mono py-1 flex items-center gap-2">
                  <span className="text-muted-foreground">{i + 1}.</span>
                  {code}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={copyAllCodes} className="flex-1 gap-2">
                <Copy className="h-4 w-4" />
                Kopiuj
              </Button>
              <Button variant="outline" onClick={downloadCodes} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Pobierz
              </Button>
              <Button onClick={() => setGeneratedCodes([])} className="flex-1">
                Nowe
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function VouchersManager({ initialVouchers, plans }: VouchersManagerProps) {
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterType, setFilterType] = useState<'all' | 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_TRIAL'>('all');
  const { toast } = useToast();

  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch = v.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive =
      filterActive === 'all' ||
      (filterActive === 'active' && v.isActive) ||
      (filterActive === 'inactive' && !v.isActive);
    const matchesType = filterType === 'all' || v.type === filterType;
    return matchesSearch && matchesActive && matchesType;
  });

  const stats = {
    total: vouchers.length,
    active: vouchers.filter((v) => v.isActive).length,
    used: vouchers.reduce((sum, v) => sum + v.currentUses, 0),
  };

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh list
        setVouchers((prev) => [{ ...data, id: result.voucher.id, currentUses: 0, createdAt: new Date().toISOString(), validFrom: new Date().toISOString() } as Voucher, ...prev]);
        return { success: true };
      }

      return { success: false, error: result.error };
    } catch {
      return { success: false, error: 'Błąd połączenia' };
    }
  };

  const handleBulkGenerate = async (data: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/vouchers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh vouchers list after bulk generation
        window.location.reload();
        return { success: true, codes: result.codes };
      }

      return { success: false, error: result.error };
    } catch {
      return { success: false, error: 'Błąd połączenia' };
    }
  };

  const handleToggleActive = async (voucherId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/vouchers/${voucherId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const result = await response.json();

      if (result.success) {
        setVouchers((prev) =>
          prev.map((v) => (v.id === voucherId ? { ...v, isActive: !currentStatus } : v))
        );
        toast({
          title: currentStatus ? 'Voucher dezaktywowany' : 'Voucher aktywowany',
        });
      }
    } catch {
      toast({ title: 'Błąd', description: 'Nie udało się zaktualizować', variant: 'destructive' });
    }
  };

  const handleDelete = async (voucherId: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten voucher?')) return;

    try {
      const response = await fetch(`/api/vouchers/${voucherId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setVouchers((prev) => prev.filter((v) => v.id !== voucherId));
        toast({ title: 'Voucher usunięty' });
      }
    } catch {
      toast({ title: 'Błąd', description: 'Nie udało się usunąć', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Zarządzanie <span className="text-primary">Voucherami</span>
          </h1>
          <p className="text-muted-foreground">
            {stats.total} voucherów • {stats.active} aktywnych • {stats.used} użyć
          </p>
        </div>
        <div className="flex gap-2">
          <BulkVoucherDialog
            plans={plans}
            onGenerate={handleBulkGenerate}
            trigger={
              <Button variant="outline" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Masowo
              </Button>
            }
          />
          <CreateVoucherDialog
            plans={plans}
            onCreate={handleCreate}
            trigger={
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Nowy Voucher
              </Button>
            }
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Wszystkie</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Aktywne</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.used}</p>
              <p className="text-xs text-muted-foreground">Użyć</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj po kodzie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64 bg-background border-border"
          />
        </div>

        <div className="flex gap-2">
          <div className="flex rounded-lg bg-muted p-1">
            {[
              { value: 'all', label: 'Wszystkie' },
              { value: 'active', label: 'Aktywne' },
              { value: 'inactive', label: 'Nieaktywne' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilterActive(option.value as typeof filterActive)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm transition-colors',
                  filterActive === option.value
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
            <SelectTrigger className="w-40 bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie typy</SelectItem>
              <SelectItem value="PERCENTAGE">Procent</SelectItem>
              <SelectItem value="FIXED_AMOUNT">Kwota</SelectItem>
              <SelectItem value="FREE_TRIAL">Darmowy okres</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vouchers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVouchers.map((voucher) => {
          const style = typeStyles[voucher.type];
          const Icon = style.icon;

          return (
            <Card
              key={voucher.id}
              className={cn(
                'border transition-all',
                voucher.isActive ? 'border-border' : 'border-red-500/20 opacity-60'
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-mono">{voucher.code}</CardTitle>
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', style.bg)}>
                    <Icon className={cn('h-4 w-4', style.text)} />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={style.text}>
                    {voucher.type === 'PERCENTAGE' && `${voucher.value}% zniżki`}
                    {voucher.type === 'FIXED_AMOUNT' && `${voucher.value} PLN`}
                    {voucher.type === 'FREE_TRIAL' && `${voucher.value} dni za darmo`}
                  </Badge>
                  {voucher.isActive ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                      Aktywny
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                      Nieaktywny
                    </Badge>
                  )}
                </div>

                {voucher.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{voucher.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {voucher.currentUses} / {voucher.maxUses || '∞'}
                  </div>
                  {voucher.validUntil && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(voucher.validUntil).toLocaleDateString('pl-PL')}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Status:</span>
                    <Switch
                      checked={voucher.isActive}
                      onCheckedChange={() => handleToggleActive(voucher.id, voucher.isActive)}
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(voucher.code)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Kopiuj kod
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(voucher.id)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Usuń
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredVouchers.length === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="py-12 text-center">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Brak voucherów do wyświetlenia</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
