'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Film,
  MonitorPlay,
  Radio,
  Users,
  Settings,
  ArrowLeft,
  Activity,
  Zap,
  BarChart3,
  Bell,
  Database,
  Shield,
  Globe,
  CreditCard,
  Palette,
  LogOut,
  Menu,
  X,
  Satellite,
  HardDrive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
  {
    category: 'Główne',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    category: 'Treści',
    items: [
      { href: '/admin/content', label: 'Zarządzanie Treścią', icon: Film },
      { href: '/admin/e2-import', label: 'Import E2', icon: Satellite },
      { href: '/admin/bzyk83-import', label: 'Import Bzyk83', icon: HardDrive },
      { href: '/admin/importer', label: 'Importer', icon: Zap },
      { href: '/admin/monitoring', label: 'Monitoring TV', icon: Activity },
    ]
  },
  {
    category: 'Użytkownicy',
    items: [
      { href: '/admin/users', label: 'Użytkownicy', icon: Users },
      { href: '/admin/plans', label: 'Plany Subskrypcji', icon: CreditCard },
      { href: '/admin/payments', label: 'Płatności', icon: CreditCard },
    ]
  },
  {
    category: 'Analityka',
    items: [
      { href: '/admin/analytics', label: 'Statystyki', icon: BarChart3 },
    ]
  },
  {
    category: 'System',
    items: [
      { href: '/admin/settings', label: 'Ustawienia', icon: Settings },
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(path);
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b border-white/5 bg-card/95 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20">
            Z
          </div>
          <div>
            <span className="text-base font-black uppercase tracking-tighter">Admin</span>
            <span className="text-primary font-black">Zone</span>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-72 border-r border-white/5 bg-card/95 backdrop-blur-xl transition-transform duration-300 lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col pt-16">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20">
              Z
            </div>
            <div>
              <span className="text-lg font-black uppercase tracking-tighter">Admin</span>
              <span className="text-primary font-black">Zone</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {navItems.map((group) => (
              <div key={group.category} className="mb-6">
                <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {group.category}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                        isActive(item.href)
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/5 p-4 space-y-2">
            <Link
              href="/"
              onClick={handleNavClick}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Powrót do strony
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
                Wyloguj się
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl transition-transform lg:translate-x-0 hidden lg:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20">
              Z
            </div>
            <div>
              <span className="text-lg font-black uppercase tracking-tighter">Admin</span>
              <span className="text-primary font-black">Zone</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {navItems.map((group) => (
              <div key={group.category} className="mb-6">
                <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  {group.category}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                        isActive(item.href)
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/5 p-4 space-y-2">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/5 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Powrót do strony
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-red-500/10 hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
                Wyloguj się
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
