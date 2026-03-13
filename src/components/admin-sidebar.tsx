"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Film, 
  Users, 
  Settings, 
  ArrowLeft,
  Activity,
  Zap
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(path);
  };

  const navItems = [
    { 
      href: "/admin", 
      label: "Dashboard", 
      icon: LayoutDashboard 
    },
    { 
      href: "/admin/content", 
      label: "Treści VOD", 
      icon: Film 
    },
    { 
      href: "/admin/importer-beta", 
      label: "Importer", 
      icon: Zap 
    },
    { 
      href: "/admin/users", 
      label: "Użytkownicy", 
      icon: Users 
    },
    { 
      href: "/admin/monitoring", 
      label: "Monitoring", 
      icon: Activity 
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl transition-transform lg:translate-x-0 hidden lg:block">
      <div className="flex h-full flex-col px-4 py-8">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20">Z</div>
          <span className="text-xl font-black uppercase tracking-tighter">Admin<span className="text-primary">Zone</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href} 
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all border",
                isActive(item.href)
                  ? "text-primary bg-primary/5 border-primary/20 shadow-[0_0_20px_-5px_rgba(255,0,0,0.1)]" // Active style matching "red frame" intent
                  : "text-muted-foreground border-transparent hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-8 border-t border-white/5">
           <Link 
            href="/" 
            className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold text-muted-foreground transition-all hover:bg-white/5 hover:text-white border border-transparent"
          >
            <ArrowLeft className="h-5 w-5" />
            Powrót do strony
          </Link>
          <Link 
            href="/admin/settings" 
            className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all border",
                isActive("/admin/settings")
                  ? "text-primary bg-primary/5 border-primary/20 shadow-[0_0_20px_-5px_rgba(255,0,0,0.1)]"
                  : "text-muted-foreground border-transparent hover:bg-white/5 hover:text-white"
            )}
          >
            <Settings className="h-5 w-5" />
            Ustawienia
          </Link>
        </div>
      </div>
    </aside>
  );
}
