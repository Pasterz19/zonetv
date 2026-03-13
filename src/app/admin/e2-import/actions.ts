"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma/client";
import { parseBouquetContent, E2ParseResult, E2Channel } from "@/lib/e2-parser";
import { revalidatePath } from "next/cache";

const prisma = new PrismaClient();

export interface ImportE2FromUrlParams {
  url: string;
  satellite: string; // e.g., "13E", "19.2E", "Hot Bird"
  autoEnable?: boolean;
}

/**
 * Pobiera i importuje listę kanałów E2 bezpośrednio z URL
 * Wspiera listy z gigablue.hswg.pl i podobne
 */
export async function importE2FromUrl(params: ImportE2FromUrlParams) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "Unauthorized" };
  }

  try {
    console.log("[E2 Import] Downloading from:", params.url);
    
    // Download the file
    const response = await fetch(params.url, {
      signal: AbortSignal.timeout(120000),
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "*/*",
      },
    });

    if (!response.ok) {
      return { error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const contentType = response.headers.get("content-type") || "";
    const buffer = await response.arrayBuffer();
    
    let content: string;
    let channels: E2Channel[] = [];
    
    // Handle ZIP files
    if (contentType.includes("zip") || params.url.endsWith(".zip")) {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(buffer);
      
      const files = new Map<string, string>();
      
      // Extract all .tv and lamedb files
      for (const [filename, zipEntry] of Object.entries(zip.files)) {
        if (filename.endsWith(".tv") || filename.includes("lamedb") || filename.includes("bouquets")) {
          const fileContent = await zipEntry.async("string");
          files.set(filename, fileContent);
        }
      }
      
      // Parse bouquet files
      for (const [filename, fileContent] of files) {
        if (filename.endsWith(".tv") || filename.includes("bouquet")) {
          const bouquet = parseBouquetContent(fileContent, filename);
          channels.push(...bouquet.channels);
        }
      }
    } else {
      // Direct M3U or text file
      content = new TextDecoder().decode(buffer);
      
      if (params.url.endsWith(".m3u") || params.url.endsWith(".m3u8")) {
        // Parse as M3U
        const { parseM3U } = await import("@/lib/m3u-parser");
        const entries = parseM3U(content);
        channels = entries.map(e => ({
          name: e.name,
          url: e.url,
          serviceRef: e.tvgId || "",
          description: e.groupTitle,
        }));
      } else {
        // Parse as E2 bouquet
        const bouquet = parseBouquetContent(content, "imported.tv");
        channels.push(...bouquet.channels);
      }
    }

    if (channels.length === 0) {
      return { error: "No channels found in the provided file" };
    }

    console.log(`[E2 Import] Found ${channels.length} channels`);

    // Import to database
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const channel of channels) {
      try {
        // Check if channel already exists by serviceRef or URL
        const existing = await prisma.channel.findFirst({
          where: {
            OR: [
              { tvgId: channel.serviceRef },
              { streamUrl: channel.url },
            ],
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Determine group title from satellite
        const groupTitle = params.satellite || channel.description || "Imported";

        // Create channel
        await prisma.channel.create({
          data: {
            name: channel.name,
            streamUrl: channel.url,
            groupTitle: groupTitle,
            tvgId: channel.serviceRef,
            tvgName: channel.name,
            enabled: params.autoEnable ?? false,
            imageUrl: "", // Can be filled later from EPG
          },
        });

        imported++;
      } catch (err) {
        errors.push(`Failed to import ${channel.name}: ${(err as Error).message}`);
      }
    }

    revalidatePath("/admin/channels");
    revalidatePath("/dashboard");

    return {
      success: true,
      stats: {
        total: channels.length,
        imported,
        skipped,
        errors: errors.slice(0, 10), // Return first 10 errors
      },
    };

  } catch (error) {
    console.error("[E2 Import] Error:", error);
    return { error: (error as Error).message };
  }
}

/**
 * Predefined URLs for popular E2 channel lists
 */
export const E2_PRESETS = {
  hotbird: {
    name: "Hot Bird 13°E (bzyk83)",
    url: "https://enigma2.hswg.pl/wp-content/uploads/2025/10/Lista-bzyk83-hb-13E-13.10.2025.zip",
    satellite: "13°E - Hot Bird",
  },
  quadri: {
    name: "4 satelity (bzyk83)",
    url: "https://enigma2.hswg.pl/wp-content/uploads/2025/06/Lista-bzyk83-4x1-13E-192E-235E-282E-01.06.2025.zip",
    satellite: "13E+19.2E+23.5E+28.2E",
  },
  multi: {
    name: "6 satelitów (bzyk83)",
    url: "https://enigma2.hswg.pl/wp-content/uploads/2025/01/Lista-bzyk83-6x1-13E-192E-235E-282E-48E-08W-20.01.2025.zip",
    satellite: "13E+19.2E+23.5E+28.2E+4.8E+0.8W",
  },
};

/**
 * Import from predefined preset
 */
export async function importE2Preset(presetKey: keyof typeof E2_PRESETS) {
  const preset = E2_PRESETS[presetKey];
  if (!preset) {
    return { error: "Unknown preset" };
  }

  return importE2FromUrl({
    url: preset.url,
    satellite: preset.satellite,
    autoEnable: false,
  });
}
