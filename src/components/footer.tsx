"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-black py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">Z</div>
              <span className="font-bold text-xl uppercase tracking-tighter">ZoneTV</span>
          </div>
          <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ZoneTV Inc. Wszelkie prawa zastrzeżone.
          </div>
          <div className="flex gap-6 text-sm font-medium text-muted-foreground">
              <Link href="#" className="hover:text-white transition-colors">Regulamin</Link>
              <Link href="#" className="hover:text-white transition-colors">Prywatność</Link>
              <Link href="#" className="hover:text-white transition-colors">Kontakt</Link>
          </div>
      </div>
    </footer>
  );
}
