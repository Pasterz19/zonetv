'use client';

import { useState, useTransition } from 'react';
import {
  Users,
  Search,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Mail,
  Trash2,
  X,
  Loader2,
  Filter,
  Download,
  MoreVertical,
  Crown,
  User,
  Check,
  AlertCircle,
  CreditCard,
  Clock,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  subscription: {
    active: boolean;
    planId: string;
    planName: string;
    endsAt: string | null;
  } | null;
}

interface Plan {
  id: string;
  name: string;
  tier: number;
  price: number;
}

interface UserManagementProps {
  users: User[];
  plans: Plan[];
  currentUser: string;
  createUser: (formData: FormData) => Promise<void>;
  deleteUser: (formData: FormData) => Promise<void>;
  updateUserRole: (formData: FormData) => Promise<void>;
  assignSubscription: (formData: FormData) => Promise<void>;
  revokeSubscription: (formData: FormData) => Promise<void>;
}

function AddUserDialog({
  onCreate,
  trigger
}: {
  onCreate: (formData: FormData) => Promise<void>;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await onCreate(formData);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md bg-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Dodaj Użytkownika
          </DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email</label>
            <Input name="email" type="email" placeholder="email@example.com" required className="bg-white/5 border-white/10" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Nazwa (opcjonalnie)</label>
            <Input name="name" placeholder="Nazwa użytkownika" className="bg-white/5 border-white/10" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Hasło</label>
            <Input name="password" type="password" required className="bg-white/5 border-white/10" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rola</label>
            <select name="role" className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm">
              <option value="USER">Użytkownik</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
            Utwórz Konto
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AssignSubscriptionDialog({
  user,
  plans,
  onAssign,
  trigger
}: {
  user: User;
  plans: Plan[];
  onAssign: (formData: FormData) => Promise<void>;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await onAssign(formData);
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md bg-card border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Przypisz Subskrypcję
          </DialogTitle>
        </DialogHeader>
        <div className="mt-2 mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-sm font-medium">{user.name || user.email.split('@')[0]}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
        <form action={handleSubmit} className="space-y-4 mt-4">
          <input type="hidden" name="userId" value={user.id} />
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Plan Subskrypcji</label>
            <select name="planId" className="w-full h-10 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm" defaultValue={user.subscription?.planId || ''}>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.price === 0 ? 'Gratis' : `${plan.price} PLN/mies.`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Czas trwania (dni)</label>
            <Input name="durationDays" type="number" defaultValue={30} min={1} max={365} className="bg-white/5 border-white/10" />
            <p className="text-xs text-muted-foreground">Domyślnie 30 dni. Wpisz 365 dla rocznej subskrypcji.</p>
          </div>
          
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
            Przypisz Subskrypcję
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UserManagement({
  users,
  plans,
  currentUser,
  createUser,
  deleteUser,
  updateUserRole,
  assignSubscription,
  revokeSubscription
}: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'USER' | 'ADMIN'>('all');
  const [isPending, startTransition] = useTransition();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    activeSubs: users.filter(u => u.subscription?.active).length,
    newThisWeek: users.filter(u => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(u.createdAt) > weekAgo;
    }).length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            Zarządzanie <span className="text-primary">Użytkownikami</span>
          </h1>
          <p className="text-muted-foreground">
            {stats.total} użytkowników • {stats.activeSubs} aktywnych subskrypcji
          </p>
        </div>
        <AddUserDialog
          onCreate={createUser}
          trigger={
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Dodaj Użytkownika
            </Button>
          }
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-white/5 bg-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Wszyscy</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.admins}</p>
              <p className="text-xs text-muted-foreground">Administratorów</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeSubs}</p>
              <p className="text-xs text-muted-foreground">Aktywnych</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.newThisWeek}</p>
              <p className="text-xs text-muted-foreground">Nowych (7 dni)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Szukaj użytkowników..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-white/5 border-white/10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex rounded-lg bg-white/5 p-1">
            <Button
              variant={roleFilter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setRoleFilter('all')}
              className="h-8 rounded-md text-xs"
            >
              Wszyscy
            </Button>
            <Button
              variant={roleFilter === 'USER' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setRoleFilter('USER')}
              className="h-8 rounded-md text-xs"
            >
              Użytkownicy
            </Button>
            <Button
              variant={roleFilter === 'ADMIN' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setRoleFilter('ADMIN')}
              className="h-8 rounded-md text-xs"
            >
              Admini
            </Button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <Card className="border-white/5 bg-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <th className="px-6 py-4">Użytkownik</th>
                <th className="px-6 py-4">Rola</th>
                <th className="px-6 py-4">Subskrypcja</th>
                <th className="px-6 py-4">Data Dołączenia</th>
                <th className="px-6 py-4 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                        {(user.name || user.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{user.name || user.email.split('@')[0]}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <form action={updateUserRole} className="inline">
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="role" value={user.role === 'ADMIN' ? 'USER' : 'ADMIN'} />
                      <button
                        type="submit"
                        disabled={user.id === currentUser}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                          user.role === 'ADMIN'
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-muted text-muted-foreground hover:bg-white/10"
                        )}
                      >
                        {user.role === 'ADMIN' ? (
                          <>
                            <Crown className="h-3 w-3" />
                            ADMIN
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3" />
                            USER
                          </>
                        )}
                      </button>
                    </form>
                  </td>
                  <td className="px-6 py-4">
                    {user.subscription ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={user.subscription.active ? 'default' : 'secondary'}
                          className={cn(
                            "text-xs",
                            user.subscription.active && "bg-emerald-500/10 text-emerald-500"
                          )}
                        >
                          {user.subscription.planName}
                        </Badge>
                        {user.subscription.endsAt && (
                          <span className="text-xs text-muted-foreground">
                            do {new Date(user.subscription.endsAt).toLocaleDateString('pl-PL')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Brak</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(user.createdAt).toLocaleDateString('pl-PL')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem className="gap-2">
                          <Mail className="h-4 w-4" />
                          Wyślij wiadomość
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AssignSubscriptionDialog
                          user={user}
                          plans={plans}
                          onAssign={assignSubscription}
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2">
                              <Gift className="h-4 w-4" />
                              Przypisz subskrypcję
                            </DropdownMenuItem>
                          }
                        />
                        {user.subscription?.active && (
                          <form action={revokeSubscription}>
                            <input type="hidden" name="userId" value={user.id} />
                            <DropdownMenuItem asChild className="text-amber-500 focus:text-amber-500">
                              <button type="submit" className="flex items-center gap-2 w-full">
                                <Clock className="h-4 w-4" />
                                Wycofaj subskrypcję
                              </button>
                            </DropdownMenuItem>
                          </form>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="text-red-500 focus:text-red-500">
                          <form action={deleteUser}>
                            <input type="hidden" name="userId" value={user.id} />
                            <button
                              type="submit"
                              disabled={user.id === currentUser}
                              className="flex items-center gap-2 w-full"
                            >
                              <Trash2 className="h-4 w-4" />
                              Usuń użytkownika
                            </button>
                          </form>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Nie znaleziono użytkowników</p>
          </div>
        )}
      </Card>
    </div>
  );
}
