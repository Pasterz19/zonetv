import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Bzyk83LocalImporter } from "./bzyk83-importer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, HardDrive, Satellite, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function Bzyk83ImportPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <HardDrive className="h-8 w-8" />
            Import Lokalny Bzyk83
          </h1>
          <p className="text-muted-foreground">
            Automatyczny importer kanałów z lokalnych plików list E2 (Hot Bird 13°E)
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Satellite className="h-3 w-3 mr-1" />
          Hot Bird 13°E
        </Badge>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Format wejściowy</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside text-sm space-y-1 mt-2">
            <li>Pliki lokalne z <code>/home/damian/Pobrane/Lista-bzyk83-hb-13E-13.10.2025/</code></li>
            <li>Parser odczytuje: lamedb, bouquets.tv, userbouquet.*.tv</li>
            <li>Konwertuje proxy URL-e (127.0.0.1:8088) na bezpośrednie streamy</li>
            <li>Filtruje tylko kanały IPTV (streaming HTTP/HTTPS)</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Bzyk83LocalImporter />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Formaty wyjściowe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>M3U Playlist</span>
                <Badge variant="secondary">Standard</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>M3U8 (HLS)</span>
                <Badge variant="secondary">Streaming</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span>TS Stream</span>
                <Badge variant="secondary">Transport</Badge>
              </div>
              <p className="text-muted-foreground text-xs mt-2">
                Kanały są importowane do bazy danych i dostępne przez /api/stream 
                z proxy HLS dla odtwarzania w przeglądarce.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wspierane bukiety</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-green-600">IPTV</Badge>
                <span className="text-muted-foreground">Polska, Sport, Muzyka</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-blue-600">Pluto TV</Badge>
                <span className="text-muted-foreground">DE, UK, US, PL, IT...</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-purple-600">Rakuten</Badge>
                <span className="text-muted-foreground">Movies, TV Series</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-orange-600">Samsung+</Badge>
                <span className="text-muted-foreground">Live TV Channels</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-red-600">YouTube</Badge>
                <span className="text-muted-foreground">Webcam, Live</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
