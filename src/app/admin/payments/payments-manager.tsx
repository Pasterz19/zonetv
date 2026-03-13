'use client';

import { useState } from 'react';
import {
  CreditCard,
  Search,
  Download,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpDown,
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  MoreHorizontal,
  Eye,
  RotateCcw,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Payment {
  id: string;
  amount: number;
  originalAmount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';
  provider: string;
  providerId: string | null;
  description: string | null;
  voucherCode: string | null;
  discountAmount: number;
  paidAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
  subscription?: {
    id: string;
    plan: {
      name: string;
    };
  } | null;
}

interface PaymentsManagerProps {
  initialPayments: Payment[];
}

const statusStyles = {
  PENDING: { bg: 'bg-amber-500/10', text: 'text-amber-500', icon: Clock, label: 'Oczekuje' },
  PROCESSING: { bg: 'bg-blue-500/10', text: 'text-blue-500', icon: RefreshCw, label: 'Przetwarzanie' },
  COMPLETED: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', icon: CheckCircle, label: 'Zakończona' },
  FAILED: { bg: 'bg-red-500/10', text: 'text-red-500', icon: XCircle, label: 'Nieudana' },
  REFUNDED: { bg: 'bg-purple-500/10', text: 'text-purple-500', icon: RotateCcw, label: 'Zwrócona' },
  CANCELLED: { bg: 'bg-gray-500/10', text: 'text-gray-500', icon: XCircle, label: 'Anulowana' },
};

const providerLabels: Record<string, string> = {
  stripe: 'Stripe',
  przelewy24: 'Przelewy24',
  payu: 'PayU',
};

export function PaymentsManager({ initialPayments }: PaymentsManagerProps) {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const { toast } = useToast();

  // Calculate stats
  const stats = {
    total: payments.length,
    completed: payments.filter((p) => p.status === 'COMPLETED').length,
    pending: payments.filter((p) => p.status === 'PENDING').length,
    totalRevenue: payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0),
    totalDiscounts: payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.discountAmount, 0),
  };

  // Filter and sort payments
  const filteredPayments = payments
    .filter((p) => {
      const matchesSearch =
        p.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesProvider = providerFilter === 'all' || p.provider === providerFilter;
      return matchesSearch && matchesStatus && matchesProvider;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc'
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
      }
    });

  const handleRefund = async (paymentId: string) => {
    if (!confirm('Czy na pewno chcesz zwrócić tę płatność?')) return;

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/refund`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        setPayments((prev) =>
          prev.map((p) => (p.id === paymentId ? { ...p, status: 'REFUNDED' as const } : p))
        );
        toast({ title: 'Zwrot został zrealizowany' });
      } else {
        toast({ title: 'Błąd', description: result.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Błąd połączenia', variant: 'destructive' });
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Data', 'Użytkownik', 'Email', 'Kwota', 'Status', 'Provider', 'Voucher'];
    const rows = filteredPayments.map((p) => [
      p.id,
      new Date(p.createdAt).toLocaleDateString('pl-PL'),
      p.user.name || '-',
      p.user.email,
      p.amount.toFixed(2),
      p.status,
      p.provider,
      p.voucherCode || '-',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Zarządzanie <span className="text-primary">Płatnościami</span>
          </h1>
          <p className="text-muted-foreground">
            Przeglądaj i zarządzaj płatnościami platformy
          </p>
        </div>
        <Button variant="outline" onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Eksport CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
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
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Zakończone</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Oczekujące</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalRevenue.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Przychód (PLN)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalDiscounts.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Zniżki (PLN)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj po użytkowniku, email, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-72 bg-background border-border"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie statusy</SelectItem>
              <SelectItem value="PENDING">Oczekujące</SelectItem>
              <SelectItem value="COMPLETED">Zakończone</SelectItem>
              <SelectItem value="FAILED">Nieudane</SelectItem>
              <SelectItem value="REFUNDED">Zwrócone</SelectItem>
            </SelectContent>
          </Select>

          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-36 bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszyscy</SelectItem>
              <SelectItem value="stripe">Stripe</SelectItem>
              <SelectItem value="przelewy24">Przelewy24</SelectItem>
              <SelectItem value="payu">PayU</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder((o) => (o === 'desc' ? 'asc' : 'desc'))}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Payments Table */}
      <Card className="border-border bg-card overflow-hidden">
        <ScrollArea className="h-[600px]">
          <div className="min-w-[800px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-muted z-10">
                <tr className="border-b border-border text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-4 text-left">ID / Data</th>
                  <th className="px-6 py-4 text-left">Użytkownik</th>
                  <th className="px-6 py-4 text-left">Kwota</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Provider</th>
                  <th className="px-6 py-4 text-left">Voucher</th>
                  <th className="px-6 py-4 text-right">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPayments.map((payment) => {
                  const style = statusStyles[payment.status];
                  const StatusIcon = style.icon;

                  return (
                    <tr
                      key={payment.id}
                      className="group hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-xs font-mono text-muted-foreground">
                            {payment.id.slice(0, 8)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(payment.createdAt)}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            {(payment.user.name || payment.user.email)[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {payment.user.name || payment.user.email.split('@')[0]}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {payment.user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="font-bold">
                            {payment.amount.toFixed(2)} {payment.currency}
                          </p>
                          {payment.discountAmount > 0 && (
                            <p className="text-xs text-emerald-500">
                              Zniżka: -{payment.discountAmount.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={cn(style.bg, style.text, 'gap-1')}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {style.label}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm">
                          {providerLabels[payment.provider] || payment.provider}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {payment.voucherCode ? (
                          <Badge variant="secondary" className="font-mono text-xs">
                            {payment.voucherCode}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedPayment(payment);
                                setDetailsOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Szczegóły
                            </DropdownMenuItem>
                            {payment.status === 'COMPLETED' && (
                              <>
                                <DropdownMenuItem>
                                  <Receipt className="h-4 w-4 mr-2" />
                                  Faktura
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleRefund(payment.id)}
                                  className="text-red-500 focus:text-red-500"
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Zwrot
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ScrollArea>

        {filteredPayments.length === 0 && (
          <div className="py-12 text-center">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Brak płatności do wyświetlenia</p>
          </div>
        )}
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle>Szczegóły płatności</DialogTitle>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-4 mt-4">
              <div className="p-4 rounded-lg bg-muted space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">ID:</span>
                  <span className="text-xs font-mono">{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Data:</span>
                  <span className="text-sm">{formatDate(selectedPayment.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground text-sm">Status:</span>
                  <Badge
                    variant="outline"
                    className={cn(statusStyles[selectedPayment.status].bg, statusStyles[selectedPayment.status].text)}
                  >
                    {statusStyles[selectedPayment.status].label}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-bold">Użytkownik</h4>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {(selectedPayment.user.name || selectedPayment.user.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{selectedPayment.user.name || 'Brak nazwy'}</p>
                    <p className="text-sm text-muted-foreground">{selectedPayment.user.email}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="text-sm font-bold">Kwota</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kwota pierwotna:</span>
                    <span>{selectedPayment.originalAmount.toFixed(2)} {selectedPayment.currency}</span>
                  </div>
                  {selectedPayment.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Zniżka:</span>
                      <span>-{selectedPayment.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t border-border">
                    <span>Do zapłaty:</span>
                    <span>{selectedPayment.amount.toFixed(2)} {selectedPayment.currency}</span>
                  </div>
                </div>
              </div>

              {selectedPayment.voucherCode && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold">Voucher</h4>
                    <Badge variant="secondary" className="font-mono">
                      {selectedPayment.voucherCode}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
