import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { E2Importer } from "./e2-importer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Satellite } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function E2ImportPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Satellite className="h-8 w-8" />
            Import List E2
          </h1>
          <p className="text-muted-foreground">
            Importuj listy kanałów z odbiorników Enigma2 (Gigablue, Dreambox, itp.)
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Wspierane formaty</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside text-sm space-y-1 mt-2">
            <li>Pliki ZIP z listami bzyk83 (gigablue.hswg.pl)</li>
            <li>Pliki userbouquet (.tv) z E2</li>
            <li>Listy M3U/M3U8</li>
            <li>Formaty z URL streaming (http/https)</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <E2Importer />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Instrukcja</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">1. Wybierz preset</h4>
                <p className="text-muted-foreground">
                  Użyj gotowych list z bzyk83 dla popularnych satelitów (Hot Bird 13°E, Astry, itp.)
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">2. Lub podaj własny URL</h4>
                <p className="text-muted-foreground">
                  Możesz zaimportować dowolną listę M3U lub ZIP z kanałami E2
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">3. Włącz kanały</h4>
                <p className="text-muted-foreground">
                  Zaimportowane kanały są domyślnie wyłączone. Włącz je w panelu zarządzania kanałami.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Źródła</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <a 
                href="https://gigablue.hswg.pl/listy-kanalow-e2-by-bzyk83/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline block"
              >
                Listy bzyk83 (HSWG)
              </a>
              <p className="text-muted-foreground text-xs">
                Aktualizowane regularnie listy kanałów satelitarnych dla odbiorników Enigma2.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
