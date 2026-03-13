"use server";

import { auth } from "@/lib/auth";
import { PrismaClient } from "@/generated/prisma/client";
import { parseM3U, M3UEntry } from "@/lib/m3u-parser";
import { revalidatePath } from "next/cache";
import { XMLParser } from "fast-xml-parser";

const db = new PrismaClient();

// Global state for import control (in production, use Redis or DB)
let importController: AbortController | null = null;
let isImportStopped = false;

// Polish channel filter keywords
const POLISH_KEYWORDS = [
  "poland",
  "polish",
  "polska",
  "polskie",
  "polski",
  "polsat",
  "tvn",
  "tvp",
  "tvn24",
  "ttv",
  "tv puls",
  "canal+ pol",
  "canal+ polska",
  "PL",
  "POL",
];

export async function stopImport() {
  if (importController) {
    importController.abort();
    isImportStopped = true;
    return { success: true as const, message: "Import stopped" };
  }
  return { success: false as const, message: "No active import" };
}

export async function resetImportState() {
  isImportStopped = false;
  importController = null;
  return { success: true as const };
}

function isPolishChannel(entry: M3UEntry): boolean {
  const name = entry.name?.toLowerCase() ?? "";
  const group = entry.groupTitle?.toLowerCase() ?? "";
  const tvgName = entry.tvgName?.toLowerCase() ?? "";

  // Short tokens like "pl"/"pol" cause lots of false positives, so treat them separately.
  const shortTokenRegex = /(^|[^a-z0-9])(pl|pol)([^a-z0-9]|$)/i;

  // Prefer groupTitle if present (usually more reliable than name).
  const primaryText = group || name;
  const secondaryText = `${name} ${tvgName}`;

  const keywordHit = POLISH_KEYWORDS.some((kw) => primaryText.includes(kw) || secondaryText.includes(kw));
  if (keywordHit) return true;

  // If provider uses group naming like "PL |" or "POL |" etc.
  if (shortTokenRegex.test(primaryText) || shortTokenRegex.test(secondaryText)) return true;

  // Some common Polish channel name patterns.
  if (/(^|\s)(tvp\s?1|tvp\s?2|tvp\s?info|polsat|tvn)(\s|$)/i.test(secondaryText)) return true;

  return false;
}

export async function fetchM3UWithControl(
  url: string, 
  filterPolish: boolean = true,
  signal?: AbortSignal
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    // Create new abort controller for this import
    importController = new AbortController();
    const finalSignal = signal || importController.signal;
    isImportStopped = false;

    const response = await fetch(url, { 
      signal: finalSignal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      }
    });
    
    if (!response.ok) return { error: `HTTP ${response.status} - ${response.statusText}` };

    const arrayBuffer = await response.arrayBuffer();
    const maxBytes = 100 * 1024 * 1024; // 100MB limit
    
    let text = "";
    if (arrayBuffer.byteLength > maxBytes) {
      text = new TextDecoder().decode(arrayBuffer.slice(0, maxBytes));
      const lastNewline = text.lastIndexOf('\n');
      if (lastNewline > 0) text = text.slice(0, lastNewline);
    } else {
      text = new TextDecoder().decode(arrayBuffer);
    }

    const entries = parseM3U(text);
    
    if (entries.length === 0) {
      return { error: "No entries found in M3U. Check format." };
    }

    // Apply Polish filter if enabled
    let filteredEntries = entries;
    if (filterPolish) {
      filteredEntries = entries.filter(isPolishChannel);
      console.log(`Filtered ${entries.length} entries to ${filteredEntries.length} Polish channels`);
    }
    
    return { 
      success: true, 
      entries: filteredEntries.slice(0, 3000), 
      totalFound: entries.length,
      filteredCount: filteredEntries.length,
      wasFiltered: filterPolish
    };

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, stopped: true, message: "Import stopped by user" };
    }
    console.error("M3U Fetch Error:", error);
    return { error: `Fetch Failed: ${(error as Error).message}` };
  }
}

export async function fetchM3UFromXtreamWithControl(
  host: string, 
  user: string, 
  pass: string, 
  type: "m3u_plus" | "m3u" = "m3u_plus", 
  output: "ts" | "hls" = "ts",
  filterPolish: boolean = true
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  let baseUrl = host;
  if (!baseUrl.startsWith("http")) baseUrl = `http://${baseUrl}`;
  
  const m3uUrl = `${baseUrl}/get.php?username=${user}&password=${pass}&type=${type}&output=${output}`;
  
  try {
    importController = new AbortController();
    isImportStopped = false;

    const response = await fetch(m3uUrl, { 
      signal: importController.signal
    });
    
    if (!response.ok) return { error: `HTTP ${response.status} from Provider` };

    const arrayBuffer = await response.arrayBuffer();
    const maxBytes = 30 * 1024 * 1024; // 30MB limit
    let text = "";
    
    if (arrayBuffer.byteLength > maxBytes) {
      text = new TextDecoder().decode(arrayBuffer.slice(0, maxBytes));
      const lastNewline = text.lastIndexOf('\n');
      if (lastNewline > 0) text = text.slice(0, lastNewline);
    } else {
      text = new TextDecoder().decode(arrayBuffer);
    }

    const entries = parseM3U(text);
    
    // Apply Polish filter if enabled
    let filteredEntries = entries;
    if (filterPolish) {
      filteredEntries = entries.filter(isPolishChannel);
      console.log(`Filtered ${entries.length} entries to ${filteredEntries.length} Polish channels`);
    }
    
    return { 
      success: true, 
      entries: filteredEntries.slice(0, 3000), 
      totalFound: entries.length,
      filteredCount: filteredEntries.length,
      wasFiltered: filterPolish
    };
    
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, stopped: true, message: "Import stopped by user" };
    }
    console.error("Xtream Fetch Error:", error);
    return { error: "Failed to connect to Xtream API" };
  }
}

export async function importContentWithControl(
  items: M3UEntry[], 
  type: "MOVIE" | "SERIES" | "CHANNEL"
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  let count = 0;
  let errors: string[] = [];

  for (let i = 0; i < items.length; i++) {
    // Check if import was stopped
    if (isImportStopped) {
      return { 
        success: false, 
        stopped: true, 
        message: "Import stopped by user",
        importedCount: count,
        errors
      };
    }

    const item = items[i];
    
    try {
      if (type === "CHANNEL") {
        await db.channel.upsert({
          where: { streamUrl: item.url },
          create: {
            name: item.name || "Unknown Channel",
            streamUrl: item.url,
            imageUrl: item.tvgLogo || "",
            groupTitle: item.groupTitle || "Imported",
            tvgId: item.tvgId || "",
            tvgName: item.tvgName || "",
            tvgLogo: item.tvgLogo || "",
            enabled: true,
          },
          update: {
            name: item.name || "Unknown Channel",
            imageUrl: item.tvgLogo || "",
            groupTitle: item.groupTitle || "Imported",
            tvgId: item.tvgId || "",
            tvgName: item.tvgName || "",
            tvgLogo: item.tvgLogo || "",
          },
        });
        count++;
      } else if (type === "MOVIE") {
        const existing = await db.movie.findFirst({ where: { externalUrl: item.url } });
        if (!existing) {
          await db.movie.create({
            data: {
              title: item.name || "Unknown Movie",
              category: item.groupTitle || "Imported",
              description: "Imported from M3U",
              imageUrl: item.tvgLogo || "",
              externalUrl: item.url,
            },
          });
          count++;
        }
      } else if (type === "SERIES") {
        let series = await db.series.findFirst({ where: { title: item.groupTitle } });
        if (!series) {
          series = await db.series.create({
            data: {
              title: item.groupTitle || "Imported Series",
              category: "Imported",
              description: "Imported from M3U",
              imageUrl: item.tvgLogo || "",
            },
          });
        }

        let season = await db.season.findFirst({ where: { seriesId: series.id, number: 1 } });
        if (!season) {
          season = await db.season.create({
            data: {
              seriesId: series.id,
              number: 1,
            },
          });
        }

        const episodeNumber = (await db.episode.count({ where: { seasonId: season.id } })) + 1;
        await db.episode.create({
          data: {
            seasonId: season.id,
            number: episodeNumber,
            title: item.name || `Episode ${episodeNumber}`,
            description: "Imported from M3U",
            imageUrl: item.tvgLogo || "",
            externalUrl: item.url,
          },
        });
        count++;
      }
    } catch (error) {
      const errorMsg = `Failed to import "${item.name}": ${(error as Error).message}`;
      errors.push(errorMsg);
      console.error(errorMsg);
    }

    // Add small delay to prevent overwhelming the database
    if (i % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  revalidatePath("/admin/content");
  return { 
    success: true, 
    importedCount: count, 
    errors,
    message: `Successfully imported ${count} items`
  };
}

// Enhanced EPG functions with stop control
export async function importEpgFromUrlWithControl(url: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" };

  try {
    importController = new AbortController();
    isImportStopped = false;

    console.log("Fetching EPG from:", url);
    const response = await fetch(url, { 
      signal: importController.signal
    });
    
    if (!response.ok) return { error: `HTTP ${response.status} from Provider` };

    const text = await response.text();
    return await processEpgDataWithControl(text);

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, stopped: true, message: "EPG import stopped by user" };
    }
    console.error("EPG Import Error:", error);
    return { error: (error as Error).message };
  }
}

async function processEpgDataWithControl(text: string) {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ""
  });
  const result = parser.parse(text);
  
  if (!result.tv || !result.tv.programme) {
    return { error: "Invalid XMLTV format or no programs found" };
  }

  const programs = Array.isArray(result.tv.programme) ? result.tv.programme : [result.tv.programme];
  console.log(`Found ${programs.length} programs`);

  const channels = await db.channel.findMany({
    where: { tvgId: { not: null } },
    select: { id: true, tvgId: true }
  });

  const channelMap = new Map(channels.map(c => [c.tvgId, c.id]));
  let count = 0;
  let errors: string[] = [];

  for (let i = 0; i < programs.length; i++) {
    if (isImportStopped) {
      return { 
        success: false, 
        stopped: true, 
        message: "EPG import stopped by user",
        importedCount: count,
        errors
      };
    }

    const prog = programs[i];
    const channelId = channelMap.get(prog.channel);
    
    if (channelId) {
      try {
        await db.epgProgram.create({
          data: {
            channelId,
            start: new Date(prog.start),
            stop: new Date(prog.stop),
            title: prog.title?.['#text'] || prog.title || 'Unknown',
            description: prog.desc?.['#text'] || prog.desc || '',
          }
        });
        count++;
      } catch (error) {
        errors.push(`Failed to import program for ${prog.channel}: ${(error as Error).message}`);
      }
    }

    if (i % 1000 === 0) {
      await new Promise(resolve => setTimeout(resolve, 5));
    }
  }

  return { success: true, count, errors };
}
